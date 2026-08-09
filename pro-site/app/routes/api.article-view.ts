import type { ActionFunctionArgs } from "react-router";
import { recordArticleView } from "../lib/article-view.server";

/**
 * Records one article read, from the browser.
 *
 * This used to be called from the article loader, which was wrong and quietly
 * broke the stats page: the article route is CDN-cached, so on a repeat view
 * the edge serves the stored HTML and the loader never runs on the origin.
 * Every view after the first inside the cache window recorded nothing — which
 * is why ten reads of an article showed up as one.
 *
 * A page cannot be both edge-cached and server-counted. Moving the write to a
 * POST the browser makes after paint fixes it, and picks up two things for
 * free:
 *
 *   - it only fires in a real browser that runs JavaScript, which excludes most
 *     crawlers before the user-agent test even sees them
 *   - it costs the reader nothing, because it happens after the page is up
 *
 * Actions are never cached, so this always reaches the origin. The server-side
 * bot, Do-Not-Track and published-slug checks in recordArticleView all still
 * apply — this route only changes *when* it is called, not what it trusts.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Same-origin only. Without this the endpoint is a free view counter for
  // anyone who wants to inflate someone else's numbers from a script.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return new Response(null, { status: 204 });
  }

  let slug = "";
  try {
    const body = await request.json();
    slug = typeof body?.slug === "string" ? body.slug.slice(0, 200) : "";
  } catch {
    return new Response(null, { status: 204 });
  }
  if (!slug) return new Response(null, { status: 204 });

  recordArticleView(request, slug);

  // 204 and no body: the browser is not waiting on this and nothing about the
  // response should be cacheable.
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Nothing to GET. Keeps the route from rendering an empty document. */
export function loader() {
  return new Response("Not found", { status: 404 });
}
