import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

/**
 * Only the pages whose content lives in this repository are prerendered.
 *
 * Articles used to be in this list, resolved by querying Supabase at build
 * time. That baked every article into static HTML, which meant editing one in
 * the admin changed nothing on the live site until the next deploy — the CMS
 * appeared to save and then do nothing, no matter how hard the reader
 * refreshed. Publishing a new article had the same problem.
 *
 * Articles are therefore server-rendered on request and cached at the edge for
 * a minute (see the Cache-Control in each route's loader). An edit is live
 * within that minute, everywhere, with no build.
 *
 * A second thing this fixes: the build no longer needs a database. It used to
 * fail outright if Supabase was unreachable or the keys were missing from the
 * build environment.
 */
export default {
  ssr: true,
  presets: [vercelPreset()],
  prerender: ["/", "/products/malibu-professional-spray-1l", "/tools/spray-tan-profit-calculator"],
} satisfies Config;
