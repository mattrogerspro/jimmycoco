import { useMemo, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { portalPriceTiers } from "../lib/portal-pricing";
import { requireReseller } from "../lib/reseller-auth.server";
import { normaliseResellerAddress, resellerAddressIsComplete } from "../lib/reseller-profile.server";
import { createOrder, loadCatalogue } from "../lib/resellers.server";
import { INTERNAL_NOTICE_ADDRESS, emitResellerEventSafely } from "../lib/reseller-events.server";
import { SITE_URL, gbpFromPence } from "../lib/site";
import { isSameOriginPost } from "../lib/supabase.server";

type OrderActionData = { error?: string; reference?: string };

export const meta: MetaFunction = () => [
  { title: "Place a trade order | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, reseller } = await requireReseller(request);
  const catalogue = await loadCatalogue(supabase);
  const discountPercent = Number(reseller.discount_percent ?? 0);
  const shippingAddress = normaliseResellerAddress(
    Object.keys(reseller.shipping_address ?? {}).length > 0 ? reseller.shipping_address : reseller.address,
  );

  return data(
    {
      discountPercent,
      hasShippingAddress: resellerAddressIsComplete(shippingAddress),
      catalogue: catalogue.map((product) => ({
        sku: product.sku,
        title: product.title,
        description: product.description,
        unitLabel: product.unit_label,
        tiers: portalPriceTiers(product, discountPercent),
      })),
    },
    { headers: responseHeaders },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders, reseller } = await requireReseller(request);

  if (!isSameOriginPost(request)) {
    return data<OrderActionData>(
      { error: "That request could not be verified. Please try again." },
      { status: 403, headers: responseHeaders },
    );
  }

  const form = await request.formData();
  const catalogue = await loadCatalogue(supabase);
  const lines = catalogue
    .map((product) => ({
      sku: product.sku,
      quantity: Number.parseInt(String(form.get(`qty-${product.sku}`) ?? "0"), 10) || 0,
    }))
    .filter((line) => line.quantity > 0);

  if (lines.length === 0) {
    return data<OrderActionData>(
      { error: "Add a quantity against at least one product." },
      { status: 400, headers: responseHeaders },
    );
  }

  const shippingAddress = normaliseResellerAddress(
    Object.keys(reseller.shipping_address ?? {}).length > 0 ? reseller.shipping_address : reseller.address,
  );
  if (!resellerAddressIsComplete(shippingAddress)) {
    return data<OrderActionData>(
      { error: "Add a complete shipping address before sending an order request." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const note = String(form.get("note") ?? "").trim();
    const order = await createOrder(supabase, reseller, lines, note, "pro_website");
    const orderSummary = order.items
      .map((item) => `${item.title}: ${item.quantity} x ${gbpFromPence(item.unit_price_pence)} = ${gbpFromPence(item.line_total_pence)}`)
      .join("\n");
    const contact = {
      email: reseller.email,
      first_name: reseller.contact_name.split(" ")[0] ?? null,
      business_name: reseller.business_name,
      market: reseller.market,
    };
    await Promise.all([
      emitResellerEventSafely({
        trigger: "reseller_order_submitted",
        eventId: `reseller-order-${order.id}-submitted`,
        contact,
        context: {
          SALON_NAME: reseller.business_name,
          CONTACT_NAME: reseller.contact_name,
          ACCOUNT_CODE: reseller.account_code,
          ORDER_REFERENCE: order.reference,
          ORDER_SUMMARY: orderSummary,
          ORDER_TOTAL: gbpFromPence(order.subtotalPence),
          CUSTOMER_NOTES: note || "None supplied.",
          ORDER_LINK: `${SITE_URL}/portal`,
        },
      }),
      emitResellerEventSafely({
        trigger: "reseller_order_internal_notice",
        eventId: `reseller-order-${order.id}-internal`,
        contact: { email: INTERNAL_NOTICE_ADDRESS, business_name: "Sunless by Jimmy Coco", market: "UK" },
        context: {
          SALON_NAME: reseller.business_name,
          CONTACT_NAME: reseller.contact_name,
          CONTACT_EMAIL: reseller.email,
          ACCOUNT_CODE: reseller.account_code,
          ORDER_REFERENCE: order.reference,
          ORDER_SUMMARY: orderSummary,
          ORDER_TOTAL: gbpFromPence(order.subtotalPence),
          CUSTOMER_NOTES: note || "None supplied.",
          ADMIN_LINK: `${SITE_URL}/admin/orders/${order.id}`,
        },
      }),
    ]);
    return data<OrderActionData>({ reference: order.reference }, { headers: responseHeaders });
  } catch (error) {
    console.error("Reseller order failed", (error as Error).message);
    return data<OrderActionData>(
      { error: "We could not submit that order. Please try again or contact us." },
      { status: 500, headers: responseHeaders },
    );
  }
}

export default function PortalOrder() {
  const { catalogue, discountPercent, hasShippingAddress } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(catalogue.map((product) => [product.sku, 0])),
  );

  const pricedProducts = useMemo(() => catalogue.map((product) => {
    const quantity = quantities[product.sku] ?? 0;
    const pricingQuantity = Math.max(1, quantity);
    const tier = [...product.tiers].reverse().find((candidate) => pricingQuantity >= candidate.minQuantity)
      ?? product.tiers[0];
    return {
      ...product,
      quantity,
      tier,
      lineTotalPence: quantity * tier.unitPricePence,
    };
  }), [catalogue, quantities]);
  const orderTotal = pricedProducts.reduce((total, product) => total + product.lineTotalPence, 0);
  const itemCount = pricedProducts.reduce((total, product) => total + product.quantity, 0);

  return (
    <main className="portal-main portal-order-main">
      <header className="portal-page-head">
        <div>
          <p className="portal-eyebrow">Trade ordering</p>
          <h1>Place an order</h1>
          <p>Choose quantities below. Prices change live at the same breaks shown on the Pro website.</p>
        </div>
        <Link className="portal-secondary-link" to="/portal">Back to account</Link>
      </header>

      {result?.error ? (
        <p className="portal-alert alert-error" role="alert">{result.error}</p>
      ) : null}
      {result?.reference ? (
        <p className="portal-alert alert-ok" role="status">
          Order {result.reference} received. We will confirm it by email shortly.
        </p>
      ) : null}
      {!hasShippingAddress ? (
        <p className="portal-alert portal-alert-address" role="status">
          Add your complete business and shipping addresses before ordering. <Link to="/portal/addresses">Open addresses</Link>
        </p>
      ) : null}

      <Form method="post" data-form-id="portal_order" replace>
        <section className="portal-panel">
          <div className="portal-panel-head">
            <div>
              <p className="portal-eyebrow">Current catalogue</p>
              <h2>Build your order</h2>
            </div>
            <span className="portal-price-source">
              {discountPercent > 0 ? `${discountPercent}% account discount included` : "Pro website prices"}
            </span>
          </div>
          <div className="portal-table-wrap">
            <table className="portal-order-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Price at quantity</th>
                  <th scope="col" className="num">Quantity</th>
                  <th scope="col" className="num">Line total</th>
                </tr>
              </thead>
              <tbody>
                {pricedProducts.map((product) => (
                  <tr key={product.sku}>
                    <td>
                      <strong>{product.title}</strong>
                      {product.description ? <span>{product.description}</span> : null}
                      <div className="portal-tier-preview" aria-label={`Price breaks for ${product.title}`}>
                        {product.tiers.map((tier) => (
                          <small key={`${product.sku}-${tier.minQuantity}`}>
                            {tier.range}: {gbpFromPence(tier.unitPricePence)}
                          </small>
                        ))}
                      </div>
                    </td>
                    <td className="portal-nowrap">
                      <strong>{gbpFromPence(product.tier.unitPricePence)}</strong>
                      <span>{product.tier.name} · per {product.unitLabel}</span>
                    </td>
                    <td className="num">
                      <label className="hp-field" htmlFor={`qty-${product.sku}`}>
                        Quantity of {product.title}
                      </label>
                      <input
                        id={`qty-${product.sku}`}
                        className="portal-qty"
                        name={`qty-${product.sku}`}
                        type="number"
                        min={0}
                        max={999}
                        step={1}
                        value={product.quantity}
                        inputMode="numeric"
                        onChange={(event) => {
                          const parsed = Number.parseInt(event.currentTarget.value, 10);
                          const quantity = Number.isFinite(parsed) ? Math.min(999, Math.max(0, parsed)) : 0;
                          setQuantities((current) => ({ ...current, [product.sku]: quantity }));
                        }}
                      />
                    </td>
                    <td className="num portal-nowrap">
                      <strong>{product.quantity > 0 ? gbpFromPence(product.lineTotalPence) : "—"}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}><strong>Order request total</strong></td>
                  <td className="num"><span>{itemCount} items</span></td>
                  <td className="num portal-nowrap"><strong>{gbpFromPence(orderTotal)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="portal-order-footer">
          <div className="portal-order-note">
            <label htmlFor="note">Notes for our team (optional)</label>
            <textarea id="note" name="note" rows={3} placeholder="Delivery timing, purchase order number, anything else." />
          </div>
          <div className="portal-order-submit">
            <span>Nothing is charged now. We confirm stock and invoice you by email.</span>
            <strong>{gbpFromPence(orderTotal)}</strong>
            <button className="portal-primary" type="submit" disabled={submitting || itemCount === 0 || !hasShippingAddress}>
              {submitting ? "Sending…" : "Send order request"}
            </button>
          </div>
        </section>
      </Form>
    </main>
  );
}
