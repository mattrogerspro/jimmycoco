import type { HeadersFunction, LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import articleStyles from "../styles/articles.css?url";
import chromeStyles from "../styles/chrome.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { getPublishedArticle, getPublishedArticles } from "../lib/articles.server";
import { ArticleViewBeacon } from "../components/shared/ArticleViewBeacon";
import { ORG_ID, PERSON_ID, brandEntities } from "../lib/entity";
import { SIZES, responsiveSrcSet } from "../lib/responsive-image";
import { PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";

const fallbackSocialImage = absoluteUrl("/social/articles-og-1200x630.jpg");

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: articleStyles },
  { rel: "stylesheet", href: chromeStyles },
];

export async function loader({ params }: LoaderFunctionArgs) {
  const article = await getPublishedArticle(params.slug ?? "");
  if (!article) throw new Response("Article not found", { status: 404 });

  // Newest first, so the "previous" article is the one published after this
  // one. Related prefers the same category and falls back to recency.
  const all = await getPublishedArticles(100);
  const index = all.findIndex((item: any) => item.slug === article.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const sameCategory = all.filter(
    (item: any) => item.slug !== article.slug && item.category?.slug && item.category.slug === article.category?.slug,
  );
  const related = [...sameCategory, ...all.filter((item: any) => item.slug !== article.slug && !sameCategory.includes(item))].slice(0, 3);

  return data(
    { article, newer, older, related },
    // s-maxage keeps the edge cache useful; stale-while-revalidate is deliberately
    // SHORT. At 86400 the CDN served a day-old copy of this page while it
    // revalidated behind the reader — which is why a freshly seeded article, or a
    // newly attached cover, appeared only after a hard refresh.
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}

/**
 * Without this the Cache-Control set in the loader never reaches the document
 * response, and the page falls back to Vercel's default — which is what makes
 * an edit look like it did not save.
 */
export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control") ?? "public, s-maxage=60, stale-while-revalidate=120",
});

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.article) return [{ title: "Article not found | Jimmy Coco" }, { name: "robots", content: "noindex" }];
  const article: any = loaderData.article;
  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const title = article.seo_title || `${article.title} | Sunless by Jimmy Coco`;
  const description = article.meta_description || article.excerpt || "";
  const socialImage = article.cover_url || fallbackSocialImage;
  const socialImageAlt = article.cover?.alt_text || article.title;
  return [
    { title }, { name: "description", content: description },
    { name: "robots", content: article.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
    { property: "og:type", content: "article" }, { property: "og:title", content: article.og_title || title },
    { property: "og:description", content: article.og_description || description }, { property: "og:url", content: canonical },
    { property: "og:image", content: socialImage },
    { property: "og:image:alt", content: socialImageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: socialImage },
    { name: "twitter:image:alt", content: socialImageAlt },
    { tagName: "link", rel: "canonical", href: canonical },
    { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: canonical },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonical },
  ];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

/** The brand byline is the organisation, not a person. */
const BRAND_AUTHORS = ["Sunless by Jimmy Coco Trade Team", "Sunless by Jimmy Coco"];

