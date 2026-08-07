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
    ["Reference", "Status", "Account code", "Business", "Contact", "Email", "Placed", "Confirmed", "Currency", "Total", "Customer note", "Internal note"],
    rows.map((row) => [
      row.reference,
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
  user_id: string | null;
  approved_at: string | null;
  created_at: string;
};

export function accountsCsv(rows: AccountExportRow[], responseHeaders: Headers) {
  return csvResponse(
    "jimmy-coco-accounts",
    ["Account code", "Business", "Contact", "Email", "Phone", "Market", "Tier", "Discount %", "Status", "Portal", "Approved", "Created"],
    rows.map((row) => [
      row.account_code,
      row.business_name,
      row.contact_name,
      row.email,
      row.phone ?? "",
      row.market,
      row.pricing_tier,
      String(row.discount_percent),
      row.status,
      row.user_id ? "Signed up" : "Not signed up",
      row.approved_at ?? "",
      row.created_at,
    ]),
    responseHeaders,
  );
}
