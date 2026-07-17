import type { LoaderFunctionArgs } from "react-router";
import { getPublishedArticles } from "../lib/articles.server";
import { SITE_URL } from "../lib/site";
const escape = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" }[char]!));
export async function loader(_: LoaderFunctionArgs) {
  const articles = await getPublishedArticles(100);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Sunless by Jimmy Coco Professional Journal</title><link>${SITE_URL}/articles</link><description>Professional spray tanning and salon guidance.</description>${articles.map((article: any) => `<item><title>${escape(article.title)}</title><link>${SITE_URL}/articles/${article.slug}</link><guid>${SITE_URL}/articles/${article.slug}</guid><description>${escape(article.excerpt || "")}</description><pubDate>${new Date(article.published_at).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
