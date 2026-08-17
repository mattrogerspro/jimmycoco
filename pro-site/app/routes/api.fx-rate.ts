import type { LoaderFunctionArgs } from "react-router";

/**
 * Same-origin, cacheable GBP/USD reference endpoint.
 *
 * The browser cannot reliably request Frankfurter directly from every visitor
 * origin. This route performs the public, data-only request server-side and
 * gives Vercel a bounded cache window. It deliberately receives no order,
 * salon, visitor or email data.
 */
const FRANKFURTER_GBP_USD = "https://api.frankfurter.dev/v2/rate/GBP/USD";
const CACHE_CONTROL = "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400";

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  try {
    const upstream = await fetch(FRANKFURTER_GBP_USD, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error(`Frankfurter returned ${upstream.status}`);

    const payload = await upstream.json() as { base?: string; quote?: string; rate?: number; date?: string };
    if (payload.base !== "GBP" || payload.quote !== "USD" || typeof payload.rate !== "number" || !Number.isFinite(payload.rate) || typeof payload.date !== "string") {
      throw new Error("Frankfurter returned an invalid GBP/USD payload");
    }

    const body = JSON.stringify({ base: payload.base, quote: payload.quote, rate: payload.rate, date: payload.date, source: "Frankfurter" });
    return new Response(request.method === "HEAD" ? null : body, {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": CACHE_CONTROL },
    });
  } catch (error) {
    console.error("GBP/USD reference lookup failed", error);
    return new Response(JSON.stringify({ error: "USD reference is temporarily unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
