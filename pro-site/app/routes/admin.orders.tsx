import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listOrdersDetailed } from "../lib/resellers.server";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Orders | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const orders = await listOrdersDetailed(supabase);
  return data({ orders }, { headers: responseHeaders });
}

export default function AdminOrders() {
  const { orders } = useLoaderData<typeof loader>();
  const open = orders.filter((order) => ["submitted", "confirmed"].includes(order.status));
  const value = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.subtotal_pence, 0);

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade orders</p>
          <h1>Orders</h1>
          <p>Order requests from the stockist portal. Nothing is charged online — confirm, then invoice.</p>
        </div>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged"><span>Awaiting action</span><b>{open.length}</b></div>
        <div className="admin-stat"><span>Orders total</span><b>{orders.length}</b></div>
        <div className="admin-stat"><span>Value (excl. cancelled)</span><b>{gbpFromPence(value)}</b></div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head"><h2>All orders</h2></div>
        {orders.length === 0 ? (
          <div className="admin-empty">No orders yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Account</th>
                  <th scope="col">Placed</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong><Link to={`/admin/orders/${order.id}`}>{order.reference}</Link></strong></td>
                    <td>
                      {order.resellers?.business_name ?? "—"}
                      <span>{order.resellers?.account_code}</span>
                    </td>
                    <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td><span className={`admin-status admin-status-${order.status}`}>{order.status}</span></td>
                    <td>{gbpFromPence(order.subtotal_pence)}</td>
                    <td>{order.customer_note ?? "—"}</td>
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
