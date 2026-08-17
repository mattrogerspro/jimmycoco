import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getOrder, updateOrder } from "../lib/resellers.server";
import { createInvoiceFromOrder, invoiceForOrder } from "../lib/invoices.server";
import { INVOICE_STATUS_LABELS, isOverdue } from "../lib/invoice-constants";
import { ORDER_SOURCE_LABELS, ORDER_SOURCES, ORDER_STATUSES } from "../lib/reseller-constants";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Order | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const result = await getOrder(supabase, params.orderId as string);
  if (!result) throw new Response("Order not found", { status: 404, headers: responseHeaders });
  const invoice = await invoiceForOrder(supabase, params.orderId as string);
  return data({ ...result, invoice } as never, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();

  // Raising an invoice is a different job from moving the order along, so it
  // gets its own intent rather than being inferred from the fields present.
  if (form.get("intent") === "create-invoice") {
    try {
      const { id } = await createInvoiceFromOrder(supabase, params.orderId as string, staff?.userId);
      return redirect(`/admin/invoices/${id}`, { headers: responseHeaders });
    } catch (error) {
      return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
    }
  }

  const status = String(form.get("status") ?? "");
  const note = form.get("internalNote");
  const source = String(form.get("source") ?? "");

  // Each form on this page posts only its own field, so building the patch from
  // what was actually submitted stops one form wiping the other's value.
  const patch: { status?: (typeof ORDER_STATUSES)[number]; internal_note?: string | null; source?: string } = {};
  if ((ORDER_STATUSES as readonly string[]).includes(status)) {
    patch.status = status as (typeof ORDER_STATUSES)[number];
  }
  if (note !== null) patch.internal_note = String(note).trim() || null;
  if ((ORDER_SOURCES as readonly string[]).includes(source)) patch.source = source;

  if (!Object.keys(patch).length) {
    return data({ error: "Nothing to update." }, { status: 400, headers: responseHeaders });
  }

  try {
    await updateOrder(supabase, params.orderId as string, patch);
    return data({ notice: patch.status ? `Order marked ${patch.status === "submitted" ? "Received" : patch.status}.` : patch.source ? "Order source updated." : "Note saved." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 500, headers: responseHeaders });
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
  { key: "shipped", label: "Shipped" },
] as const;

/** The one thing to do next, given where the order is now. */
const NEXT_ACTION: Record<string, { status: string; label: string; blurb: string } | null> = {
  submitted: { status: "confirmed", label: "Confirm order", blurb: "Check stock and price, then confirm." },
  confirmed: null,
  invoiced: { status: "shipped", label: "Mark shipped", blurb: "Mark it shipped once it leaves." },
  shipped: null,
  cancelled: null,
};

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
  const { order, items, catalogue, siblings, invoice } = useLoaderData<typeof loader>() as unknown as {
    order: Order;
    items: Line[];
    catalogue: Record<string, { trade_price_pence: number; retail_price_pence: number | null; unit_label: string }>;
    siblings: Array<{ id: string; reference: string; status: string; subtotal_pence: number; submitted_at: string }>;
    invoice: {
      id: string;
      invoice_number: string | null;
      status: string;
      gross_pence: number;
      balance_pence: number;
      due_date: string | null;
    } | null;
  };

  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  const account = order.resellers;
  const units = items.reduce((total, item) => total + item.quantity, 0);
  const cancelled = order.status === "cancelled";
  const next = cancelled ? null : NEXT_ACTION[order.status];
  const canRaiseInvoice = order.status === "confirmed" && !invoice;
  const canOpenInvoice = order.status === "confirmed" && Boolean(invoice);
  const actionBlurb = cancelled
    ? "Reopening puts it back in the received queue."
    : canRaiseInvoice
      ? "Create the invoice draft from these agreed order lines."
      : canOpenInvoice
        ? "The invoice draft is ready to review and issue."
        : (next?.blurb ?? "Nothing left to do — this order is complete.");
  const open = order.status === "submitted" || order.status === "confirmed";
  const warning = account && account.status !== "active" ? ACCOUNT_WARNING[account.status] : null;

  // Value at the current catalogue price, so the trade discount is visible
  // rather than baked silently into the unit price.
  const listTotal = items.reduce(
    (total, item) => total + (catalogue[item.sku]?.trade_price_pence ?? item.unit_price_pence) * item.quantity,
    0,
  );
  const saved = Math.max(0, listTotal - order.subtotal_pence);

  const stageIndex = STAGES.findIndex((stage) => stage.key === order.status);
  const stageTime: Record<string, string | null> = {
    submitted: order.submitted_at,
    confirmed: order.confirmed_at,
    invoiced: null,
    shipped: null,
  };

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
      </header>

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
        <>
          <section className="admin-next-task" aria-label="Next order task">
            <div className="admin-next-task-copy">
              <span className="admin-next-task-icon" aria-hidden="true">↳</span>
              <div>
                <p className="admin-next-task-kicker">Next task <span>{order.status === "submitted" ? "Received" : order.status}</span></p>
                <h2>{canRaiseInvoice ? "Raise the draft invoice" : canOpenInvoice ? "Review the invoice draft" : next?.label ?? "Order complete"}</h2>
                <p>{actionBlurb}</p>
              </div>
            </div>
            <div className="admin-next-task-actions">
              {canRaiseInvoice ? (
                <Form method="post" replace><input type="hidden" name="intent" value="create-invoice" /><button className="admin-primary" type="submit" disabled={busy}>Raise invoice</button></Form>
              ) : canOpenInvoice && invoice ? (
                <Link className="admin-primary" to={`/admin/invoices/${invoice.id}`}>Open draft invoice</Link>
              ) : next ? (
                <>
                  <Form method="post" replace><input type="hidden" name="status" value={next.status} /><button className="admin-primary" type="submit" disabled={busy}>{next.label}</button></Form>
                  <Form method="post" replace><input type="hidden" name="status" value="cancelled" /><button className="admin-ghost-danger" type="submit" disabled={busy}>Cancel</button></Form>
                </>
              ) : null}
            </div>
            <div className="admin-next-task-utilities">
              <Form method="post" replace className="admin-source-form">
                <label htmlFor="source">Order source</label>
                <select id="source" name="source" defaultValue={order.source}>
                  {ORDER_SOURCES.map((value) => <option key={value} value={value}>{ORDER_SOURCE_LABELS[value]}</option>)}
                </select>
                <button type="submit" disabled={busy}>Save</button>
              </Form>
              <details className="admin-override">
                <summary>Set status</summary>
                <Form method="post" replace className="admin-override-form">
                  <label htmlFor="status">Move this order to</label>
                  <select id="status" name="status" defaultValue={order.status}>
                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status === "submitted" ? "received" : status}</option>)}
                  </select>
                  <button type="submit" disabled={busy}>Apply</button>
                  <p>Use this only to correct a mistake — the action above follows the normal flow.</p>
                </Form>
              </details>
            </div>
          </section>
          <section className="admin-flow-panel" aria-label="Order progress">
            <div className="admin-flow-label"><b>Order flow</b><span>Follow the next step</span></div>
            <ol className="admin-steps">
              {STAGES.map((stage, index) => (
                <li key={stage.key} className={index < stageIndex ? "is-done" : index === stageIndex ? "is-current" : "is-todo"} aria-current={index === stageIndex ? "step" : undefined}>
                  <span className="admin-steps-dot" aria-hidden="true">{index < stageIndex ? "✓" : ""}</span>
                  <b>{stage.label}</b>
                  <span>{stamp(stageTime[stage.key], false) ?? (index < stageIndex ? "done" : "")}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <div className="admin-split">
        <div>
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
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                          <span>{item.sku}</span>
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
          <section className="admin-panel is-secondary">
            <div className="admin-panel-head">
              <h2>Ship to</h2>
            </div>
            <div className="admin-panel-body">
              {account ? (
                <>
                  <p className="admin-shipto-name">{account.business_name}</p>
                  {addressLines.length ? (
                    <address className="admin-address">
                      {addressLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </address>
                  ) : (
                    <p className="admin-muted">No address on the account record.</p>
                  )}
                  {order.delivery_note ? (
                    <p className="admin-address-note">
                      <b>Delivery instructions</b>
                      {order.delivery_note}
                    </p>
                  ) : null}
                  <ul className="admin-contactlist">
                    <li>
                      {account.contact_name}
                      <a href={`mailto:${account.email}`}>{account.email}</a>
                      {account.phone ? <a href={`tel:${account.phone.replace(/\s+/g, "")}`}>{account.phone}</a> : null}
                    </li>
                  </ul>
                </>
              ) : (
                <p className="admin-muted">This order is not attached to an account.</p>
              )}
            </div>
          </section>

          <section className="admin-panel is-secondary">
            <div className="admin-panel-head">
              <h2>Invoice</h2>
              {invoice ? (
                <Link className="admin-panel-link" to={`/admin/invoices/${invoice.id}`}>
                  Open
                </Link>
              ) : null}
            </div>
            <div className="admin-panel-body">
              {invoice ? (
                <>
                  <p className="admin-kv">
                    <span>Number</span>
                    <Link to={`/admin/invoices/${invoice.id}`}>{invoice.invoice_number ?? "Draft"}</Link>
                  </p>
                  <p className="admin-kv">
                    <span>Status</span>
                    <span className={`admin-status admin-status-inv-${invoice.status}`}>
                      {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] ?? invoice.status}
                    </span>
                  </p>
                  <p className="admin-kv">
                    <span>Outstanding</span>
                    <span className={isOverdue(invoice.status, invoice.due_date) ? "admin-negative" : undefined}>
                      {invoice.balance_pence > 0 ? gbpFromPence(invoice.balance_pence) : "Settled"}
                    </span>
                  </p>
                </>
              ) : cancelled ? (
                <p className="admin-muted">Cancelled orders are not invoiced.</p>
              ) : (
                <>
                  <p className="admin-muted">No invoice raised for this order yet.</p>
                  <p className="admin-hint">Raise the draft from the single order action above; this panel will then show its status and link.</p>
                </>
              )}
            </div>
          </section>

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
