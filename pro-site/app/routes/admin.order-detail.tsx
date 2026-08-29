import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getOrder, updateOrder } from "../lib/resellers.server";
import { createInvoiceFromOrder, invoiceForOrder, issueInvoice, recordPayment } from "../lib/invoices.server";
import { type PaymentMethod } from "../lib/invoice-constants";
import { ORDER_SOURCE_LABELS, ORDER_STATUSES } from "../lib/reseller-constants";
import { gbpFromPence } from "../lib/site";
import { productImageForSku } from "../lib/product-images";
import { emailIssuedInvoice } from "../lib/invoice-email.server";
import { latestOrderShipment, saveOrderShipment, SHIPMENT_STATUSES, type ShipmentStatus } from "../lib/order-shipments.server";
import { loadFollowUpHistory, startManualFollowUp, stopManualFollowUp } from "../lib/manual-follow-ups.server";
import { getTradeDataVisibility } from "../lib/trade-data-settings.server";
import { OrderStageDetails } from "../components/admin/OrderStageDetails";
import { OrderInvoiceFlow } from "../components/admin/OrderInvoiceFlow";
import { ManualFollowUpPanel } from "../components/admin/ManualFollowUpPanel";

export const meta: MetaFunction = () => [
  { title: "Order | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const visibility = await getTradeDataVisibility(supabase);
  const result = await getOrder(supabase, params.orderId as string, visibility);
  if (!result) throw new Response("Order not found", { status: 404, headers: responseHeaders });
  const [invoice, shipment] = await Promise.all([
    invoiceForOrder(supabase, params.orderId as string, visibility),
    latestOrderShipment(supabase, params.orderId as string),
  ]);
  const contactEmail = (result.order as unknown as { resellers?: { email?: string } | null }).resellers?.email;
  const followUpHistory = contactEmail ? await loadFollowUpHistory(contactEmail) : { configured: false, unavailableReason: "not_configured" as const, enrollments: [], messages: [] };
  return data({ ...result, invoice, shipment, followUpHistory } as never, { headers: responseHeaders });
}
export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const orderId = params.orderId as string;
  const intent = String(form.get("intent") ?? "");
  const money = (value: FormDataEntryValue | null) => Math.round(Number.parseFloat(String(value ?? "0")) * 100);
  const visibility = await getTradeDataVisibility(supabase);

  try {
    switch (intent) {
      case "start-follow-up": {
        const order = await getOrder(supabase, orderId, visibility);
        if (!order) throw new Error("Order not found.");
        const account = (order.order as unknown as { resellers?: { email: string; contact_name: string; business_name: string; market: string } | null }).resellers;
        if (!account?.email || account.market !== "UK") throw new Error("Manual order follow-up campaigns are currently available for UK order records with an email contact.");
        if (!["confirmed", "invoiced", "shipped"].includes(String(order.order.status))) throw new Error("Confirm or invoice the order before starting its promotional follow-up.");
        await startManualFollowUp({
          campaignId: "uk-pro-order-follow-up",
          sourceType: "order",
          sourceId: orderId,
          owner: staff.userId,
          contact: { email: account.email, firstName: account.contact_name.split(" ")[0] ?? "there", businessName: account.business_name, market: "UK" },
          context: { ORDER_ID: orderId, ORDER_REFERENCE: order.order.reference, ORDER_STATUS: order.order.status, ORDER_SOURCE: order.order.source },
        });
        return data({ notice: "Manual order follow-up enrolled. The campaign remains subject to its release gates." }, { headers: responseHeaders });
      }
      case "stop-follow-up": {
        const order = await getOrder(supabase, orderId, visibility);
        if (!order) throw new Error("Order not found.");
        const account = (order.order as unknown as { resellers?: { email?: string } | null }).resellers;
        if (!account?.email) throw new Error("This order has no email contact for a follow-up stop.");
        await stopManualFollowUp({
          campaignId: "uk-pro-order-follow-up",
          sourceType: "order",
          sourceId: orderId,
          owner: staff.userId,
          email: account.email,
          reason: String(form.get("reason") ?? "manual_suppression"),
        });
        return data({ notice: "Manual order follow-up stopped. No future promotional steps will be sent from that enrollment." }, { headers: responseHeaders });
      }
      case "create-invoice": {
        await createInvoiceFromOrder(supabase, orderId, staff?.userId);
        return data({ notice: "Invoice draft created. Review and issue it below." }, { headers: responseHeaders });
      }
      case "issue-invoice": {
        const invoice = await invoiceForOrder(supabase, orderId, visibility);
        if (!invoice || invoice.status !== "draft") throw new Error("This order does not have a draft invoice to issue.");
        const number = await issueInvoice(supabase, invoice.id);
        const order = await getOrder(supabase, orderId, visibility);
        if (order?.order.status === "confirmed") await updateOrder(supabase, orderId, { status: "invoiced" });
        return data({ notice: `Invoice ${number} issued. You can now email it to the customer.` }, { headers: responseHeaders });
      }
      case "email-invoice": {
        const invoice = await invoiceForOrder(supabase, orderId, visibility);
        if (!invoice) throw new Error("Raise and issue an invoice before emailing it.");
        const result = await emailIssuedInvoice(supabase, invoice.id, staff?.userId);
        return data({ notice: `Invoice emailed to ${result.recipient}.` }, { headers: responseHeaders });
      }
      case "record-payment": {
        const invoice = await invoiceForOrder(supabase, orderId, visibility);
        if (!invoice) throw new Error("Raise and issue an invoice before recording payment.");
        await recordPayment(supabase, invoice.id, {
          amountPence: money(form.get("amount")),
          paidOn: String(form.get("paidOn") ?? new Date().toISOString().slice(0, 10)),
          method: String(form.get("method") ?? "bank_transfer") as PaymentMethod,
          reference: String(form.get("reference") ?? "").trim() || null,
          note: String(form.get("note") ?? "").trim() || null,
        }, staff?.userId);
        return data({ notice: "Payment recorded against this invoice." }, { headers: responseHeaders });
      }
      case "save-shipment": {
        const shipmentStatus = String(form.get("shipmentStatus") ?? "") as ShipmentStatus;
        if (!(SHIPMENT_STATUSES as readonly string[]).includes(shipmentStatus)) throw new Error("Choose a valid shipment status.");
        const order = await getOrder(supabase, orderId, visibility);
        if (!order) throw new Error("Order not found.");
        if (!["invoiced", "shipped"].includes(order.order.status)) throw new Error("Issue the invoice before recording shipping details.");
        const text = (name: string) => String(form.get(name) ?? "").trim() || null;
        const trackingUrl = text("trackingUrl");
        if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) throw new Error("Tracking links must start with http:// or https://.");
        const shipment = await saveOrderShipment(supabase, orderId, {
          status: shipmentStatus,
          carrier: text("carrier"),
          service_level: text("serviceLevel"),
          tracking_number: text("trackingNumber"),
          tracking_url: trackingUrl,
          estimated_delivery_date: text("estimatedDeliveryDate"),
          internal_note: text("shipmentNote"),
        }, staff?.userId);
        if (["dispatched", "in_transit", "delivered"].includes(shipment.status) && order.order.status !== "shipped") {
          await updateOrder(supabase, orderId, { status: "shipped" });
        }
        return data({ notice: `Shipment updated: ${shipment.status.replace(/_/g, " ")}.` }, { headers: responseHeaders });
      }
    }

    const status = String(form.get("status") ?? "");
    const note = form.get("internalNote");
    const patch: { status?: (typeof ORDER_STATUSES)[number]; internal_note?: string | null } = {};
    if ((ORDER_STATUSES as readonly string[]).includes(status)) patch.status = status as (typeof ORDER_STATUSES)[number];
    if (note !== null) patch.internal_note = String(note).trim() || null;
    if (!Object.keys(patch).length) return data({ error: "Nothing to update." }, { status: 400, headers: responseHeaders });

    const order = await getOrder(supabase, orderId, visibility);
    if (!order) throw new Error("Order not found.");
    await updateOrder(supabase, orderId, patch);
    return data({ notice: patch.status ? `Order marked ${patch.status === "submitted" ? "Received" : patch.status}.` : "Note saved." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

/* ------------------------------------------------------------------ */

type Line = {
  id: string;
  sku: string;
  title: string;
  unit_price_pence: number;
  quantity: number;
  line_total_pence: number;
};

type Reseller = {
  id: string;
  account_code: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  market: string;
  address: Record<string, string> | null;
  pricing_tier: string;
  discount_percent: number;
  status: string;
};

type Order = {
  id: string;
  reference: string;
  status: string;
  source: string;
  currency: string;
  subtotal_pence: number;
  customer_note: string | null;
  internal_note: string | null;
  delivery_note: string | null;
  submitted_at: string;
  confirmed_at: string | null;
  resellers: Reseller | null;
};

/** The order's journey. Cancelled is an exit, not a stage, so it sits outside. */
const STAGES = [
  { key: "submitted", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "invoiced", label: "Invoiced" },
  { key: "paid", label: "Payment received" },
  { key: "shipped", label: "Shipped" },
] as const;
const ACCOUNT_WARNING: Record<string, string> = {
  suspended: "This account is suspended. Check why before you confirm or ship anything.",
  closed: "This account is closed. It should not be receiving stock.",
};

function stamp(value: string | null, withTime = true) {
  if (!value) return null;
  return new Date(value).toLocaleString(
    "en-GB",
    withTime
      ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short", year: "numeric" },
  );
}

function waitingFor(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export default function OrderDetail() {
  const { order, items, catalogue, siblings, invoice, shipment, followUpHistory } = useLoaderData<typeof loader>() as unknown as {
    order: Order;
    items: Line[];
    catalogue: Record<string, { trade_price_pence: number; retail_price_pence: number | null; unit_label: string }>;
    siblings: Array<{ id: string; reference: string; status: string; subtotal_pence: number; submitted_at: string }>;
    invoice: {
      id: string;
      invoice_number: string | null;
      status: string;
      gross_pence: number;
      paid_pence: number;
      balance_pence: number;
      due_date: string | null;
      issue_date: string | null;
      currency: string;
      paid_at: string | null;
      customer_emailed_at: string | null;
      customer_emailed_to: string | null;
    } | null;
    shipment: Awaited<ReturnType<typeof latestOrderShipment>>;
    followUpHistory: Awaited<ReturnType<typeof loadFollowUpHistory>>;
  };

  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const [activeStage, setActiveStage] = useState<(typeof STAGES)[number]["key"] | null>(null);
  const account = order.resellers;
  const units = items.reduce((total, item) => total + item.quantity, 0);
  const cancelled = order.status === "cancelled";
  const warning = account && account.status !== "active" ? ACCOUNT_WARNING[account.status] : null;
  const listTotal = items.reduce(
    (total, item) => total + (catalogue[item.sku]?.trade_price_pence ?? item.unit_price_pence) * item.quantity,
    0,
  );
  const saved = Math.max(0, listTotal - order.subtotal_pence);
  const paymentReceived = invoice?.status === "paid" || (invoice?.balance_pence ?? 1) <= 0;
  const stageIndex = order.status === "shipped"
    ? 4
    : paymentReceived
      ? 3
      : order.status === "invoiced"
        ? 2
        : order.status === "confirmed"
          ? 1
          : 0;
  const addressLines = account?.address
    ? [
        account.address.line1,
        account.address.line2,
        account.address.city,
        account.address.county,
        account.address.postcode,
        account.address.country,
      ].filter(Boolean)
    : [];

  return (
    <main className="admin-main admin-order">
      <p className="admin-crumb">
        <Link to="/admin/orders">← Orders</Link>
        {account ? (
          <>
            {" · "}
            <Link to={`/admin/accounts/${account.id}`}>{account.business_name}</Link>
          </>
        ) : null}
      </p>

      <header className="admin-order-hero">
        <div className="admin-order-hero-main">
          <p className="admin-order-kicker">Trade order <span>{order.reference}</span></p>
          <h1>{account?.business_name ?? "Trade order"}</h1>
          <p className="admin-order-meta">
            <span className={`admin-status admin-status-${order.status}`}>{order.status === "submitted" ? "Received" : order.status}</span>
            <span>{ORDER_SOURCE_LABELS[order.source as keyof typeof ORDER_SOURCE_LABELS] ?? "Pro website"}</span>
            <span>{account?.account_code ?? "Trade account"}</span>
            <span>Received {stamp(order.submitted_at, false)}</span>
          </p>
        </div>
        <div className="admin-order-hero-value">
          <b>{gbpFromPence(order.subtotal_pence)}</b>
          <span>{units} unit{units === 1 ? "" : "s"} · {items.length} line{items.length === 1 ? "" : "s"} · {order.currency}</span>
        </div>
        {!cancelled ? (
          <div className="admin-order-hero-flow" aria-label="Order progress">
            <ol className="admin-steps">
              {STAGES.map((stage, index) => (
                <li key={stage.key} className={index < stageIndex ? "is-done" : index === stageIndex ? "is-current" : "is-todo"}>
                  <button type="button" className="admin-stage-trigger" onClick={() => setActiveStage(stage.key)} aria-current={index === stageIndex ? "step" : undefined}>
                    <span className="admin-steps-dot" aria-hidden="true">{index < stageIndex ? "✓" : ""}</span>
                    <b>{stage.label}</b>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </header>
      <OrderStageDetails
        stage={activeStage}
        onClose={() => setActiveStage(null)}
        order={{ reference: order.reference, status: order.status, submitted_at: order.submitted_at, confirmed_at: order.confirmed_at, delivery_note: order.delivery_note }}
        account={account ? { business_name: account.business_name, contact_name: account.contact_name, email: account.email, phone: account.phone } : null}
        invoice={invoice}
        shipment={shipment}
        busy={busy}
      />

      {result?.error ? (
        <p className="admin-alert" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.notice ? (
        <p className="admin-alert admin-alert-ok" role="status">
          {result.notice}
        </p>
      ) : null}

      {warning ? (
        <p className="admin-warn" role="alert">
          <b>{account?.status === "closed" ? "Closed account" : "Suspended account"}</b>
          {warning}
        </p>
      ) : null}

      {cancelled ? (
        <div className="admin-order-cancelled" role="status">
          <b>This order was cancelled.</b>
          <span>Nothing is due to be picked, invoiced or shipped.</span>
        </div>
      ) : (
        <OrderInvoiceFlow
          order={{ status: order.status, currency: order.currency, subtotal_pence: order.subtotal_pence, reference: order.reference }}
          account={account ? { business_name: account.business_name, contact_name: account.contact_name, email: account.email } : null}
          invoice={invoice}
          busy={busy}
          result={result}
          onOpenShipping={() => setActiveStage("shipped")}
          onOpenInvoice={() => setActiveStage("invoiced")}
        />
      )}
      <div className="admin-split">
        <div>
          <section className="admin-panel is-secondary admin-shipto-card">
            <div className="admin-panel-head"><h2>Ship to</h2><span>Delivery address</span></div>
            <div className="admin-panel-body">
              {account ? (
                <div className="admin-shipto-layout">
                  <div><p className="admin-shipto-name">{account.business_name}</p>{addressLines.length ? <address className="admin-address">{addressLines.map((line) => <span key={line}>{line}</span>)}</address> : <p className="admin-muted">No address on the account record.</p>}</div>
                  <div className="admin-shipto-contact"><b>{account.contact_name}</b><a href={`mailto:${account.email}`}>{account.email}</a>{account.phone ? <a href={`tel:${account.phone.replace(/\s+/g, "")}`}>{account.phone}</a> : null}</div>
                  {order.delivery_note ? <p className="admin-address-note"><b>Delivery instructions</b>{order.delivery_note}</p> : null}
                </div>
              ) : <p className="admin-muted">This order is not attached to an account.</p>}
            </div>
          </section>
          <section className="admin-panel is-primary">
            <div className="admin-panel-head">
              <h2>Order lines</h2>
              <p className="admin-result-count">
                {units} unit{units === 1 ? "" : "s"} to pick
              </p>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Unit price</th>
                    <th scope="col">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const list = catalogue[item.sku]?.trade_price_pence ?? null;
                    const discounted = list !== null && list > item.unit_price_pence;
                    const image = productImageForSku(item.sku);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-order-product">
                            {image ? <img src={image} alt="" /> : null}
                            <div><strong>{item.title}</strong><span>{item.sku}</span></div>
                          </div>
                        </td>
                        <td className="admin-nowrap admin-qty">
                          <b>{item.quantity}</b>
                          <span>{catalogue[item.sku]?.unit_label ?? "each"}</span>
                        </td>
                        <td className="admin-nowrap">
                          {gbpFromPence(item.unit_price_pence)}
                          {discounted ? <span>{gbpFromPence(list)} list</span> : null}
                        </td>
                        <td className="admin-nowrap admin-linetotal">{gbpFromPence(item.line_total_pence)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <dl className="admin-figures">
              {saved > 0 ? (
                <>
                  <div>
                    <dt>At current trade list</dt>
                    <dd>{gbpFromPence(listTotal)}</dd>
                  </div>
                  <div className="admin-figures-off">
                    <dt>
                      Trade discount
                      {account && Number(account.discount_percent) > 0 ? ` · ${account.discount_percent}%` : ""}
                    </dt>
                    <dd>− {gbpFromPence(saved)}</dd>
                  </div>
                </>
              ) : null}
              <div className="admin-figures-total">
                <dt>Order total</dt>
                <dd>{gbpFromPence(order.subtotal_pence)}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-panel is-primary">
            <div className="admin-panel-head">
              <h2>Notes</h2>
            </div>
            <div className="admin-panel-body">
              <div className="admin-quote">
                <h3>From the stockist</h3>
                {order.customer_note ? <p>{order.customer_note}</p> : <p className="admin-muted">Nothing added with the order.</p>}
              </div>

              <Form method="post" replace className="admin-notefield">
                <label htmlFor="internalNote">Internal note</label>
                <textarea
                  id="internalNote"
                  name="internalNote"
                  rows={3}
                  defaultValue={order.internal_note ?? ""}
                  placeholder="Anything the next person picking this order up should know."
                />
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Save note
                  </button>
                  <span className="admin-muted">Only visible to staff.</span>
                </div>
              </Form>
            </div>
          </section>
        </div>

        <aside>


          {account ? (
            <section className="admin-panel is-secondary">
              <div className="admin-panel-head">
                <h2>Account</h2>
                <Link className="admin-panel-link" to={`/admin/accounts/${account.id}`}>
                  Open
                </Link>
              </div>
              <div className="admin-panel-body">
                <p className="admin-kv">
                  <span>Account</span>
                  <Link to={`/admin/accounts/${account.id}`}>{account.account_code}</Link>
                </p>
                <p className="admin-kv">
                  <span>Status</span>
                  <span className={`admin-status admin-status-${account.status}`}>{account.status}</span>
                </p>
                <p className="admin-kv">
                  <span>Terms</span>
                  <span>
                    <b className="admin-capitalise">{account.pricing_tier}</b>
                    {Number(account.discount_percent) > 0 ? ` · ${account.discount_percent}% off list` : ""}
                  </span>
                </p>
                <p className="admin-kv">
                  <span>Market</span>
                  <span>{account.market}</span>
                </p>
              </div>
            </section>
          ) : null}

          <ManualFollowUpPanel
            campaignId="uk-pro-order-follow-up"
            label="Order follow-up"
            sourceLabel="confirmed order"
            eligible={Boolean(account?.email && account.market === "UK" && ["confirmed", "invoiced", "shipped"].includes(order.status))}
            ineligibleReason={order.status === "cancelled" ? "Cancelled orders cannot enter a follow-up." : account?.market !== "UK" ? "This follow-up is currently available for UK orders only." : "Confirm or invoice the order before starting its promotional follow-up."}
            history={followUpHistory}
            busy={busy}
          />

          {siblings.length ? (
            <section className="admin-panel is-secondary">
              <div className="admin-panel-head">
                <h2>Recent orders</h2>
                {account ? (
                  <Link className="admin-panel-link" to={`/admin/accounts/${account.id}`}>
                    All
                  </Link>
                ) : null}
              </div>
              <ul className="admin-minilist">
                {siblings.slice(0, 4).map((sibling) => (
                  <li key={sibling.id}>
                    <Link to={`/admin/orders/${sibling.id}`}>{sibling.reference}</Link>
                    <span className="admin-minilist-date">{stamp(sibling.submitted_at, false)}</span>
                    <span className={`admin-status admin-status-${sibling.status}`}>{sibling.status}</span>
                    <b>{gbpFromPence(sibling.subtotal_pence)}</b>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
