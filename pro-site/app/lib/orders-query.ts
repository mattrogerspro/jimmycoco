/** Client-safe query model for the orders list — shared by the loader and the UI. */

import { ORDER_STATUSES, type OrderStatusValue } from "./reseller-constants";

export const ORDER_SORTS = [
  { value: "submitted_at", label: "Date placed" },
  { value: "reference", label: "Reference" },
  { value: "subtotal_pence", label: "Order value" },
  { value: "status", label: "Status" },
] as const;

export type OrderSort = (typeof ORDER_SORTS)[number]["value"];

export const PER_PAGE_OPTIONS = [25, 50, 100, 200] as const;
export const DEFAULT_PER_PAGE = 25;

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

/**
 * PostgREST's `or=(...)` grammar is comma and bracket delimited, so a search
 * term containing those characters would change the meaning of the filter
 * rather than being matched literally. Strip them, and cap the length.
 */
export function sanitiseSearch(value: string) {
  return value
    .replace(/[,()*%\\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function pence(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null;
}

/** Everything the list needs, read from the URL so views stay shareable. */
export function parseOrderQuery(params: URLSearchParams): OrderQuery {
  const statuses = params
    .getAll("status")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value): value is OrderStatusValue => (ORDER_STATUSES as readonly string[]).includes(value));

  const sortParam = params.get("sort") ?? "";
  const sort = (ORDER_SORTS.find((option) => option.value === sortParam)?.value ?? "submitted_at") as OrderSort;

  const perPageParam = positiveInt(params.get("perPage"), DEFAULT_PER_PAGE);
  const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(perPageParam) ? perPageParam : DEFAULT_PER_PAGE;

  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  return {
    q: sanitiseSearch(params.get("q") ?? ""),
    statuses: [...new Set(statuses)],
    resellerId: params.get("account") ?? "",
    from: ISO_DATE.test(from) ? from : "",
    to: ISO_DATE.test(to) ? to : "",
    minPence: pence(params.get("min")),
    maxPence: pence(params.get("max")),
    sort,
    direction: params.get("dir") === "asc" ? "asc" : "desc",
    page: positiveInt(params.get("page"), 1),
    perPage,
  };
}

/** True when anything narrows the list — drives the "Clear filters" affordance. */
export function isFiltered(query: OrderQuery) {
  return Boolean(
    query.q ||
      query.statuses.length ||
      query.resellerId ||
      query.from ||
      query.to ||
      query.minPence !== null ||
      query.maxPence !== null,
  );
}

/** Rebuilds a querystring with one or more values replaced. */
export function withParams(params: URLSearchParams, changes: Record<string, string | number | null>) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  // Any change to the filters puts you back on the first page.
  if (!("page" in changes)) next.delete("page");
  const query = next.toString();
  return query ? `?${query}` : "";
}
