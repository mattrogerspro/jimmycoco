import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireReseller } from "../lib/reseller-auth.server";
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
  const discount = Number(reseller.discount_percent ?? 0);

  return data(
    {
      catalogue: catalogue.map((product) => ({
        sku: product.sku,
        title: product.title,
        description: product.description,
        unitLabel: product.unit_label,
        price: Math.round(product.trade_price_pence * (1 - discount / 100)),
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

  try {
    const note = String(form.get("note") ?? "").trim();
    const order = await createOrder(supabase, reseller, lines, note);
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
  const { catalogue } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <>
      <h1>Place an order</h1>
      <p className="portal-lead">
        Enter quantities and send. Nothing is charged here — we confirm stock and trade terms, then
        invoice you by email.
      </p>

      {result?.error ? (
        <p className="portal-alert alert-error" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.reference ? (
        <p className="portal-alert alert-ok" role="status">
          Order {result.reference} received. We will confirm it by email shortly.
        </p>
      ) : null}

      <Form method="post" data-form-id="portal_order" replace>
        <table className="portal-table" style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col" className="num">Your price</th>
              <th scope="col" className="num">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {catalogue.map((product) => (
              <tr key={product.sku}>
                <td>
                  <b>{product.title}</b>
                  {product.description ? (
                    <>
                      <br />
                      <span style={{ color: "var(--p-muted)", fontSize: 14 }}>{product.description}</span>
                    </>
                  ) : null}
                </td>
                <td className="num">
                  {gbpFromPence(product.price)}
                  <br />
                  <span style={{ color: "var(--p-muted)", fontSize: 13 }}>per {product.unitLabel}</span>
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
                    defaultValue={0}
                    inputMode="numeric"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="portal-form" style={{ maxWidth: 620 }}>
          <label htmlFor="note">Notes for our team (optional)</label>
          <textarea id="note" name="note" rows={3} placeholder="Delivery timing, purchase order number, anything else." />
          <button className="portal-btn" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send order request"}
          </button>
        </div>
      </Form>
    </>
  );
}
