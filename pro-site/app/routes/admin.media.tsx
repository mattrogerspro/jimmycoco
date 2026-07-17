import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { articleMediaUrl, isSameOriginPost, privateNoStoreHeaders } from "../lib/supabase.server";

export const meta: MetaFunction = () => [{ title: "Media library | Jimmy Coco admin" }, { name: "robots", content: "noindex, nofollow" }];
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const { data: media, error } = await supabase.from("article_media").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Response(error.message, { status: 500, headers: responseHeaders });
  return data({ staff, media: (media ?? []).map((item: any) => ({ ...item, url: articleMediaUrl(item.storage_path) })) }, { headers: responseHeaders });
}
export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) return data({ error: "The request could not be verified." }, { status: 403, headers: privateNoStoreHeaders() });
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const form = await request.formData();
  const intent = String(form.get("intent") || "upload");
  if (intent.startsWith("delete:")) {
    if (staff.role !== "admin") return data({ error: "Only administrators can delete media." }, { status: 403, headers: responseHeaders });
    const id = intent.slice(7);
    const { data: item } = await supabase.from("article_media").select("storage_path").eq("id", id).maybeSingle();
    if (!item) return data({ error: "Media item not found." }, { status: 404, headers: responseHeaders });
    const { error: storageError } = await supabase.storage.from("article-media").remove([item.storage_path]);
    if (storageError) return data({ error: storageError.message }, { status: 400, headers: responseHeaders });
    const { error } = await supabase.from("article_media").delete().eq("id", id);
    return error ? data({ error: error.message }, { status: 400, headers: responseHeaders }) : data({ success: true }, { headers: responseHeaders });
  }
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return data({ error: "Choose an image to upload." }, { status: 400, headers: responseHeaders });
  const allowed: Record<string, string> = { "image/avif": "avif", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = allowed[file.type];
  if (!ext || file.size > 5 * 1024 * 1024) return data({ error: "Use AVIF, JPEG, PNG or WebP up to 5 MB." }, { status: 400, headers: responseHeaders });
  const path = `articles/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("article-media").upload(path, file, { contentType: file.type });
  if (uploadError) return data({ error: uploadError.message }, { status: 400, headers: responseHeaders });
  const { error } = await supabase.from("article_media").insert({ storage_path: path, alt_text: String(form.get("alt_text") || "").trim(), title: String(form.get("title") || "").trim() || null, mime_type: file.type, size_bytes: file.size });
  return error ? data({ error: error.message }, { status: 400, headers: responseHeaders }) : data({ success: true }, { headers: responseHeaders });
}
export default function AdminMedia() {
  const { media, staff }: any = useLoaderData<typeof loader>(); const result = useActionData<typeof action>(); const navigation = useNavigation();
  return <main className="admin-main"><header className="admin-page-head"><div><p className="admin-eyebrow">Publishing workspace</p><h1>Media</h1><p>Reusable article images · {media.length} items</p></div></header>{result && "error" in result && <div className="admin-alert">{result.error}</div>}<Form method="post" encType="multipart/form-data" className="admin-media-upload"><input type="file" name="file" accept="image/avif,image/jpeg,image/png,image/webp" required /><input name="alt_text" placeholder="Alternative text" required /><input name="title" placeholder="Internal title (optional)" /><button className="admin-primary" disabled={navigation.state !== "idle"}>Upload image</button></Form><section className="admin-media-grid">{media.map((item: any) => <article key={item.id}><img src={item.url} alt={item.alt_text} /><div><strong>{item.title || item.storage_path.split("/").pop()}</strong><p>{item.alt_text || "No alternative text"}</p><input readOnly value={item.url} onFocus={(event) => event.currentTarget.select()} />{staff.role === "admin" && <Form method="post"><button className="admin-media-delete" name="intent" value={`delete:${item.id}`} onClick={(event) => { if (!confirm("Delete this image? Articles using it will lose their image.")) event.preventDefault(); }}>Delete</button></Form>}</div></article>)}</section></main>;
}
