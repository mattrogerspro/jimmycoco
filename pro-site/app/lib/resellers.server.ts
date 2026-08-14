import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient } from "./supabase.server";
export { ORDER_STATUSES } from "./reseller-constants";
import type { OrderQuery } from "./orders-query";
import type { AccountQuery } from "./accounts-query";

export type ApplicationStatus = "pending" | "approved" | "declined" | "on_hold";
export type ResellerStatus = "active" | "suspended" | "closed";
export type OrderStatus = "submitted" | "confirmed" | "invoiced" | "shipped" | "cancelled";

export type ResellerApplication = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  business_type: string;
  market: string;
  message: string | null;
  wants_trial: boolean;
  status: ApplicationStatus;
  source: string;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Reseller = {
  id: string;
  account_code: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  market: string;
  pricing_tier: "standard" | "silver" | "gold";
  discount_percent: number;
  status: ResellerStatus;
  user_id: string | null;
  approved_at: string | null;
  created_at: string;
};

export type ResellerProduct = {
  sku: string;
  title: string;
  description: string | null;
  unit_label: string;
  retail_price_pence: number | null;
  trade_price_pence: number;
  case_quantity: number;
  sort_order: number;
};

export type ResellerOrder = {
  id: string;
  reference: string;
  status: OrderStatus;
  currency: string;
  subtotal_pence: number;
  customer_note: string | null;
  submitted_at: string;
};

export type ApplicationInput = {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  businessType?: string | null;
  market?: string | null;
  message?: string | null;
  wantsTrial?: boolean;
  source?: string;
  metadata?: Record<string, unknown>;
};

const BUSINESS_TYPES = ["Salon", "Spa", "Mobile professional", "Multi-site group", "Other"];

export function normaliseBusinessType(value: FormDataEntryValue | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return BUSINESS_TYPES.includes(candidate) ? candidate : "Salon";
}

export function isPlausibleEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Public intake. Uses the anonymous key and the security-definer RPC so the
 * marketing site never holds write rights on the applications table itself.
 */
export async function submitApplication(input: ApplicationInput) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("submit_reseller_application", {
    p_business_name: input.businessName,
    p_contact_name: input.contactName,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_business_type: input.businessType ?? "Salon",
    p_market: input.market ?? "UK",
    p_message: input.message ?? null,
    p_wants_trial: input.wantsTrial ?? true,
    p_source: input.source ?? "pro-site",
    p_metadata: input.metadata ?? {},
  });

  if (error) throw new Error(`Could not lodge the trade application: ${error.message}`);
  return data as string;
}

