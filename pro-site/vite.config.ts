import { execSync } from "node:child_process";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

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

/**
 * Put executable assets from each release in their own directory. Vercel can
 * briefly serve a new HTML document before every edge has the matching chunks;
 * a 404 cached under a shared /assets URL then leaves React unable to hydrate.
 * A commit-scoped directory makes those failed URLs impossible to reuse in a
 * later release.
 */
function resolveBuildAssetVersion() {
  const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12);
  if (vercelCommit && /^[a-zA-Z0-9_-]+$/.test(vercelCommit)) return vercelCommit;
  try {
    const commit = execSync("git rev-parse --short=12 HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^[a-zA-Z0-9_-]+$/.test(commit)) return commit;
  } catch {
    // Local archives without git still receive an isolated build directory.
  }
  return "local";
}

const buildAssetVersion = resolveBuildAssetVersion();

export default defineConfig({
  plugins: [reactRouter()],
  resolve: { tsconfigPaths: true },
  build: {
    assetsDir: `assets/build-${buildAssetVersion}`,
  },
  define: {
    __CONTENT_UPDATED__: JSON.stringify(resolveContentDate()),
  },
});
