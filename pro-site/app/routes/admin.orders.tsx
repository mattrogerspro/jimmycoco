import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listOrdersForExport, listOrdersPage, listResellerOptions } from "../lib/resellers.server";
import { ORDER_STATUSES } from "../lib/reseller-constants";
import {
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  isFiltered,
  parseOrderQuery,
  withParams,
  type OrderSort,
} from "../lib/orders-query";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Orders | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  confirmed: "Confirmed",
  invoiced: "Invoiced",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const url = new URL(request.url);
  const query = parseOrderQuery(url.searchParams);

  if (url.searchParams.get("export") === "csv") {
    const rows = await listOrdersForExport(supabase, query);
    const header = [
      "Reference", "Status", "Account code", "Business", "Contact", "Email",
      "Placed", "Confirmed", "Currency", "Total", "Customer note", "Internal note",
    ];
    const body = rows.map((row) =>
      [
        row.reference,
        row.status,
        row.resellers?.account_code,
        row.resellers?.business_name,
        row.resellers?.contact_name,
        row.resellers?.email,
        row.submitted_at,
        row.confirmed_at,
        row.currency,
        (row.subtotal_pence / 100).toFixed(2),
        row.customer_note,
        row.internal_note,
      ]
        .map(csvCell)
        .join(","),
    );

    const headers = new Headers(responseHeaders);
    headers.set("Content-Type", "text/csv; charset=utf-8");
    headers.set("Content-Disposition", `attachment; filename="jimmy-coco-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
    // BOM so Excel opens the £ signs and accented names correctly.
    return new Response(`﻿${[header.join(","), ...body].join("\n")}\n`, { headers });
  }

  const [page, accounts] = await Promise.all([listOrdersPage(supabase, query), listResellerOptions(supabase)]);
  return data({ query, page, accounts }, { headers: responseHeaders });
}

export default function AdminOrders() {
  const { query, page, accounts } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const busy = navigation.state === "loading";
  const filtered = isFiltered(query);

  const href = (changes: Record<string, string | number | null>) => `/admin/orders${withParams(params, changes)}`;

  // Status is multi-select: each pill toggles itself, everything else survives.
  const statusHref = (statuses: string[]) => {
    const next = new URLSearchParams(params);
    next.delete("status");
    next.delete("page");
    for (const value of statuses) next.append("status", value);
    const search = next.toString();
    return `/admin/orders${search ? `?${search}` : ""}`;
  };

  const toggleStatus = (status: string) =>
    statusHref(
      query.statuses.includes(status as never)
        ? query.statuses.filter((value) => value !== status)
        : [...query.statuses, status],
    );

  const sortHref = (column: OrderSort) =>
    href({ sort: column, dir: query.sort === column && query.direction === "desc" ? "asc" : "desc" });

  const sortMark = (column: OrderSort) =>
    query.sort === column ? (query.direction === "asc" ? " ▲" : " ▼") : "";

  // A short window of page numbers around the current one.
  const window: number[] = [];
  const start = Math.max(1, Math.min(page.page - 3, page.pageCount - 6));
  for (let index = start; index <= Math.min(page.pageCount, start + 6); index += 1) window.push(index);

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade orders</p>
          <h1>Orders</h1>
          <p>Order requests from the stockist portal. Nothing is charged online — confirm, then invoice.</p>
        </div>
        <a className="admin-primary-link" href={`/admin/orders${withParams(params, { export: "csv", page: null })}`}>
          Download CSV
        </a>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged"><span>Awaiting action</span><b>{page.stats.open}</b></div>
        <div className="admin-stat"><span>{filtered ? "Matching orders" : "Orders total"}</span><b>{page.stats.total}</b></div>
        <div className="admin-stat"><span>Value (excl. cancelled)</span><b>{gbpFromPence(page.stats.valuePence)}</b></div>
        <div className="admin-stat"><span>Cancelled</span><b>{page.stats.cancelled}</b></div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter by status">
        <Link to={statusHref([])} className={query.statuses.length === 0 ? "is-active" : undefined} preventScrollReset>
          All ({Object.values(page.statusCounts).reduce((total, count) => total + count, 0)})
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            to={toggleStatus(status)}
            className={query.statuses.includes(status) ? "is-active" : undefined}
            preventScrollReset
          >
            {STATUS_LABELS[status]}
            {page.statusCounts[status] !== undefined ? ` (${page.statusCounts[status]})` : ""}
          </Link>
        ))}
      </div>

      <Form method="get" className="admin-toolbar" role="search">
        <div className="admin-toolbar-search">
          <label htmlFor="orders-q">Search</label>
          <input
            id="orders-q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Reference, account, contact, email or note"
          />
        </div>

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
          <input id="orders-min" name="min" type="number" min="0" step="0.01" defaultValue={query.minPence === null ? "" : (query.minPence / 100).toFixed(2)} />
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="orders-max">Max £</label>
          <input id="orders-max" name="max" type="number" min="0" step="0.01" defaultValue={query.maxPence === null ? "" : (query.maxPence / 100).toFixed(2)} />
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="orders-per-page">Per page</label>
          <select id="orders-per-page" name="perPage" defaultValue={String(query.perPage)}>
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Preserve the pills and the sort when the form is submitted. */}
        {query.statuses.map((status) => (
          <input key={status} type="hidden" name="status" value={status} />
        ))}
        <input type="hidden" name="sort" value={query.sort} />
        <input type="hidden" name="dir" value={query.direction} />

        <div className="admin-toolbar-actions">
          <button type="submit" className="admin-primary">Apply</button>
          {filtered || query.perPage !== DEFAULT_PER_PAGE ? <Link to="/admin/orders">Clear</Link> : null}
        </div>
      </Form>

      <section className="admin-panel" aria-busy={busy}>
        <div className="admin-panel-head">
          <h2>{filtered ? "Matching orders" : "All orders"}</h2>
          <p className="admin-result-count">
            {page.total === 0 ? "No results" : `Showing ${page.from}–${page.to} of ${page.total}`}
            {page.truncated ? " · counts based on the most recent 20,000 orders" : ""}
          </p>
        </div>

        {page.rows.length === 0 ? (
          <div className="admin-empty">
            {filtered ? (
              <>Nothing matches those filters. <Link to="/admin/orders">Clear them</Link> to see every order.</>
            ) : (
              "No orders yet."
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" aria-sort={query.sort === "reference" ? (query.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <Link to={sortHref("reference")} preventScrollReset>Reference{sortMark("reference")}</Link>
                  </th>
                  <th scope="col">Account</th>
                  <th scope="col" aria-sort={query.sort === "submitted_at" ? (query.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <Link to={sortHref("submitted_at")} preventScrollReset>Placed{sortMark("submitted_at")}</Link>
                  </th>
                  <th scope="col" aria-sort={query.sort === "status" ? (query.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <Link to={sortHref("status")} preventScrollReset>Status{sortMark("status")}</Link>
                  </th>
                  <th scope="col" aria-sort={query.sort === "subtotal_pence" ? (query.direction === "asc" ? "ascending" : "descending") : "none"}>
                    <Link to={sortHref("subtotal_pence")} preventScrollReset>Total{sortMark("subtotal_pence")}</Link>
                  </th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((order) => (
                  <tr key={order.id}>
                    <td className="admin-nowrap"><strong><Link to={`/admin/orders/${order.id}`}>{order.reference}</Link></strong></td>
                    <td>
                      {order.resellers?.business_name ?? "—"}
                      <span>{order.resellers?.account_code}</span>
                    </td>
                    <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td><span className={`admin-status admin-status-${order.status}`}>{order.status}</span></td>
                    <td>{gbpFromPence(order.subtotal_pence)}</td>
                    <td>{order.customer_note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page.pageCount > 1 ? (
          <nav className="admin-pager" aria-label="Order pages">
            <Link to={href({ page: 1 })} aria-disabled={page.page === 1} className={page.page === 1 ? "is-disabled" : undefined} preventScrollReset>
              First
            </Link>
            <Link to={href({ page: Math.max(1, page.page - 1) })} aria-disabled={page.page === 1} className={page.page === 1 ? "is-disabled" : undefined} preventScrollReset rel="prev">
              Previous
            </Link>
            <span className="admin-pager-pages">
              {window.map((number) => (
                <Link
                  key={number}
                  to={href({ page: number })}
                  className={number === page.page ? "is-current" : undefined}
                  aria-current={number === page.page ? "page" : undefined}
                  preventScrollReset
                >
                  {number}
                </Link>
              ))}
            </span>
            <Link to={href({ page: Math.min(page.pageCount, page.page + 1) })} aria-disabled={page.page === page.pageCount} className={page.page === page.pageCount ? "is-disabled" : undefined} preventScrollReset rel="next">
              Next
            </Link>
            <Link to={href({ page: page.pageCount })} aria-disabled={page.page === page.pageCount} className={page.page === page.pageCount ? "is-disabled" : undefined} preventScrollReset>
              Last
            </Link>
            <span className="admin-pager-count">Page {page.page} of {page.pageCount}</span>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
