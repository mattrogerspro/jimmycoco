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
];

export async function loader(_: LoaderFunctionArgs) {
  return data(
    { articles: await getPublishedArticles() },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } },
  );
}

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export default function ArticlesPage() {
  const { articles } = useLoaderData<typeof loader>();
  return <>
    <Announcement />
    <SiteHeader page="content" />
    <main className="articles-page">
      <header className="articles-hero"><p>Professional journal</p><h1>Advice for better tans<br /><em>and stronger salons.</em></h1></header>
      <section className="articles-grid" aria-label="Published articles">
        {articles.map((article: any) => <article className="article-card" key={article.id}>
          <Link to={`/articles/${article.slug}`} className="article-card-image">
            {article.cover_url ? <img src={article.cover_url} alt={article.cover?.alt_text || ""} loading="lazy" /> : <span />}
          </Link>
          <div><p className="article-card-meta">{article.category?.name || "Professional advice"} · {formatDate(article.published_at)}</p><h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><Link className="article-read" to={`/articles/${article.slug}`}>Read article →</Link></div>
        </article>)}
        {!articles.length && <p className="articles-empty">The first articles are being prepared.</p>}
      </section>
    </main>
    <SiteFooter page="content" />
  </>;
}
