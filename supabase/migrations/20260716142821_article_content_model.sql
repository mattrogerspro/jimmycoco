-- Article publishing, revision history, media storage and role-based access.
begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;
alter default privileges for role postgres in schema private revoke execute on functions from public;

create table public.article_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 120),
  role text not null check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_admin_profiles_active_role
  on public.article_admin_profiles (role)
  where is_active = true;

create table public.article_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  job_title text,
  bio text,
  avatar_url text,
  website_url text,
  social_links jsonb not null default '{}'::jsonb
    check (jsonb_typeof(social_links) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_categories_active_sort
  on public.article_categories (is_active, sort_order, name);

create table public.article_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_tags_active_name
  on public.article_tags (is_active, name);

create table public.article_media (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'article-media'
    check (bucket_id = 'article-media'),
  storage_path text not null unique
    check (storage_path ~ '^articles/[a-z0-9][a-z0-9._/-]*\.(avif|jpe?g|png|webp)$'),
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  title text,
  mime_type text not null
    check (mime_type in ('image/avif', 'image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes between 1 and 5242880),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_media_public_created
  on public.article_media (created_at desc)
  where is_public = true;

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 180),
  excerpt text check (excerpt is null or char_length(excerpt) <= 600),
  content_html text not null default '',
  author_id uuid references public.article_authors(id) on delete restrict,
  category_id uuid references public.article_categories(id) on delete set null,
  cover_media_id uuid references public.article_media(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'archived')),
  seo_title text check (seo_title is null or char_length(seo_title) <= 120),
  meta_description text
    check (meta_description is null or char_length(meta_description) <= 320),
  og_title text check (og_title is null or char_length(og_title) <= 180),
  og_description text
    check (og_description is null or char_length(og_description) <= 320),
  og_media_id uuid references public.article_media(id) on delete set null,
  keywords text[] not null default '{}'::text[],
  faq_items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(faq_items) = 'array'),
  citations jsonb not null default '[]'::jsonb
    check (jsonb_typeof(citations) = 'array'),
  reading_time_minutes smallint
    check (reading_time_minutes is null or reading_time_minutes between 1 and 180),
  is_featured boolean not null default false,
  noindex boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_document tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(excerpt, '')), 'B') ||
    setweight(
      to_tsvector(
        'english'::regconfig,
        regexp_replace(coalesce(content_html, ''), '<[^>]+>', ' ', 'g')
      ),
      'C'
    )
  ) stored,
  check (
    status <> 'published'
    or (
      published_at is not null
      and author_id is not null
      and char_length(btrim(coalesce(excerpt, ''))) > 0
      and char_length(btrim(content_html)) > 0
    )
  )
);

create index articles_publication
  on public.articles (published_at desc, id)
  where status = 'published';
create index articles_author on public.articles (author_id);
create index articles_category on public.articles (category_id);
create index articles_search on public.articles using gin (search_document);
create index articles_featured
  on public.articles (published_at desc)
  where status = 'published' and is_featured = true;

