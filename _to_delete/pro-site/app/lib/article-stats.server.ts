import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Article analytics, aggregated for the admin dashboard.
 *
 * Mirrors the Oxford Roof Masters blog-stats shape so the two dashboards read
 * the same way: all-time totals come from the fast counter on `articles`, and
 * the time, referrer and device breakdowns come from a bounded window of raw
 * `article_views` rows.
 */

const DAY_MS = 864e5;
const WINDOW_DAYS = 30;
const RAW_ROW_LIMIT = 20000;

export type StatsPost = {
  slug: string;
  title: string;
  status: string;
  allTime: number;
  last30: number;
};

export type ArticleStats = {
  allTimeTotal: number;
  last7: number;
  last30: number;
  mobileShare: number;
  uniqueVisitors: number;
  averageDaily: number;
  activeDays: number;
  peak: { date: string; count: number };
  viewsByDay: Array<{ date: string; count: number }>;
  topPosts: StatsPost[];
  topReferrers: Array<{ host: string; count: number }>;
  /** True when the analytics migration has not been applied yet. */
  unavailable: boolean;
};

const emptyStats = (unavailable: boolean): ArticleStats => ({
  allTimeTotal: 0,
  last7: 0,
  last30: 0,
  mobileShare: 0,
  uniqueVisitors: 0,
  averageDaily: 0,
  activeDays: 0,
  peak: { date: "", count: 0 },
  viewsByDay: buildDays({}),
  topPosts: [],
  topReferrers: [],
  unavailable,
});

function buildDays(byDay: Record<string, number>) {
  const now = Date.now();
  const days: Array<{ date: string; count: number }> = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    days.push({ date, count: byDay[date] ?? 0 });
  }
  return days;
}

export async function getArticleStats(supabase: SupabaseClient): Promise<ArticleStats> {
  const now = Date.now();
  const since30 = new Date(now - WINDOW_DAYS * DAY_MS).toISOString();
  const since7 = new Date(now - 7 * DAY_MS).toISOString();

  const [postsResult, rawResult] = await Promise.all([
    supabase.from("articles").select("slug, title, status, views").order("views", { ascending: false }),
    supabase
      .from("article_views")
      .select("slug, referrer, device, visitor_hash, created_at")
      .gte("created_at", since30)
      .limit(RAW_ROW_LIMIT),
  ]);

  // The dashboard should degrade rather than 500 if the migration is pending.
  if (postsResult.error || rawResult.error) {
    console.error(
      "Article stats unavailable",
      postsResult.error?.message ?? rawResult.error?.message,
    );
    return emptyStats(true);
  }

  const posts = postsResult.data ?? [];
  const rows = rawResult.data ?? [];

  const perSlug30: Record<string, number> = {};
  const referrers: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const visitors = new Set<string>();
  let last7 = 0;
  let mobile = 0;

  for (const row of rows) {
    perSlug30[row.slug] = (perSlug30[row.slug] ?? 0) + 1;
    const host = row.referrer || "Direct / none";
    referrers[host] = (referrers[host] ?? 0) + 1;
    const day = String(row.created_at).slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
    if (row.created_at >= since7) last7 += 1;
    if (row.device === "mobile") mobile += 1;
    if (row.visitor_hash) visitors.add(row.visitor_hash);
  }

  const viewsByDay = buildDays(byDay);
  const peak = viewsByDay.reduce(
    (best, day) => (day.count > best.count ? day : best),
    { date: "", count: 0 },
  );

  return {
    allTimeTotal: posts.reduce((sum, post) => sum + (post.views ?? 0), 0),
    last7,
    last30: rows.length,
    mobileShare: rows.length ? Math.round((mobile / rows.length) * 100) : 0,
    uniqueVisitors: visitors.size,
    averageDaily: Math.round(rows.length / WINDOW_DAYS),
    activeDays: viewsByDay.filter((day) => day.count > 0).length,
    peak,
    viewsByDay,
    topPosts: posts
      .map((post) => ({
        slug: post.slug,
        title: post.title,
        status: post.status,
        allTime: post.views ?? 0,
        last30: perSlug30[post.slug] ?? 0,
      }))
      .sort((a, b) => b.allTime - a.allTime)
      .slice(0, 25),
    topReferrers: Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([host, count]) => ({ host, count })),
    unavailable: false,
  };
}
