/** Client-safe query model for the accounts list — shared by the loader and the UI. */

import { PRICING_TIERS, RESELLER_STATUSES } from "./reseller-constants";
import { readPerPage, readRepeated, sanitiseSearch } from "./query-params";

export const ACCOUNT_SORTS = [
  { value: "business_name", label: "Business" },
  { value: "account_code", label: "Account code" },
  { value: "approved_at", label: "Approved" },
  { value: "pricing_tier", label: "Tier" },
  { value: "status", label: "Status" },
] as const;

export type AccountSort = (typeof ACCOUNT_SORTS)[number]["value"];
export type PortalFilter = "" | "yes" | "no";

export type AccountQuery = {
  q: string;
  statuses: string[];
  tiers: string[];
  portal: PortalFilter;
  market: string;
  sort: AccountSort;
  direction: "asc" | "desc";
  page: number;
  perPage: number;
};

export function parseAccountQuery(params: URLSearchParams): AccountQuery {
  const sortParam = params.get("sort") ?? "";
  const sort = (ACCOUNT_SORTS.find((option) => option.value === sortParam)?.value ?? "business_name") as AccountSort;
  const portal = params.get("portal");

  return {
    q: sanitiseSearch(params.get("q") ?? ""),
    statuses: readRepeated(params, "status", RESELLER_STATUSES),
    tiers: readRepeated(params, "tier", PRICING_TIERS),
    portal: portal === "yes" || portal === "no" ? portal : "",
    market: sanitiseSearch(params.get("market") ?? ""),
    sort,
    // Names read best A–Z; everything else reads best newest first.
    direction: params.get("dir") === "asc" ? "asc" : params.get("dir") === "desc" ? "desc" : sort === "business_name" || sort === "account_code" ? "asc" : "desc",
    page: Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
    perPage: readPerPage(params),
  };
}

export function isAccountFiltered(query: AccountQuery) {
  return Boolean(query.q || query.statuses.length || query.tiers.length || query.portal || query.market);
}