export async function listApplications(supabase: SupabaseClient, status?: ApplicationStatus) {
  let query = supabase
    .from("reseller_applications")
    .select(
      "id, business_name, contact_name, email, phone, business_type, market, message, wants_trial, status, source, review_note, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load trade applications: ${error.message}`);
  return (data ?? []) as ResellerApplication[];
}

export async function listResellers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("resellers")
    .select(
      "id, account_code, business_name, contact_name, email, phone, market, pricing_tier, discount_percent, status, user_id, approved_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`Could not load reseller accounts: ${error.message}`);
  return (data ?? []) as Reseller[];
}

function accountCodeFrom(businessName: string) {
  const letters = businessName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "X");
  const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${letters}${suffix}`;
}

export async function approveApplication(
  supabase: SupabaseClient,
  applicationId: string,
  reviewerId: string,
  options: { pricingTier?: Reseller["pricing_tier"]; discountPercent?: number; note?: string } = {},
) {
  const { data: application, error: loadError } = await supabase
    .from("reseller_applications")
    .select("id, business_name, contact_name, email, phone, market, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (loadError) throw new Error(`Could not load the application: ${loadError.message}`);
  if (!application) throw new Error("That application no longer exists.");
  if (application.status === "approved") throw new Error("That application is already approved.");

  const { data: reseller, error: insertError } = await supabase
    .from("resellers")
    .insert({
      application_id: application.id,
      account_code: accountCodeFrom(application.business_name),
      business_name: application.business_name,
      contact_name: application.contact_name,
      email: application.email,
      phone: application.phone,
      market: application.market,
      pricing_tier: options.pricingTier ?? "standard",
      discount_percent: options.discountPercent ?? 0,
      approved_by: reviewerId,
      approved_at: new Date().toISOString(),
    })
    .select("id, account_code, business_name, contact_name, email, market")
    .single();

  if (insertError) throw new Error(`Could not create the reseller account: ${insertError.message}`);

  const { error: updateError } = await supabase
    .from("reseller_applications")
    .update({
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: options.note ?? null,
    })
    .eq("id", application.id);

  if (updateError) throw new Error(`Approved, but the application status did not update: ${updateError.message}`);

  return reseller;
}

export async function setApplicationStatus(
  supabase: SupabaseClient,
  applicationId: string,
  status: Exclude<ApplicationStatus, "approved">,
  reviewerId: string,
  note?: string,
) {
  const { data, error } = await supabase
    .from("reseller_applications")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", applicationId)
    .select("id, business_name, contact_name, email, market")
    .single();

  if (error) throw new Error(`Could not update the application: ${error.message}`);
  return data;
}

export async function loadCatalogue(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("reseller_products")
    .select("sku, title, description, unit_label, retail_price_pence, trade_price_pence, case_quantity, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Could not load the trade catalogue: ${error.message}`);
  return (data ?? []) as ResellerProduct[];
}

export async function listOrders(supabase: SupabaseClient, resellerId?: string) {
  let query = supabase
    .from("reseller_orders")
    .select("id, reference, status, currency, subtotal_pence, customer_note, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (resellerId) query = query.eq("reseller_id", resellerId);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return (data ?? []) as ResellerOrder[];
}

export type OrderLineInput = { sku: string; quantity: number };

export function orderReference() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear().toString().slice(2)}${(now.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JC-${stamp}-${random}`;
}

export async function createOrder(
  supabase: SupabaseClient,
  reseller: Pick<Reseller, "id" | "discount_percent">,
  lines: OrderLineInput[],
  customerNote?: string,
) {
  const wanted = lines.filter((line) => line.quantity > 0);
  if (wanted.length === 0) throw new Error("Add at least one product before submitting an order.");

  const catalogue = await loadCatalogue(supabase);
  const bySku = new Map(catalogue.map((product) => [product.sku, product]));

  const items = wanted.map((line) => {
    const product = bySku.get(line.sku);
    if (!product) throw new Error(`Unknown product: ${line.sku}`);
    const discounted = Math.round(
      product.trade_price_pence * (1 - Number(reseller.discount_percent ?? 0) / 100),
    );
    return {
      sku: product.sku,
      title: product.title,
      unit_price_pence: discounted,
      quantity: line.quantity,
      line_total_pence: discounted * line.quantity,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from("reseller_orders")
    .insert({
      reseller_id: reseller.id,
      reference: orderReference(),
      customer_note: customerNote?.trim() || null,
    })
    .select("id, reference")
    .single();

  if (orderError) throw new Error(`Could not open the order: ${orderError.message}`);

  const { error: itemsError } = await supabase
    .from("reseller_order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) throw new Error(`Could not save the order lines: ${itemsError.message}`);

  return {
    ...order,
    items,
    subtotalPence: items.reduce((sum, item) => sum + item.line_total_pence, 0),
  };
}

/* ---------------------------------------------------------------------------
 * Detail views
 * ------------------------------------------------------------------------ */

export type OrderLine = {
  id: string;
  sku: string;
  title: string;
  unit_price_pence: number;
  quantity: number;
  line_total_pence: number;
};

export async function getApplication(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("reseller_applications")
    .select(
      "id, business_name, contact_name, email, phone, business_type, market, website, instagram, address, message, wants_trial, status, source, metadata, reviewed_at, review_note, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load the application: ${error.message}`);
  return data as (ResellerApplication & {
    website: string | null;
    instagram: string | null;
    address: Record<string, unknown>;
    metadata: Record<string, unknown>;
    updated_at: string;
  }) | null;
}