export default function ArticlePage() {
  const { article, newer, older, related }: any = useLoaderData<typeof loader>();
  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const authorName: string = article.author?.name || "Jimmy Coco";
  const isBrand = BRAND_AUTHORS.includes(authorName);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description || article.excerpt,
    image: article.cover_url ? [article.cover_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: isBrand
      ? { "@id": ORG_ID }
      : authorName === "Jimmy Coco"
        ? { "@id": PERSON_ID }
        : { "@type": "Person", name: authorName },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: canonical,
    keywords: article.keywords?.join(", "),
    wordCount: article.content_html ? article.content_html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length : undefined,
  };

  const faq = article.faq_items?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq_items.map((item: any) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Professional", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  return (
    <div className="content-shell">
      {/* The cover is the LCP element on every article, and it lives on a third
          origin, so the browser only discovers it after parsing the markup.
          React 19 hoists this into <head>, which starts the fetch alongside the
          CSS instead of behind it. imageSrcSet/imageSizes must mirror the <img>
          exactly or the browser preloads one candidate and then downloads a
          different one. */}
      {article.cover_url ? (
        <link
          rel="preload"
          as="image"
          href={article.cover_url}
          imageSrcSet={responsiveSrcSet(article.cover_url)}
          imageSizes={SIZES.lead}
          fetchPriority="high"
        />
      ) : null}
      <ArticleViewBeacon slug={article.slug} />
      <StructuredData data={[...brandEntities, schema, breadcrumbs, ...(faq ? [faq] : [])]} />
      <Announcement />
      <SiteHeader page="content" />

      <main className="article-page">
        <article>
          {/* Full-bleed lead. The cover fills the viewport width, the navigation
              and the title sit on top of it, and a two-stop scrim keeps both
              legible without dimming the whole photograph. */}
          <header className={`article-lead${article.cover_url ? "" : " is-plain"}`}>
            {article.cover_url ? (
              <img className="article-lead-img" src={article.cover_url} srcSet={responsiveSrcSet(article.cover_url)} sizes={SIZES.lead} alt={article.cover?.alt_text || ""} width={2752} height={1536} fetchPriority="high" decoding="async" />
            ) : null}
            <span className="article-lead-scrim" aria-hidden="true" />

            <nav className="article-nav" aria-label="Article navigation">
              <div>
                {older ? (
                  <Link to={`/articles/${older.slug}`}>
                    <span>← Previous</span>
                    <b>{older.title}</b>
                  </Link>
                ) : <span className="article-nav-empty" />}
              </div>
              <Link className="article-nav-all" to="/articles">All articles</Link>
              <div className="article-nav-next">
                {newer ? (
                  <Link to={`/articles/${newer.slug}`}>
                    <span>Next →</span>
                    <b>{newer.title}</b>
                  </Link>
                ) : <span className="article-nav-empty" />}
              </div>
            </nav>

            <div className="article-lead-copy">
              <p className="article-kicker">
                {article.category?.name ? <span className="article-tag">{article.category.name}</span> : null}
                {article.published_at ? <span>{formatDate(article.published_at)}</span> : null}
                <span>{article.reading_time_minutes || 5} min read</span>
              </p>
              <h1>{article.title}</h1>
            </div>
          </header>

          <div className="article-hero">
            {article.excerpt ? <p className="article-standfirst">{article.excerpt}</p> : null}

            <div className="article-byline">
              <span className="article-byline-mark" aria-hidden="true">{isBrand ? "JC" : authorName.slice(0, 1)}</span>
              <span>
                <b>By {authorName}</b>
                {article.author?.job_title ? <small>{article.author.job_title}</small> : null}
                {article.author?.bio ? <small>{article.author.bio}</small> : null}
              </span>
            </div>
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content_html }} />

          {article.faq_items?.length ? (
            <section className="article-faq" aria-labelledby="faq-title">
              <h2 id="faq-title">Frequently asked questions</h2>
              {article.faq_items.map((item: any, index: number) => (
                <details key={index} name="article-faq">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
          ) : null}

          {article.citations?.length ? (
            <aside className="article-sources">
              <h2>Sources</h2>
              <p className="article-sources-note">Every figure in this article traces to one of these.</p>
              <ol>
                {article.citations.map((citation: any, index: number) => (
                  <li key={index}>
                    {citation.url ? <a href={citation.url} rel="noreferrer nofollow" target="_blank">{citation.text}</a> : citation.text}
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}
        </article>

        {related.length ? (
          <section className="article-related" aria-labelledby="related-title">
            <h2 id="related-title">Keep reading</h2>
            <div className="article-related-grid">
              {related.map((item: any) => (
                <article className="article-card" key={item.id}>
                  <Link to={`/articles/${item.slug}`} className="article-card-image">
                    {item.cover_url ? <img src={item.cover_url} srcSet={responsiveSrcSet(item.cover_url)} sizes={SIZES.card} alt={item.cover?.alt_text || ""} loading="lazy" decoding="async" /> : <span className="article-card-fallback" />}
                    <span className="article-card-scrim" aria-hidden="true" />
                    {item.category?.name ? <span className="article-card-chip">{item.category.name}</span> : null}
                  </Link>
                  <div className="article-card-body">
                    <h2><Link to={`/articles/${item.slug}`}>{item.title}</Link></h2>
                    <span className="article-card-rule" aria-hidden="true" />
                    <p className="article-card-excerpt">{item.excerpt}</p>
                    <div className="article-card-foot">
                      <span className="article-card-meta">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        {item.reading_time_minutes || 5} min read
                        {item.published_at ? <><i aria-hidden="true">·</i>{formatDate(item.published_at)}</> : null}
                      </span>
                      <span className="article-read">Read article <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="article-cta">
          <div>
            <p className="article-kicker">Professional trial</p>
            <h2>Judge the colour on a real client.</h2>
            <p>
              A complimentary professional trial — the Sunset litre and Jimmy's shade guide, posted this
              week. No cost, no commitment, and the guide is yours either way.
            </p>
            <div className="article-cta-actions">
              <Link className="btn btn-bronze" to="/#trial">Request a free trial</Link>
              <Link className="btn btn-ghost-light" to={PRODUCT_PATH}>Order the litre — £60</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter page="content" />
    </div>
  );
}
