import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import articleStyles from "../styles/articles.css?url";
import chromeStyles from "../styles/chrome.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { getPublishedArticle } from "../lib/articles.server";
import { SITE_URL } from "../lib/site";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: articleStyles }, { rel: "stylesheet", href: chromeStyles }];

export async function loader({ params }: LoaderFunctionArgs) {
  const article = await getPublishedArticle(params.slug ?? "");
  if (!article) throw new Response("Article not found", { status: 404 });
  return data({ article }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } });
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.article) return [{ title: "Article not found | Jimmy Coco" }, { name: "robots", content: "noindex" }];
  const article: any = loaderData.article;
  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const title = article.seo_title || `${article.title} | Sunless by Jimmy Coco`;
  const description = article.meta_description || article.excerpt || "";
  return [
    { title }, { name: "description", content: description },
    { name: "robots", content: article.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
    { property: "og:type", content: "article" }, { property: "og:title", content: article.og_title || title },
    { property: "og:description", content: article.og_description || description }, { property: "og:url", content: canonical },
    ...(article.cover_url ? [{ property: "og:image", content: article.cover_url }] : []),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function ArticlePage() {
  const { article }: any = useLoaderData<typeof loader>();
  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.meta_description || article.excerpt, image: article.cover_url ? [article.cover_url] : undefined, datePublished: article.published_at, dateModified: article.updated_at, author: { "@type": "Person", name: article.author?.name || "Jimmy Coco" }, publisher: { "@type": "Organization", name: "Sunless by Jimmy Coco", url: SITE_URL }, mainEntityOfPage: canonical, keywords: article.keywords?.join(", ") };
  const faq = article.faq_items?.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.faq_items.map((item: any) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) } : null;
  return <div className="content-shell">
    <StructuredData data={faq ? [schema, faq] : [schema]} />
    <Announcement /><SiteHeader page="content" />
    <main className="article-page">
      <article>
        <header className="article-hero"><Link to="/articles">Professional journal</Link><h1>{article.title}</h1><p>{article.excerpt}</p><div>{article.author?.name || "Jimmy Coco"} · {article.reading_time_minutes || 5} min read</div></header>
        {article.cover_url && <figure className="article-cover"><img src={article.cover_url} alt={article.cover?.alt_text || article.title} /></figure>}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content_html }} />
        {!!article.citations?.length && <aside className="article-sources"><h2>Sources</h2><ol>{article.citations.map((citation: any, index: number) => <li key={index}>{citation.url ? <a href={citation.url} rel="noreferrer">{citation.text}</a> : citation.text}</li>)}</ol></aside>}
      </article>
    </main>
    <SiteFooter page="content" />
  </div>;
}
