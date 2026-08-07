/** Client-safe query model for the orders list — shared by the loader and the UI. */

import { ORDER_STATUSES, type OrderStatusValue } from "./reseller-constants";
import { positiveInt, readPerPage, readRepeated, sanitiseSearch } from "./query-params";

export { withParams, withRepeated, sanitiseSearch, PER_PAGE_OPTIONS, DEFAULT_PER_PAGE } from "./query-params";

export const ORDER_SORTS = [
  { value: "submitted_at", label: "Date placed" },
  { value: "reference", label: "Reference" },
  { value: "subtotal_pence", label: "Order value" },
  { value: "status", label: "Status" },
] as const;

export type OrderSort = (typeof ORDER_SORTS)[number]["value"];

export type OrderQuery = {
  q: string;
  statuses: OrderStatusValue[];
  resellerId: string;
  from: string;
  to: string;
  minPence: number | null;
  maxPence: number | null;
  sort: OrderSort;
  direction: "asc" | "desc";
  page: number;
  perPage: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function pence(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null;
}

/** Everything the list needs, read from the URL so views stay shareable. */
export function parseOrderQuery(params: URLSearchParams): OrderQuery {
  const sortParam = params.get("sort") ?? "";
  const sort = (ORDER_SORTS.find((option) => option.value === sortParam)?.value ?? "submitted_at") as OrderSort;

  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  return {
    q: sanitiseSearch(params.get("q") ?? ""),
    statuses: readRepeated(params, "status", ORDER_STATUSES),
    resellerId: params.get("account") ?? "",
    from: ISO_DATE.test(from) ? from : "",
    to: ISO_DATE.test(to) ? to : "",
    minPence: pence(params.get("min")),
    maxPence: pence(params.get("max")),
    sort,
    direction: params.get("dir") === "asc" ? "asc" : "desc",
    page: positiveInt(params.get("page"), 1),
    perPage: readPerPage(params),
  };
}

/** True when anything narrows the list — drives the "Clear filters" affordance. */
export function isFiltered(query: OrderQuery, { ignoreAccount = false } = {}) {
  return Boolean(
    query.q ||
      query.statuses.length ||
      (!ignoreAccount && query.resellerId) ||
      query.from ||
      query.to ||
      query.minPence !== null ||
      query.maxPence !== null,
  );
}
