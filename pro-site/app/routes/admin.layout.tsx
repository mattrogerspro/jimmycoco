import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { useState } from "react";
import { Form, Link, NavLink, Outlet, data, useLoaderData } from "react-router";
import adminStyles from "../styles/admin.css?url";
import { requireArticleStaff } from "../lib/article-auth.server";

export type AdminArticleSummary = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  updated_at: string;
  published_at: string | null;
};

const ICONS: Record<string, string> = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  sequence: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  monitor: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  contacts: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
};

function AdminIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.overview }} />
  );
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: adminStyles },
];

export const meta: MetaFunction = () => [
  { title: "Admin | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export const headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, updated_at, published_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Unable to load article list", error.message);
    throw new Response("The article list is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  return data(
    { staff, articles: (articles ?? []) as AdminArticleSummary[] },
    { headers: responseHeaders },
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { to: "/admin/articles", label: "Articles", icon: "book" },
      { to: "/admin/article-stats", label: "Article stats", icon: "sequence" },
      { to: "/admin/chat", label: "Live chat", icon: "mail" },
      { to: "/admin/media", label: "Media", icon: "monitor" },
      { to: "/admin/qr-codes", label: "QR codes", icon: "overview" },
    ],
  },
  {
    label: "Trade",
    items: [
      { to: "/admin/resellers", label: "Applications", icon: "contacts" },
      { to: "/admin/sample-requests", label: "Sample requests", icon: "send" },
      { to: "/admin/accounts", label: "Accounts", icon: "contacts" },
      { to: "/admin/orders", label: "Orders", icon: "book" },
      { to: "/admin/invoices", label: "Invoices", icon: "mail" },
      { to: "/admin/data-mode", label: "Data mode", icon: "power" },
    ],
  },
];

export default function AdminLayout() {
  const { staff } = useLoaderData<typeof loader>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navGroups = staff.role === "admin"
    ? [...NAV_GROUPS, { label: "Admin", items: [{ to: "/admin/access-requests", label: "Access requests", icon: "upload" }] }]
    : NAV_GROUPS;

  return (
    <div className={"admin-app" + (sidebarCollapsed ? " sidebar-is-collapsed" : "")}>
      <button
        className="admin-nav-reopen"
        type="button"
        aria-label="Open workspace navigation"
        onClick={() => setSidebarCollapsed(false)}
      >
        <AdminIcon name="menu" />
      </button>
      <button
        className={`admin-mobile-nav-scrim${mobileNavOpen ? " is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside className={`admin-side${mobileNavOpen ? " is-open" : ""}`}>
        <div className="admin-side-head">
          <Link className="admin-brand-mark" to="/admin" onClick={() => setMobileNavOpen(false)} aria-label="Sunless by Jimmy Coco">
            <span>SUNLESS</span>
            <small>BY JIMMY COCO</small>
          </Link>
          <button className="admin-icon-button admin-sidebar-collapse" type="button" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse workspace navigation"><AdminIcon name="close" /></button>
          <button className="admin-icon-button admin-mobile-nav-close" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><AdminIcon name="close" /></button>
        </div>
        <div className="admin-side-top">
          <nav id="admin-navigation" className="admin-nav" aria-label="Admin navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="admin-nav-block">
                <p className="admin-nav-group">{group.label}</p>
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className="admin-nav-link" onClick={() => setMobileNavOpen(false)}>
                    <AdminIcon name={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="admin-side-foot">
          <div className="admin-environment-card">
            <span className="admin-env-dot" />
            <div>
              <strong>Production workspace</strong>
              <span>Supabase connected</span>
            </div>
          </div>
          <div className="admin-profile-row">
            <span className="admin-avatar" aria-hidden="true">{initialsOf(staff.displayName)}</span>
            <div><strong>{staff.displayName}</strong><span>{staff.role}</span></div>
            <Form method="post" action="/admin/logout"><button className="admin-side-signout" type="submit">Sign out</button></Form>
          </div>
        </div>
      </aside>

      <div className="admin-body">
        <button className="admin-mobile-menu-trigger" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><AdminIcon name="menu" /></button>
        <Outlet />
      </div>
    </div>
  );
}
