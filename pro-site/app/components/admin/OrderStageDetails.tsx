/**
 * Jimmy Coco admin order workflow: each compact header stage opens the related
 * operational information without moving the administrator away from the order.
 */
import { Form } from "react-router";
import { IconDownload, IconExternal } from "./AdminIcons";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type OrderShipment, type ShipmentStatus } from "../../lib/order-shipment-constants";

type Stage = "submitted" | "confirmed" | "invoiced" | "paid" | "shipped";

type Invoice = {
  id: string;
  invoice_number: string | null;
  status: string;
  gross_pence: number;
  balance_pence: number;
  due_date: string | null;
  issue_date: string | null;
  currency: string;
  paid_at: string | null;
  customer_emailed_at: string | null;
};

type Props = {
  stage: Stage | null;
  onClose: () => void;
  order: { reference: string; status: string; submitted_at: string; confirmed_at: string | null; delivery_note: string | null };
  account: { business_name: string; contact_name: string; email: string; phone: string | null } | null;
  invoice: Invoice | null;
  shipment: OrderShipment | null;
  busy: boolean;
};

function date(value: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function money(pence: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(pence / 100);
}

function SimpleStage({ stage, order, account, invoice }: Pick<Props, "stage" | "order" | "account" | "invoice">) {
  const detail = stage === "submitted"
    ? { eyebrow: "Order received", title: "Order received", text: "The trade order is awaiting stock and price confirmation.", rows: [["Received", date(order.submitted_at)], ["Customer", account?.business_name ?? "Trade account"], ["Reference", order.reference]] }
    : stage === "confirmed"
      ? { eyebrow: "Order confirmed", title: "Order confirmed", text: "The order is approved for invoicing and fulfilment preparation.", rows: [["Confirmed", date(order.confirmed_at)], ["Customer", account?.business_name ?? "Trade account"], ["Reference", order.reference]] }
      : { eyebrow: "Payment status", title: invoice?.paid_at ? "Payment received" : "Payment pending", text: invoice?.paid_at ? "The payment is recorded against this order’s invoice." : "Use Receive payment in the order action panel to reconcile a payment.", rows: [["Paid at", date(invoice?.paid_at ?? null)], ["Outstanding", invoice ? money(invoice.balance_pence, invoice.currency) : "—"], ["Customer", account?.business_name ?? "Trade account"]] };

  return <><div className="admin-workflow-modal-head"><div><p>{detail.eyebrow}</p><h2 id="order-stage-title">{detail.title}</h2></div></div><p>{detail.text}</p><dl className="admin-modal-summary">{detail.rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></>;
}

function InvoiceWorkspace({ invoice, account, busy }: Pick<Props, "invoice" | "account" | "busy">) {
  if (!invoice) return <><div className="admin-workflow-modal-head"><div><p>Invoice</p><h2 id="order-stage-title">No invoice raised</h2></div></div><p>Confirm the order, then use Raise invoice to create the document from these order lines.</p></>;
  const issued = ["issued", "part_paid", "paid"].includes(invoice.status);
  const documentUrl = `/admin/invoices/${invoice.id}/document?print=0`;
  const embeddedDocumentUrl = `/admin/invoices/${invoice.id}/document?print=0&embed=1`;
  const downloadUrl = `/admin/invoices/${invoice.id}/document?print=1`;

  return <>
    <div className="admin-workflow-modal-head"><div><p>Invoice workspace</p><h2 id="order-stage-title">{invoice.invoice_number ?? "Draft invoice"}</h2></div></div>
    <div className="admin-invoice-workspace-meta"><span>{invoice.status}</span><span>{money(invoice.gross_pence, invoice.currency)}</span><span>{account?.business_name ?? "Trade account"}</span></div>
    <div className="admin-invoice-workspace-actions">
      {invoice.status === "draft" ? <Form method="post" replace><input type="hidden" name="intent" value="issue-invoice" /><button className="admin-primary" type="submit" disabled={busy}>Issue invoice</button></Form> : null}
      {issued ? <Form method="post" replace><input type="hidden" name="intent" value="email-invoice" /><button className="admin-primary" type="submit" disabled={busy}>{invoice.customer_emailed_at ? "Resend invoice" : "Email invoice"}</button></Form> : null}
      <a className="admin-secondary-link" href={downloadUrl} target="_blank" rel="noreferrer"><IconDownload size={17} /> Download / print PDF</a>
      <a className="admin-ghost-link" href={documentUrl} target="_blank" rel="noreferrer"><IconExternal size={16} /> Open document</a>
    </div>
    <div className="admin-invoice-document-frame"><iframe title={`Invoice ${invoice.invoice_number ?? "draft"}`} src={embeddedDocumentUrl} /></div>
  </>;
}

function ShippingWorkspace({ order, account, shipment, busy, onClose }: Pick<Props, "order" | "account" | "shipment" | "busy" | "onClose">) {
  const shipmentStatus = shipment?.status ?? (order.status === "shipped" ? "dispatched" : "preparing");
  const shipmentReady = ["invoiced", "shipped"].includes(order.status) || shipment !== null;
  return <>
    <div className="admin-workflow-modal-head"><div><p>Fulfilment</p><h2 id="order-stage-title">Shipping process</h2></div></div>
    {!shipmentReady ? <p>Shipping becomes available once the invoice has been issued. This keeps the fulfilment record tied to the commercial order.</p> : <>
      <p>Record dispatch and tracking here, then update the shipment as it moves in transit and is delivered.</p>
      <Form method="post" replace className="admin-shipment-form">
        <input type="hidden" name="intent" value="save-shipment" />
        <div className="admin-shipment-statuses" aria-label="Shipment status">
          {SHIPMENT_STATUSES.map((value) => <label key={value}><input type="radio" name="shipmentStatus" value={value} defaultChecked={shipmentStatus === value} /><span>{SHIPMENT_STATUS_LABELS[value]}</span></label>)}
        </div>
        <div className="admin-form-grid">
          <div className="admin-field"><label htmlFor="shipment-carrier">Carrier</label><input id="shipment-carrier" name="carrier" defaultValue={shipment?.carrier ?? ""} placeholder="e.g. DPD" /></div>
          <div className="admin-field"><label htmlFor="shipment-service">Service</label><input id="shipment-service" name="serviceLevel" defaultValue={shipment?.service_level ?? ""} placeholder="e.g. Next day" /></div>
          <div className="admin-field"><label htmlFor="shipment-tracking">Tracking number</label><input id="shipment-tracking" name="trackingNumber" defaultValue={shipment?.tracking_number ?? ""} placeholder="Optional" /></div>
          <div className="admin-field"><label htmlFor="shipment-url">Tracking link</label><input id="shipment-url" name="trackingUrl" type="url" defaultValue={shipment?.tracking_url ?? ""} placeholder="https://" /></div>
          <div className="admin-field"><label htmlFor="shipment-eta">Estimated delivery</label><input id="shipment-eta" name="estimatedDeliveryDate" type="date" defaultValue={shipment?.estimated_delivery_date ?? ""} /></div>
          <div className="admin-field"><label htmlFor="shipment-note">Fulfilment note</label><input id="shipment-note" name="shipmentNote" defaultValue={shipment?.internal_note ?? ""} placeholder="Optional internal note" /></div>
        </div>
        <dl className="admin-modal-summary admin-shipment-summary"><div><dt>Dispatch</dt><dd>{date(shipment?.dispatched_at ?? null)}</dd></div><div><dt>Delivered</dt><dd>{date(shipment?.delivered_at ?? null)}</dd></div><div><dt>Ship to</dt><dd>{account?.business_name ?? "Trade account"}</dd></div><div><dt>Instructions</dt><dd>{order.delivery_note ?? "None"}</dd></div></dl>
        <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={onClose}>Close</button><button className="admin-primary" type="submit" disabled={busy}>Save shipping update</button></div>
      </Form>
    </>}
  </>;
}

export function OrderStageDetails({ stage, onClose, order, account, invoice, shipment, busy }: Props) {
  if (!stage) return null;
  const wide = stage === "invoiced";
  return <dialog className={`admin-workflow-modal admin-stage-modal${wide ? " is-invoice-workspace" : ""}`} open onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="order-stage-title">
    <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">×</button>
    {stage === "invoiced" ? <InvoiceWorkspace invoice={invoice} account={account} busy={busy} /> : stage === "shipped" ? <ShippingWorkspace order={order} account={account} shipment={shipment} busy={busy} onClose={onClose} /> : <SimpleStage stage={stage} order={order} account={account} invoice={invoice} />}
    {stage !== "shipped" ? <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={onClose}>Close</button></div> : null}
  </dialog>;
}
