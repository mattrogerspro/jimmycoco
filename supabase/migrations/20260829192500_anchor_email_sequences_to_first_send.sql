-- Anchor ad-hoc sequence timing to the actual first email send per contact.
-- This prevents delayed first sends, cron backlogs, daily caps or manual pauses
-- from compressing later follow-up emails.

begin;

alter table public.email_enrollments
  add column if not exists sequence_started_at timestamptz;

create index if not exists email_enrollments_due_step_priority
  on public.email_enrollments (status, next_step, next_send_at)
  where status = 'active';

with first_sequence_send as (
  select
    enrollment_id,
    min(sent_at) filter (where step_number = 1 and sent_at is not null) as first_sent_at
  from public.email_messages
  where enrollment_id is not null
  group by enrollment_id
)
update public.email_enrollments enrollment
set sequence_started_at = first_sequence_send.first_sent_at
from first_sequence_send
where enrollment.id = first_sequence_send.enrollment_id
  and enrollment.sequence_started_at is null
  and first_sequence_send.first_sent_at is not null;

-- Repair active follow-up rows so the next send can never be before the full
-- day offset measured from email 1's actual send time.
with scheduled_followups as (
  select
    enrollment.id,
    greatest(
      enrollment.next_send_at,
      enrollment.sequence_started_at + (step.day_offset * interval '1 day')
    ) as repaired_next_send_at
  from public.email_enrollments enrollment
  join public.email_campaign_steps step
    on step.campaign_id = enrollment.campaign_id
   and step.step_number = enrollment.next_step
  where enrollment.status = 'active'
    and enrollment.next_step > 1
    and enrollment.sequence_started_at is not null
    and step.day_offset is not null
    and (
      enrollment.next_send_at is null
      or enrollment.next_send_at < enrollment.sequence_started_at + (step.day_offset * interval '1 day')
    )
)
update public.email_enrollments enrollment
set
  next_send_at = scheduled_followups.repaired_next_send_at,
  locked_at = null,
  locked_by = null,
  updated_at = now()
from scheduled_followups
where enrollment.id = scheduled_followups.id;

drop function if exists public.claim_due_email_enrollments(integer, text);

create function public.claim_due_email_enrollments(p_limit integer, p_worker text)
returns table (
  enrollment_id uuid,
  campaign_id text,
  next_step integer,
  enrolled_at timestamptz,
  sequence_started_at timestamptz,
  contact_id uuid,
  email citext,
  first_name text,
  last_name text,
  business_name text,
  market text,
  timezone text,
  context jsonb,
  retry_count integer
)
language sql security definer set search_path = '' as $$
  with due as (
    select e.id
    from public.email_enrollments e
    join public.email_campaigns c on c.id = e.campaign_id and c.enabled = true
    where e.status = 'active'
      and e.next_send_at <= now()
      and (e.locked_at is null or e.locked_at < now() - interval '10 minutes')
    order by
      case when e.next_step = 1 then 0 else 1 end,
      e.next_send_at,
      e.created_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  ), claimed as (
    update public.email_enrollments e
    set locked_at = now(), locked_by = p_worker
    from due where e.id = due.id
    returning e.*
  )
  select
    c.id,
    c.campaign_id,
    c.next_step,
    c.enrolled_at,
    c.sequence_started_at,
    ec.id,
    ec.email,
    ec.first_name,
    ec.last_name,
    ec.business_name,
    ec.market,
    ec.timezone,
    c.context,
    c.retry_count
  from claimed c
  join public.email_contacts ec on ec.id = c.contact_id;
$$;

revoke all on function public.claim_due_email_enrollments(integer, text) from public, anon, authenticated;
grant execute on function public.claim_due_email_enrollments(integer, text) to service_role;

commit;
