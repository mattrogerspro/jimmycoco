import type { getInvoice } from "./invoices.server";
import { INVOICE_STATUS_LABELS } from "./invoice-constants";

type Loaded = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;

const escape = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CURRENCY: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", AUD: "A$" };

function money(pence: number, currency: string) {
  const symbol = CURRENCY[currency] ?? "";
  return `${pence < 0 ? "−" : ""}${symbol}${Math.abs(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function longDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function addressBlock(address: Record<string, string> | null | undefined) {
  const lines = [address?.line1, address?.line2, address?.city, address?.county, address?.postcode, address?.country]
    .filter(Boolean)
    .map((line) => `<span>${escape(line)}</span>`);
  return lines.join("");
}

/**
 * The printable invoice. Deliberately plain: black on white, one accent rule,
 * no background fills that would drink a customer's toner.
 */
export function renderInvoiceDocument({ invoice, lines, payments, order }: Loaded, { autoPrint = true } = {}) {
  const issuer = (invoice.issuer ?? {}) as Record<string, never>;
  const billTo = (invoice.bill_to ?? {}) as Record<string, never>;
  const account = invoice.resellers;

  // A draft has no snapshot yet, so fall back to the live records for a preview.
  const issuerName = (issuer.legal_name as string) ?? "Sunless by Jimmy Coco";
  const issuerAddress = (issuer.address as Record<string, string>) ?? null;
  const customerName = (billTo.business_name as string) ?? account?.business_name ?? "";
  const customerAddress = ((billTo.address as Record<string, string>) ?? account?.address) as Record<string, string> | null;
  const customerContact = (billTo.contact_name as string) ?? account?.contact_name ?? "";
  const customerCode = (billTo.account_code as string) ?? account?.account_code ?? "";
  const vat = invoice.vat_registered;
  const draft = invoice.status === "draft";
  const currency = invoice.currency;

  const lineRows = lines
    .map(
      (line) => `<tr>
      <td class="desc"><b>${escape(line.title)}</b>${line.sku ? `<span>${escape(line.sku)}</span>` : ""}${
        line.description ? `<span>${escape(line.description)}</span>` : ""
      }</td>
      <td class="num">${line.quantity}</td>
      <td class="num">${money(line.unit_price_pence, currency)}</td>
      ${vat ? `<td class="num">${(line.vat_rate_bps / 100).toFixed(line.vat_rate_bps % 100 ? 1 : 0)}%</td>` : ""}
      <td class="num strong">${money(vat ? line.net_pence : line.gross_pence, currency)}</td>
    </tr>`,
    )
    .join("");

  const paymentRows = payments.length
    ? `<section class="payments">
        <h2>Payments received</h2>
        <table>
          <tbody>
            ${payments
              .map(
                (payment) => `<tr>
                  <td>${longDate(payment.paid_on)}</td>
                  <td>${escape(payment.reference ?? payment.method.replace(/_/g, " "))}</td>
                  <td class="num">${money(payment.amount_pence, currency)}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </section>`
    : "";

  const totals = [
    vat ? `<tr><th>Subtotal</th><td>${money(invoice.net_pence, currency)}</td></tr>` : "",
    vat
      ? `<tr><th>VAT at ${(invoice.vat_rate_bps / 100).toFixed(invoice.vat_rate_bps % 100 ? 1 : 0)}%</th><td>${money(
          invoice.vat_pence,
          currency,
        )}</td></tr>`
      : "",
    `<tr class="grand"><th>Total ${escape(currency)}</th><td>${money(invoice.gross_pence, currency)}</td></tr>`,
    invoice.paid_pence ? `<tr><th>Paid</th><td>−${money(invoice.paid_pence, currency).replace("−", "")}</td></tr>` : "",
    invoice.paid_pence
      ? `<tr class="grand"><th>Amount due</th><td>${money(invoice.balance_pence, currency)}</td></tr>`
      : "",
  ].join("");

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>${escape(invoice.invoice_number ?? "Draft invoice")} — ${escape(issuerName)}</title>
<meta name="robots" content="noindex, nofollow">
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin:0; padding:24px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
         font-size:11pt; line-height:1.5; color:#1A1512; background:#F3EFE9; }
  .sheet { max-width:210mm; margin:0 auto; padding:18mm 16mm; background:#fff; box-shadow:0 8px 40px rgba(0,0,0,.12); }
  header { display:flex; justify-content:space-between; gap:32px; align-items:flex-start;
           padding-bottom:18px; border-bottom:2px solid #98603A; }
  .brand b { display:block; font-size:19pt; font-weight:600; letter-spacing:-.01em; }
  .brand span, address span { display:block; font-size:9.5pt; color:#5A5149; }
  address { font-style:normal; }
  .doc { text-align:right; }
  .doc h1 { margin:0 0 4px; font-size:22pt; font-weight:600; letter-spacing:.02em; }
  .doc .number { font-size:13pt; color:#98603A; font-weight:600; }
  .draft { display:inline-block; margin-top:6px; padding:3px 10px; border:1px solid #C08A2E;
           border-radius:3px; color:#6B4E14; font-size:8.5pt; letter-spacing:.16em; text-transform:uppercase; }
  .void { border-color:#9D3D34; color:#7A2E2E; }
  .meta { display:flex; justify-content:space-between; gap:32px; margin:22px 0 26px; }
  .meta h2 { margin:0 0 6px; font-size:8.5pt; letter-spacing:.16em; text-transform:uppercase; color:#7A726A; font-weight:600; }
  .meta b { font-size:11.5pt; }
  .dates table { border-collapse:collapse; }
  .dates th { text-align:left; padding:2px 18px 2px 0; font-weight:400; color:#5A5149; font-size:9.5pt; }
  .dates td { text-align:right; font-weight:600; font-size:9.5pt; white-space:nowrap; }
  table.items { width:100%; border-collapse:collapse; margin-bottom:18px; }
  table.items th { text-align:left; padding:8px 10px; border-bottom:1px solid #1A1512;
                   font-size:8.5pt; letter-spacing:.12em; text-transform:uppercase; }
  table.items td { padding:10px; border-bottom:1px solid #E4DACE; vertical-align:top; }
  table.items .num, table.items th.num { text-align:right; white-space:nowrap; }
  table.items .desc span { display:block; font-size:9pt; color:#7A726A; }
  .strong { font-weight:600; }
  .foot { display:flex; justify-content:space-between; gap:32px; align-items:flex-start; }
  .totals { margin-left:auto; border-collapse:collapse; min-width:64mm; }
  .totals th { text-align:left; padding:6px 18px 6px 0; font-weight:400; color:#5A5149; }
  .totals td { text-align:right; padding:6px 0; font-variant-numeric:tabular-nums; }
  .totals .grand th, .totals .grand td { border-top:1px solid #1A1512; font-weight:700; font-size:13pt; padding-top:9px; }
  .payments { margin-top:22px; }
  .payments h2, .terms h2 { font-size:8.5pt; letter-spacing:.16em; text-transform:uppercase; color:#7A726A; margin:0 0 8px; }
  .payments table { width:100%; border-collapse:collapse; font-size:9.5pt; }
  .payments td { padding:5px 0; border-bottom:1px solid #EFE8E0; }
  .payments .num { text-align:right; font-variant-numeric:tabular-nums; }
  .terms { margin-top:26px; padding-top:16px; border-top:1px solid #E4DACE; font-size:9.5pt; color:#5A5149; }
  .terms p { margin:0 0 8px; white-space:pre-line; }
  .noprint { max-width:210mm; margin:0 auto 14px; display:flex; gap:10px; }
  .noprint button, .noprint a { padding:10px 18px; border:1px solid #98603A; border-radius:6px;
                                background:#98603A; color:#fff; font:inherit; font-size:10pt; cursor:pointer; text-decoration:none; }
  .noprint a { background:#fff; color:#98603A; }
  @media print {
    body { background:#fff; padding:0; }
    .sheet { box-shadow:none; padding:0; max-width:none; }
    .noprint { display:none; }
  }
</style>
</head>
<body>
<div class="noprint">
  <button type="button" onclick="window.print()">Save as PDF</button>
  <a href="/admin/invoices/${escape(invoice.id)}">Back to the invoice</a>
</div>

<div class="sheet">
  <header>
    <div class="brand">
      <b>${escape(issuerName)}</b>
      <address>${addressBlock(issuerAddress)}</address>
      ${issuer.email ? `<span>${escape(issuer.email)}</span>` : ""}
      ${issuer.phone ? `<span>${escape(issuer.phone)}</span>` : ""}
      ${issuer.company_number ? `<span>Company no. ${escape(issuer.company_number)}</span>` : ""}
      ${vat && issuer.vat_number ? `<span>VAT no. ${escape(issuer.vat_number)}</span>` : ""}
    </div>
    <div class="doc">
      <h1>${vat ? "VAT Invoice" : "Invoice"}</h1>
      <div class="number">${escape(invoice.invoice_number ?? "Not yet issued")}</div>
      ${draft ? '<div class="draft">Draft — not issued</div>' : ""}
      ${invoice.status === "void" ? '<div class="draft void">Void</div>' : ""}
      ${
        !draft && invoice.status !== "void" && invoice.balance_pence <= 0
          ? '<div class="draft" style="border-color:#4F7A4A;color:#33602F">Paid</div>'
          : ""
      }
    </div>
  </header>

  <div class="meta">
    <div>
      <h2>Invoice to</h2>
      <b>${escape(customerName)}</b>
      <address>${addressBlock(customerAddress)}</address>
      ${customerContact ? `<span style="display:block;font-size:9.5pt;color:#5A5149">${escape(customerContact)}</span>` : ""}
      ${customerCode ? `<span style="display:block;font-size:9.5pt;color:#5A5149">Account ${escape(customerCode)}</span>` : ""}
    </div>
    <div class="dates">
      <table>
        <tr><th>Invoice date</th><td>${longDate(invoice.issue_date)}</td></tr>
        <tr><th>Payment due</th><td>${longDate(invoice.due_date)}</td></tr>
        <tr><th>Terms</th><td>${invoice.payment_terms_days} days</td></tr>
        ${order ? `<tr><th>Your order</th><td>${escape(order.reference)}</td></tr>` : ""}
        ${invoice.external_reference ? `<tr><th>Reference</th><td>${escape(invoice.external_reference)}</td></tr>` : ""}
      </table>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="num">Qty</th>
        <th class="num">Unit price</th>
        ${vat ? '<th class="num">VAT</th>' : ""}
        <th class="num">${vat ? "Net" : "Amount"}</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <div class="foot">
    <table class="totals">${totals}</table>
  </div>

  ${paymentRows}

  ${
    invoice.customer_note || invoice.terms_text || (issuer.bank_details as string)
      ? `<div class="terms">
          ${invoice.customer_note ? `<p>${escape(invoice.customer_note)}</p>` : ""}
          ${invoice.terms_text ? `<p>${escape(invoice.terms_text)}</p>` : ""}
        </div>`
      : ""
  }
</div>

${autoPrint ? "<script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 350); });</script>" : ""}
</body>
</html>`;
}
