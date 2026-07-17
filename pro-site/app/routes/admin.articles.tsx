import { Link, useRouteLoaderData } from "react-router";
import type { loader as adminLoader } from "./admin.layout";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function AdminArticles() {
  const adminData = useRouteLoaderData<typeof adminLoader>("routes/admin.layout");

  if (!adminData) return null;

  const { articles, staff } = adminData;

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Publishing workspace</p>
          <h1>Articles</h1>
          <p>
            Signed in as {staff.displayName} · <span className="admin-role">{staff.role}</span>
          </p>
        </div>
        <Link className="admin-primary admin-primary-link" to="/admin/articles/new">New article</Link>
      </header>

      <section className="admin-panel" aria-labelledby="article-list-title">
        <div className="admin-panel-head">
          <h2 id="article-list-title">All articles</h2>
          <span>{articles.length} total</span>
        </div>

        {articles.length === 0 ? (
          <div className="admin-empty">
            <h3>No articles yet.</h3>
            <p>The secure workspace is ready. The editor and publishing controls come next.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <strong><Link to={`/admin/articles/${article.id}`}>{article.title}</Link></strong>
                      <span>/articles/{article.slug}</span>
                    </td>
                    <td><span className={`admin-status admin-status-${article.status}`}>{article.status}</span></td>
                    <td>{dateFormatter.format(new Date(article.updated_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-return"><Link to="/">Return to the professional website</Link></p>
    </main>
  );
}
