/** Client-safe query model for the invoices list. */

import { INVOICE_STATUSES } from "./invoice-constants";
import { positiveInt, readPerPage, readRepeated, sanitiseSearch } from "./query-params";

export { withParams, withRepeated, PER_PAGE_OPTIONS, DEFAULT_PER_PAGE } from "./query-params";

export const INVOICE_SORTS = [
  { value: "issue_date", label: "Issue date" },
  { value: "due_date", label: "Due date" },
  { value: "invoice_number", label: "Invoice number" },
  { value: "gross_pence", label: "Total" },
  { value: "balance_pence", label: "Outstanding" },
] as const;

export type InvoiceSort = (typeof INVOICE_SORTS)[number]["value"];

export type InvoiceQuery = {
  q: string;
  statuses: string[];
  resellerId: string;
  from: string;
  to: string;
  /** Only invoices past their due date and still owing. */
  overdueOnly: boolean;
  /** Only invoices with money still outstanding. */
  openOnly: boolean;
  sort: InvoiceSort;
  direction: "asc" | "desc";
  page: number;
  perPage: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseInvoiceQuery(params: URLSearchParams): InvoiceQuery {
  const sortParam = params.get("sort") ?? "";
  const sort = (INVOICE_SORTS.find((option) => option.value === sortParam)?.value ?? "issue_date") as InvoiceSort;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  return {
    q: sanitiseSearch(params.get("q") ?? ""),
    statuses: readRepeated(params, "status", INVOICE_STATUSES),
    resellerId: params.get("account") ?? "",
    from: ISO_DATE.test(from) ? from : "",
    to: ISO_DATE.test(to) ? to : "",
    overdueOnly: params.get("overdue") === "1",
    openOnly: params.get("open") === "1",
    sort,
    direction: params.get("dir") === "asc" ? "asc" : "desc",
    page: positiveInt(params.get("page"), 1),
    perPage: readPerPage(params),
  };
}

export function isInvoiceFiltered(query: InvoiceQuery, { ignoreAccount = false } = {}) {
  return Boolean(
    query.q ||
      query.statuses.length ||
      (!ignoreAccount && query.resellerId) ||
      query.from ||
      query.to ||
      query.overdueOnly ||
      query.openOnly,
  );
}
