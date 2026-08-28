// api/[...route].js

// Map route paths to their handlers
const routes = {
  // Auth
  "auth/login": () => import("./_routes/auth/login.js"),
  "auth/logout": () => import("./_routes/auth/logout.js"),
  "auth/session": () => import("./_routes/auth/session.js"),

  // Campaigns
  "campaigns/audience-import-history": () => import("./_routes/campaigns/audience-import-history.js"),
  "campaigns/contact-activity": () => import("./_routes/campaigns/contact-activity.js"),
  "campaigns/enroll": () => import("./_routes/campaigns/enroll.js"),
  "campaigns/exit": () => import("./_routes/campaigns/exit.js"),
  "campaigns/history": () => import("./_routes/campaigns/history.js"),
  "campaigns/import-audience": () => import("./_routes/campaigns/import-audience.js"),
  "campaigns/kill-switch": () => import("./_routes/campaigns/kill-switch.js"),
  "campaigns/stats": () => import("./_routes/campaigns/stats.js"),
  "campaigns/stop": () => import("./_routes/campaigns/stop.js"),

  // Lifecycle & Preferences
  "lifecycle/trigger": () => import("./_routes/lifecycle/trigger.js"),
  "preferences/unsubscribe": () => import("./_routes/preferences/unsubscribe.js"),

  // Health
  "health": () => import("./_routes/health.js"),
};

export default async function handler(req, res) {
  // Extract path from query or URL (e.g., /api/auth/login -> "auth/login")
  let path = req.query.route;
  if (Array.isArray(path)) {
    path = path.join("/");
  } else if (!path) {
    path = req.url.replace(/^\/api\//, "").split("?")[0];
  }

  // Remove trailing slashes and .js extensions if passed
  path = path.replace(/\/$/, "").replace(/\.js$/, "");

  const routeModuleLoader = routes[path];

  if (!routeModuleLoader) {
    return res.status(404).json({ error: `Route /api/${path} not found` });
  }

  try {
    const routeModule = await routeModuleLoader();
    const handlerFn = routeModule.default || routeModule;
    return await handlerFn(req, res);
  } catch (error) {
    console.error(`Error executing /api/${path}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}