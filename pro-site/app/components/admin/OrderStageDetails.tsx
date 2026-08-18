/**
 * Jimmy Coco admin order workflow: compact stage inspections that preserve the
 * order page as the operational home for commercial and fulfilment details.
 */
import { Form } from "react-router";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type OrderShipment, type ShipmentStatus } from "../../lib/order-shipment-constants";

type Stage = "submitted" | "confirmed" | "invoiced" | "paid" | "shipped";

type Props = {
  stage: Stage | null;
  onClose: () => void;
  order: { reference: string; status: string; submitted_at: string; confirmed_at: string | null; delivery_note: string | null };
  account: { business_name: string; contact_name: string; email: string; phone: string | null } | null;
  invoice: { invoice_number: string | null; status: string; balance_pence: number; due_date: string | null; currency: string; paid_at: string | null } | null;
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

function StageInfo({ stage, order, account, invoice }: Omit<Props, "shipment" | "busy" | "onClose"> & { stage: Exclude<Stage, "shipped"> }) {
  const detail = stage === "submitted"
    ? { label: "Order received", title: "Order received", text: "The trade order is awaiting the stock and price confirmation.", rows: [["Received", date(order.submitted_at)], ["Customer", account?.business_name ?? "Trade account"], ["Reference", order.reference]] }
    : stage === "confirmed"
      ? { label: "Order confirmed", title: "Order confirmed", text: "The order is approved for invoicing and fulfilment preparation.", rows: [["Confirmed", date(order.confirmed_at)], ["Customer", account?.business_name ?? "Trade account"], ["Reference", order.reference]] }
      : stage === "invoiced"
        ? { label: "Invoice status", title: invoice?.invoice_number ?? "Invoice not raised", text: invoice ? "The invoice is kept on this order page for issuing, customer delivery and reconciliation." : "No invoice has been raised for this order yet.", rows: [["Status", invoice?.status ?? "Not raised"], ["Amount due", invoice ? money(invoice.balance_pence, invoice.currency) : "—"], ["Due", invoice?.due_date ?? "Not set"]] }
        : { label: "Payment status", title: invoice?.paid_at ? "Payment received" : "Payment pending", text: invoice?.paid_at ? "The payment is recorded against this order’s invoice." : "Use Receive payment in the commercial action panel to reconcile a payment.", rows: [["Paid at", date(invoice?.paid_at ?? null)], ["Outstanding", invoice ? money(invoice.balance_pence, invoice.currency) : "—"], ["Customer", account?.business_name ?? "Trade account"]] };

  return <><div className="admin-workflow-modal-head"><div><p>{detail.label}</p><h2 id="order-stage-title">{detail.title}</h2></div></div><p>{detail.text}</p><dl className="admin-modal-summary">{detail.rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></>;
}

export function OrderStageDetails({ stage, onClose, order, account, invoice, shipment, busy }: Props) {
  if (!stage) return null;
  const shipmentStatus = shipment?.status ?? (order.status === "shipped" ? "dispatched" : "preparing");
  const canManageShipment = ["invoiced", "shipped"].includes(order.status);
  const shipmentReady = canManageShipment || shipment !== null;

  return (
    <dialog className="admin-workflow-modal admin-stage-modal" open onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="order-stage-title">
      <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">×</button>
      {stage !== "shipped" ? <StageInfo stage={stage} order={order} account={account} invoice={invoice} /> : (
        <>
          <div className="admin-workflow-modal-head"><div><p>Fulfilment</p><h2 id="order-stage-title">Shipping process</h2></div></div>
          {!shipmentReady ? <p>Shipping becomes available once the invoice has been issued. This keeps the fulfilment record tied to the commercial order.</p> : <>
            <p>Record dispatch and tracking here, then update the shipment as it moves in transit and is delivered. The order remains the single operational record.</p>
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
        </>
      )}
      {stage !== "shipped" ? <div className="admin-modal-actions"><button className="admin-ghost" type="button" onClick={onClose}>Close</button></div> : null}
    </dialog>
  );
}
