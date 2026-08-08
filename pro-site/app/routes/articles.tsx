import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import articleStyles from "../styles/articles.css?url";
import chromeStyles from "../styles/chrome.css?url";
import { Announcement, SiteFooter, SiteHeader } from "../components/shared/SiteChrome";
import { getPublishedArticles } from "../lib/articles.server";
import { SITE_URL } from "../lib/site";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: articleStyles },
  { rel: "stylesheet", href: chromeStyles },
];
export const meta: MetaFunction = () => [
  { title: "Professional Spray Tan Articles | Sunless by Jimmy Coco" },
  { name: "description", content: "Professional spray tanning guidance, salon education and expert advice from Sunless by Jimmy Coco." },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "website" },
  { property: "og:title", content: "Professional Spray Tan Articles | Sunless by Jimmy Coco" },
  { property: "og:url", content: `${SITE_URL}/articles` },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/articles` },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: `${SITE_URL}/articles` },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}/articles` },
];

export async function loader(_: LoaderFunctionArgs) {
  return data(
    { articles: await getPublishedArticles() },
    // s-maxage keeps the edge cache useful; stale-while-revalidate is deliberately
    // SHORT. At 86400 the CDN served a day-old copy of this page while it
    // revalidated behind the reader — which is why a freshly seeded article, or a
    // newly attached cover, appeared only after a hard refresh.
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

/** Static files in public/img/articles/, produced by scripts/generate-article-images.mjs.
 *  Missing frames simply never fade in, so this is safe to ship before they all exist. */
const HERO_FRAMES = [
  "/img/articles/journal-hero-1.webp",
  "/img/articles/journal-hero-2.webp",
  "/img/articles/journal-hero-3.webp",
  "/img/articles/journal-hero-4.webp",
  "/img/articles/journal-hero-5.webp",
];

export default function ArticlesPage() {
  const { articles } = useLoaderData<typeof loader>();
  return <div className="content-shell">
    <Announcement />
    <SiteHeader page="content" />
    <main className="articles-page">
      <header className="articles-lead">
        {/* Five frames on one CSS loop. Only the first is eager so the page
            paints on a single image; the rest arrive lazily behind it. */}
        <div className="articles-lead-frames" aria-hidden="true">
          {HERO_FRAMES.map((src, index) => (
            <img key={src} src={src} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          ))}
        </div>
        <span className="articles-lead-scrim" aria-hidden="true" />
        <div className="articles-lead-copy">
          <p>Professional journal</p>
          <h1>Advice for better tans<br /><em>and stronger salons.</em></h1>
        </div>
      </header>
      <section className="articles-grid" aria-label="Published articles">
        {articles.map((article: any) => <article className="article-card" key={article.id}>
          <Link to={`/articles/${article.slug}`} className="article-card-image">
            {article.cover_url ? <img src={article.cover_url} alt={article.cover?.alt_text || ""} loading="lazy" /> : <span className="article-card-fallback" />}
            <span className="article-card-scrim" aria-hidden="true" />
            {article.category?.name ? <span className="article-card-chip">{article.category.name}</span> : null}
          </Link>
          <div className="article-card-body">
            <h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2>
            <span className="article-card-rule" aria-hidden="true" />
            <p className="article-card-excerpt">{article.excerpt}</p>
            <div className="article-card-foot">
              <span className="article-card-meta">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                {article.reading_time_minutes || 5} min read
                <i aria-hidden="true">·</i>
                {formatDate(article.published_at)}
              </span>
              <span className="article-read">Read article <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span>
            </div>
          </div>
        </article>)}
        {!articles.length && <p className="articles-empty">The first articles are being prepared.</p>}
      </section>
    </main>
    <SiteFooter page="content" />
  </div>;
}
