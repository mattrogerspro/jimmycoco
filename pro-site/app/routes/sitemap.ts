import type { LoaderFunctionArgs } from "react-router";
import { getPublishedArticles } from "../lib/articles.server";
import { CONTENT_UPDATED, SITE_URL } from "../lib/site";
const escape = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" }[char]!));
export async function loader(_: LoaderFunctionArgs) {
  const articles = await getPublishedArticles(1000);
  const staticPaths = ["/", "/products/malibu-professional-spray-1l", "/articles", "/tools/spray-tan-profit-calculator"];
  const urls = [...staticPaths.map((path) => ({ path, updated_at: CONTENT_UPDATED })), ...articles.filter((article: any) => !article.noindex).map((article: any) => ({ path: `/articles/${article.slug}`, updated_at: article.updated_at }))];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((entry) => `  <url><loc>${escape(`${SITE_URL}${entry.path}`)}</loc>${entry.updated_at ? `<lastmod>${entry.updated_at.slice(0, 10)}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
