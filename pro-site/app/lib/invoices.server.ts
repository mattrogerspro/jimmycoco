import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateLine, type InvoiceStatus, type PaymentMethod } from "./invoice-constants";
import type { InvoiceQuery } from "./invoices-query";
import { applyTradeDataVisibility, type DataMode, type TradeDataVisibility } from "./resellers.server";

export { INVOICE_STATUSES } from "./invoice-constants";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type InvoiceSettings = {
  legal_name: string;
  address: Record<string, string>;
  contact_email: string | null;
  contact_phone: string | null;
  company_number: string | null;
  vat_registered: boolean;
  vat_number: string | null;
  vat_rate_bps: number;
  prices_include_vat: boolean;
  invoice_prefix: string;
  next_number: number;
  number_pad: number;
  default_payment_terms_days: number;
  bank_details: string | null;
  footer_terms: string | null;
};

export type InvoiceLine = {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unit_price_pence: number;
  vat_rate_bps: number;
  net_pence: number;
  vat_pence: number;
  gross_pence: number;
  sort_order: number;
};

export type InvoicePayment = {
  id: string;
  amount_pence: number;
  paid_on: string;
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string | null;
  reseller_id: string;
  order_id: string | null;
  status: InvoiceStatus;
  data_mode: DataMode;
  currency: string;
  issue_date: string | null;
  due_date: string | null;
  payment_terms_days: number;
  vat_registered: boolean;
  vat_number: string | null;
  vat_rate_bps: number;
  prices_include_vat: boolean;
  net_pence: number;
  vat_pence: number;
  gross_pence: number;
  paid_pence: number;
  balance_pence: number;
  issuer: Record<string, unknown>;
  bill_to: Record<string, unknown>;
  customer_note: string | null;
  internal_note: string | null;
  terms_text: string | null;
  external_reference: string | null;
  issued_at: string | null;
  paid_at: string | null;
  customer_emailed_at: string | null;
  customer_emailed_to: string | null;
  customer_email_resend_id: string | null;
  customer_emailed_by: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
};
const INVOICE_COLUMNS =
  "id, invoice_number, reseller_id, order_id, status, data_mode, currency, issue_date, due_date, payment_terms_days, vat_registered, vat_number, vat_rate_bps, prices_include_vat, net_pence, vat_pence, gross_pence, paid_pence, balance_pence, issuer, bill_to, customer_note, internal_note, terms_text, external_reference, issued_at, paid_at, voided_at, void_reason, customer_emailed_at, customer_emailed_to, customer_email_resend_id, customer_emailed_by, created_at";
const LIST_COLUMNS = `${INVOICE_COLUMNS}, resellers(id, account_code, business_name, contact_name, email)`;

/* ------------------------------------------------------------------ *
 * Settings
 * ------------------------------------------------------------------ */

export async function getInvoiceSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("invoice_settings").select("*").eq("id", true).maybeSingle();
  if (error) throw new Error(`Could not load the invoice settings: ${error.message}`);
  if (!data) throw new Error("The invoice settings row is missing. Re-run the invoicing migration.");
  return data as unknown as InvoiceSettings;
}

export async function updateInvoiceSettings(supabase: SupabaseClient, patch: Partial<InvoiceSettings>) {
  // next_number is deliberately not patchable here. Moving it backwards would
  // let a number be reused, which is the one thing invoicing must never do.
  const { next_number, ...safe } = patch as Partial<InvoiceSettings> & { next_number?: number };
  const { error } = await supabase.from("invoice_settings").update(safe).eq("id", true);
  if (error) throw new Error(`Could not save the invoice settings: ${error.message}`);
}

/* ------------------------------------------------------------------ *
 * Drafting
 * ------------------------------------------------------------------ */

/**
 * Builds a draft invoice from an order, copying the lines at the prices that
 * were actually agreed. Returns the existing invoice if one is already attached,
 * so double-clicking "Create invoice" cannot raise two.
 */
