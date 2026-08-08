import type { LoaderFunctionArgs } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { getArticleStats, type ArticleStats } from "../lib/article-stats.server";
import {
  IconCalendar,
  IconChart,
  IconCrown,
  IconEye,
  IconGlobe,
  IconPhone,
  IconPulse,
  IconTrend,
  IconUsers,
  IconWarning,
} from "../components/admin/AdminIcons";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const stats = await getArticleStats(supabase);
  return data({ stats }, { headers: responseHeaders });
}

const formatNumber = (value: number) => value.toLocaleString("en-GB");
const shortDate = (date: string) =>
  date ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`)) : "n/a";

function StatCard({
  label,
  value,
  suffix,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  helper: string;
  tone: "info" | "gold" | "good" | "plum";
  icon: React.ReactNode;
}) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top">
        <div>
          <span>{label}</span>
          <b>
            {formatNumber(value)}
            {suffix ? <i>{suffix}</i> : null}
          </b>
        </div>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <p>{helper}</p>
    </div>
  );
}

function TrafficPulse({ stats }: { stats: ArticleStats }) {
  const max = Math.max(1, ...stats.viewsByDay.map((day) => day.count));
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div className="stat-panel-title">
          <span className="stat-panel-icon"><IconTrend size={20} /></span>
          <div>
            <h2>Traffic pulse</h2>
            <p>Last 30 days, with active days and peak demand surfaced.</p>
          </div>
        </div>
        <div className="art-head-chips">
          <span className="art-count">{stats.activeDays} active days</span>
          <span className="art-count art-count-warn">
            Peak {stats.peak.count} on {shortDate(stats.peak.date)}
          </span>
        </div>
      </div>
      <div className="pulse-chart" role="img" aria-label={`Daily article views for the last 30 days. Peak ${stats.peak.count} views.`}>
        {stats.viewsByDay.map((day, index) => {
          const isPeak = day.count > 0 && day.count === stats.peak.count;
          const height = day.count > 0 ? Math.max(5, Math.round((day.count / max) * 100)) : 2;
          return (
            <div className="pulse-col" key={day.date}>
              <div className="pulse-track">
                <div
                  className={`pulse-bar${isPeak ? " is-peak" : ""}${day.count === 0 ? " is-empty" : ""}`}
                  style={{ height: `${height}%` }}
                  title={`${shortDate(day.date)}: ${day.count} views`}
                />
              </div>
              <span>{index % 7 === 0 ? shortDate(day.date) : ""}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Leaderboard({ stats }: { stats: ArticleStats }) {
  const max = Math.max(1, ...stats.topPosts.map((post) => post.allTime));
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div className="stat-panel-title">
          <span className="stat-panel-icon"><IconCrown size={20} /></span>
          <div>
            <h2>Content leaderboard</h2>
            <p>Ranked by all-time reach, with recent traction alongside it.</p>
          </div>
        </div>
        <span className="art-count">{stats.topPosts.length} articles</span>
      </div>

      {stats.topPosts.length === 0 ? (
        <div className="admin-empty">No views recorded yet.</div>
      ) : (
        <ol className="leaderboard">
          {stats.topPosts.map((post, index) => (
            <li key={post.slug} className={index === 0 ? "is-first" : undefined}>
              <span className="leaderboard-rank">{index + 1}</span>
              <div className="leaderboard-title">
                <b>{post.title}</b>
                <code>/articles/{post.slug}</code>
              </div>
              <div className="leaderboard-bar">
                <div className="leaderboard-bar-head">
                  <span>All time</span>
                  <b>{formatNumber(post.allTime)}</b>
                </div>
                <div className="leaderboard-track">
                  <div style={{ width: `${Math.round((post.allTime / max) * 100)}%` }} />
                </div>
              </div>
              <div className="leaderboard-recent">
                <span>30 days</span>
                <b>{formatNumber(post.last30)}</b>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Sources({ stats }: { stats: ArticleStats }) {
  const max = Math.max(1, ...stats.topReferrers.map((referrer) => referrer.count));
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div className="stat-panel-title">
          <span className="stat-panel-icon"><IconGlobe size={20} /></span>
          <div>
            <h2>Reader sources</h2>
            <p>Where visits are coming from.</p>
          </div>
        </div>
      </div>
      <div className="admin-panel-body">
        {stats.topReferrers.length === 0 ? (
          <p className="admin-muted">No referrer data yet.</p>
        ) : (
          <ul className="sources">
            {stats.topReferrers.map((referrer) => (
              <li key={referrer.host}>
                <div className="sources-row">
                  <span>{referrer.host}</span>
                  <b>{formatNumber(referrer.count)}</b>
                </div>
                <div className="sources-track">
                  <div style={{ width: `${Math.round((referrer.count / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Snapshot({ stats }: { stats: ArticleStats }) {
  const share = stats.allTimeTotal > 0 ? Math.round((stats.last30 / stats.allTimeTotal) * 100) : 0;
  const top = stats.topPosts[0];
  return (
    <section className="admin-panel snapshot">
      <div className="admin-panel-body">
        <p className="admin-eyebrow">Traffic snapshot</p>
        <ul>
          <li><IconPulse size={19} /> <b>{share}%</b> of all views happened in the last 30 days</li>
          <li><IconPhone size={19} /> <b>{stats.mobileShare}%</b> mobile readership</li>
          <li><IconUsers size={19} /> <b>{formatNumber(stats.uniqueVisitors)}</b> rough unique readers this month</li>
          {top ? <li><IconCrown size={19} /> Top article: <b>{top.title}</b></li> : null}
        </ul>
      </div>
    </section>
  );
}

export default function AdminArticleStats() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Publishing workspace</p>
          <h1>Article stats</h1>
          <div className="art-head-chips">
            <span className="art-count art-count-good">{formatNumber(stats.last30)} views / 30d</span>
            <span className="art-count">{stats.topPosts.length} ranked articles</span>
          </div>
        </div>
        <div className="admin-head-actions">
          <Link className="admin-secondary-link" to="/admin/articles">Back to articles</Link>
        </div>
      </header>

      {stats.unavailable ? (
        <div className="admin-alert art-alert-setup" role="status">
          <IconWarning size={20} />
          <div>
            <b>Analytics tables are not in place yet.</b>
            <span>
              Apply <code>supabase/migrations/20260808120000_article_views.sql</code>, then reads will
              start being recorded on published articles.
            </span>
          </div>
        </div>
      ) : null}

      <div className="stat-grid">
        <StatCard label="Views all time" value={stats.allTimeTotal} tone="info" icon={<IconEye size={21} />}
          helper="Total article reads captured by the site's own tracker." />
        <StatCard label="Last 7 days" value={stats.last7} tone="gold" icon={<IconCalendar size={21} />}
          helper="Short-term demand and recent content pull." />
        <StatCard label="Last 30 days" value={stats.last30} tone="good" icon={<IconTrend size={21} />}
          helper={`${stats.averageDaily} average views per day across the period.`} />
        <StatCard label="Mobile share" value={stats.mobileShare} suffix="%" tone="plum" icon={<IconPhone size={21} />}
          helper="Most salon owners read between clients. Design for it." />
      </div>

      <div className="stat-layout">
        <div className="stat-layout-main">
          <TrafficPulse stats={stats} />
          <Leaderboard stats={stats} />
        </div>
        <aside className="stat-layout-side">
          <Snapshot stats={stats} />
          <Sources stats={stats} />
        </aside>
      </div>

      <p className="admin-return">
        <IconChart size={16} /> Counts exclude bots and anyone sending a Do&nbsp;Not&nbsp;Track header.
        Nothing personally identifying is stored — the referrer is reduced to a host and the visitor
        hash rotates daily.
      </p>
    </main>
  );
}
