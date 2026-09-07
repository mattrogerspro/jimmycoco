import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData } from "react-router";
import { portalPriceTiers, portalReferencePrice } from "../lib/portal-pricing";
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
      },
      catalogue: catalogue.map((product) => ({
        sku: product.sku,
        title: product.title,
        unitLabel: product.unit_label,
        reference: portalReferencePrice(product),
        tiers: portalPriceTiers(product, discount),
      })),
      orders,
    },
    { headers: responseHeaders },
  );
}

export default function PortalDashboard() {
  const { reseller, catalogue, orders } = useLoaderData<typeof loader>();
  const latestOrder = orders[0];

  return (
    <main className="portal-main">
      <header className="portal-page-head">
        <div>
          <p className="portal-eyebrow">Trade account</p>
          <h1>{reseller.businessName}</h1>
          <p>
            {reseller.contactName} · {reseller.email} · Account {reseller.accountCode}
          </p>
        </div>
        <Link className="portal-primary-link" to="/portal/order">
          Place an order
        </Link>
      </header>

      <section className="portal-stat-row" aria-label="Account summary">
        <article className="portal-stat is-flagged">
          <span>Pricing tier</span>
          <b className="portal-capitalize">{reseller.pricingTier}</b>
          <small>
            {reseller.discountPercent > 0
              ? `${reseller.discountPercent}% account discount included`
              : "Current Pro website trade pricing"}
          </small>
        </article>
        <article className="portal-stat">
          <span>Orders placed</span>
          <b>{orders.length}</b>
          <small>Order requests from this account</small>
        </article>
        <article className="portal-stat">
          <span>Latest order</span>
          <b>{latestOrder ? gbpFromPence(latestOrder.subtotal_pence) : "—"}</b>
          <small>{latestOrder?.reference ?? "No orders submitted yet"}</small>
        </article>
      </section>

      <section className="portal-panel">
        <div className="portal-panel-head">
          <div>
            <p className="portal-eyebrow">Live price list</p>
            <h2>Your trade pricing</h2>
          </div>
          <span className="portal-price-source">Synced with the Pro website</span>
        </div>
        <p className="portal-panel-intro">
          Unit prices update automatically at each quantity break. The order form and submitted
          order totals use these same prices.
        </p>
        <div className="portal-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Reference price</th>
                <th scope="col">Your quantity pricing</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((product) => (
                <tr key={product.sku}>
                  <td>
                    <strong>{product.title}</strong>
                    <span>{product.sku} · per {product.unitLabel}</span>
                  </td>
                  <td className="portal-nowrap">
                    <strong>{gbpFromPence(product.reference.pricePence)}</strong>
                    <span>{product.reference.label}</span>
                  </td>
                  <td>
                    <div className="portal-tier-list">
                      {product.tiers.map((tier) => (
                        <div key={`${product.sku}-${tier.minQuantity}`}>
                          <span>{tier.range}</span>
                          <strong>{gbpFromPence(tier.unitPricePence)}</strong>
                          <small>{tier.name}</small>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="portal-panel">
        <div className="portal-panel-head">
          <div>
            <p className="portal-eyebrow">Order history</p>
            <h2>Recent orders</h2>
          </div>
        </div>
        {orders.length === 0 ? (
          <p className="portal-empty">No orders yet.</p>
        ) : (
          <div className="portal-table-wrap">
            <table>
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
                    <td><strong>{order.reference}</strong></td>
                    <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td>
                      <span className={`portal-pill pill-${order.status}`}>{order.status}</span>
                    </td>
                    <td className="num portal-nowrap"><strong>{gbpFromPence(order.subtotal_pence)}</strong></td>
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
