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
 *
 * DO NOT TRACK. This used to discard the view entirely, which is why the stats
 * page under-reported so badly: the signal is on in a large share of browsers
 * and forced on by common privacy extensions. Counting a page read is not
 * tracking, so the read is recorded — but with no visitor hash written at all.
 * A Do Not Track reader counts towards reads, never towards uniques, and the
 * row holds nothing that could be tied back to them.
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

export function recordArticleView(
  request: Request,
  slug: string,
  options: { doNotTrack?: boolean } = {},
) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT.test(userAgent)) return;

  // Either the browser sent the header, or the beacon read navigator.doNotTrack
  // and told us. Chrome only sends the header on a same-site request, so the
  // explicit flag is the one that can be relied on.
  const doNotTrack = options.doNotTrack === true || request.headers.get("dnt") === "1";

  const url = new URL(request.url);
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = doNotTrack
    ? null
    : createHash("sha256")
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

  void (async () => {
    try {
      const { error } = await createPublicSupabaseClient().rpc("record_article_view", payload);
      if (error) console.error("Could not record article view", error.message);
    } catch (error) {
      console.error("Could not record article view", error);
    }
  })();
}
