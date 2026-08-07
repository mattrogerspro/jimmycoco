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
  return data(result as never, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const status = String(form.get("status") ?? "");
  const note = form.get("internalNote");

  // The quick actions post a status only. Building the patch from what was
  // actually submitted stops them wiping the internal note.
  const patch: { status?: (typeof ORDER_STATUSES)[number]; internal_note?: string | null } = {};
  if ((ORDER_STATUSES as readonly string[]).includes(status)) {
    patch.status = status as (typeof ORDER_STATUSES)[number];
  }
  if (note !== null) patch.internal_note = String(note).trim() || null;

  if (!Object.keys(patch).length) {
    return data({ error: "Nothing to update." }, { status: 400, headers: responseHeaders });
  }

  try {
    await updateOrder(supabase, params.orderId as string, patch);
    return data({ notice: "Order updated." }, { headers: responseHeaders });
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
  currency: string;
  subtotal_pence: number;
  customer_note: string | null;
  internal_note: string | null;
  delivery_note: string | null;
  submitted_at: string;
  confirmed_at: string | null;
  updated_at: string;
  resellers: Reseller | null;
};

/** The order's journey. Cancelled is an exit, not a stage, so it sits outside. */
const STAGES = [
  { key: "submitted", label: "Submitted", hint: "Requested from the portal" },
  { key: "confirmed", label: "Confirmed", hint: "Stock and price agreed" },
  { key: "invoiced", label: "Invoiced", hint: "Raised outside this system" },
  { key: "shipped", label: "Shipped", hint: "On its way to the salon" },
] as const;

/** What the next click should be, given where the order is now. */
const NEXT_ACTION: Record<string, { status: string; label: string; blurb: string } | null> = {
  submitted: {
    status: "confirmed",
    label: "Confirm this order",
    blurb: "Check stock and price, then confirm. Confirming stamps the time and tells you it is ready to invoice.",
  },
  confirmed: {
    status: "invoiced",
    label: "Mark as invoiced",
    blurb: "Raise the invoice in your accounts system, then record it here.",
  },
  invoiced: {
    status: "shipped",
    label: "Mark as shipped",
    blurb: "Once the order leaves, mark it shipped. That closes it off.",
  },
  shipped: null,
  cancelled: null,
};

const TIER_NOTE: Record<string, string> = {
  standard: "Standard trade pricing",
  silver: "Silver trade pricing",
  gold: "Gold trade pricing",
};

function shortDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysSince(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export default function OrderDetail() {
  const { order, items, catalogue, siblings } = useLoaderData<typeof loader>() as unknown as {
    order: Order;
    items: Line[];
    catalogue: Record<string, { trade_price_pence: number; retail_price_pence: number | null; unit_label: string }>;
    siblings: Array<{ id: string; reference: string; status: string; subtotal_pence: number; submitted_at: string }>;
  };

  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  const account = order.resellers;
  const units = items.reduce((total, item) => total + item.quantity, 0);
  const cancelled = order.status === "cancelled";
  const next = cancelled ? null : NEXT_ACTION[order.status];
  const open = order.status === "submitted" || order.status === "confirmed";

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

  const address = account?.address ?? null;
  const addressLines = address
    ? [address.line1, address.line2, address.city, address.county, address.postcode, address.country].filter(Boolean)
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

      <header className="admin-order-head">
        <div>
          <p className="admin-eyebrow">Order request</p>
          <h1>{order.reference}</h1>
          <p className="admin-order-sub">
            {account ? (
              <>
                <Link to={`/admin/accounts/${account.id}`}>{account.business_name}</Link> ·{" "}
              </>
            ) : null}
            placed {shortDate(order.submitted_at)}
            {open ? <> · waiting {daysSince(order.submitted_at)}</> : null}
          </p>
        </div>
        <div className="admin-order-head-right">
          <span className={`admin-status admin-status-lg admin-status-${order.status}`}>{order.status}</span>
          <b className="admin-order-total">{gbpFromPence(order.subtotal_pence)}</b>
          <span className="admin-order-total-note">
            {units} unit{units === 1 ? "" : "s"} across {items.length} line{items.length === 1 ? "" : "s"} ·{" "}
            {order.currency}
          </span>
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

      {cancelled ? (
        <div className="admin-order-cancelled" role="status">
          <b>This order was cancelled.</b>
          <span>Nothing is due to be picked, invoiced or shipped. Reopen it below if that was a mistake.</span>
        </div>
      ) : (
        <ol className="admin-lifecycle" aria-label="Order progress">
          {STAGES.map((stage, index) => {
            const state = index < stageIndex ? "is-done" : index === stageIndex ? "is-current" : "is-todo";
            return (
              <li key={stage.key} className={state} aria-current={index === stageIndex ? "step" : undefined}>
                <span className="admin-lifecycle-dot" aria-hidden="true" />
                <b>{stage.label}</b>
                <span>{shortDate(stageTime[stage.key]) ?? (index <= stageIndex ? "done" : stage.hint)}</span>
              </li>
            );
          })}
        </ol>
      )}

      {next || cancelled ? (
        <section className="admin-next" aria-label="Next step">
          <div>
            <b>{cancelled ? "Reopen this order?" : "Next step"}</b>
            <p>
              {cancelled
                ? "Reopening puts it back in the submitted queue so it can be confirmed again."
                : next?.blurb}
            </p>
          </div>
          <div className="admin-next-actions">
            <Form method="post" replace>
              <input type="hidden" name="status" value={cancelled ? "submitted" : (next?.status ?? "")} />
              <button className="admin-primary" type="submit" disabled={busy}>
                {cancelled ? "Reopen order" : next?.label}
              </button>
            </Form>
            {cancelled ? null : (
              <Form method="post" replace>
                <input type="hidden" name="status" value="cancelled" />
                <button className="admin-danger" type="submit" disabled={busy}>
                  Cancel order
                </button>
              </Form>
            )}
          </div>
        </section>
      ) : null}

      <div className="admin-split">
        <div>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>What was ordered</h2>
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
                        <td className="admin-nowrap">
                          {item.quantity}
                          <span>{catalogue[item.sku]?.unit_label ?? "each"}</span>
                        </td>
                        <td className="admin-nowrap">
                          {gbpFromPence(item.unit_price_pence)}
                          {discounted ? <span>{gbpFromPence(list)} list</span> : null}
                        </td>
                        <td className="admin-nowrap">
                          <strong>{gbpFromPence(item.line_total_pence)}</strong>
                        </td>
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
            <p className="admin-hint">
              Prices are those agreed when the order was placed. Nothing is charged online — the invoice is
              raised separately.
            </p>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Notes</h2>
            </div>
            <div className="admin-notecards">
              <article className={order.customer_note ? undefined : "is-empty"}>
                <h3>From the stockist</h3>
                <p>{order.customer_note || "Nothing was added with the order."}</p>
              </article>
              <article className={order.delivery_note ? undefined : "is-empty"}>
                <h3>Delivery instructions</h3>
                <p>{order.delivery_note || "None given."}</p>
              </article>
              <article className={order.internal_note ? "is-internal" : "is-empty"}>
                <h3>Internal note</h3>
                <p>{order.internal_note || "Nothing recorded yet."}</p>
              </article>
            </div>
          </section>
          {siblings.length ? (
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Their other orders</h2>
              </div>
              <ul className="admin-minilist">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <Link to={`/admin/orders/${sibling.id}`}>{sibling.reference}</Link>
                    <span className={`admin-status admin-status-${sibling.status}`}>{sibling.status}</span>
                    <b>{gbpFromPence(sibling.subtotal_pence)}</b>
                    <span className="admin-minilist-date">
                      {new Date(sibling.submitted_at).toLocaleDateString("en-GB")}
                    </span>
                  </li>
                ))}
              </ul>
              {account ? (
                <p className="admin-hint">
                  <Link to={`/admin/accounts/${account.id}`}>See all orders from this account</Link>
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Account</h2>
            </div>
            {account ? (
              <div className="admin-panel-body admin-accountcard">
                <p className="admin-accountcard-name">
                  <Link to={`/admin/accounts/${account.id}`}>{account.business_name}</Link>
                </p>
                <p className="admin-accountcard-meta">
                  {account.account_code} · {account.market} ·{" "}
                  <span className={`admin-status admin-status-${account.status}`}>{account.status}</span>
                </p>

                <p className="admin-tierbadge">
                  <b className="admin-capitalise">{account.pricing_tier}</b>
                  <span>
                    {TIER_NOTE[account.pricing_tier] ?? "Trade pricing"}
                    {Number(account.discount_percent) > 0 ? ` · ${account.discount_percent}% off list` : ""}
                  </span>
                </p>

                <ul className="admin-contactlist">
                  <li>
                    <span>Contact</span>
                    {account.contact_name}
                  </li>
                  <li>
                    <span>Email</span>
                    <a href={`mailto:${account.email}`}>{account.email}</a>
                  </li>
                  <li>
                    <span>Phone</span>
                    {account.phone ? <a href={`tel:${account.phone.replace(/\s+/g, "")}`}>{account.phone}</a> : "—"}
                  </li>
                </ul>

                <div className="admin-actions">
                  <Link className="admin-primary-link" to={`/admin/accounts/${account.id}`}>
                    Open account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="admin-empty">This order is not attached to an account.</div>
            )}
          </section>

          {addressLines.length ? (
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Deliver to</h2>
              </div>
              <div className="admin-panel-body">
                <address className="admin-address">
                  {addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
                {order.delivery_note ? <p className="admin-address-note">{order.delivery_note}</p> : null}
              </div>
            </section>
          ) : null}

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Update</h2>
            </div>
            <div className="admin-panel-body">
              <Form method="post" replace>
                <div className="admin-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" defaultValue={order.status}>
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="internalNote">Internal note</label>
                  <textarea
                    id="internalNote"
                    name="internalNote"
                    rows={4}
                    defaultValue={order.internal_note ?? ""}
                    placeholder="Anything the next person picking this order up should know."
                  />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Save
                  </button>
                </div>
              </Form>
              <p className="admin-hint">
                Moving an order to <b>confirmed</b> stamps the confirmation time. Invoicing and payment happen
                outside this system.
              </p>
            </div>
          </section>

        </aside>
      </div>
    </main>
  );
}
