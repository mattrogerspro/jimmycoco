-- Stage 2 chat operations: presence stays in Supabase Realtime channels, while
-- unanswered-message escalation needs durable timestamps so cron can notify
-- the team once per unanswered visitor turn.
begin;

alter table public.chat_conversations
  add column last_visitor_message_at timestamptz,
  add column last_staff_message_at timestamptz,
  add column escalated_at timestamptz,
  add column escalation_email_resend_id text
    check (
      escalation_email_resend_id is null
      or char_length(escalation_email_resend_id) between 1 and 160
    );

update public.chat_conversations conversation
set
  last_visitor_message_at = (
    select max(message.created_at)
    from public.chat_messages message
    where message.conversation_id = conversation.id
      and message.sender_kind = 'visitor'
  ),
  last_staff_message_at = (
    select max(message.created_at)
    from public.chat_messages message
    where message.conversation_id = conversation.id
      and message.sender_kind = 'staff'
  );

create index chat_conversations_escalation_due
  on public.chat_conversations (status, escalated_at, last_visitor_message_at)
  where status = 'open' and last_visitor_message_at is not null;

create or replace function private.touch_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations
  set
    last_message_at = new.created_at,
    last_visitor_message_at = case
      when new.sender_kind = 'visitor' then new.created_at
      else last_visitor_message_at
    end,
    last_staff_message_at = case
      when new.sender_kind = 'staff' then new.created_at
      else last_staff_message_at
    end,
    escalated_at = case
      when new.sender_kind = 'visitor' then null
      else escalated_at
    end,
    escalation_email_resend_id = case
      when new.sender_kind = 'visitor' then null
      else escalation_email_resend_id
    end,
    updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

revoke all on function private.touch_chat_conversation()
  from public, anon, authenticated;
grant execute on function private.touch_chat_conversation() to service_role;

commit;
