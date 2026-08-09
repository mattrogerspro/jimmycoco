import { useEffect } from "react";

/**
 * Fires one view record per article, per page visit.
 *
 * Deliberately not a loader call — see routes/api.article-view.ts for why the
 * server-side version could not work behind a CDN cache.
 *
 * The module-level Set is what stops React's development double-render, and a
 * client-side navigation back to the same article in the same session, from
 * counting twice. It resets on a full page load, which is the behaviour we
 * want: a genuine second visit is a second view.
 */
const recorded = new Set<string>();

/**
 * The first version of this component returned here and sent nothing, which is
 * why ten reads of an article still showed as one: Do Not Track is switched on
 * in a lot of browsers — and forced on by several privacy extensions — so most
 * real traffic was being discarded before it left the page.
 *
 * Counting a page read is not tracking. The view is now always recorded; this
 * flag travels with it so the server stores the row with no visitor hash at
 * all. A Do Not Track reader therefore counts towards reads, never towards
 * uniques, and leaves nothing that could be tied back to them.
 */
function doNotTrack() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { msDoNotTrack?: string | null };
  const win = window as unknown as { doNotTrack?: string | null };
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1" || win.doNotTrack === "1";
}

export function ArticleViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug || recorded.has(slug)) return;
    recorded.add(slug);

    const body = JSON.stringify({ slug, dnt: doNotTrack() });

    const send = () => {
      // keepalive lets the request survive the reader navigating away
      // immediately, which is exactly when a bounce would otherwise go
      // uncounted.
      fetch("/api/article-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // A failed count must never surface to the reader.
      });
    };

    // After paint, so it cannot compete with the cover image for bandwidth.
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(send, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const timer = setTimeout(send, 1200);
    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
