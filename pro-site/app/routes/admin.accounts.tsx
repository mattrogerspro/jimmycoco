import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listResellers } from "../lib/resellers.server";

export const meta: MetaFunction = () => [
  { title: "Trade accounts | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const resellers = await listResellers(supabase);
  return data({ resellers }, { headers: responseHeaders });
}

export default function AdminAccounts() {
  const { resellers } = useLoaderData<typeof loader>();

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade accounts</p>
          <h1>Accounts</h1>
          <p>{resellers.length} account{resellers.length === 1 ? "" : "s"} · approved stockists and their status</p>
        </div>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-head"><h2>All accounts</h2></div>
        {resellers.length === 0 ? (
          <div className="admin-empty">No trade accounts yet. Approve an application to create one.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Tier</th>
                  <th scope="col">Portal</th>
                  <th scope="col">Status</th>
                  <th scope="col">Approved</th>
                </tr>
              </thead>
              <tbody>
                {resellers.map((reseller) => (
                  <tr key={reseller.id}>
                    <td>
                      <strong><Link to={`/admin/accounts/${reseller.id}`}>{reseller.business_name}</Link></strong>
                      <span>{reseller.account_code}</span>
                    </td>
                    <td>{reseller.contact_name}<span>{reseller.email}</span></td>
                    <td style={{ textTransform: "capitalize" }}>
                      {reseller.pricing_tier}
                      {Number(reseller.discount_percent) > 0 ? <span>{reseller.discount_percent}% off trade</span> : null}
                    </td>
                    <td>{reseller.user_id ? "Signed up" : "Not signed up"}</td>
                    <td><span className={`admin-status admin-status-${reseller.status}`}>{reseller.status}</span></td>
                    <td>{reseller.approved_at ? new Date(reseller.approved_at).toLocaleDateString("en-GB") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
