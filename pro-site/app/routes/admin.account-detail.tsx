import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getReseller, listOrdersDetailed, updateReseller } from "../lib/resellers.server";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Trade account | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const reseller = await getReseller(supabase, params.resellerId as string);
  if (!reseller) throw new Response("Account not found", { status: 404, headers: responseHeaders });
  const orders = await listOrdersDetailed(supabase, reseller.id);
  return data({ reseller, orders }, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  try {
    await updateReseller(supabase, params.resellerId as string, {
      pricing_tier: String(form.get("pricingTier") ?? "standard") as "standard" | "silver" | "gold",
      discount_percent: Number.parseFloat(String(form.get("discountPercent") ?? "0")) || 0,
      status: String(form.get("status") ?? "active") as "active" | "suspended" | "closed",
      phone: String(form.get("phone") ?? "").trim() || null,
      internal_notes: String(form.get("internalNotes") ?? "").trim() || null,
    });
    return data({ notice: "Account updated." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 500, headers: responseHeaders });
  }
}

export default function AccountDetail() {
  const { reseller, orders } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const lifetime = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.subtotal_pence, 0);

  return (
    <main className="admin-main">
      <p className="admin-crumb"><Link to="/admin/accounts">← Accounts</Link></p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade account · {reseller.account_code}</p>
          <h1>{reseller.business_name}</h1>
          <p>
            {reseller.contact_name} · {reseller.email} ·{" "}
            <span className={`admin-status admin-status-${reseller.status}`}>{reseller.status}</span>
          </p>
        </div>
      </header>

      {result?.error ? <p className="admin-alert" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="admin-alert admin-alert-ok" role="status">{result.notice}</p> : null}

      <div className="admin-stat-row">
        <div className="admin-stat"><span>Orders</span><b>{orders.length}</b></div>
        <div className="admin-stat"><span>Lifetime value</span><b>{gbpFromPence(lifetime)}</b></div>
        <div className="admin-stat"><span>Pricing tier</span><b style={{ textTransform: "capitalize", fontSize: 24 }}>{reseller.pricing_tier}</b></div>
        <div className="admin-stat is-flagged"><span>Portal</span><b style={{ fontSize: 20 }}>{reseller.user_id ? "Signed up" : "Not signed up"}</b></div>
      </div>

      <div className="admin-split">
        <div>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Orders</h2></div>
            {orders.length === 0 ? (
              <div className="admin-empty">No orders yet.</div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr><th scope="col">Reference</th><th scope="col">Placed</th><th scope="col">Status</th><th scope="col">Total</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><strong><Link to={`/admin/orders/${order.id}`}>{order.reference}</Link></strong></td>
                        <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                        <td><span className={`admin-status admin-status-${order.status}`}>{order.status}</span></td>
                        <td>{gbpFromPence(order.subtotal_pence)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Account record</h2></div>
            <dl className="admin-dl">
              <div><dt>Account code</dt><dd>{reseller.account_code}</dd></div>
              <div><dt>Market</dt><dd>{reseller.market}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${reseller.email}`}>{reseller.email}</a></dd></div>
              <div><dt>Phone</dt><dd>{reseller.phone || "—"}</dd></div>
              <div><dt>Approved</dt><dd>{reseller.approved_at ? new Date(reseller.approved_at).toLocaleString("en-GB") : "—"}</dd></div>
              <div><dt>Created</dt><dd>{new Date(reseller.created_at).toLocaleString("en-GB")}</dd></div>
              <div><dt>Application</dt><dd>{reseller.application_id ? <Link to={`/admin/applications/${reseller.application_id}`}>View original</Link> : "—"}</dd></div>
            </dl>
          </section>
        </div>

        <aside>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Edit account</h2></div>
            <div className="admin-panel-body">
              <Form method="post" replace>
                <div className="admin-field">
                  <label htmlFor="pricingTier">Pricing tier</label>
                  <select id="pricingTier" name="pricingTier" defaultValue={reseller.pricing_tier}>
                    <option value="standard">Standard</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="discountPercent">Discount off trade (%)</label>
                  <input id="discountPercent" name="discountPercent" type="number" min={0} max={90} step="0.5" defaultValue={Number(reseller.discount_percent)} />
                </div>
                <div className="admin-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" defaultValue={reseller.status}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" defaultValue={reseller.phone ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="internalNotes">Internal notes</label>
                  <textarea id="internalNotes" name="internalNotes" rows={4} defaultValue={reseller.internal_notes ?? ""} />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>Save changes</button>
                </div>
              </Form>
              <p className="admin-hint">
                Changing the tier or discount affects the price shown in the portal and applied to
                future orders. Existing orders keep the price they were placed at.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
