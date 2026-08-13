import { execSync } from "node:child_process";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

// One-time cache reset after an earlier deployment allowed missing asset
// responses to be cached as immutable. Adding this banner changes every
// JavaScript chunk hash without changing the public /assets directory, so
// browsers cannot reuse those poisoned 404 entries.
const ASSET_CACHE_RESET = "2026-08-13-reset-1";

/**
 * Date the site's content last changed, resolved at BUILD time and baked into
 * the bundle. Feeds sitemap <lastmod> and dateModified in structured data.
 *
 * Preference order:
 *  1. The commit date of the last commit that touched a content-bearing path.
 *     This is the honest answer: it only moves when pages actually change, so
 *     redeploying a config tweak does not falsely claim the content is new.
 *  2. The build date, if git is unavailable or the clone is too shallow to
 *     answer (Vercel shallow-clones, so this fallback does get used).
 */
function resolveContentDate() {
  try {
    const out = execSync(
      "git log -1 --format=%cs -- app/routes app/components app/styles",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    // git missing or shallow clone — fall through
  }
  return new Date().toISOString().slice(0, 10);
}

export default defineConfig({
  plugins: [reactRouter()],
  build: {
    rollupOptions: {
      output: {
        banner: `/* jimmy-coco-asset-reset:${ASSET_CACHE_RESET} */`,
      },
    },
  },
  resolve: { tsconfigPaths: true },
  define: {
    __CONTENT_UPDATED__: JSON.stringify(resolveContentDate()),
  },
});
