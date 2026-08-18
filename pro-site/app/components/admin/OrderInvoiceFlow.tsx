/**
 * Jimmy Coco admin order flow: calm, operationally direct controls that keep
 * the complete invoice lifecycle in context on the order-detail page.
 */
import { useEffect, useState } from "react";
import { Form } from "react-router";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "../../lib/invoice-constants";

type InvoiceSummary = {
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
};

type OrderInvoiceFlowProps = {
  order: { status: string; currency: string; subtotal_pence: number; reference: string };
  account: { business_name: string; contact_name: string; email: string } | null;
  invoice: InvoiceSummary | null;
  busy: boolean;
  result?: { error?: string; notice?: string };
  onOpenShipping: () => void;
  onOpenInvoice: () => void;
};

type Modal = "raise" | "issue" | "email" | "payment" | null;

function money(pence: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(pence / 100);
}

function date(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
export function OrderInvoiceFlow({ order, account, invoice, busy, result, onOpenShipping, onOpenInvoice }: OrderInvoiceFlowProps) {
  const [modal, setModal] = useState<Modal>(null);
  const isDraft = invoice?.status === "draft";
  const paid = invoice?.status === "paid" || (invoice?.balance_pence ?? 1) <= 0;
  const canShip = order.status === "invoiced";
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (result?.notice) setModal(null);
  }, [result?.notice]);

  const task = order.status === "submitted"
    ? { title: "Confirm this order", text: "Confirm the agreed stock and price before creating the invoice." }
    : !invoice
      ? { title: "Raise the invoice", text: "Create a draft from the confirmed order lines without leaving this page." }
      : isDraft
        ? { title: "Issue the invoice", text: "Check the frozen total and due date, then allocate the official invoice number." }
        : !paid
          ? { title: "Review the invoice and record payment", text: "Open the invoice workspace to email or download the document, then record any payment received." }
          : canShip
            ? { title: "Arrange fulfilment", text: "The invoice is issued. Open the shipping process to add dispatch and tracking details." }
            : { title: "Order complete", text: "The order is paid and its administration is up to date." };

  return (
    <>
      <section className="admin-next-task admin-invoice-flow" aria-label="Order billing and fulfilment">
        <div className="admin-next-task-copy">
          <span className="admin-next-task-icon" aria-hidden="true">£</span>
          <div>
            <p className="admin-next-task-kicker">Next task <span>{order.status === "submitted" ? "Received" : order.status}</span></p>
            <h2>{task.title}</h2>
            <p>{task.text}</p>
          </div>
        </div>
        <div className="admin-next-task-actions admin-invoice-flow-actions">
          {order.status === "submitted" ? (
            <Form method="post" replace>
              <input type="hidden" name="status" value="confirmed" />
              <button className="admin-primary" type="submit" disabled={busy}>Confirm order</button>
            </Form>
          ) : !invoice ? (
            <button className="admin-primary" type="button" onClick={() => setModal("raise")} disabled={busy}>Raise invoice</button>
          ) : isDraft ? (
            <button className="admin-primary" type="button" onClick={() => setModal("issue")} disabled={busy}>Issue invoice</button>
          ) : (
            <>
              <button className="admin-primary" type="button" onClick={onOpenInvoice} disabled={busy}>Open invoice</button>
              {!paid ? <button className="admin-secondary" type="button" onClick={() => setModal("payment")} disabled={busy}>Receive payment</button> : null}
              {canShip ? <button className="admin-ghost" type="button" onClick={onOpenShipping} disabled={busy}>Open shipping</button> : null}
            </>
          )}
        </div>
      </section>

      {modal === "raise" ? (
        <dialog className="admin-workflow-modal" open onCancel={(event) => { event.preventDefault(); setModal(null); }} aria-labelledby="raise-invoice-title">
          <div className="admin-workflow-modal-head"><div><p>Confirmed order</p><h2 id="raise-invoice-title">Raise invoice</h2></div><button type="button" className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div>
          <p>This creates a draft using the confirmed order lines. You remain on this order page to issue, email and record payment.</p>
          <dl className="admin-modal-summary"><div><dt>Customer</dt><dd>{account?.business_name ?? "Trade account"}</dd></div><div><dt>Order</dt><dd>{order.reference}</dd></div><div><dt>Draft total</dt><dd>{money(order.subtotal_pence, order.currency)}</dd></div></dl>
          <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={() => setModal(null)}>Cancel</button><Form method="post" replace><input type="hidden" name="intent" value="create-invoice" /><button className="admin-primary" type="submit" disabled={busy}>Create draft invoice</button></Form></div>
        </dialog>
      ) : null}

      {modal === "issue" && invoice ? (
        <dialog className="admin-workflow-modal" open onCancel={(event) => { event.preventDefault(); setModal(null); }} aria-labelledby="issue-invoice-title">
          <div className="admin-workflow-modal-head"><div><p>Draft invoice</p><h2 id="issue-invoice-title">Issue invoice</h2></div><button type="button" className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div>
          <p>Issuing allocates the official invoice number, freezes the invoice details and moves the order to Invoiced.</p>
          <dl className="admin-modal-summary"><div><dt>Customer</dt><dd>{account?.business_name ?? "Trade account"}</dd></div><div><dt>Invoice total</dt><dd>{money(invoice.gross_pence, invoice.currency)}</dd></div><div><dt>Payment terms</dt><dd>Due date set on issue</dd></div></dl>
          <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={() => setModal(null)}>Cancel</button><Form method="post" replace><input type="hidden" name="intent" value="issue-invoice" /><button className="admin-primary" type="submit" disabled={busy}>Issue invoice</button></Form></div>
        </dialog>
      ) : null}

      {modal === "email" && invoice ? (
        <dialog className="admin-workflow-modal" open onCancel={(event) => { event.preventDefault(); setModal(null); }} aria-labelledby="email-invoice-title">
          <div className="admin-workflow-modal-head"><div><p>Customer delivery</p><h2 id="email-invoice-title">Email invoice</h2></div><button type="button" className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div>
          <p>The issued invoice summary, payment due date and saved payment details will be emailed to the account contact. A copy is sent only to Matthew for the internal audit trail.</p>
          <dl className="admin-modal-summary"><div><dt>To</dt><dd>{account?.email ?? "No account email"}</dd></div><div><dt>Invoice</dt><dd>{invoice.invoice_number}</dd></div><div><dt>Amount due</dt><dd>{money(invoice.balance_pence, invoice.currency)}</dd></div><div><dt>Due</dt><dd>{date(invoice.due_date)}</dd></div></dl>
          <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={() => setModal(null)}>Cancel</button><Form method="post" replace><input type="hidden" name="intent" value="email-invoice" /><button className="admin-primary" type="submit" disabled={busy}>{invoice.customer_emailed_at ? "Resend invoice" : "Email invoice"}</button></Form></div>
        </dialog>
      ) : null}

      {modal === "payment" && invoice ? (
        <dialog className="admin-workflow-modal" open onCancel={(event) => { event.preventDefault(); setModal(null); }} aria-labelledby="record-payment-title">
          <div className="admin-workflow-modal-head"><div><p>Payment received</p><h2 id="record-payment-title">Receive payment</h2></div><button type="button" className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div>
          <p>Record the amount received against {invoice.invoice_number}. Part-payments remain visible against this order.</p>
          <Form method="post" replace className="admin-payment-form"><input type="hidden" name="intent" value="record-payment" /><div className="admin-field"><label htmlFor="payment-amount">Amount {invoice.currency}</label><input id="payment-amount" name="amount" type="number" step="0.01" min="0.01" defaultValue={(invoice.balance_pence / 100).toFixed(2)} required /></div><div className="admin-field"><label htmlFor="payment-date">Received</label><input id="payment-date" name="paidOn" type="date" defaultValue={today} required /></div><div className="admin-field"><label htmlFor="payment-method">Method</label><select id="payment-method" name="method" defaultValue="bank_transfer">{PAYMENT_METHODS.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}</select></div><div className="admin-field"><label htmlFor="payment-reference">Reference</label><input id="payment-reference" name="reference" placeholder="Bank reference, optional" /></div><div className="admin-field"><label htmlFor="payment-note">Internal note</label><input id="payment-note" name="note" placeholder="Optional" /></div><div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={() => setModal(null)}>Cancel</button><button className="admin-primary" type="submit" disabled={busy}>Record payment</button></div></Form>
        </dialog>
      ) : null}
    </>
  );
}
