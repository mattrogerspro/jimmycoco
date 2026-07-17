import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { cleanArticleHtml } from "../lib/articles.server";
import { requireArticleStaff } from "../lib/article-auth.server";
import { articleMediaUrl, isSameOriginPost, privateNoStoreHeaders } from "../lib/supabase.server";

export const meta: MetaFunction = () => [{ title: "Article editor | Jimmy Coco admin" }, { name: "robots", content: "noindex, nofollow" }];
const slugify = (value: string) => value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const pairs = (value: string, first: string, second: string) => lines(value).map((line) => { const [head, ...rest] = line.split("|"); return { [first]: head.trim(), [second]: rest.join("|").trim() }; }).filter((item) => item[first as keyof typeof item] && item[second as keyof typeof item]);

async function namedRecord(supabase: any, table: "article_authors" | "article_categories" | "article_tags", name: string) {
  if (!name) return null;
  const slug = slugify(name);
  const { data: existing } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
  if (existing) return existing.id;
  const payload = table === "article_authors" ? { name, slug } : { name, slug };
  const { data: created, error } = await supabase.from(table).insert(payload).select("id").single();
  if (error) throw error;
  return created.id;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (params.articleId === "new") return data({ article: null, tags: [], revisions: [], staff }, { headers: responseHeaders });
  const { data: article, error } = await supabase.from("articles").select(`*, author:article_authors(name), category:article_categories(name), cover:article_media!articles_cover_media_id_fkey(storage_path, alt_text)`).eq("id", params.articleId).maybeSingle();
  if (error) throw new Response(error.message, { status: 500, headers: responseHeaders });
  if (!article) throw new Response("Article not found", { status: 404, headers: responseHeaders });
  const [{ data: assignments }, { data: revisions }] = await Promise.all([
    supabase.from("article_tag_assignments").select("tag:article_tags(name)").eq("article_id", article.id),
    supabase.from("article_revisions").select("id, revision_number, operation, changed_by, created_at").eq("article_uuid", article.id).order("revision_number", { ascending: false }).limit(20),
  ]);
  return data({ article: { ...article, cover_url: articleMediaUrl(article.cover?.storage_path) }, tags: (assignments ?? []).map((item: any) => item.tag?.name).filter(Boolean), revisions: revisions ?? [], staff }, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) return data({ error: "The request could not be verified." }, { status: 403, headers: privateNoStoreHeaders() });
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const form = await request.formData();
  const intent = text(form, "intent") || "save";
  const id = params.articleId === "new" ? null : params.articleId;
  if (intent.startsWith("restore:") && id) {
    const revisionId = Number(intent.slice("restore:".length));
    const { data: revision } = await supabase.from("article_revisions").select("snapshot").eq("id", revisionId).eq("article_uuid", id).maybeSingle();
    if (!revision) return data({ error: "That revision could not be loaded." }, { status: 404, headers: responseHeaders });
    const snapshot: any = revision.snapshot;
    if (staff.role === "editor" && !["draft", "review"].includes(snapshot.status)) return data({ error: "An administrator must restore published or archived revisions." }, { status: 403, headers: responseHeaders });
    const restorable = { slug: snapshot.slug, title: snapshot.title, excerpt: snapshot.excerpt, content_html: cleanArticleHtml(snapshot.content_html || ""), author_id: snapshot.author_id, category_id: snapshot.category_id, cover_media_id: snapshot.cover_media_id, status: snapshot.status, seo_title: snapshot.seo_title, meta_description: snapshot.meta_description, og_title: snapshot.og_title, og_description: snapshot.og_description, og_media_id: snapshot.og_media_id, keywords: snapshot.keywords || [], faq_items: snapshot.faq_items || [], citations: snapshot.citations || [], reading_time_minutes: snapshot.reading_time_minutes, is_featured: snapshot.is_featured, noindex: snapshot.noindex, published_at: snapshot.published_at };
    const { error } = await supabase.from("articles").update(restorable).eq("id", id);
    if (error) return data({ error: error.message }, { status: 400, headers: responseHeaders });
    return redirect(`/admin/articles/${id}?restored=1`, { headers: responseHeaders });
  }
  if (intent === "delete") {
    if (staff.role !== "admin" || !id) return data({ error: "Only administrators can delete articles." }, { status: 403, headers: responseHeaders });
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return data({ error: error.message }, { status: 400, headers: responseHeaders });
    return redirect("/admin/articles", { headers: responseHeaders });
  }

  const title = text(form, "title");
  const slug = slugify(text(form, "slug") || title);
  const status = text(form, "status") || "draft";
  if (!title || !slug) return data({ error: "Title and URL slug are required." }, { status: 400, headers: responseHeaders });
  if (staff.role === "editor" && !["draft", "review"].includes(status)) return data({ error: "Editors can save drafts or submit for review; an administrator publishes." }, { status: 403, headers: responseHeaders });

  try {
    const authorId = await namedRecord(supabase, "article_authors", text(form, "author"));
    const categoryId = await namedRecord(supabase, "article_categories", text(form, "category"));
    let coverMediaId = text(form, "cover_media_id") || null;
    const cover = form.get("cover");
    if (cover instanceof File && cover.size > 0) {
      const allowed: Record<string, string> = { "image/avif": "avif", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
      const ext = allowed[cover.type];
      if (!ext || cover.size > 5 * 1024 * 1024) throw new Error("Images must be AVIF, JPEG, PNG or WebP and no larger than 5 MB.");
      const path = `articles/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("article-media").upload(path, cover, { contentType: cover.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: media, error: mediaError } = await supabase.from("article_media").insert({ storage_path: path, alt_text: text(form, "cover_alt"), mime_type: cover.type, size_bytes: cover.size }).select("id").single();
      if (mediaError) throw mediaError;
      coverMediaId = media.id;
    }

    const existingPublishedAt = text(form, "published_at") || null;
    const payload = {
      title, slug, excerpt: text(form, "excerpt") || null, content_html: cleanArticleHtml(text(form, "content_html")),
      author_id: authorId, category_id: categoryId, cover_media_id: coverMediaId, status,
      seo_title: text(form, "seo_title") || null, meta_description: text(form, "meta_description") || null,
      og_title: text(form, "og_title") || null, og_description: text(form, "og_description") || null,
      keywords: lines(text(form, "keywords").replaceAll(",", "\n")),
      faq_items: pairs(text(form, "faq"), "question", "answer"), citations: pairs(text(form, "citations"), "text", "url"),
      reading_time_minutes: Math.max(1, Number(text(form, "reading_time_minutes")) || 5),
      is_featured: form.get("is_featured") === "on", noindex: form.get("noindex") === "on",
      published_at: status === "published" ? (existingPublishedAt || new Date().toISOString()) : null,
    };
    const query = id ? supabase.from("articles").update(payload).eq("id", id) : supabase.from("articles").insert(payload);
    const { data: saved, error } = await query.select("id").single();
    if (error) throw error;

    const tagNames = lines(text(form, "tags").replaceAll(",", "\n"));
    await supabase.from("article_tag_assignments").delete().eq("article_id", saved.id);
    for (const tagName of tagNames) {
      const tagId = await namedRecord(supabase, "article_tags", tagName);
      if (tagId) { const { error: tagError } = await supabase.from("article_tag_assignments").insert({ article_id: saved.id, tag_id: tagId }); if (tagError) throw tagError; }
    }

    if (status === "published" && process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" }).catch((error) => console.error("Article deploy hook failed", error));
    }
    return redirect(`/admin/articles/${saved.id}?saved=1`, { headers: responseHeaders });
  } catch (error) {
    return data({ error: error instanceof Error ? error.message : "The article could not be saved." }, { status: 400, headers: responseHeaders });
  }
}

export default function AdminArticleEditor() {
  const { article, tags, revisions, staff }: any = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const faq = (article?.faq_items ?? []).map((item: any) => `${item.question} | ${item.answer}`).join("\n");
  const citations = (article?.citations ?? []).map((item: any) => `${item.text} | ${item.url || ""}`).join("\n");
  return <main className="admin-main admin-editor">
    <header className="admin-editor-head"><div><Link to="/admin/articles">← All articles</Link><h1>{article ? "Edit article" : "New article"}</h1></div><span>{staff.role}</span></header>
    {actionData?.error && <div className="admin-alert" role="alert">{actionData.error}</div>}
    <Form method="post" encType="multipart/form-data" className="admin-editor-form">
      <input type="hidden" name="cover_media_id" value={article?.cover_media_id || ""} /><input type="hidden" name="published_at" value={article?.published_at || ""} />
      <section className="admin-editor-main"><div className="admin-field"><label>Article title</label><input name="title" defaultValue={article?.title} required /></div><div className="admin-field"><label>URL slug</label><input name="slug" defaultValue={article?.slug} placeholder="generated-from-title" /></div><div className="admin-field"><label>Excerpt</label><textarea name="excerpt" defaultValue={article?.excerpt} rows={4} /></div><div className="admin-field"><label>Article HTML</label><textarea className="admin-content-input" name="content_html" defaultValue={article?.content_html} rows={24} required /></div></section>
      <aside className="admin-editor-side">
        <section><h2>Publishing</h2><div className="admin-field"><label>Status</label><select name="status" defaultValue={article?.status || "draft"}><option value="draft">Draft</option><option value="review">Ready for review</option>{staff.role === "admin" && <><option value="published">Published</option><option value="archived">Archived</option></>}</select></div><div className="admin-field"><label>Reading time (minutes)</label><input type="number" min="1" max="180" name="reading_time_minutes" defaultValue={article?.reading_time_minutes || 5} /></div><label className="admin-check"><input type="checkbox" name="is_featured" defaultChecked={article?.is_featured} /> Featured</label><label className="admin-check"><input type="checkbox" name="noindex" defaultChecked={article?.noindex} /> Hide from search engines</label></section>
        <section><h2>Organisation</h2><div className="admin-field"><label>Author</label><input name="author" defaultValue={article?.author?.name || "Jimmy Coco"} /></div><div className="admin-field"><label>Category</label><input name="category" defaultValue={article?.category?.name || ""} /></div><div className="admin-field"><label>Tags</label><input name="tags" defaultValue={tags.join(", ")} placeholder="salon, technique" /></div></section>
        <section><h2>Cover image</h2>{article?.cover_url && <img className="admin-cover-preview" src={article.cover_url} alt="" />}<div className="admin-field"><input type="file" name="cover" accept="image/avif,image/jpeg,image/png,image/webp" /></div><div className="admin-field"><label>Alternative text</label><input name="cover_alt" defaultValue={article?.cover?.alt_text || ""} /></div></section>
        <section><h2>Search and sharing</h2><div className="admin-field"><label>SEO title</label><input name="seo_title" defaultValue={article?.seo_title || ""} maxLength={120} /></div><div className="admin-field"><label>Meta description</label><textarea name="meta_description" defaultValue={article?.meta_description || ""} rows={4} maxLength={320} /></div><div className="admin-field"><label>Social title</label><input name="og_title" defaultValue={article?.og_title || ""} /></div><div className="admin-field"><label>Social description</label><textarea name="og_description" defaultValue={article?.og_description || ""} rows={3} /></div><div className="admin-field"><label>Keywords</label><input name="keywords" defaultValue={(article?.keywords || []).join(", ")} /></div></section>
        <section><h2>Structured content</h2><div className="admin-field"><label>FAQs — one “Question | Answer” per line</label><textarea name="faq" defaultValue={faq} rows={5} /></div><div className="admin-field"><label>Sources — one “Label | URL” per line</label><textarea name="citations" defaultValue={citations} rows={5} /></div></section>
      </aside>
      <div className="admin-editor-actions"><button className="admin-primary" name="intent" value="save" disabled={busy}>{busy ? "Saving…" : "Save article"}</button>{article && staff.role === "admin" && <button className="admin-danger" name="intent" value="delete" formNoValidate onClick={(event) => { if (!confirm("Delete this article permanently?")) event.preventDefault(); }}>Delete</button>}</div>
    </Form>
    {!!revisions.length && <section className="admin-revisions"><h2>Revision history</h2><ul>{revisions.map((revision: any) => <li key={revision.id}><span>Revision {revision.revision_number} · {revision.operation} · {new Date(revision.created_at).toLocaleString("en-GB")}</span><Form method="post"><button name="intent" value={`restore:${revision.id}`} onClick={(event) => { if (!confirm(`Restore revision ${revision.revision_number}? The current version will remain in history.`)) event.preventDefault(); }}>Restore</button></Form></li>)}</ul></section>}
  </main>;
}
