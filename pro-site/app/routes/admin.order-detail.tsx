import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getOrder, updateOrder } from "../lib/resellers.server";
import { ORDER_STATUSES } from "../lib/reseller-constants";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Order | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const result = await getOrder(supabase, params.orderId as string);
  if (!result) throw new Response("Order not found", { status: 404, headers: responseHeaders });
  return data(result as unknown as { order: Record<string, string | number | null>; items: unknown[] }, {
    headers: responseHeaders,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }
  const form = await request.formData();
  try {
    await updateOrder(supabase, params.orderId as string, {
      status: String(form.get("status") ?? "submitted") as (typeof ORDER_STATUSES)[number],
      internal_note: String(form.get("internalNote") ?? "").trim() || null,
    });
    return data({ notice: "Order updated." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 500, headers: responseHeaders });
  }
}

type Line = { id: string; sku: string; title: string; unit_price_pence: number; quantity: number; line_total_pence: number };

export default function OrderDetail() {
  const loaded = useLoaderData<typeof loader>() as unknown as {
    order: Record<string, never> & {
      id: string; reference: string; status: string; subtotal_pence: number; currency: string;
      customer_note: string | null; internal_note: string | null; delivery_note: string | null;
      submitted_at: string; confirmed_at: string | null;
      resellers: { id: string; account_code: string; business_name: string; contact_name: string; email: string; phone: string | null; pricing_tier: string; discount_percent: number } | null;
    };
    items: Line[];
  };
  const { order, items } = loaded;
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const units = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="admin-main">
      <p className="admin-crumb"><Link to="/admin/orders">← Orders</Link></p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Order request</p>
          <h1>{order.reference}</h1>
          <p>
            Placed {new Date(order.submitted_at).toLocaleString("en-GB")} ·{" "}
            <span className={`admin-status admin-status-${order.status}`}>{order.status}</span>
          </p>
        </div>
      </header>

      {result?.error ? <p className="admin-alert" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="admin-alert admin-alert-ok" role="status">{result.notice}</p> : null}

      <div className="admin-stat-row">
        <div className="admin-stat"><span>Order total</span><b>{gbpFromPence(order.subtotal_pence)}</b></div>
        <div className="admin-stat"><span>Units</span><b>{units}</b></div>
        <div className="admin-stat"><span>Lines</span><b>{items.length}</b></div>
        <div className="admin-stat"><span>Currency</span><b style={{ fontSize: 24 }}>{order.currency}</b></div>
      </div>

      <div className="admin-split">
        <div>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Order summary</h2></div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col">Unit price</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.sku}</td>
                      <td>{gbpFromPence(item.unit_price_pence)}</td>
                      <td>{item.quantity}</td>
                      <td>{gbpFromPence(item.line_total_pence)}</td>
                    </tr>
                  ))}
                  <tr className="admin-total-row">
                    <td colSpan={4}><strong>Total</strong></td>
                    <td><strong>{gbpFromPence(order.subtotal_pence)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Notes</h2></div>
            <dl className="admin-dl">
              <div><dt>From the stockist</dt><dd>{order.customer_note || "—"}</dd></div>
              <div><dt>Delivery</dt><dd>{order.delivery_note || "—"}</dd></div>
              <div><dt>Internal</dt><dd>{order.internal_note || "—"}</dd></div>
            </dl>
          </section>
        </div>

        <aside>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Account</h2></div>
            <dl className="admin-dl">
              <div><dt>Business</dt><dd>{order.resellers ? <Link to={`/admin/accounts/${order.resellers.id}`}>{order.resellers.business_name}</Link> : "—"}</dd></div>
              <div><dt>Account code</dt><dd>{order.resellers?.account_code ?? "—"}</dd></div>
              <div><dt>Contact</dt><dd>{order.resellers?.contact_name ?? "—"}</dd></div>
              <div><dt>Email</dt><dd>{order.resellers ? <a href={`mailto:${order.resellers.email}`}>{order.resellers.email}</a> : "—"}</dd></div>
              <div><dt>Phone</dt><dd>{order.resellers?.phone || "—"}</dd></div>
              <div><dt>Tier</dt><dd style={{ textTransform: "capitalize" }}>{order.resellers?.pricing_tier ?? "—"}</dd></div>
            </dl>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Update</h2></div>
            <div className="admin-panel-body">
              <Form method="post" replace>
                <div className="admin-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" defaultValue={order.status}>
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="internalNote">Internal note</label>
                  <textarea id="internalNote" name="internalNote" rows={4} defaultValue={order.internal_note ?? ""} />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>Save</button>
                </div>
              </Form>
              <p className="admin-hint">
                Moving an order to <b>confirmed</b> stamps the confirmation time. Invoicing and
                payment happen outside this system.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
