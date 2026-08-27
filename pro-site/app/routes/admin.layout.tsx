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
      { to: "/admin/articles", label: "Articles", glyph: "✎" },
      { to: "/admin/article-stats", label: "Article stats", glyph: "▤" },
      { to: "/admin/chat", label: "Live chat", glyph: "◌" },
      { to: "/admin/media", label: "Media", glyph: "❖" },
      { to: "/admin/qr-codes", label: "QR codes", glyph: "▦" },
    ],
  },
  {
    label: "Trade",
    items: [
      { to: "/admin/resellers", label: "Applications", glyph: "◈" },
      { to: "/admin/accounts", label: "Accounts", glyph: "◆" },
      { to: "/admin/orders", label: "Orders", glyph: "▣" },
      { to: "/admin/invoices", label: "Invoices", glyph: "£" },
      { to: "/admin/data-mode", label: "Data mode", glyph: "◐" },
    ],
  },
];

export default function AdminLayout() {
  const { staff } = useLoaderData<typeof loader>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navGroups = staff.role === "admin"
    ? [...NAV_GROUPS, { label: "Workspace", items: [{ to: "/admin/access-requests", label: "Access requests", glyph: "⌁" }] }]
    : NAV_GROUPS;

  return (
    <div className="admin-app">
      <button
        className="admin-mobile-nav-toggle"
        type="button"
        aria-expanded={mobileNavOpen}
        aria-controls="admin-navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <span aria-hidden="true">☰</span>
        <span>Menu</span>
      </button>
      <button
        className={`admin-mobile-nav-scrim${mobileNavOpen ? " is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside className={`admin-side${mobileNavOpen ? " is-open" : ""}`}>
        <button className="admin-mobile-nav-close" type="button" onClick={() => setMobileNavOpen(false)}>
          <span>Close menu</span><span aria-hidden="true">×</span>
        </button>
        <div className="admin-side-top">
          <Link className="admin-org" to="/admin/articles" onClick={() => setMobileNavOpen(false)}>
            <span className="admin-org-chip">JC</span>
            <span className="admin-org-name">
              <b>Jimmy Coco</b>
              <small>Professional</small>
            </span>
          </Link>

          <div className="admin-user">
            <span className="admin-user-name">
              <b>{staff.displayName}</b>
              <small>{staff.role}</small>
            </span>
            <span className="admin-avatar" aria-hidden="true">
              {initialsOf(staff.displayName)}
            </span>
          </div>

          <nav id="admin-navigation" className="admin-nav" aria-label="Admin navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="admin-nav-block">
                <p className="admin-nav-group">{group.label}</p>
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className="admin-nav-link" onClick={() => setMobileNavOpen(false)}>
                    <i aria-hidden="true">{item.glyph}</i>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="admin-side-foot">
          <div className="admin-restricted">
            <b>Restricted area</b>
            <span>Only active admin users can manage this workspace.</span>
          </div>
          <a className="admin-side-btn" href="/" target="_blank" rel="noreferrer">
            Back to website
          </a>
          <Form method="post" action="/admin/logout">
            <button className="admin-side-signout" type="submit">
              Sign out <span aria-hidden="true">→</span>
            </button>
          </Form>
        </div>
      </aside>

      <div className="admin-body">
        <Outlet />
      </div>
    </div>
  );
}
