import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { createClient } from "@supabase/supabase-js";

async function prerenderRoutes() {
  const routes = ["/", "/products/malibu-professional-spray-1l", "/tools/spray-tan-profit-calculator"];
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return routes;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) throw new Error(`Could not load published article routes: ${error.message}`);
  return [...routes, "/articles", ...(data ?? []).map((article) => `/articles/${article.slug}`)];
}

export default {
  ssr: true,
  presets: [vercelPreset()],
  prerender: prerenderRoutes,
} satisfies Config;
