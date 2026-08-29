import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import {
  addInvoiceLine,
  getInvoice,
  issueInvoice,
  recordPayment,
  removeInvoiceLine,
  removePayment,
  updateInvoice,
  voidInvoice,
} from "../lib/invoices.server";
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  daysUntil,
  isOverdue,
  type PaymentMethod,
} from "../lib/invoice-constants";
import { gbpFromPence } from "../lib/site";
import { updateOrder } from "../lib/resellers.server";
import { getTradeDataVisibility } from "../lib/trade-data-settings.server";

export const meta: MetaFunction = () => [
  { title: "Invoice | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const visibility = await getTradeDataVisibility(supabase);
  const result = await getInvoice(supabase, params.invoiceId as string, visibility);
  if (!result) throw new Response("Invoice not found", { status: 404, headers: responseHeaders });
  return data(result as never, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const invoiceId = params.invoiceId as string;
  const money = (value: FormDataEntryValue | null) => Math.round(Number.parseFloat(String(value ?? "0")) * 100);
  const visibility = await getTradeDataVisibility(supabase);

  try {
    const existing = await getInvoice(supabase, invoiceId, visibility);
    if (!existing) throw new Error("Invoice not found.");

    switch (intent) {
      case "issue": {
        const number = await issueInvoice(supabase, invoiceId);
        const issued = await getInvoice(supabase, invoiceId, visibility);
        const linkedOrder = issued?.order;
        if (linkedOrder?.status === "confirmed") {
          await updateOrder(supabase, linkedOrder.id, { status: "invoiced" });
        }
        return data({ notice: `Issued as ${number}.` }, { headers: responseHeaders });
      }
      case "void": {
        await voidInvoice(supabase, invoiceId, String(form.get("reason") ?? ""));
        return data({ notice: "Invoice voided." }, { headers: responseHeaders });
      }
      case "add-line": {
        const quantity = Number.parseInt(String(form.get("quantity") ?? "1"), 10);
        if (!Number.isFinite(quantity) || quantity < 1) throw new Error("Quantity must be at least 1.");
        await addInvoiceLine(supabase, invoiceId, {
          title: String(form.get("title") ?? "").trim(),
          sku: String(form.get("sku") ?? "").trim() || null,
          quantity,
          unitPricePence: money(form.get("unitPrice")),
        });
        return data({ notice: "Line added." }, { headers: responseHeaders });
      }
      case "remove-line": {
        await removeInvoiceLine(supabase, String(form.get("lineId") ?? ""));
        return data({ notice: "Line removed." }, { headers: responseHeaders });
      }
      case "record-payment": {
        await recordPayment(
          supabase,
          invoiceId,
          {
            amountPence: money(form.get("amount")),
            paidOn: String(form.get("paidOn") ?? new Date().toISOString().slice(0, 10)),
            method: String(form.get("method") ?? "bank_transfer") as PaymentMethod,
            reference: String(form.get("reference") ?? "").trim() || null,
            note: String(form.get("note") ?? "").trim() || null,
          },
          staff?.userId,
        );
        return data({ notice: "Payment recorded." }, { headers: responseHeaders });
      }
      case "remove-payment": {
        await removePayment(supabase, String(form.get("paymentId") ?? ""));
        return data({ notice: "Payment removed." }, { headers: responseHeaders });
      }
      case "details": {
        await updateInvoice(supabase, invoiceId, {
          issue_date: String(form.get("issueDate") ?? "").trim() || null,
          due_date: String(form.get("dueDate") ?? "").trim() || null,
          external_reference: String(form.get("externalReference") ?? "").trim() || null,
          customer_note: String(form.get("customerNote") ?? "").trim() || null,
          internal_note: String(form.get("internalNote") ?? "").trim() || null,
        });
        return data({ notice: "Invoice updated." }, { headers: responseHeaders });
      }
      default:
        return data({ error: "Unknown action." }, { status: 400, headers: responseHeaders });
    }
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

function date(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export default function InvoiceDetail() {
  const { invoice, lines, payments, order } = useLoaderData<typeof loader>() as unknown as Awaited<
    ReturnType<typeof getInvoice>
  > & object as NonNullable<Awaited<ReturnType<typeof getInvoice>>>;

  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  const account = invoice.resellers;
  const draft = invoice.status === "draft";
  const voided = invoice.status === "void";
  const late = isOverdue(invoice.status, invoice.due_date);
  const due = daysUntil(invoice.due_date);
  const owing = invoice.balance_pence > 0 && !draft && !voided;

  return (
    <main className="admin-main admin-order">
      <p className="admin-crumb">
        <Link to="/admin/invoices">← Invoices</Link>
        {account ? (
          <>
            {" · "}
            <Link to={`/admin/accounts/${account.id}`}>{account.business_name}</Link>
          </>
        ) : null}
      </p>

      <header className="admin-order-head">
        <div>
          <p className="admin-eyebrow">{draft ? "Draft invoice" : "Invoice"}</p>
          <h1>{invoice.invoice_number ?? "Not yet issued"}</h1>
          <p className="admin-order-sub">
            {account ? (
              <>
                <Link to={`/admin/accounts/${account.id}`}>{account.business_name}</Link> ·{" "}
              </>
            ) : null}
            {draft ? "not issued yet" : `issued ${date(invoice.issue_date)}`}
            {order ? (
              <>
                {" · "}
                <Link to={`/admin/orders/${order.id}`}>{order.reference}</Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="admin-order-head-right">
          <b className="admin-order-total">{gbpFromPence(invoice.gross_pence)}</b>
          <span className="admin-order-total-note">
            {owing ? `${gbpFromPence(invoice.balance_pence)} outstanding` : draft ? "draft total" : "settled"} ·{" "}
            {invoice.currency}
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

      {voided ? (
        <div className="admin-order-cancelled" role="status">
          <b>This invoice was voided.</b>
          <span>
            {invoice.void_reason} · The number {invoice.invoice_number} stays used and is not reissued.
          </span>
        </div>
      ) : late ? (
        <p className="admin-warn" role="alert">
          <b>Overdue</b>
          {gbpFromPence(invoice.balance_pence)} was due on {date(invoice.due_date)} — {Math.abs(due ?? 0)} days ago.
        </p>
      ) : null}

      <div className="admin-actionbar">
        <div className="admin-actionbar-lead">
          <span className={`admin-status admin-status-inv-${invoice.status}`}>
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
          <p>
            {draft
              ? "Check the lines and the dates, then issue. Issuing allocates the number and freezes the invoice."
              : voided
                ? "Nothing further to do."
                : owing
                  ? `Due ${date(invoice.due_date)}${due !== null && due >= 0 ? ` · ${due} days` : ""}.`
                  : "Settled in full."}
          </p>
        </div>
        <div className="admin-actionbar-actions">
          {draft ? (
            <Form method="post" replace>
              <input type="hidden" name="intent" value="issue" />
              <button className="admin-primary" type="submit" disabled={busy || lines.length === 0}>
                Issue invoice
              </button>
            </Form>
          ) : (
            <a className="admin-primary-link" href={`/admin/invoices/${invoice.id}/document`} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          )}
          {voided ? null : (
            <details className="admin-override">
              <summary>Void</summary>
              <Form method="post" replace className="admin-override-form">
                <input type="hidden" name="intent" value="void" />
                <label htmlFor="reason">Reason</label>
                <input id="reason" name="reason" required placeholder="Wrong account, duplicate…" />
                <button type="submit" disabled={busy}>
                  Void this invoice
                </button>
                <p>
                  {draft
                    ? "A draft can simply be voided; no number has been used."
                    : "The number stays used. Raise a fresh invoice for the corrected version."}
                </p>
              </Form>
            </details>
          )}
        </div>
      </div>

      <div className="admin-split">
        <div>
          <section className="admin-panel is-primary">
            <div className="admin-panel-head">
              <h2>Lines</h2>
              {draft ? <p className="admin-result-count">Editable until issued</p> : null}
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Unit</th>
                    {invoice.vat_registered ? <th scope="col">VAT</th> : null}
                    <th scope="col">Total</th>
                    {draft ? <th scope="col"><span className="admin-visually-hidden">Remove</span></th> : null}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <strong>{line.title}</strong>
                        {line.sku ? <span>{line.sku}</span> : null}
                      </td>
                      <td className="admin-nowrap">{line.quantity}</td>
                      <td className="admin-nowrap">{gbpFromPence(line.unit_price_pence)}</td>
                      {invoice.vat_registered ? (
                        <td className="admin-nowrap">
                          {gbpFromPence(line.vat_pence)}
                          <span>{(line.vat_rate_bps / 100).toFixed(line.vat_rate_bps % 100 ? 1 : 0)}%</span>
                        </td>
                      ) : null}
                      <td className="admin-nowrap admin-linetotal">{gbpFromPence(line.gross_pence)}</td>
                      {draft ? (
                        <td className="admin-nowrap">
                          <Form method="post" replace>
                            <input type="hidden" name="intent" value="remove-line" />
                            <input type="hidden" name="lineId" value={line.id} />
                            <button type="submit" disabled={busy}>
                              Remove
                            </button>
                          </Form>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-muted">
                        No lines yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <dl className="admin-figures">
              {invoice.vat_registered ? (
                <>
                  <div>
                    <dt>Net</dt>
                    <dd>{gbpFromPence(invoice.net_pence)}</dd>
                  </div>
                  <div>
                    <dt>VAT{invoice.vat_rate_bps ? ` at ${(invoice.vat_rate_bps / 100).toFixed(0)}%` : ""}</dt>
                    <dd>{gbpFromPence(invoice.vat_pence)}</dd>
                  </div>
                </>
              ) : null}
              <div className="admin-figures-total">
                <dt>Invoice total</dt>
                <dd>{gbpFromPence(invoice.gross_pence)}</dd>
              </div>
              {invoice.paid_pence !== 0 ? (
                <>
                  <div className="admin-figures-off">
                    <dt>Paid</dt>
                    <dd>− {gbpFromPence(invoice.paid_pence)}</dd>
                  </div>
                  <div className="admin-figures-total">
                    <dt>Outstanding</dt>
                    <dd>{gbpFromPence(invoice.balance_pence)}</dd>
                  </div>
                </>
              ) : null}
            </dl>

            {draft ? (
              <div className="admin-panel-body">
                <Form method="post" replace className="admin-lineform">
                  <input type="hidden" name="intent" value="add-line" />
                  <div className="admin-field">
                    <label htmlFor="line-title">Add a line</label>
                    <input id="line-title" name="title" required placeholder="Description" />
                  </div>
                  <div className="admin-field is-narrow">
                    <label htmlFor="line-sku">SKU</label>
                    <input id="line-sku" name="sku" placeholder="Optional" />
                  </div>
                  <div className="admin-field is-narrow">
                    <label htmlFor="line-qty">Qty</label>
                    <input id="line-qty" name="quantity" type="number" min="1" defaultValue="1" required />
                  </div>
                  <div className="admin-field is-narrow">
                    <label htmlFor="line-price">Unit £</label>
                    <input id="line-price" name="unitPrice" type="number" min="0" step="0.01" required />
                  </div>
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Add
                  </button>
                </Form>
              </div>
            ) : null}
          </section>

          <section className="admin-panel is-primary">
            <div className="admin-panel-head">
              <h2>Payments</h2>
              <p className="admin-result-count">
                {payments.length === 0 ? "Nothing received yet" : `${payments.length} recorded`}
              </p>
            </div>

            {payments.length ? (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Received</th>
                      <th scope="col">Method</th>
                      <th scope="col">Reference</th>
                      <th scope="col">Amount</th>
                      <th scope="col"><span className="admin-visually-hidden">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="admin-nowrap">{date(payment.paid_on)}</td>
                        <td>{PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}</td>
                        <td>
                          {payment.reference ?? "—"}
                          {payment.note ? <span>{payment.note}</span> : null}
                        </td>
                        <td className={`admin-nowrap admin-linetotal${payment.amount_pence < 0 ? " admin-negative" : ""}`}>
                          {gbpFromPence(payment.amount_pence)}
                        </td>
                        <td className="admin-nowrap">
                          <Form method="post" replace>
                            <input type="hidden" name="intent" value="remove-payment" />
                            <input type="hidden" name="paymentId" value={payment.id} />
                            <button type="submit" disabled={busy}>
                              Remove
                            </button>
                          </Form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {draft || voided ? null : (
              <div className="admin-panel-body">
                <Form method="post" replace className="admin-lineform">
                  <input type="hidden" name="intent" value="record-payment" />
                  <div className="admin-field is-narrow">
                    <label htmlFor="pay-amount">Amount £</label>
                    <input
                      id="pay-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={(invoice.balance_pence / 100).toFixed(2)}
                    />
                  </div>
                  <div className="admin-field is-narrow">
                    <label htmlFor="pay-date">Received</label>
                    <input id="pay-date" name="paidOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                  </div>
                  <div className="admin-field is-narrow">
                    <label htmlFor="pay-method">Method</label>
                    <select id="pay-method" name="method" defaultValue="bank_transfer">
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {PAYMENT_METHOD_LABELS[method]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label htmlFor="pay-ref">Reference</label>
                    <input id="pay-ref" name="reference" placeholder="Bank reference, optional" />
                  </div>
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Record
                  </button>
                </Form>
                <p className="admin-hint">
                  Enter a negative amount to reverse a bounced payment — the original stays on the ledger.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside>
          <section className="admin-panel is-secondary">
            <div className="admin-panel-head">
              <h2>Bill to</h2>
              {account ? (
                <Link className="admin-panel-link" to={`/admin/accounts/${account.id}`}>
                  Open
                </Link>
              ) : null}
            </div>
            <div className="admin-panel-body">
              {/* Once issued, this is the frozen snapshot rather than the live account. */}
              {(() => {
                const snapshot = invoice.bill_to as Record<string, never>;
                const name = (snapshot.business_name as string) ?? account?.business_name ?? "—";
                const addr = ((snapshot.address as Record<string, string>) ?? account?.address ?? {}) as Record<string, string>;
                const lines2 = [addr.line1, addr.line2, addr.city, addr.county, addr.postcode, addr.country].filter(Boolean);
                return (
                  <>
                    <p className="admin-shipto-name">{name}</p>
                    {lines2.length ? (
                      <address className="admin-address">
                        {lines2.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </address>
                    ) : (
                      <p className="admin-muted">No address on the account record.</p>
                    )}
                    {draft ? <p className="admin-hint">Snapshotted when you issue.</p> : null}
                  </>
                );
              })()}
            </div>
          </section>

          <section className="admin-panel is-secondary">
            <div className="admin-panel-head">
              <h2>Details</h2>
            </div>
            <div className="admin-panel-body">
              <Form method="post" replace>
                <input type="hidden" name="intent" value="details" />
                <div className="admin-field">
                  <label htmlFor="issueDate">Issue date</label>
                  <input id="issueDate" name="issueDate" type="date" defaultValue={invoice.issue_date ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="dueDate">Due date</label>
                  <input id="dueDate" name="dueDate" type="date" defaultValue={invoice.due_date ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="externalReference">Accounting reference</label>
                  <input
                    id="externalReference"
                    name="externalReference"
                    defaultValue={invoice.external_reference ?? ""}
                    placeholder="Xero / QuickBooks reference"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="customerNote">Note on the invoice</label>
                  <textarea id="customerNote" name="customerNote" rows={2} defaultValue={invoice.customer_note ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="internalNote">Internal note</label>
                  <textarea id="internalNote" name="internalNote" rows={2} defaultValue={invoice.internal_note ?? ""} />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Save
                  </button>
                </div>
              </Form>
            </div>
          </section>

          <section className="admin-panel is-secondary">
            <div className="admin-panel-head">
              <h2>VAT treatment</h2>
            </div>
            <div className="admin-panel-body">
              {invoice.vat_registered ? (
                <>
                  <p className="admin-kv">
                    <span>Rate</span>
                    <span>{(invoice.vat_rate_bps / 100).toFixed(invoice.vat_rate_bps % 100 ? 1 : 0)}%</span>
                  </p>
                  <p className="admin-kv">
                    <span>Prices</span>
                    <span>{invoice.prices_include_vat ? "Include VAT" : "Exclude VAT"}</span>
                  </p>
                  <p className="admin-kv">
                    <span>VAT number</span>
                    <span>{invoice.vat_number ?? "—"}</span>
                  </p>
                </>
              ) : (
                <p className="admin-muted">
                  Not VAT registered — this invoice shows no VAT.{" "}
                  <Link to="/admin/invoice-settings">Change that in settings</Link> if it is wrong.
                </p>
              )}
              <p className="admin-hint">
                Frozen when this invoice was drafted, so changing the settings later cannot rewrite it.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