export async function createInvoiceFromOrder(supabase: SupabaseClient, orderId: string, staffUserId?: string) {
  const existing = await supabase
    .from("invoices")
    .select("id, status")
    .eq("order_id", orderId)
    .neq("status", "void")
    .limit(1)
    .maybeSingle();
  if (existing.data) return { id: existing.data.id as string, created: false };

  const { data: order, error: orderError } = await supabase
    .from("reseller_orders")
    .select("id, reseller_id, data_mode, currency, customer_note, delivery_note, reference")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw new Error(`Could not load the order: ${orderError.message}`);
  if (!order) throw new Error("That order no longer exists.");

  const { data: items, error: itemsError } = await supabase
    .from("reseller_order_items")
    .select("sku, title, quantity, unit_price_pence")
    .eq("order_id", orderId)
    .order("title", { ascending: true });
  if (itemsError) throw new Error(`Could not load the order lines: ${itemsError.message}`);
  if (!items?.length) throw new Error("That order has no lines to invoice.");

  const settings = await getInvoiceSettings(supabase);
  const vatRate = settings.vat_registered ? settings.vat_rate_bps : 0;

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      reseller_id: (order as unknown as { reseller_id: string }).reseller_id,
      order_id: orderId,
      data_mode: (order as unknown as { data_mode: DataMode }).data_mode,
      currency: (order as unknown as { currency: string }).currency,
      // Frozen now, so changing the settings later cannot rewrite this invoice.
      vat_registered: settings.vat_registered,
      vat_number: settings.vat_registered ? settings.vat_number : null,
      vat_rate_bps: vatRate,
      prices_include_vat: settings.prices_include_vat,
      payment_terms_days: settings.default_payment_terms_days,
      customer_note: (order as unknown as { customer_note: string | null }).customer_note,
      terms_text: settings.footer_terms,
      created_by: staffUserId ?? null,
    })
    .select("id")
    .single();
  if (invoiceError) throw new Error(`Could not start the invoice: ${invoiceError.message}`);

  const lines = (items as unknown as Array<{ sku: string; title: string; quantity: number; unit_price_pence: number }>)
    .map((item, index) => {
      const totals = calculateLine({
        quantity: item.quantity,
        unitPricePence: item.unit_price_pence,
        vatRateBps: vatRate,
        pricesIncludeVat: settings.prices_include_vat,
      });
      return {
        invoice_id: invoice.id,
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        unit_price_pence: item.unit_price_pence,
        vat_rate_bps: vatRate,
        net_pence: totals.netPence,
        vat_pence: totals.vatPence,
        gross_pence: totals.grossPence,
        sort_order: (index + 1) * 10,
      };
    });

  const { error: linesError } = await supabase.from("invoice_lines").insert(lines);
  if (linesError) throw new Error(`Could not copy the order lines: ${linesError.message}`);

  return { id: invoice.id as string, created: true };
}

export async function addInvoiceLine(
  supabase: SupabaseClient,
  invoiceId: string,
  input: { title: string; sku?: string | null; description?: string | null; quantity: number; unitPricePence: number },
) {
  const invoice = await getInvoiceRow(supabase, invoiceId);
  const vatRate = invoice.vat_registered ? invoice.vat_rate_bps : 0;
  const totals = calculateLine({
    quantity: input.quantity,
    unitPricePence: input.unitPricePence,
    vatRateBps: vatRate,
    pricesIncludeVat: invoice.prices_include_vat,
  });

  const { error } = await supabase.from("invoice_lines").insert({
    invoice_id: invoiceId,
    sku: input.sku ?? null,
    title: input.title,
    description: input.description ?? null,
    quantity: input.quantity,
    unit_price_pence: input.unitPricePence,
    vat_rate_bps: vatRate,
    net_pence: totals.netPence,
    vat_pence: totals.vatPence,
    gross_pence: totals.grossPence,
    sort_order: 1000,
  });
  if (error) throw new Error(`Could not add that line: ${error.message}`);
}

export async function removeInvoiceLine(supabase: SupabaseClient, lineId: string) {
  const { error } = await supabase.from("invoice_lines").delete().eq("id", lineId);
  if (error) throw new Error(`Could not remove that line: ${error.message}`);
}

export async function updateInvoice(
  supabase: SupabaseClient,
  invoiceId: string,
  patch: {
    issue_date?: string | null;
    due_date?: string | null;
    payment_terms_days?: number;
    customer_note?: string | null;
    internal_note?: string | null;
    terms_text?: string | null;
    external_reference?: string | null;
  },
) {
  const { error } = await supabase.from("invoices").update(patch).eq("id", invoiceId);
  if (error) throw new Error(`Could not update the invoice: ${error.message}`);
}

/* ------------------------------------------------------------------ *
 * Issuing, voiding, paying
 * ------------------------------------------------------------------ */