create table public.article_tag_assignments (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.article_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create index article_tag_assignments_tag
  on public.article_tag_assignments (tag_id, article_id);

create table public.article_revisions (
  id bigint generated always as identity primary key,
  article_id uuid references public.articles(id) on delete set null,
  article_uuid uuid not null,
  revision_number integer not null check (revision_number > 0),
  operation text not null check (operation in ('insert', 'update', 'delete')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (article_uuid, revision_number)
);

create index article_revisions_article_created
  on public.article_revisions (article_uuid, created_at desc);

create or replace function private.current_article_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.article_admin_profiles p
  where p.user_id = (select auth.uid())
    and p.is_active = true
  limit 1;
$$;

revoke all on function private.current_article_role() from public, anon, authenticated;
grant execute on function private.current_article_role() to authenticated, service_role;

create or replace function private.capture_article_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  snapshot_row public.articles;
  snapshot_id uuid;
  next_revision integer;
begin
  if tg_op = 'DELETE' then
    snapshot_row := old;
    snapshot_id := old.id;
  else
    snapshot_row := new;
    snapshot_id := new.id;
  end if;

  select coalesce(max(r.revision_number), 0) + 1
    into next_revision
  from public.article_revisions r
  where r.article_uuid = snapshot_id;

  insert into public.article_revisions (
    article_id,
    article_uuid,
    revision_number,
    operation,
    snapshot,
    changed_by
  )
  values (
    case when tg_op = 'DELETE' then null else snapshot_id end,
    snapshot_id,
    next_revision,
    lower(tg_op),
    to_jsonb(snapshot_row),
    (select auth.uid())
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.capture_article_revision() from public, anon, authenticated;
grant execute on function private.capture_article_revision() to service_role;

create trigger article_admin_profiles_touch
before update on public.article_admin_profiles
for each row execute function public.touch_updated_at();

create trigger article_authors_touch
before update on public.article_authors
for each row execute function public.touch_updated_at();

create trigger article_categories_touch
before update on public.article_categories
for each row execute function public.touch_updated_at();

create trigger article_tags_touch
before update on public.article_tags
for each row execute function public.touch_updated_at();

create trigger article_media_touch
before update on public.article_media
for each row execute function public.touch_updated_at();

create trigger articles_touch
before update on public.articles
for each row execute function public.touch_updated_at();

create trigger articles_capture_revision
after insert or update or delete on public.articles
for each row execute function private.capture_article_revision();

alter table public.article_admin_profiles enable row level security;
alter table public.article_authors enable row level security;
alter table public.article_categories enable row level security;
alter table public.article_tags enable row level security;
alter table public.article_media enable row level security;
alter table public.articles enable row level security;
alter table public.article_tag_assignments enable row level security;
alter table public.article_revisions enable row level security;

revoke all on table public.article_admin_profiles from public, anon, authenticated;
revoke all on table public.article_authors from public, anon, authenticated;
revoke all on table public.article_categories from public, anon, authenticated;
revoke all on table public.article_tags from public, anon, authenticated;
revoke all on table public.article_media from public, anon, authenticated;
revoke all on table public.articles from public, anon, authenticated;
revoke all on table public.article_tag_assignments from public, anon, authenticated;
revoke all on table public.article_revisions from public, anon, authenticated;

grant select on table
  public.article_authors,
  public.article_categories,
  public.article_tags,
  public.article_media,
  public.articles,
  public.article_tag_assignments
to anon, authenticated;

grant select, insert, update, delete on table
  public.article_admin_profiles,
  public.article_authors,
  public.article_categories,
  public.article_tags,
  public.article_media,
  public.articles,
  public.article_tag_assignments
to authenticated;

grant select on table public.article_revisions to authenticated;

grant all on table
  public.article_admin_profiles,
  public.article_authors,
  public.article_categories,
  public.article_tags,
  public.article_media,
  public.articles,
  public.article_tag_assignments,
  public.article_revisions
to service_role;
grant usage, select on sequence public.article_revisions_id_seq to service_role;

create policy article_admin_profiles_select
on public.article_admin_profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_article_role()) = 'admin'
);

create policy article_admin_profiles_admin_insert
on public.article_admin_profiles
for insert
to authenticated
with check ((select private.current_article_role()) = 'admin');

create policy article_admin_profiles_admin_update
on public.article_admin_profiles
for update
to authenticated
using ((select private.current_article_role()) = 'admin')
with check ((select private.current_article_role()) = 'admin');

create policy article_admin_profiles_admin_delete
on public.article_admin_profiles
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_authors_public_select
on public.article_authors
for select
to anon, authenticated
using (is_active = true);

create policy article_authors_staff_select
on public.article_authors
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_authors_staff_insert
on public.article_authors
for insert
to authenticated
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_authors_staff_update
on public.article_authors
for update
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'))
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_authors_admin_delete
on public.article_authors
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_categories_public_select
on public.article_categories
for select
to anon, authenticated
using (is_active = true);

create policy article_categories_staff_select
on public.article_categories
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_categories_staff_insert
on public.article_categories
for insert
to authenticated
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_categories_staff_update
on public.article_categories
for update
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'))
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_categories_admin_delete
on public.article_categories
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_tags_public_select
on public.article_tags
for select
to anon, authenticated
using (is_active = true);

create policy article_tags_staff_select
on public.article_tags
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_tags_staff_insert
on public.article_tags
for insert
to authenticated
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_tags_staff_update
on public.article_tags
for update
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'))
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_tags_admin_delete
on public.article_tags
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_media_public_select
on public.article_media
for select
to anon, authenticated
using (is_public = true);

create policy article_media_staff_select
on public.article_media
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_media_staff_insert
on public.article_media
for insert
to authenticated
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_media_staff_update
on public.article_media
for update
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'))
with check ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_media_admin_delete
on public.article_media
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy articles_public_select
on public.articles
for select
to anon, authenticated
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

create policy articles_staff_select
on public.articles
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy articles_admin_insert
on public.articles
for insert
to authenticated
with check ((select private.current_article_role()) = 'admin');

create policy articles_editor_insert
on public.articles
for insert
to authenticated
with check (
  (select private.current_article_role()) = 'editor'
  and status in ('draft', 'review')
);

create policy articles_admin_update
on public.articles
for update
to authenticated
using ((select private.current_article_role()) = 'admin')
with check ((select private.current_article_role()) = 'admin');

create policy articles_editor_update
on public.articles
for update
to authenticated
using (
  (select private.current_article_role()) = 'editor'
  and status in ('draft', 'review')
)
with check (
  (select private.current_article_role()) = 'editor'
  and status in ('draft', 'review')
);

create policy articles_admin_delete
on public.articles
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_tag_assignments_public_select
on public.article_tag_assignments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_tag_assignments.article_id
      and a.status = 'published'
      and a.published_at is not null
      and a.published_at <= now()
  )
);

