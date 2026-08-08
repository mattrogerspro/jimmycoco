import { createHash } from "node:crypto";
import { createPublicSupabaseClient } from "./supabase.server";

/**
 * Records one article read.
 *
 * Called from the article route loader and deliberately fire-and-forget: a
 * failure here must never cost a reader their page. Writes go through the
 * `record_article_view` security-definer function, so the public site needs no
 * elevated key and cannot log a view against an unpublished slug.
 *
 * Nothing personally identifying is stored. The referrer is reduced to its
 * host, and the visitor hash is salted with the current date so it stops being
 * linkable to anyone once the day rolls over.
 */

const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|curl|wget|python-requests|axios|node-fetch/i;
const MOBILE = /android|iphone|ipod|iemobile|blackberry|opera mini|mobile safari|windows phone/i;

function referrerHost(value: string | null) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "";
}

export function recordArticleView(request: Request, slug: string) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT.test(userAgent)) return;

  // Respect an explicit Do Not Track signal rather than logging anyway.
  if (request.headers.get("dnt") === "1") return;

  const url = new URL(request.url);
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256")
    .update(`${day}:${clientAddress(request)}:${userAgent}`)
    .digest("hex")
    .slice(0, 32);

  const payload = {
    p_slug: slug,
    p_path: url.pathname,
    p_referrer: referrerHost(request.headers.get("referer")),
    p_device: MOBILE.test(userAgent) ? "mobile" : "desktop",
    p_visitor_hash: visitorHash,
  };

  void createPublicSupabaseClient()
    .rpc("record_article_view", payload)
    .then(({ error }) => {
      if (error) console.error("Could not record article view", error.message);
    })
    .catch((error: unknown) => {
      console.error("Could not record article view", error);
    });
}
