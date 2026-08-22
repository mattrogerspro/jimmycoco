-- Stage 1 live chat: durable conversations, realtime messages and strict
-- visitor/staff row ownership. Anonymous Supabase Auth users carry the
-- authenticated database role, so every visitor policy is tied to auth.uid().
begin;

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  visitor_name text not null
    check (char_length(btrim(visitor_name)) between 1 and 80),
  visitor_email text
    check (
      visitor_email is null
      or (
        char_length(visitor_email) between 3 and 254
        and visitor_email = lower(visitor_email)
        and visitor_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    ),
  source_path text not null default '/'
    check (
      char_length(source_path) between 1 and 500
      and left(source_path, 1) = '/'
      and left(source_path, 2) <> '//'
    ),
  status text not null default 'open'
    check (status in ('open', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index chat_conversations_one_open_per_visitor
  on public.chat_conversations (visitor_id)
  where status = 'open';

create index chat_conversations_visitor
  on public.chat_conversations (visitor_id);

create index chat_conversations_assignee
  on public.chat_conversations (assigned_to)
  where assigned_to is not null;

create index chat_conversations_staff_queue
  on public.chat_conversations (status, last_message_at desc);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null
    references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  sender_kind text not null
    check (sender_kind in ('visitor', 'staff', 'system')),
  body text not null
    check (char_length(btrim(body)) between 1 and 2000),
  client_nonce uuid,
  created_at timestamptz not null default now(),
  unique (sender_id, client_nonce)
);

create index chat_messages_conversation_created
  on public.chat_messages (conversation_id, created_at, id);

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
    updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

revoke all on function private.touch_chat_conversation()
  from public, anon, authenticated;
grant execute on function private.touch_chat_conversation() to service_role;

create trigger chat_messages_touch_conversation
after insert on public.chat_messages
for each row execute function private.touch_chat_conversation();

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.chat_conversations
  from public, anon, authenticated;
revoke all on table public.chat_messages
  from public, anon, authenticated;
revoke all on sequence public.chat_messages_id_seq
  from public, anon, authenticated;

grant select on table public.chat_conversations to authenticated;
grant insert (visitor_id, visitor_name, visitor_email, source_path)
  on table public.chat_conversations to authenticated;
grant update (status, assigned_to, updated_at)
  on table public.chat_conversations to authenticated;
grant select on table public.chat_messages to authenticated;
grant insert (conversation_id, sender_id, sender_kind, body, client_nonce)
  on table public.chat_messages to authenticated;
grant usage, select on sequence public.chat_messages_id_seq to authenticated;

grant all on table public.chat_conversations, public.chat_messages
  to service_role;
grant usage, select on sequence public.chat_messages_id_seq to service_role;

create policy chat_conversations_visitor_select
on public.chat_conversations
for select
to authenticated
using (visitor_id = (select auth.uid()));

create policy chat_conversations_staff_select
on public.chat_conversations
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy chat_conversations_visitor_insert
on public.chat_conversations
for insert
to authenticated
with check (
  visitor_id = (select auth.uid())
  and status = 'open'
  and assigned_to is null
);

create policy chat_conversations_staff_update
on public.chat_conversations
for update
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'))
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy chat_messages_participant_select
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and conversation.visitor_id = (select auth.uid())
  )
  or (select private.current_article_role()) in ('admin', 'editor')
);

create policy chat_messages_visitor_insert
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and sender_kind = 'visitor'
  and exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and conversation.visitor_id = (select auth.uid())
      and conversation.status = 'open'
  )
);

create policy chat_messages_staff_insert
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and sender_kind = 'staff'
  and (select private.current_article_role()) in ('admin', 'editor')
  and exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and conversation.status = 'open'
  )
);

-- Postgres Changes is intentionally used for the Stage 1 inbox: it is the
-- smallest implementation and RLS is re-checked for each subscriber.
alter publication supabase_realtime add table public.chat_conversations;
alter publication supabase_realtime add table public.chat_messages;

commit;
