import type { SupabaseClient } from "@supabase/supabase-js";
import { getInvoice } from "./invoices.server";

const INTERNAL_AUDIT_ADDRESS = "matthew@jimmycoco.pro";
const DEFAULT_FROM = "Sunless Partnerships <partnerships@email.jimmycoco.pro>";
const DEFAULT_REPLY_TO = "partnerships@email.jimmycoco.pro";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

const currencySymbol: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", AUD: "A$" };

function money(pence: number, currency: string) {
  const symbol = currencySymbol[currency] ?? "";
  return `${pence < 0 ? "−" : ""}${symbol}${Math.abs(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function date(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function invoiceEmailHtml(input: NonNullable<Awaited<ReturnType<typeof getInvoice>>>) {
  const { invoice, lines } = input;
  const issuer = (invoice.issuer ?? {}) as Record<string, string>;
  const billTo = (invoice.bill_to ?? {}) as Record<string, string>;
  const account = invoice.resellers;
  const recipientName = billTo.contact_name ?? account?.contact_name ?? "there";
  const businessName = billTo.business_name ?? account?.business_name ?? "";
  const issuerName = issuer.legal_name ?? "Sunless by Jimmy Coco";
  const lineRows = lines
    .map(
      (line) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ece7e1">${escapeHtml(line.title)}${line.sku ? `<br><span style="color:#746d66;font-size:12px">${escapeHtml(line.sku)}</span>` : ""}</td><td style="padd      (line) =>er-bottom:1px solid #ece7e1;text-align:right">${line.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #ece7e1;text-align:right;white-space:nowrap">${money(line.gross_pence, invoice.currency)}</td></tr>`,
    )
    .join("");
  const bankDetails = issuer.bank_details ? `<p style="margin:20px 0 0;color:#514a45;white-space:pre-line"><strong>Payment details</strong><br>${escapeHtml(issuer.bank_details)}</p>` : "";

  return `<!doctype html><html lang="en"><body style="margin:0;background:#f5f1ec;color:#1e1a17;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px 18px"><section style="background:#fff;padding:34px;border-top:5px solid #9a6038"><p style="margin:0 0 24px;color:#756e68;font-size:13px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(issuerName)}</p><h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;font-weight:400">Invoice ${escapeHtml(invoice.invoice_number)}</h1><p style="margin:0;color:#514a45;line-height:1.6">Hello ${escapeHtml(recipientName)},<br><br>Please find your invoice for ${escapeHtml(businessName)} below. The amount due is <strong>${money(invoice.balance_pence, invoice.currency)}</strong> by <strong>${date(invoice.due_date)}</strong>.</p><table role="presentation" style="width:100%;margin:28px 0;border-collapse:collapse;font-size:14px"><thead><tr style="color:#756e68;font-size:11px;letter-spacing:.08em;text-transform:uppercase"><th style="padding:0 0 8px;text-align:left">Description</th><th style="padding:0 0 8px;text-align:right">Qty</th><th style="padding:0 0 8px;text-align:right">Amount</th></tr></thead><tbody>${lineRows}</tbody></table><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#514a45">Invoice date</td><td style="padding:8px 0;text-align:right">${date(invoice.issue_date)}</td></tr><tr><td style="padding:8px 0;color:#514a45">Payment due</td><td style="padding:8px 0;text-align:right">${date(invoice.due_date)}</td></tr><tr><td style="padding:14px 0 0;border-top:1px solid #1e1a17;font-size:18px;font-weight:700">Amount due</td><td style="padding:14px 0 0;border-top:1px solid #1e1a17;text-align:right;font-size:18px;font-weight:700">${money(invoice.balance_pence, invoice.currency)}</td></tr></table>${bankDetails}<p style="margin:26px 0 0;color:#514a45;line-height:1.6">If you have any questions, simply reply to this email.</p></section></main></body></html>`;
}

function invoiceEmailText(input: NonNullable<Awaited<ReturnType<typeof getInvoice>>>) {
  const { invoice } = input;
  const account = invoice.resellers;
  const billTo = (invoice.bill_to ?? {}) as Record<string, string>;
  const recipientName = billTo.contact_name ?? account?.contact_name ?? "there";
  const issuer = (invoice.issuer ?? {}) as Record<string, string>;
  return `Hello ${recipientName},\n\nInvoice ${invoice.invoice_number} is set out below.\n\nAmount due: ${money(invoice.balance_pence, invoice.currency)}\nPayment due: ${date(invoice.due_date)}\n\n${issuer.bank_details ? `Payment details:\n${issuer.bank_details}\n\n` : ""}Please reply to this email with any questions.`;
}

export async function emailIssuedInvoice(supabase: SupabaseClient, invoiceId: string, staffUserId?: string) {
  if (process.env.EMAIL_LIVE_MODE !== "true") {
    throw new Error("Invoice email delivery is disabled. Set EMAIL_LIVE_MODE=true before sending customer invoices.");
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Invoice email delivery is not configured. Set RESEND_API_KEY first.");
  }

  const loaded = await getInvoice(supabase, invoiceId);
  if (!loaded) throw new Error("Invoice not found.");
  const { invoice } = loaded;
  if (!["issued", "part_paid", "paid"].includes(invoice.status)) {
    throw new Error("Issue the invoice before emailing it to the customer.");
  }

  const billTo = (invoice.bill_to ?? {}) as Record<string, string>;
  const recipient = billTo.email ?? invoice.resellers?.email;
  if (!recipient) throw new Error("This invoice has no customer email address.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `invoice-${invoiceId}-${Math.floor(Date.now() / 60_000)}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [recipient],
      bcc: [INTERNAL_AUDIT_ADDRESS],
      reply_to: process.env.RESEND_REPLY_TO || DEFAULT_REPLY_TO,
      subject: `Invoice ${invoice.invoice_number} from Jimmy Coco`,
      html: invoiceEmailHtml(loaded),
      text: invoiceEmailText(loaded),
      tags: [
        { name: "type", value: "invoice" },
        { name: "invoice_id", value: invoiceId },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!response.ok || !payload.id) {
    throw new Error(`Could not email the invoice: ${payload.message ?? payload.name ?? `Resend returned ${response.status}`}`);
  }

  const { error } = await supabase
    .from("invoices")
    .update({
      customer_emailed_at: new Date().toISOString(),
      customer_emailed_to: recipient,
      customer_email_resend_id: payload.id,
      customer_emailed_by: staffUserId ?? null,
    })
    .eq("id", invoiceId);
  if (error) throw new Error(`The invoice was emailed but its delivery audit could not be saved: ${error.message}`);

  return { recipient, resendId: payload.id };
}
