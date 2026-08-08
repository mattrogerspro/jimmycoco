-- Article analytics, owned by us rather than by Google.
--
-- Ported from the Oxford Roof Masters blog_post_views model, with two
-- differences: the write path is a security-definer RPC so the public site
-- never needs a service-role key, and the function refuses any slug that is
-- not a published article, so it cannot be used to enumerate drafts or to
-- inflate a counter on something that is not live.

alter table public.articles
  add column if not exists views integer not null default 0;

create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  slug text not null,
  path text,
  -- Referrer HOST only. Never the full URL, which can carry query strings.
  referrer text,
  device text check (device is null or device in ('mobile', 'desktop')),
  -- Daily-rotating hash of IP + user agent. Rough uniques, not identity, and
  -- it stops being linkable to a person once the day rolls over.
  visitor_hash text
);

create index if not exists article_views_slug_idx
  on public.article_views (slug, created_at desc);
create index if not exists article_views_created_idx
  on public.article_views (created_at desc);

alter table public.article_views enable row level security;

-- Only signed-in article staff may read the raw rows. There is deliberately no
-- insert policy: every write goes through record_article_view() below.
create policy article_views_staff_select
on public.article_views
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create or replace function public.record_article_view(
  p_slug text,
  p_path text default null,
  p_referrer text default null,
  p_device text default null,
  p_visitor_hash text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Published articles only. A draft slug is silently ignored.
  if not exists (
    select 1 from public.articles
    where slug = p_slug
      and status = 'published'
      and published_at is not null
      and published_at <= now()
  ) then
    return;
  end if;

  insert into public.article_views (slug, path, referrer, device, visitor_hash)
  values (
    p_slug,
    left(p_path, 300),
    left(p_referrer, 200),
    case when p_device in ('mobile', 'desktop') then p_device end,
    left(p_visitor_hash, 64)
  );

  update public.articles set views = views + 1 where slug = p_slug;
end;
$$;

revoke all on function public.record_article_view(text, text, text, text, text) from public;
grant execute on function public.record_article_view(text, text, text, text, text)
  to anon, authenticated;

notify pgrst, 'reload schema';
