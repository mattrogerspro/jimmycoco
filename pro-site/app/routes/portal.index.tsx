import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import { requireReseller } from "../lib/reseller-auth.server";
import { loadCatalogue, listOrders } from "../lib/resellers.server";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Your trade account | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, reseller } = await requireReseller(request);
  const [catalogue, orders] = await Promise.all([
    loadCatalogue(supabase),
    listOrders(supabase, reseller.id),
  ]);

  const discount = Number(reseller.discount_percent ?? 0);
  return data(
    {
      reseller: {
        businessName: reseller.business_name,
        contactName: reseller.contact_name,
        accountCode: reseller.account_code,
        email: reseller.email,
        pricingTier: reseller.pricing_tier,
        discountPercent: discount,
        approvedAt: reseller.approved_at,
      },
      catalogue: catalogue.map((product) => ({
        sku: product.sku,
        title: product.title,
        unitLabel: product.unit_label,
        retail: product.retail_price_pence,
        trade: Math.round(product.trade_price_pence * (1 - discount / 100)),
      })),
      orders,
    },
    { headers: responseHeaders },
  );
}

export default function PortalDashboard() {
  const { reseller, catalogue, orders } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>{reseller.businessName}</h1>
      <p className="portal-lead">
        Account {reseller.accountCode} · {reseller.contactName} · {reseller.email}
      </p>

      <div className="portal-grid">
        <div className="portal-card">
          <h3>Pricing tier</h3>
          <b style={{ textTransform: "capitalize" }}>{reseller.pricingTier}</b>
          <p>
            {reseller.discountPercent > 0
              ? `${reseller.discountPercent}% off standard trade pricing`
              : "Standard trade pricing"}
          </p>
        </div>
        <div className="portal-card">
          <h3>Orders placed</h3>
          <b>{orders.length}</b>
          <p>Order requests are confirmed and invoiced by email.</p>
        </div>
        <div className="portal-card">
          <h3>Ready to reorder?</h3>
          <Link className="portal-btn" to="/portal/order" style={{ marginTop: 12 }}>
            Place an order
          </Link>
        </div>
      </div>

      <h2>Your trade pricing</h2>
      <table className="portal-table" style={{ marginBottom: 40 }}>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col" className="num">RRP</th>
            <th scope="col" className="num">Your price</th>
          </tr>
        </thead>
        <tbody>
          {catalogue.map((product) => (
            <tr key={product.sku}>
              <td>
                {product.title}
                <br />
                <span style={{ color: "var(--p-muted)", fontSize: 14 }}>
                  {product.sku} · per {product.unitLabel}
                </span>
              </td>
              <td className="num">{product.retail ? gbpFromPence(product.retail) : "—"}</td>
              <td className="num">
                <b>{gbpFromPence(product.trade)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Recent orders</h2>
      {orders.length === 0 ? (
        <p className="portal-empty">No orders yet.</p>
      ) : (
        <table className="portal-table">
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Placed</th>
              <th scope="col">Status</th>
              <th scope="col" className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.reference}</td>
                <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                <td>
                  <span className={`portal-pill pill-${order.status}`}>{order.status}</span>
                </td>
                <td className="num">{gbpFromPence(order.subtotal_pence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
