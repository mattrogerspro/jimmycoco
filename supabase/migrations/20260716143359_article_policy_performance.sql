-- Covers article foreign keys and consolidates role policies per operation.
begin;

create index article_admin_profiles_created_by
  on public.article_admin_profiles (created_by);
create index article_revisions_article_id
  on public.article_revisions (article_id);
create index article_revisions_changed_by
  on public.article_revisions (changed_by);
create index articles_cover_media
  on public.articles (cover_media_id);
create index articles_og_media
  on public.articles (og_media_id);

drop policy article_authors_public_select on public.article_authors;
drop policy article_authors_staff_select on public.article_authors;

create policy article_authors_anon_select
on public.article_authors
for select
to anon
using (is_active = true);

create policy article_authors_authenticated_select
on public.article_authors
for select
to authenticated
using (
  is_active = true
  or (select private.current_article_role()) in ('admin', 'editor')
);

drop policy article_categories_public_select on public.article_categories;
drop policy article_categories_staff_select on public.article_categories;

create policy article_categories_anon_select
on public.article_categories
for select
to anon
using (is_active = true);

create policy article_categories_authenticated_select
on public.article_categories
for select
to authenticated
using (
  is_active = true
  or (select private.current_article_role()) in ('admin', 'editor')
);

drop policy article_tags_public_select on public.article_tags;
drop policy article_tags_staff_select on public.article_tags;

create policy article_tags_anon_select
on public.article_tags
for select
to anon
using (is_active = true);

create policy article_tags_authenticated_select
on public.article_tags
for select
to authenticated
using (
  is_active = true
  or (select private.current_article_role()) in ('admin', 'editor')
);

drop policy article_media_public_select on public.article_media;
drop policy article_media_staff_select on public.article_media;

create policy article_media_anon_select
on public.article_media
for select
to anon
using (is_public = true);

create policy article_media_authenticated_select
on public.article_media
for select
to authenticated
using (
  is_public = true
  or (select private.current_article_role()) in ('admin', 'editor')
);

drop policy articles_public_select on public.articles;
drop policy articles_staff_select on public.articles;
drop policy articles_admin_insert on public.articles;
drop policy articles_editor_insert on public.articles;
drop policy articles_admin_update on public.articles;
drop policy articles_editor_update on public.articles;

create policy articles_anon_select
on public.articles
for select
to anon
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

create policy articles_authenticated_select
on public.articles
for select
to authenticated
using (
  (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  )
  or (select private.current_article_role()) in ('admin', 'editor')
);

create policy articles_staff_insert
on public.articles
for insert
to authenticated
with check (
  case (select private.current_article_role())
    when 'admin' then true
    when 'editor' then status in ('draft', 'review')
    else false
  end
);

create policy articles_staff_update
on public.articles
for update
to authenticated
using (
  case (select private.current_article_role())
    when 'admin' then true
    when 'editor' then status in ('draft', 'review')
    else false
  end
)
with check (
  case (select private.current_article_role())
    when 'admin' then true
    when 'editor' then status in ('draft', 'review')
    else false
  end
);

drop policy article_tag_assignments_public_select
  on public.article_tag_assignments;
drop policy article_tag_assignments_staff_select
  on public.article_tag_assignments;
drop policy article_tag_assignments_admin_insert
  on public.article_tag_assignments;
drop policy article_tag_assignments_editor_insert
  on public.article_tag_assignments;
drop policy article_tag_assignments_admin_delete
  on public.article_tag_assignments;
drop policy article_tag_assignments_editor_delete
  on public.article_tag_assignments;

create policy article_tag_assignments_anon_select
on public.article_tag_assignments
for select
to anon
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

create policy article_tag_assignments_authenticated_select
on public.article_tag_assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = article_tag_assignments.article_id
      and a.status = 'published'
      and a.published_at is not null
      and a.published_at <= now()
  )
  or (select private.current_article_role()) in ('admin', 'editor')
);

create policy article_tag_assignments_staff_insert
on public.article_tag_assignments
for insert
to authenticated
with check (
  case (select private.current_article_role())
    when 'admin' then true
    when 'editor' then exists (
      select 1
      from public.articles a
      where a.id = article_tag_assignments.article_id
        and a.status in ('draft', 'review')
    )
    else false
  end
);

create policy article_tag_assignments_staff_delete
on public.article_tag_assignments
for delete
to authenticated
using (
  case (select private.current_article_role())
    when 'admin' then true
    when 'editor' then exists (
      select 1
      from public.articles a
      where a.id = article_tag_assignments.article_id
        and a.status in ('draft', 'review')
    )
    else false
  end
);

commit;
