// ~/jimmycoco/api/index.js

const routes = {
  // Auth
  "auth/login": () => import("../server/auth/login.js"),
  "auth/logout": () => import("../server/auth/logout.js"),
  "auth/session": () => import("../server/auth/session.js"),

  // Campaigns
  "campaigns/audience-import-history": () => import("../server/campaigns/audience-import-history.js"),
  "campaigns/contact-activity": () => import("../server/campaigns/contact-activity.js"),
  "campaigns/enroll": () => import("../server/campaigns/enroll.js"),
  "campaigns/exit": () => import("../server/campaigns/exit.js"),
  "campaigns/history": () => import("../server/campaigns/history.js"),
  "campaigns/import-audience": () => import("../server/campaigns/import-audience.js"),
  "campaigns/kill-switch": () => import("../server/campaigns/kill-switch.js"),
  "campaigns/stats": () => import("../server/campaigns/stats.js"),
  "campaigns/stop": () => import("../server/campaigns/stop.js"),

  // Lifecycle & Preferences
  "lifecycle/trigger": () => import("../server/lifecycle/trigger.js"),
  "preferences/unsubscribe": () => import("../server/preferences/unsubscribe.js"),

  // Health
  "health": () => import("../server/health.js"),
  "healthz": () => import("../server/health.js"),
};

export default async function handler(req, res) {
  let path = (req.url || "")
    .replace(/^\/api\//, "")
    .replace(/^\//, "")
    .split("?")[0]
    .replace(/\/$/, "")
    .replace(/\.js$/, "");

  const loader = routes[path];
  if (!loader) {
    console.warn(`[API] 404 Route not found: "${path}" (URL: "${req.url}")`);
    return res.status(404).json({ error: `Route /api/${path} not found` });
  }

  try {
    const mod = await loader();
    const fn = mod.default || mod;
    return await fn(req, res);
  } catch (err) {
    console.error(`Error executing /api/${path}:`, err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}