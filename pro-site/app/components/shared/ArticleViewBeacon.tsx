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

export function ArticleViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug || recorded.has(slug)) return;
    recorded.add(slug);

    // Respect the browser signal here as well as on the server, so a reader who
    // has asked not to be tracked does not even send the request.
    if (navigator.doNotTrack === "1" || (window as any).doNotTrack === "1") return;

    const send = () => {
      const body = JSON.stringify({ slug });
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