export async function getReseller(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("resellers")
    .select(
      "id, application_id, account_code, business_name, contact_name, email, phone, market, pricing_tier, discount_percent, status, user_id, address, internal_notes, approved_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load the trade account: ${error.message}`);
  return data as (Reseller & {
    application_id: string | null;
    address: Record<string, unknown>;
    internal_notes: string | null;
    updated_at: string;
  }) | null;
}

export async function updateReseller(
  supabase: SupabaseClient,
  id: string,
  patch: {
    pricing_tier?: Reseller["pricing_tier"];
    discount_percent?: number;
    status?: ResellerStatus;
    phone?: string | null;
    internal_notes?: string | null;
  },
) {
  const { error } = await supabase.from("resellers").update(patch).eq("id", id);
  if (error) throw new Error(`Could not update the trade account: ${error.message}`);
}

/** Order queue with the reseller joined, so the list is readable without N+1. */
export async function listOrdersDetailed(supabase: SupabaseClient, resellerId?: string) {
  let query = supabase
    .from("reseller_orders")
    .select(
      "id, reference, status, currency, subtotal_pence, customer_note, internal_note, submitted_at, confirmed_at, reseller_id, resellers(account_code, business_name, contact_name, email)",
    )
    .order("submitted_at", { ascending: false })
    .limit(200);

  if (resellerId) query = query.eq("reseller_id", resellerId);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return (data ?? []) as unknown as Array<
    ResellerOrder & {
      internal_note: string | null;
      confirmed_at: string | null;
      reseller_id: string;
      resellers: { account_code: string; business_name: string; contact_name: string; email: string } | null;
    }
  >;
}

export async function getOrder(supabase: SupabaseClient, id: string) {
  const { data: order, error } = await supabase
    .from("reseller_orders")
    .select(
      "id, reference, status, currency, subtotal_pence, customer_note, internal_note, delivery_note, submitted_at, confirmed_at, created_at, updated_at, reseller_id, resellers(id, account_code, business_name, contact_name, email, phone, market, address, pricing_tier, discount_percent, status)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load the order: ${error.message}`);
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("reseller_order_items")
    .select("id, sku, title, unit_price_pence, quantity, line_total_pence")
    .eq("order_id", id)
    .order("title", { ascending: true });

  if (itemsError) throw new Error(`Could not load the order lines: ${itemsError.message}`);

  const lines = (items ?? []) as OrderLine[];

  // Current catalogue prices, so the page can explain why a unit costs what it
  // does rather than presenting a bare number. Labelled as *current* list in the
  // UI, because an old order may have been placed at a different price.
  const skus = [...new Set(lines.map((line) => line.sku))];
  let catalogue: Record<string, { trade_price_pence: number; retail_price_pence: number | null; unit_label: string }> = {};
  if (skus.length) {
    const { data: products, error: catalogueError } = await supabase
      .from("reseller_products")
      .select("sku, trade_price_pence, retail_price_pence, unit_label")
      .in("sku", skus);
    if (catalogueError) throw new Error(`Could not load the trade catalogue: ${catalogueError.message}`);
    catalogue = Object.fromEntries(
      (products ?? []).map((product) => {
        const row = product as unknown as {
          sku: string;
          trade_price_pence: number;
          retail_price_pence: number | null;
          unit_label: string;
        };
        return [row.sku, { trade_price_pence: row.trade_price_pence, retail_price_pence: row.retail_price_pence, unit_label: row.unit_label }];
      }),
    );
  }

  // Recent history for the same account — an order rarely makes sense alone.
  const resellerId = (order as unknown as { reseller_id: string }).reseller_id;
  const { data: siblings } = await supabase
    .from("reseller_orders")
    .select("id, reference, status, subtotal_pence, submitted_at")
    .eq("reseller_id", resellerId)
    .neq("id", id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  return {
    order: order as unknown as Record<string, never>,
    items: lines,
    catalogue,
    siblings: (siblings ?? []) as unknown as Array<{
      id: string;
      reference: string;
      status: string;
      subtotal_pence: number;
      submitted_at: string;
    }>,
  };
}
export async function updateOrder(
  supabase: SupabaseClient,
  id: string,
  patch: { status?: OrderStatus; internal_note?: string | null },
) {
  const next: Record<string, unknown> = { ...patch };
  if (patch.status === "confirmed") next.confirmed_at = new Date().toISOString();
  const { error } = await supabase.from("reseller_orders").update(next).eq("id", id);
  if (error) throw new Error(`Could not update the order: ${error.message}`);
}

export async function resellerCounts(supabase: SupabaseClient) {
  const [apps, accounts, orders] = await Promise.all([
    supabase.from("reseller_applications").select("status", { count: "exact", head: false }),
    supabase.from("resellers").select("status", { count: "exact", head: false }),
    supabase.from("reseller_orders").select("status, subtotal_pence", { count: "exact", head: false }),
  ]);

  const applications = (apps.data ?? []) as Array<{ status: string }>;
  const accountRows = (accounts.data ?? []) as Array<{ status: string }>;
  const orderRows = (orders.data ?? []) as Array<{ status: string; subtotal_pence: number }>;

  return {
    pending: applications.filter((row) => row.status === "pending").length,
    applicationsTotal: applications.length,
    activeAccounts: accountRows.filter((row) => row.status === "active").length,
    accountsTotal: accountRows.length,
    openOrders: orderRows.filter((row) => ["submitted", "confirmed"].includes(row.status)).length,
    orderValuePence: orderRows
      .filter((row) => row.status !== "cancelled")
      .reduce((total, row) => total + (row.subtotal_pence ?? 0), 0),
  };
}

/* ------------------------------------------------------------------ *
 * Orders list: search, filter, sort, paginate
 * ------------------------------------------------------------------ */

export type OrderListRow = ResellerOrder & {
  internal_note: string | null;
  confirmed_at: string | null;
  reseller_id: string;
  resellers: { account_code: string; business_name: string; contact_name: string; email: string } | null;
};

const ORDER_COLUMNS =
  "id, reference, status, currency, subtotal_pence, customer_note, internal_note, submitted_at, confirmed_at, reseller_id, resellers(account_code, business_name, contact_name, email)";

/**
 * The subset of the PostgREST builder the filters touch. Typing it structurally
 * lets one function narrow both the counting query and the page query, so the
 * figures above the table can never drift from the rows underneath it.
 */
type Filterable = {
  eq(column: string, value: unknown): Filterable;
  in(column: string, values: readonly unknown[]): Filterable;
  is(column: string, value: unknown): Filterable;
  not(column: string, operator: string, value: unknown): Filterable;
  gte(column: string, value: unknown): Filterable;
  lt(column: string, value: unknown): Filterable;
  lte(column: string, value: unknown): Filterable;
  or(filters: string): Filterable;
};

function nextDayIso(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
}

function applyOrderFilters<T>(builder: T, query: OrderQuery, resellerIds: string[] | null): T {
  let next = builder as Filterable;

  if (query.statuses.length) next = next.in("status", query.statuses);
  if (query.resellerId) next = next.eq("reseller_id", query.resellerId);
  if (query.from) next = next.gte("submitted_at", `${query.from}T00:00:00.000Z`);
  if (query.to) next = next.lt("submitted_at", nextDayIso(query.to));
  if (query.minPence !== null) next = next.gte("subtotal_pence", query.minPence);
  if (query.maxPence !== null) next = next.lte("subtotal_pence", query.maxPence);

  if (query.q) {
    // The term is sanitised upstream, so it cannot break out of this grammar.
    const term = `%${query.q}%`;
    const clauses = [`reference.ilike.${term}`, `customer_note.ilike.${term}`, `internal_note.ilike.${term}`];
    // Account names live on the joined table. Resolving them to ids first keeps
    // the whole search a single filter on reseller_orders, which means the count
    // and the page agree and pagination stays correct.
    if (resellerIds?.length) clauses.push(`reseller_id.in.(${resellerIds.join(",")})`);
    next = next.or(clauses.join(","));
  }

  return next as T;
}

/** Account ids whose name, code, contact or email match the search term. */
async function resellerIdsMatching(supabase: SupabaseClient, term: string) {
  const like = `%${term}%`;
  const { data, error } = await supabase
    .from("resellers")
    .select("id")
    .or(`business_name.ilike.${like},account_code.ilike.${like},contact_name.ilike.${like},email.ilike.${like}`)
    .limit(2000);

  if (error) throw new Error(`Could not search reseller accounts: ${error.message}`);
  return (data ?? []).map((row) => row.id as string);
}

export type OrderPage = {
  rows: OrderListRow[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
  stats: { total: number; open: number; cancelled: number; valuePence: number };
  statusCounts: Record<string, number>;
  /** True when the summary scan hit its ceiling, so the figures are a floor. */
  truncated: boolean;
};

/** How many rows the summary pass will scan before it stops counting. */
const SUMMARY_SCAN_LIMIT = 20_000;

export async function listOrdersPage(supabase: SupabaseClient, query: OrderQuery): Promise<OrderPage> {
  const resellerIds = query.q ? await resellerIdsMatching(supabase, query.q) : null;

  // Summary pass: every filter EXCEPT status, two integers a row. Excluding
  // status is what lets each pill show the number of orders it would reveal —
  // counting the already-filtered set would leave every other pill on zero.
  const totalsBuilder = supabase.from("reseller_orders").select("status, subtotal_pence", { count: "exact" });
  const { data: totalsData, count, error: totalsError } = await applyOrderFilters(
    totalsBuilder,
    { ...query, statuses: [] },
    resellerIds,
  ).limit(SUMMARY_SCAN_LIMIT);
  if (totalsError) throw new Error(`Could not summarise orders: ${totalsError.message}`);

  const scanned = (totalsData ?? []) as unknown as Array<{ status: string; subtotal_pence: number }>;
  const truncated = (count ?? scanned.length) > scanned.length;

  const statusCounts: Record<string, number> = {};
  for (const row of scanned) statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;

  const matching = query.statuses.length
    ? scanned.filter((row) => (query.statuses as readonly string[]).includes(row.status))
    : scanned;

  // With no status filter the exact count is authoritative even if the scan was
  // capped; with one, the scan is all we have.
  const total = query.statuses.length ? matching.length : (count ?? matching.length);
  const pageCount = Math.max(1, Math.ceil(total / query.perPage));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const offset = (page - 1) * query.perPage;

  const stats = {
    total,
    open: matching.filter((row) => row.status === "submitted" || row.status === "confirmed").length,
    cancelled: matching.filter((row) => row.status === "cancelled").length,
    valuePence: matching
      .filter((row) => row.status !== "cancelled")
      .reduce((running, row) => running + (row.subtotal_pence ?? 0), 0),
  };

  const pageBuilder = supabase.from("reseller_orders").select(ORDER_COLUMNS);
  const { data, error } = await applyOrderFilters(pageBuilder, query, resellerIds)
    .order(query.sort, { ascending: query.direction === "asc" })
    // Reference is unique, so this makes the ordering total. Without a tiebreak,
    // rows sharing a sort key can swap places between requests and show up twice
    // across two pages — or not at all.
    .order("reference", { ascending: true })
    .range(offset, offset + query.perPage - 1);

  if (error) throw new Error(`Could not load orders: ${error.message}`);

  const rows = (data ?? []) as unknown as OrderListRow[];
  return {
    rows,
    total,
    page,
    pageCount,
    from: total === 0 ? 0 : offset + 1,
    to: offset + rows.length,
    stats,
    statusCounts,
    truncated,
  };
}

/** Every matching order, for a CSV download. Capped, deliberately. */
export async function listOrdersForExport(supabase: SupabaseClient, query: OrderQuery, limit = 5000) {
  const resellerIds = query.q ? await resellerIdsMatching(supabase, query.q) : null;
  const builder = supabase.from("reseller_orders").select(ORDER_COLUMNS);

  const { data, error } = await applyOrderFilters(builder, query, resellerIds)
    .order(query.sort, { ascending: query.direction === "asc" })
    .order("reference", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Could not export orders: ${error.message}`);
  return (data ?? []) as unknown as OrderListRow[];
}

/** Accounts for the filter dropdown — id, code and name only. */
export async function listResellerOptions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("resellers")
    .select("id, account_code, business_name, status")
    .order("business_name", { ascending: true })
    .limit(2000);

  if (error) throw new Error(`Could not load reseller accounts: ${error.message}`);
  return (data ?? []) as Array<{ id: string; account_code: string; business_name: string; status: ResellerStatus }>;
}

/* ------------------------------------------------------------------ *
 * Accounts list: search, filter, sort, paginate
 * ------------------------------------------------------------------ */

const ACCOUNT_COLUMNS =
  "id, account_code, business_name, contact_name, email, phone, market, pricing_tier, discount_percent, status, user_id, approved_at, created_at";

function applyAccountFilters<T>(builder: T, query: AccountQuery): T {
  let next = builder as Filterable;

  if (query.statuses.length) next = next.in("status", query.statuses);
  if (query.tiers.length) next = next.in("pricing_tier", query.tiers);
  if (query.market) next = next.eq("market", query.market);
  if (query.portal === "yes") next = next.not("user_id", "is", null);
  if (query.portal === "no") next = next.is("user_id", null);

  if (query.q) {
    const term = `%${query.q}%`;
    next = next.or(
      [
        `business_name.ilike.${term}`,
        `account_code.ilike.${term}`,
        `contact_name.ilike.${term}`,
        `email.ilike.${term}`,
        `phone.ilike.${term}`,
        `internal_notes.ilike.${term}`,
      ].join(","),
    );
  }

  return next as T;
}

export type AccountListRow = Reseller & {
  /** Filled in from a second pass — the list is useless without trading history. */
  orderCount: number;
  openOrders: number;
  lifetimePence: number;
  lastOrderAt: string | null;
};

export type AccountPage = {
  rows: AccountListRow[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
  stats: { total: number; active: number; suspended: number; signedUp: number };
  statusCounts: Record<string, number>;
  tierCounts: Record<string, number>;
  markets: string[];
};

export async function listAccountsPage(supabase: SupabaseClient, query: AccountQuery): Promise<AccountPage> {
  // Summary pass ignores status and tier for the same reason the orders list
  // does: a pill that reads zero because you already clicked another pill is
  // worse than no number at all.
  const summaryBuilder = supabase
    .from("resellers")
    .select("status, pricing_tier, user_id, market", { count: "exact" });
  const { data: summaryData, error: summaryError } = await applyAccountFilters(summaryBuilder, {
    ...query,
    statuses: [],
    tiers: [],
  }).limit(20000);
  if (summaryError) throw new Error(`Could not summarise accounts: ${summaryError.message}`);

  const scanned = (summaryData ?? []) as unknown as Array<{
    status: string;
    pricing_tier: string;
    user_id: string | null;
    market: string;
  }>;

  const statusCounts: Record<string, number> = {};
  const tierCounts: Record<string, number> = {};
  for (const row of scanned) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    tierCounts[row.pricing_tier] = (tierCounts[row.pricing_tier] ?? 0) + 1;
  }

  const matching = scanned.filter(
    (row) =>
      (!query.statuses.length || query.statuses.includes(row.status)) &&
      (!query.tiers.length || query.tiers.includes(row.pricing_tier)),
  );

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / query.perPage));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const offset = (page - 1) * query.perPage;

  const pageBuilder = supabase.from("resellers").select(ACCOUNT_COLUMNS);
  const { data, error } = await applyAccountFilters(pageBuilder, query)
    .order(query.sort, { ascending: query.direction === "asc" })
    // account_code is unique, so the ordering is total and pages cannot overlap.
    .order("account_code", { ascending: true })
    .range(offset, offset + query.perPage - 1);
  if (error) throw new Error(`Could not load reseller accounts: ${error.message}`);

  const rows = (data ?? []) as unknown as Reseller[];

  // One extra round trip for the trading history of just this page's accounts.
  const totals = await orderTotalsFor(supabase, rows.map((row) => row.id));

  return {
    rows: rows.map((row) => ({
      ...row,
      orderCount: totals[row.id]?.count ?? 0,
      openOrders: totals[row.id]?.open ?? 0,
      lifetimePence: totals[row.id]?.valuePence ?? 0,
      lastOrderAt: totals[row.id]?.lastOrderAt ?? null,
    })),
    total,
    page,
    pageCount,
    from: total === 0 ? 0 : offset + 1,
    to: offset + rows.length,
    stats: {
      total,
      active: matching.filter((row) => row.status === "active").length,
      suspended: matching.filter((row) => row.status === "suspended").length,
      signedUp: matching.filter((row) => row.user_id).length,
    },
    statusCounts,
    tierCounts,
    markets: [...new Set(scanned.map((row) => row.market).filter(Boolean))].sort(),
  };
}

/** Order counts and value for a handful of accounts, aggregated in one pass. */
export async function orderTotalsFor(supabase: SupabaseClient, resellerIds: string[]) {
  const totals: Record<string, { count: number; open: number; valuePence: number; lastOrderAt: string | null }> = {};
  if (!resellerIds.length) return totals;

  const { data, error } = await supabase
    .from("reseller_orders")
    .select("reseller_id, status, subtotal_pence, submitted_at")
    .in("reseller_id", resellerIds)
    .limit(20000);
  if (error) throw new Error(`Could not summarise account orders: ${error.message}`);

  for (const row of (data ?? []) as unknown as Array<{
    reseller_id: string;
    status: string;
    subtotal_pence: number;
    submitted_at: string;
  }>) {
    const entry = (totals[row.reseller_id] ??= { count: 0, open: 0, valuePence: 0, lastOrderAt: null });
    entry.count += 1;
    if (row.status === "submitted" || row.status === "confirmed") entry.open += 1;
    if (row.status !== "cancelled") entry.valuePence += row.subtotal_pence ?? 0;
    if (!entry.lastOrderAt || row.submitted_at > entry.lastOrderAt) entry.lastOrderAt = row.submitted_at;
  }

  return totals;
}

/** Every matching account, for a CSV download. Capped, deliberately. */
export async function listAccountsForExport(supabase: SupabaseClient, query: AccountQuery, limit = 5000) {
  const builder = supabase.from("resellers").select(ACCOUNT_COLUMNS);
  const { data, error } = await applyAccountFilters(builder, query)
    .order(query.sort, { ascending: query.direction === "asc" })
    .order("account_code", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Could not export accounts: ${error.message}`);
  return (data ?? []) as unknown as Reseller[];
}

/** Unfiltered trading history for one account — drives the detail page stats. */
export async function accountOrderTotals(supabase: SupabaseClient, resellerId: string) {
  const totals = await orderTotalsFor(supabase, [resellerId]);
  return totals[resellerId] ?? { count: 0, open: 0, valuePence: 0, lastOrderAt: null };
}
