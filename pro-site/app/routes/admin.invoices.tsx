import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listInvoicesForExport, listInvoicesPage } from "../lib/invoices.server";
import { listResellerOptions } from "../lib/resellers.server";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS, isOverdue } from "../lib/invoice-constants";
import { isInvoiceFiltered, parseInvoiceQuery, type InvoiceSort } from "../lib/invoices-query";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, withParams, withRepeated } from "../lib/query-params";
import { ClickableRow } from "../components/admin/ClickableRow";
import { Pager } from "../components/admin/Pager";
import { invoicesCsv } from "../lib/admin-csv";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Invoices | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const url = new URL(request.url);
  const query = parseInvoiceQuery(url.searchParams);

  if (url.searchParams.get("export") === "csv") {
    return invoicesCsv(await listInvoicesForExport(supabase, query), responseHeaders);
  }

  const [page, accounts] = await Promise.all([listInvoicesPage(supabase, query), listResellerOptions(supabase)]);
  return data({ query, page, accounts }, { headers: responseHeaders });
}

export default function AdminInvoices() {
  const { query, page, accounts } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const filtered = isInvoiceFiltered(query);

  const href = (changes: Record<string, string | number | null>) => `/admin/invoices${withParams(params, changes)}`;
  const statusHref = (statuses: string[]) => `/admin/invoices${withRepeated(params, "status", statuses)}`;
  const toggleStatus = (status: string) =>
    statusHref(query.statuses.includes(status) ? query.statuses.filter((v) => v !== status) : [...query.statuses, status]);

  const sortHref = (column: InvoiceSort) =>
    href({ sort: column, dir: query.sort === column && query.direction === "desc" ? "asc" : "desc" });
  const mark = (column: InvoiceSort) => (query.sort === column ? (query.direction === "asc" ? " ▲" : " ▼") : "");

  const unfiltered = Object.values(page.statusCounts).reduce((total, count) => total + count, 0);

  return (
    <main className="admin-main" aria-busy={navigation.state === "loading"}>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade invoicing</p>
          <h1>Invoices</h1>
          <p>What has been billed, what is still owed, and what is late.</p>
        </div>
        <div className="admin-head-actions">
          <Link className="admin-secondary-link" to="/admin/invoice-settings">
            Settings
          </Link>
          <a className="admin-primary-link" href={`/admin/invoices${withParams(params, { export: "csv", page: null })}`}>
            Download CSV
          </a>
        </div>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged">
          <span>Outstanding</span>
          <b>{gbpFromPence(page.stats.outstandingPence)}</b>
        </div>
        <div className="admin-stat">
          <span>Overdue</span>
          <b>{gbpFromPence(page.stats.overduePence)}</b>
        </div>
        <div className="admin-stat">
          <span>Overdue invoices</span>
          <b>{page.stats.overdue}</b>
        </div>
        <div className="admin-stat">
          <span>Billed</span>
          <b>{gbpFromPence(page.stats.billedPence)}</b>
        </div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter invoices">
        <Link to={statusHref([])} className={query.statuses.length === 0 ? "is-active" : undefined} preventScrollReset>
          All ({unfiltered})
        </Link>
        {INVOICE_STATUSES.map((status) => (
          <Link
            key={status}
            to={toggleStatus(status)}
            className={query.statuses.includes(status) ? "is-active" : undefined}
            preventScrollReset
          >
            {INVOICE_STATUS_LABELS[status]} ({page.statusCounts[status] ?? 0})
          </Link>
        ))}
        <span className="admin-filters-divider" aria-hidden="true" />
        <Link to={href({ open: query.openOnly ? null : "1", overdue: null })} className={query.openOnly ? "is-active" : undefined} preventScrollReset>
          Owing
        </Link>
        <Link to={href({ overdue: query.overdueOnly ? null : "1", open: null })} className={query.overdueOnly ? "is-active" : undefined} preventScrollReset>
          Overdue
        </Link>
      </div>

      <Form method="get" action="/admin/invoices" className="admin-toolbar" role="search">
        <div className="admin-toolbar-search">
          <label htmlFor="inv-q">Search</label>
          <input
            id="inv-q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Invoice number, account, accounting reference or internal note"
          />
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="inv-account">Account</label>
          <select id="inv-account" name="account" defaultValue={query.resellerId}>
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.business_name} · {account.account_code}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="inv-from">Issued from</label>
          <input id="inv-from" name="from" type="date" defaultValue={query.from} />
        </div>
        <div className="admin-toolbar-field">
          <label htmlFor="inv-to">Issued to</label>
          <input id="inv-to" name="to" type="date" defaultValue={query.to} />
        </div>
        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="inv-per-page">Per page</label>
          <select id="inv-per-page" name="perPage" defaultValue={String(query.perPage)}>
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {query.statuses.map((status) => (
          <input key={status} type="hidden" name="status" value={status} />
        ))}
        {query.openOnly ? <input type="hidden" name="open" value="1" /> : null}
        {query.overdueOnly ? <input type="hidden" name="overdue" value="1" /> : null}
        <input type="hidden" name="sort" value={query.sort} />
        <input type="hidden" name="dir" value={query.direction} />

        <div className="admin-toolbar-actions">
          <button type="submit" className="admin-primary">
            Apply
          </button>
          {filtered || query.perPage !== DEFAULT_PER_PAGE ? <Link to="/admin/invoices">Clear</Link> : null}
        </div>
      </Form>

      <section className="admin-panel is-primary">
        <div className="admin-panel-head">
          <h2>{filtered ? "Matching invoices" : "All invoices"}</h2>
          <p className="admin-result-count">
            {page.total === 0 ? "No results" : `Showing ${page.from}–${page.to} of ${page.total}`}
          </p>
        </div>

        {page.rows.length === 0 ? (
          <div className="admin-empty">
            {filtered ? (
              <>
                Nothing matches those filters. <Link to="/admin/invoices">Clear them</Link> to see every invoice.
              </>
            ) : (
              <>
                No invoices yet. Raise one from a confirmed order on the <Link to="/admin/orders">orders</Link> page.
              </>
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    <Link to={sortHref("invoice_number")} preventScrollReset>
                      Invoice{mark("invoice_number")}
                    </Link>
                  </th>
                  <th scope="col">Account</th>
                  <th scope="col">
                    <Link to={sortHref("issue_date")} preventScrollReset>
                      Issued{mark("issue_date")}
                    </Link>
                  </th>
                  <th scope="col">
                    <Link to={sortHref("due_date")} preventScrollReset>
                      Due{mark("due_date")}
                    </Link>
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <Link to={sortHref("gross_pence")} preventScrollReset>
                      Total{mark("gross_pence")}
                    </Link>
                  </th>
                  <th scope="col">
                    <Link to={sortHref("balance_pence")} preventScrollReset>
                      Outstanding{mark("balance_pence")}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((invoice) => {
                  const late = isOverdue(invoice.status, invoice.due_date);
                  return (
                    <ClickableRow key={invoice.id} to={`/admin/invoices/${invoice.id}`}>
                      <td className="admin-nowrap">
                        <strong>
                          <Link to={`/admin/invoices/${invoice.id}`}>{invoice.invoice_number ?? "Draft"}</Link>
                        </strong>
                        {invoice.external_reference ? <span>{invoice.external_reference}</span> : null}
                      </td>
                      <td>
                        {invoice.resellers?.business_name ?? "—"}
                        <span>{invoice.resellers?.account_code}</span>
                      </td>
                      <td className="admin-nowrap">
                        {invoice.issue_date ? new Date(`${invoice.issue_date}T00:00:00`).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="admin-nowrap">
                        {invoice.due_date ? new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString("en-GB") : "—"}
                        {late ? <span className="admin-late">overdue</span> : null}
                      </td>
                      <td>
                        <span className={`admin-status admin-status-inv-${invoice.status}`}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </span>
                      </td>
                      <td className="admin-nowrap">{gbpFromPence(invoice.gross_pence)}</td>
                      <td className="admin-nowrap admin-linetotal">
                        {invoice.balance_pence > 0 ? gbpFromPence(invoice.balance_pence) : "—"}
                      </td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pager page={page.page} pageCount={page.pageCount} hrefFor={(n) => href({ page: n })} label="Invoice pages" />
      </section>
    </main>
  );
}
