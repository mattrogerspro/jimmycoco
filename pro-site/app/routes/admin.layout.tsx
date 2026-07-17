import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Form, Link, Outlet, data } from "react-router";
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
  { title: "Articles | Jimmy Coco admin" },
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

export default function AdminLayout() {
  return (
    <div className="admin-app">
      <header className="admin-header">
        <Link className="admin-wordmark admin-wordmark-compact" to="/admin/articles">
          <span>Sunless</span>
          <small>Article admin</small>
        </Link>
        <nav aria-label="Article admin navigation">
          <Link to="/admin/articles">Articles</Link>
          <Link to="/admin/media">Media</Link>
          <a href="/" target="_blank" rel="noreferrer">View website</a>
          <Form method="post" action="/admin/logout">
            <button type="submit">Sign out</button>
          </Form>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