create policy article_tag_assignments_staff_select
on public.article_tag_assignments
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy article_tag_assignments_admin_insert
on public.article_tag_assignments
for insert
to authenticated
with check ((select private.current_article_role()) = 'admin');

create policy article_tag_assignments_editor_insert
on public.article_tag_assignments
for insert
to authenticated
with check (
  (select private.current_article_role()) = 'editor'
  and exists (
    select 1
    from public.articles a
    where a.id = article_tag_assignments.article_id
      and a.status in ('draft', 'review')
  )
);

create policy article_tag_assignments_admin_delete
on public.article_tag_assignments
for delete
to authenticated
using ((select private.current_article_role()) = 'admin');

create policy article_tag_assignments_editor_delete
on public.article_tag_assignments
for delete
to authenticated
using (
  (select private.current_article_role()) = 'editor'
  and exists (
    select 1
    from public.articles a
    where a.id = article_tag_assignments.article_id
      and a.status in ('draft', 'review')
  )
);

create policy article_revisions_staff_select
on public.article_revisions
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'article-media',
  'article-media',
  true,
  5242880,
  array['image/avif', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy article_media_objects_staff_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'article-media'
  and (select private.current_article_role()) in ('admin', 'editor')
);

create policy article_media_objects_staff_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'article-media'
  and (storage.foldername(name))[1] = 'articles'
  and (select private.current_article_role()) in ('admin', 'editor')
);

create policy article_media_objects_staff_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'article-media'
  and (select private.current_article_role()) in ('admin', 'editor')
)
with check (
  bucket_id = 'article-media'
  and (storage.foldername(name))[1] = 'articles'
  and (select private.current_article_role()) in ('admin', 'editor')
);

create policy article_media_objects_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'article-media'
  and (select private.current_article_role()) = 'admin'
);

commit;
