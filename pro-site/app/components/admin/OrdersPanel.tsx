import { Form, Link, useSearchParams } from "react-router";
import { ORDER_STATUSES } from "../../lib/reseller-constants";
import {
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  isFiltered,
  withParams,
  withRepeated,
  type OrderQuery,
  type OrderSort,
} from "../../lib/orders-query";
import { gbpFromPence } from "../../lib/site";
import { ClickableRow } from "./ClickableRow";
import { Pager } from "./Pager";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  confirmed: "Confirmed",
  invoiced: "Invoiced",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

type OrderRow = {
  id: string;
  reference: string;
  status: string;
  data_mode: "demo" | "live";
  subtotal_pence: number;
  customer_note: string | null;
  submitted_at: string;
  resellers: { account_code: string; business_name: string } | null;
};

export type OrdersPanelData = {
  rows: OrderRow[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
  statusCounts: Record<string, number>;
  truncated: boolean;
};

/**
 * The orders list with its search, filters, sorting and pagination.
 *
 * Shared by /admin/orders and the account detail page — when `scoped` is set,
 * the account filter and column disappear because the whole panel is already
 * one account's orders.
 */
export function OrdersPanel({
  basePath,
  query,
  page,
  accounts,
  scoped = false,
  title = "Orders",
}: {
  basePath: string;
  query: OrderQuery;
  page: OrdersPanelData;
  accounts?: Array<{ id: string; account_code: string; business_name: string }>;
  scoped?: boolean;
  title?: string;
}) {
  const [params] = useSearchParams();
  const filtered = isFiltered(query, { ignoreAccount: scoped });

  const href = (changes: Record<string, string | number | null>) => `${basePath}${withParams(params, changes)}`;
  const statusHref = (statuses: string[]) => `${basePath}${withRepeated(params, "status", statuses)}`;
  const toggleStatus = (status: string) =>
    statusHref(
      query.statuses.includes(status as never)
        ? query.statuses.filter((value) => value !== status)
        : [...query.statuses, status],
    );

  const sortHref = (column: OrderSort) =>
    href({ sort: column, dir: query.sort === column && query.direction === "desc" ? "asc" : "desc" });
  const sortMark = (column: OrderSort) => (query.sort === column ? (query.direction === "asc" ? " ▲" : " ▼") : "");
  const ariaSort = (column: OrderSort) =>
    query.sort === column ? (query.direction === "asc" ? "ascending" : "descending") : "none";

  const unfilteredTotal = Object.values(page.statusCounts).reduce((total, count) => total + count, 0);

  return (
    <>
      <div className="admin-filters" role="group" aria-label="Filter orders by status">
        <Link to={statusHref([])} className={query.statuses.length === 0 ? "is-active" : undefined} preventScrollReset>
          All ({unfilteredTotal})
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            to={toggleStatus(status)}
            className={query.statuses.includes(status) ? "is-active" : undefined}
            preventScrollReset
          >
            {ORDER_STATUS_LABELS[status]} ({page.statusCounts[status] ?? 0})
          </Link>
        ))}
      </div>

      <Form method="get" action={basePath} className="admin-toolbar" role="search">
        <div className="admin-toolbar-search">
          <label htmlFor="orders-q">Search</label>
          <input
            id="orders-q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder={scoped ? "Reference or note" : "Reference, account, contact, email or note"}
          />
        </div>

        {!scoped && accounts ? (
          <div className="admin-toolbar-field">
            <label htmlFor="orders-account">Account</label>
            <select id="orders-account" name="account" defaultValue={query.resellerId}>
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.business_name} · {account.account_code}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="admin-toolbar-field">
          <label htmlFor="orders-from">Placed from</label>
          <input id="orders-from" name="from" type="date" defaultValue={query.from} />
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="orders-to">Placed to</label>
          <input id="orders-to" name="to" type="date" defaultValue={query.to} />
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="orders-min">Min £</label>
          <input
            id="orders-min"
            name="min"
            type="number"
            min="0"
            step="0.01"
            defaultValue={query.minPence === null ? "" : (query.minPence / 100).toFixed(2)}
          />
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="orders-max">Max £</label>
          <input
            id="orders-max"
            name="max"
            type="number"
            min="0"
            step="0.01"
            defaultValue={query.maxPence === null ? "" : (query.maxPence / 100).toFixed(2)}
          />
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="orders-per-page">Per page</label>
          <select id="orders-per-page" name="perPage" defaultValue={String(query.perPage)}>
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Keep the pills and the sort when the form is submitted. */}
        {query.statuses.map((status) => (
          <input key={status} type="hidden" name="status" value={status} />
        ))}
        <input type="hidden" name="sort" value={query.sort} />
        <input type="hidden" name="dir" value={query.direction} />

        <div className="admin-toolbar-actions">
          <button type="submit" className="admin-primary">
            Apply
          </button>
          {filtered || query.perPage !== DEFAULT_PER_PAGE ? <Link to={basePath}>Clear</Link> : null}
        </div>
      </Form>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>{filtered ? `Matching ${title.toLowerCase()}` : title}</h2>
          <p className="admin-result-count">
            {page.total === 0 ? "No results" : `Showing ${page.from}–${page.to} of ${page.total}`}
            {page.truncated ? " · counts based on the most recent 20,000 orders" : ""}
          </p>
        </div>

        {page.rows.length === 0 ? (
          <div className="admin-empty">
            {filtered ? (
              <>
                Nothing matches those filters. <Link to={basePath}>Clear them</Link> to see every order.
              </>
            ) : (
              "No orders yet."
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" aria-sort={ariaSort("reference")}>
                    <Link to={sortHref("reference")} preventScrollReset>
                      Reference{sortMark("reference")}
                    </Link>
                  </th>
                  {scoped ? null : <th scope="col">Account</th>}
                  <th scope="col" aria-sort={ariaSort("submitted_at")}>
                    <Link to={sortHref("submitted_at")} preventScrollReset>
                      Placed{sortMark("submitted_at")}
                    </Link>
                  </th>
                  <th scope="col">Data</th>
                  <th scope="col" aria-sort={ariaSort("status")}>
                    <Link to={sortHref("status")} preventScrollReset>
                      Status{sortMark("status")}
                    </Link>
                  </th>
                  <th scope="col" aria-sort={ariaSort("subtotal_pence")}>
                    <Link to={sortHref("subtotal_pence")} preventScrollReset>
                      Total{sortMark("subtotal_pence")}
                    </Link>
                  </th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((order) => (
                  <ClickableRow key={order.id} to={`/admin/orders/${order.id}`}>
                    <td className="admin-nowrap">
                      <strong>
                        <Link to={`/admin/orders/${order.id}`}>{order.reference}</Link>
                      </strong>
                    </td>
                    {scoped ? null : (
                      <td>
                        {order.resellers?.business_name ?? "—"}
                        <span>{order.resellers?.account_code}</span>
                      </td>
                    )}
                    <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td><span className={`admin-status admin-status-mode-${order.data_mode}`}>{order.data_mode}</span></td>
                    <td>
                      <span className={`admin-status admin-status-${order.status}`}>{order.status}</span>
                    </td>
                    <td>{gbpFromPence(order.subtotal_pence)}</td>
                    <td>{order.customer_note ?? "—"}</td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pager page={page.page} pageCount={page.pageCount} hrefFor={(number) => href({ page: number })} label="Order pages" />
      </section>
    </>
  );
}
