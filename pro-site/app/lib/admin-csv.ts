/** CSV downloads for the admin lists. Server-side only in practice, but pure. */

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvResponse(filename: string, header: string[], rows: string[][], responseHeaders: Headers) {
  const headers = new Headers(responseHeaders);
  headers.set("Content-Type", "text/csv; charset=utf-8");
  headers.set("Content-Disposition", `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`);
  const body = [header.join(","), ...rows.map((row) => row.map(cell).join(","))].join("\n");
  // Byte order mark, so Excel reads the £ signs and accented names correctly.
  return new Response(`﻿${body}\n`, { headers });
}

type OrderExportRow = {
  reference: string;
  status: string;
  data_mode: "demo" | "live";
  submitted_at: string;
  confirmed_at: string | null;
  currency: string;
  subtotal_pence: number;
  customer_note: string | null;
  internal_note: string | null;
  resellers: { account_code: string; business_name: string; contact_name: string; email: string } | null;
};

export function ordersCsv(rows: OrderExportRow[], responseHeaders: Headers) {
  return csvResponse(
    "jimmy-coco-orders",
    ["Reference", "Data mode", "Status", "Account code", "Business", "Contact", "Email", "Placed", "Confirmed", "Currency", "Total", "Customer note", "Internal note"],
    rows.map((row) => [
      row.reference,
      row.data_mode,
      row.status,
      row.resellers?.account_code ?? "",
      row.resellers?.business_name ?? "",
      row.resellers?.contact_name ?? "",
      row.resellers?.email ?? "",
      row.submitted_at,
      row.confirmed_at ?? "",
      row.currency,
      (row.subtotal_pence / 100).toFixed(2),
      row.customer_note ?? "",
      row.internal_note ?? "",
    ]),
    responseHeaders,
  );
}

type AccountExportRow = {
  account_code: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  market: string;
  pricing_tier: string;
  discount_percent: number;
  status: string;
  data_mode: "demo" | "live";
  user_id: string | null;
  approved_at: string | null;
  created_at: string;
};

export function accountsCsv(rows: AccountExportRow[], responseHeaders: Headers) {
  return csvResponse(
    "jimmy-coco-accounts",
    ["Account code", "Business", "Contact", "Email", "Phone", "Market", "Tier", "Discount %", "Data mode", "Status", "Portal", "Approved", "Created"],
    rows.map((row) => [
      row.account_code,
      row.business_name,
      row.contact_name,
      row.email,
      row.phone ?? "",
      row.market,
      row.pricing_tier,
      String(row.discount_percent),
      row.data_mode,
      row.status,
      row.user_id ? "Signed up" : "Not signed up",
      row.approved_at ?? "",
      row.created_at,
    ]),
    responseHeaders,
  );
}

type InvoiceExportRow = {
  invoice_number: string | null;
  status: string;
  data_mode: "demo" | "live";
  issue_date: string | null;
  due_date: string | null;
  currency: string;
  net_pence: number;
  vat_pence: number;
  gross_pence: number;
  paid_pence: number;
  balance_pence: number;
  external_reference: string | null;
  resellers: { account_code: string; business_name: string; contact_name: string; email: string } | null;
};

export function invoicesCsv(rows: InvoiceExportRow[], responseHeaders: Headers) {
  return csvResponse(
    "jimmy-coco-invoices",
    ["Invoice", "Data mode", "Status", "Account code", "Business", "Contact", "Email", "Issued", "Due", "Currency", "Net", "VAT", "Total", "Paid", "Outstanding", "Accounting reference"],
    rows.map((row) => [
      row.invoice_number ?? "",
      row.data_mode,
      row.status,
      row.resellers?.account_code ?? "",
      row.resellers?.business_name ?? "",
      row.resellers?.contact_name ?? "",
      row.resellers?.email ?? "",
      row.issue_date ?? "",
      row.due_date ?? "",
      row.currency,
      (row.net_pence / 100).toFixed(2),
      (row.vat_pence / 100).toFixed(2),
      (row.gross_pence / 100).toFixed(2),
      (row.paid_pence / 100).toFixed(2),
      (row.balance_pence / 100).toFixed(2),
      row.external_reference ?? "",
    ]),
    responseHeaders,
  );
}
