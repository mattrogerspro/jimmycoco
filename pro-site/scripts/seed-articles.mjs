#!/usr/bin/env node
/**
 * Seeds the Jimmy Coco professional site's articles from the authored content
 * in scripts/blog-content/. Modelled on the Oxford Roof Masters seeder.
 *
 * Inserts each article as a DRAFT so it can be reviewed and published from
 * /admin/articles. Idempotent: re-running updates existing articles by slug
 * rather than duplicating them, and preserves publish state on re-run.
 *
 * Usage (service-role key required):
 *   npm run seed:articles                # reads .env.local for SUPABASE_URL +
 *                                        # SUPABASE_SERVICE_ROLE_KEY
 *
 * Flags:
 *   --publish    seed as published rather than draft
 *   --dry-run    report what would be written, touch nothing
 *
 * Evidence gate: any article whose body still contains a [VERIFY] marker is
 * refused, not seeded. That is deliberate — an unresolved figure must never
 * reach the site. See content/01-editorial-system/evidence-standard.md.
 */

import { createClient } from "@supabase/supabase-js";
import batch1 from "./blog-content/posts-1.mjs";

const ARTICLES = [...batch1];

/** Applied to every article — nothing that does not vary lives in a post file. */
const AUTHORS = {
  "The Craft": "Jimmy Coco",
  default: "Sunless by Jimmy Coco Trade Team",
};

const PUBLISH = process.argv.includes("--publish");
const DRY_RUN = process.argv.includes("--dry-run");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — expected in .env.local.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);

/**
 * Resolve a name to a row id in one of the lookup tables, creating it if new.
 * Mirrors namedRecord() in app/routes/admin.article-editor.tsx, so the seeder
 * and the editor cannot diverge on how a category or tag comes into being.
 */
async function namedRecord(table, name) {
  if (!name) return null;
  const slug = slugify(name);
  const { data: existing, error: lookupError } = await supabase
    .from(table)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from(table)
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

/** Stagger publish dates a week apart, newest first, ending a day before now. */
const dateFor = (index) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (index * 7 + 1));
  d.setUTCHours(9, 0, 0, 0);
  return d.toISOString();
};

let created = 0;
let updated = 0;
let refused = 0;

for (const [index, post] of ARTICLES.entries()) {
  const content = post.content.trim();

  const markers = content.match(/\[VERIFY[^\]]*\]/g);
  if (markers) {
    refused += 1;
    console.error(`  ✗ ${post.slug}: refused — unresolved ${markers.join(", ")}`);
    continue;
  }

  if (DRY_RUN) {
    console.log(`  · ${post.slug}: would seed (${content.length} chars, ${post.faq.length} FAQ, ${post.citations.length} sources)`);
    continue;
  }

  const authorName = AUTHORS[post.category] ?? AUTHORS.default;
  const [authorId, categoryId] = await Promise.all([
    namedRecord("article_authors", authorName),
    namedRecord("article_categories", post.category),
  ]);

  const row = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content_html: content,
    author_id: authorId,
    category_id: categoryId,
    status: PUBLISH ? "published" : "draft",
    seo_title: post.seoTitle ?? null,
    meta_description: post.metaDescription ?? null,
    og_title: post.ogTitle ?? null,
    og_description: post.ogDescription ?? null,
    keywords: post.keywords ?? [],
    faq_items: post.faq ?? [],
    citations: post.citations ?? [],
    reading_time_minutes: post.readingTimeMinutes ?? 5,
    is_featured: post.isFeatured ?? false,
    noindex: false,
    published_at: PUBLISH ? dateFor(index) : null,
  };

  const { data: existing, error: lookupError } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", row.slug)
    .maybeSingle();
  if (lookupError) {
    console.error(`  ✗ ${row.slug}: lookup failed — ${lookupError.message}`);
    continue;
  }

  let articleId;
  if (existing) {
    // Preserve publish state and date on re-run; only refresh the content.
    const { status, published_at, ...contentOnly } = row;
    void status;
    void published_at;
    const { error } = await supabase.from("articles").update(contentOnly).eq("id", existing.id);
    if (error) {
      console.error(`  ✗ ${row.slug}: update failed — ${error.message}`);
      continue;
    }
    articleId = existing.id;
    updated += 1;
    console.log(`  ↻ updated  ${row.slug}`);
  } else {
    const { data: inserted, error } = await supabase.from("articles").insert(row).select("id").single();
    if (error) {
      console.error(`  ✗ ${row.slug}: insert failed — ${error.message}`);
      continue;
    }
    articleId = inserted.id;
    created += 1;
    console.log(`  + created  ${row.slug}  (${PUBLISH ? "published" : "draft"})`);
  }

  // Tags are a join table, so replace the set rather than appending to it.
  await supabase.from("article_tag_assignments").delete().eq("article_id", articleId);
  for (const tagName of post.tags ?? []) {
    const tagId = await namedRecord("article_tags", tagName);
    if (!tagId) continue;
    const { error } = await supabase
      .from("article_tag_assignments")
      .insert({ article_id: articleId, tag_id: tagId });
    if (error) console.error(`    ! ${row.slug}: tag "${tagName}" failed — ${error.message}`);
  }
}

const summary = DRY_RUN
  ? `Dry run. ${ARTICLES.length - refused} would be seeded, ${refused} refused.`
  : `Done. ${created} created, ${updated} updated, ${refused} refused, ${ARTICLES.length} total.`;
console.log(`\n${summary}`);

if (refused) {
  console.log("Refused articles have unresolved [VERIFY] markers. Resolve them in");
  console.log("content/04-pipeline/<slug>/research.md, regenerate, and re-run.");
}

// Cover images are not seeded: they need an article_media row, which comes from
// uploading through /admin/articles. Add them there once the drafts land.