export async function issueInvoice(supabase: SupabaseClient, invoiceId: string) {
  const { data, error } = await supabase.rpc("issue_invoice", { p_invoice_id: invoiceId });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function voidInvoice(supabase: SupabaseClient, invoiceId: string, reason: string) {
  const { error } = await supabase.rpc("void_invoice", { p_invoice_id: invoiceId, p_reason: reason });
  if (error) throw new Error(error.message);
}

export async function recordPayment(
  supabase: SupabaseClient,
  invoiceId: string,
  input: { amountPence: number; paidOn: string; method: PaymentMethod; reference?: string | null; note?: string | null },
  staffUserId?: string,
) {
  if (!Number.isFinite(input.amountPence) || input.amountPence === 0) {
    throw new Error("A payment needs an amount.");
  }
  const { error } = await supabase.from("invoice_payments").insert({
    invoice_id: invoiceId,
    amount_pence: Math.round(input.amountPence),
    paid_on: input.paidOn,
    method: input.method,
    reference: input.reference ?? null,
    note: input.note ?? null,
    recorded_by: staffUserId ?? null,
  });
  if (error) throw new Error(`Could not record that payment: ${error.message}`);
}

export async function removePayment(supabase: SupabaseClient, paymentId: string) {
  const { error } = await supabase.from("invoice_payments").delete().eq("id", paymentId);
  if (error) throw new Error(`Could not remove that payment: ${error.message}`);
}

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

async function getInvoiceRow(supabase: SupabaseClient, invoiceId: string) {
  const { data, error } = await supabase.from("invoices").select(INVOICE_COLUMNS).eq("id", invoiceId).maybeSingle();
  if (error) throw new Error(`Could not load the invoice: ${error.message}`);
  if (!data) throw new Error("Invoice not found.");
  return data as unknown as Invoice;
}

export async function getInvoice(supabase: SupabaseClient, invoiceId: string, visibility?: TradeDataVisibility) {
  const query = applyTradeDataVisibility(
    supabase
    .from("invoices")
    .select(
      `${INVOICE_COLUMNS}, resellers(id, account_code, business_name, contact_name, email, phone, market, address, pricing_tier, discount_percent, status, data_mode)`,
    )
      .eq("id", invoiceId),
    visibility,
  );
  const { data: invoice, error } = await query
    .maybeSingle();
  if (error) throw new Error(`Could not load the invoice: ${error.message}`);
  if (!invoice) return null;

  const [{ data: lines, error: linesError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase
      .from("invoice_lines")
      .select("id, sku, title, description, quantity, unit_price_pence, vat_rate_bps, net_pence, vat_pence, gross_pence, sort_order")
      .eq("invoice_id", invoiceId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("invoice_payments")
      .select("id, amount_pence, paid_on, method, reference, note, created_at")
      .eq("invoice_id", invoiceId)
      .order("paid_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (linesError) throw new Error(`Could not load the invoice lines: ${linesError.message}`);
  if (paymentsError) throw new Error(`Could not load the payments: ${paymentsError.message}`);

  let order: { id: string; reference: string; status: string } | null = null;
  const orderId = (invoice as unknown as { order_id: string | null }).order_id;
  if (orderId) {
    const { data } = await supabase.from("reseller_orders").select("id, reference, status").eq("id", orderId).maybeSingle();
    order = (data as unknown as { id: string; reference: string; status: string }) ?? null;
  }

  return {
    invoice: invoice as unknown as Invoice & {
      resellers: {
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
      } | null;
    },
    lines: (lines ?? []) as unknown as InvoiceLine[],
    payments: (payments ?? []) as unknown as InvoicePayment[],
    order,
  };
}

/** The invoice attached to an order, if there is one. Drives the order page. */
export async function invoiceForOrder(supabase: SupabaseClient, orderId: string, visibility?: TradeDataVisibility) {
  const query = applyTradeDataVisibility(
    supabase
    .from("invoices")
    .select("id, invoice_number, status, data_mode, gross_pence, paid_pence, balance_pence, due_date, issue_date, currency, paid_at, customer_emailed_at, customer_emailed_to")
      .eq("order_id", orderId),
    visibility,
  );
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not check for an invoice: ${error.message}`);
  return (data as unknown as {
    id: string;
    invoice_number: string | null;
    status: InvoiceStatus;
    gross_pence: number;
    paid_pence: number;
    balance_pence: number;
    due_date: string | null;
    issue_date: string | null;
    currency: string;
    paid_at: string | null;
    customer_emailed_at: string | null;
    customer_emailed_to: string | null;
  }) ?? null;
}

type Filterable = {
  eq(column: string, value: unknown): Filterable;
  in(column: string, values: readonly unknown[]): Filterable;
  gte(column: string, value: unknown): Filterable;
  lte(column: string, value: unknown): Filterable;
  lt(column: string, value: unknown): Filterable;
  gt(column: string, value: unknown): Filterable;
  or(filters: string): Filterable;
};

function applyInvoiceFilters<T>(builder: T, query: InvoiceQuery, resellerIds: string[] | null): T {
  let next = builder as Filterable;

  if (query.statuses.length) next = next.in("status", query.statuses);
  if (query.resellerId) next = next.eq("reseller_id", query.resellerId);
  if (query.from) next = next.gte("issue_date", query.from);
  if (query.to) next = next.lte("issue_date", query.to);

  // "Open" and "overdue" are the two questions this list exists to answer.
  if (query.openOnly || query.overdueOnly) {
    next = next.in("status", query.statuses.length ? query.statuses : ["issued", "part_paid"]);
    next = next.gt("balance_pence", 0);
  }
  if (query.overdueOnly) next = next.lt("due_date", new Date().toISOString().slice(0, 10));

  if (query.q) {
    const term = `%${query.q}%`;
    const clauses = [`invoice_number.ilike.${term}`, `external_reference.ilike.${term}`, `internal_note.ilike.${term}`];
    if (resellerIds?.length) clauses.push(`reseller_id.in.(${resellerIds.join(",")})`);
    next = next.or(clauses.join(","));
  }

  return next as T;
}

async function resellerIdsMatching(supabase: SupabaseClient, term: string, visibility?: TradeDataVisibility) {
  const like = `%${term}%`;
  const query = applyTradeDataVisibility(
    supabase
    .from("resellers")
    .select("id")
      .or(`business_name.ilike.${like},account_code.ilike.${like},contact_name.ilike.${like},email.ilike.${like}`),
    visibility,
  );
  const { data, error } = await query
    .limit(2000);
  if (error) throw new Error(`Could not search accounts: ${error.message}`);
  return (data ?? []).map((row) => row.id as string);
}

export async function listInvoicesPage(supabase: SupabaseClient, query: InvoiceQuery, visibility?: TradeDataVisibility) {
  const resellerIds = query.q ? await resellerIdsMatching(supabase, query.q, visibility) : null;

  // Summary pass ignores the status pills so each pill can show its own count.
  const summaryBuilder = applyTradeDataVisibility(
    supabase
    .from("invoices")
      .select("status, gross_pence, balance_pence, due_date", { count: "exact" }),
    visibility,
  );
  const { data: summaryData, error: summaryError } = await applyInvoiceFilters(
    summaryBuilder,
    { ...query, statuses: [] },
    resellerIds,
  ).limit(20000);
  if (summaryError) throw new Error(`Could not summarise invoices: ${summaryError.message}`);

  const scanned = (summaryData ?? []) as unknown as Array<{
    status: string;
    gross_pence: number;
    balance_pence: number;
    due_date: string | null;
  }>;

  const statusCounts: Record<string, number> = {};
  for (const row of scanned) statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;

  const matching = query.statuses.length ? scanned.filter((row) => query.statuses.includes(row.status)) : scanned;
  const today = new Date().toISOString().slice(0, 10);
  const open = matching.filter((row) => (row.status === "issued" || row.status === "part_paid") && row.balance_pence > 0);

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / query.perPage));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const offset = (page - 1) * query.perPage;

  const pageBuilder = applyTradeDataVisibility(supabase.from("invoices").select(LIST_COLUMNS), visibility);
  const { data, error } = await applyInvoiceFilters(pageBuilder, query, resellerIds)
    .order(query.sort, { ascending: query.direction === "asc", nullsFirst: false })
    // Unique tiebreak, so pages cannot overlap or drop a row.
    .order("id", { ascending: true })
    .range(offset, offset + query.perPage - 1);
  if (error) throw new Error(`Could not load invoices: ${error.message}`);

  return {
    rows: (data ?? []) as unknown as Array<
      Invoice & { resellers: { id: string; account_code: string; business_name: string; contact_name: string; email: string } | null }
    >,
    total,
    page,
    pageCount,
    from: total === 0 ? 0 : offset + 1,
    to: offset + (data?.length ?? 0),
    statusCounts,
    stats: {
      total,
      outstandingPence: open.reduce((running, row) => running + row.balance_pence, 0),
      overdue: open.filter((row) => row.due_date && row.due_date < today).length,
      overduePence: open
        .filter((row) => row.due_date && row.due_date < today)
        .reduce((running, row) => running + row.balance_pence, 0),
      billedPence: matching
        .filter((row) => row.status !== "void" && row.status !== "draft")
        .reduce((running, row) => running + row.gross_pence, 0),
    },
  };
}

export async function listInvoicesForExport(supabase: SupabaseClient, query: InvoiceQuery, limit = 5000, visibility?: TradeDataVisibility) {
  const resellerIds = query.q ? await resellerIdsMatching(supabase, query.q, visibility) : null;
  const builder = applyTradeDataVisibility(supabase.from("invoices").select(LIST_COLUMNS), visibility);
  const { data, error } = await applyInvoiceFilters(builder, query, resellerIds)
    .order(query.sort, { ascending: query.direction === "asc", nullsFirst: false })
    .order("id", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Could not export invoices: ${error.message}`);
  return (data ?? []) as unknown as Array<
    Invoice & { resellers: { account_code: string; business_name: string; contact_name: string; email: string } | null }
  >;
}
