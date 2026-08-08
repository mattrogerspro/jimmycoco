import { useMemo, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, data, useFetcher, useLoaderData } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { articleMediaUrl, isSameOriginPost } from "../lib/supabase.server";
import {
  IconCalendar,
  IconExternal,
  IconEye,
  IconClock,
  IconFile,
  IconGrid,
  IconPencil,
  IconPlus,
  IconRows,
  IconSearch,
  IconTrash,
} from "../components/admin/AdminIcons";

type AdminArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "review" | "published" | "archived";
  is_featured: boolean;
  noindex: boolean;
  reading_time_minutes: number | null;
  views: number;
  published_at: string | null;
  updated_at: string;
  category: string | null;
  author: string | null;
  cover_url: string | null;
  cover_alt: string | null;
};

const SELECT = `
  id, slug, title, excerpt, status, is_featured, noindex,
  reading_time_minutes, views, published_at, updated_at,
  author:article_authors(name),
  category:article_categories(name),
  cover:article_media!articles_cover_media_id_fkey(storage_path, alt_text)
`;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const { data: rows, error } = await supabase
    .from("articles")
    .select(SELECT)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Unable to load articles", error.message);
    throw new Response("The article list is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  const articles: AdminArticleRow[] = (rows ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    status: row.status,
    is_featured: row.is_featured,
    noindex: row.noindex,
    reading_time_minutes: row.reading_time_minutes,
    // `views` only exists once the analytics migration has been applied.
    views: typeof row.views === "number" ? row.views : 0,
    published_at: row.published_at,
    updated_at: row.updated_at,
    category: row.category?.name ?? null,
    author: row.author?.name ?? null,
    cover_url: articleMediaUrl(row.cover?.storage_path),
    cover_alt: row.cover?.alt_text ?? null,
  }));

  return data({ articles }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "The request could not be verified." }, { status: 403, headers: responseHeaders });
  }
  if (staff.role !== "admin") {
    return data({ error: "Only administrators can delete articles." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const id = String(form.get("articleId") ?? "");
  if (!id) {
    return data({ error: "No article was selected." }, { status: 400, headers: responseHeaders });
  }

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    return data({ error: error.message }, { status: 400, headers: responseHeaders });
  }
  return data({ ok: true }, { headers: responseHeaders });
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const formatDate = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : "—");
const formatNumber = (value: number) => value.toLocaleString("en-GB");

type StatusFilter = "all" | "published" | "review" | "draft" | "archived";
type SortMode = "recent" | "newest" | "oldest" | "views" | "title";
type ViewMode = "grid" | "list";

const STATUS_LABEL: Record<AdminArticleRow["status"], string> = {
  published: "Published",
  review: "In review",
  draft: "Draft",
  archived: "Archived",
};

function ArticleCard({
  article,
  view,
  canDelete,
  onDelete,
}: {
  article: AdminArticleRow;
  view: ViewMode;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const live = article.status === "published";
  return (
    <article className={`art-card art-card-${view} art-card-${article.status}`}>
      <div className="art-card-media">
        {article.cover_url ? (
          <img src={article.cover_url} alt={article.cover_alt ?? ""} loading="lazy" />
        ) : (
          <div className="art-card-nocover">
            <IconFile size={26} />
            <span>No cover image</span>
          </div>
        )}
        <div className="art-card-chips">
          <span className={`admin-status admin-status-${article.status}`}>{STATUS_LABEL[article.status]}</span>
          {article.category ? <span className="art-chip">{article.category}</span> : null}
        </div>
      </div>

      <div className="art-card-body">
        <p className="admin-eyebrow">{live ? "Live article" : `${STATUS_LABEL[article.status]} — not on the site`}</p>
        <h2>
          <Link to={`/admin/articles/${article.id}`}>{article.title}</Link>
        </h2>
        <p className="art-card-excerpt">{article.excerpt || "No excerpt has been written yet."}</p>

        <div className="art-card-meta">
          <span><IconEye size={17} /> {formatNumber(article.views)} views</span>
          {article.reading_time_minutes ? <span><IconClock size={17} /> {article.reading_time_minutes} min read</span> : null}
          <span><IconCalendar size={17} /> {live ? formatDate(article.published_at) : `edited ${formatDate(article.updated_at)}`}</span>
        </div>

        <div className="art-card-flags">
          <code>/articles/{article.slug}</code>
          {article.is_featured ? <span className="art-flag art-flag-good">Featured</span> : null}
          {article.noindex ? <span className="art-flag art-flag-warn">Hidden from search</span> : null}
          {!article.cover_url ? <span className="art-flag art-flag-warn">Needs a cover</span> : null}
          {!article.excerpt ? <span className="art-flag art-flag-warn">Needs an excerpt</span> : null}
        </div>
      </div>

      <div className="art-card-actions">
        <Link className="admin-primary admin-primary-link" to={`/admin/articles/${article.id}`}>
          <IconPencil size={17} /> Edit
        </Link>
        <div className="art-card-icons">
          {live ? (
            <a className="art-icon-btn" href={`/articles/${article.slug}`} target="_blank" rel="noreferrer" title="Open the live article">
              <IconExternal size={19} />
            </a>
          ) : null}
          {canDelete ? (
            <button type="button" className="art-icon-btn art-icon-danger" onClick={onDelete} title="Delete this article">
              <IconTrash size={19} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AdminArticles() {
  const { articles } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ error?: string }>();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [pendingDelete, setPendingDelete] = useState<AdminArticleRow | null>(null);

  const counts = useMemo(() => {
    const by = { published: 0, review: 0, draft: 0, archived: 0 } as Record<string, number>;
    for (const article of articles) by[article.status] += 1;
    return by;
  }, [articles]);

  const totalViews = useMemo(() => articles.reduce((sum, a) => sum + a.views, 0), [articles]);
  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category).filter(Boolean))].sort() as string[],
    [articles],
  );

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = articles.filter((article) => {
      if (status !== "all" && article.status !== status) return false;
      if (category !== "all" && article.category !== category) return false;
      if (!needle) return true;
      return [article.title, article.slug, article.category, article.excerpt, article.author]
        .some((value) => value?.toLowerCase().includes(needle));
    });

    return [...filtered].sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      if (sort === "title") return a.title.localeCompare(b.title);
      const aTime = new Date((sort === "recent" ? a.updated_at : a.published_at) || a.updated_at).getTime();
      const bTime = new Date((sort === "recent" ? b.updated_at : b.published_at) || b.updated_at).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [articles, category, search, sort, status]);

  const canDelete = true; // server enforces admin-only; the button just fails loudly for editors

  const confirmDelete = () => {
    if (!pendingDelete) return;
    fetcher.submit({ articleId: pendingDelete.id }, { method: "post" });
    setPendingDelete(null);
  };

  const filters: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "All", count: articles.length },
    { value: "published", label: "Published", count: counts.published },
    { value: "review", label: "In review", count: counts.review },
    { value: "draft", label: "Drafts", count: counts.draft },
    { value: "archived", label: "Archived", count: counts.archived },
  ];

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Publishing workspace</p>
          <h1>Articles</h1>
          <div className="art-head-chips">
            <span className="art-count art-count-good">{counts.published} published</span>
            <span className="art-count art-count-warn">{counts.draft + counts.review} unpublished</span>
            <span className="art-count art-count-info">{formatNumber(totalViews)} views</span>
          </div>
        </div>
        <div className="admin-head-actions">
          <Link className="admin-secondary-link" to="/admin/article-stats">Stats</Link>
          <Link className="admin-primary admin-primary-link" to="/admin/articles/new">
            <IconPlus size={18} /> New article
          </Link>
        </div>
      </header>

      {fetcher.data?.error ? <p className="admin-alert" role="alert">{fetcher.data.error}</p> : null}

      <div className="art-toolbar">
        <div className="admin-filters">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={status === filter.value ? "is-active" : undefined}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label} <b>{filter.count}</b>
            </button>
          ))}
        </div>

        <div className="art-toolbar-right">
          <label className="art-search">
            <IconSearch size={18} />
            <input
              type="search"
              value={search}
              placeholder="Search articles"
              aria-label="Search articles"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select aria-label="Sort articles" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="recent">Recently edited</option>
            <option value="newest">Newest published</option>
            <option value="oldest">Oldest published</option>
            <option value="views">Most viewed</option>
            <option value="title">Title A–Z</option>
          </select>

          <div className="art-viewtoggle" role="group" aria-label="Layout">
            <button type="button" className={view === "grid" ? "is-active" : undefined} onClick={() => setView("grid")} aria-label="Grid view">
              <IconGrid size={19} />
            </button>
            <button type="button" className={view === "list" ? "is-active" : undefined} onClick={() => setView("list")} aria-label="List view">
              <IconRows size={19} />
            </button>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-empty art-empty">
            <IconFile size={34} />
            <h3>No articles yet.</h3>
            <p>
              Write one in <code>content/04-pipeline/</code>, then run{" "}
              <code>npm --prefix pro-site run seed:articles</code> to bring it in as a draft — or start
              from scratch with <b>New article</b>.
            </p>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-empty art-empty">
            <IconSearch size={34} />
            <h3>No matching articles</h3>
            <p>Adjust the status, category or search filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`art-grid art-grid-${view}`}>
            {visible.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                view={view}
                canDelete={canDelete}
                onDelete={() => setPendingDelete(article)}
              />
            ))}
          </div>
          <p className="art-showing">
            Showing {visible.length} of {articles.length} articles
          </p>
        </>
      )}

      {pendingDelete ? (
        <div className="art-modal-backdrop" role="presentation" onClick={() => setPendingDelete(null)}>
          <div className="art-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="delete-title">Delete “{pendingDelete.title}”?</h2>
            <p>
              It comes off the site immediately. A revision snapshot stays in the database, so the
              copy is recoverable — the published URL is not.
            </p>
            <div className="art-modal-actions">
              <button type="button" className="admin-ghost" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button type="button" className="admin-danger" onClick={confirmDelete} disabled={fetcher.state !== "idle"}>
                {fetcher.state !== "idle" ? "Deleting…" : "Delete article"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="admin-return"><Link to="/">Return to the professional website</Link></p>
    </main>
  );
}
