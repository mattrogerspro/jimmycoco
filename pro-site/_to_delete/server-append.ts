
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
