import sanitizeHtml from "sanitize-html";
import { articleMediaUrl, createPublicSupabaseClient } from "./supabase.server";

export const ARTICLE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "blockquote",
    "ul", "ol", "li", "a", "img", "figure", "figcaption", "table", "thead",
    "tbody", "tr", "th", "td", "hr", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true),
  },
};

export function cleanArticleHtml(value: string) {
  return sanitizeHtml(value, ARTICLE_HTML_OPTIONS);
}

const ARTICLE_SELECT = `
  id, slug, title, excerpt, content_html, status, seo_title, meta_description,
  og_title, og_description, keywords, faq_items, citations, reading_time_minutes,
  is_featured, noindex, published_at, created_at, updated_at,
  author:article_authors(name, slug, job_title, bio, avatar_url, website_url),
  category:article_categories(name, slug),
  cover:article_media!articles_cover_media_id_fkey(storage_path, alt_text, width, height),
  tag_assignments:article_tag_assignments(tag:article_tags(name, slug))
`;

export function mapArticle(row: any) {
  return {
    ...row,
    content_html: cleanArticleHtml(row.content_html ?? ""),
    cover_url: articleMediaUrl(row.cover?.storage_path),
    tags: (row.tag_assignments ?? []).map((item: any) => item.tag).filter(Boolean),
  };
}

export async function getPublishedArticles(limit = 100) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapArticle);
}

export async function getPublishedArticle(slug: string) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ? mapArticle(data) : null;
}
