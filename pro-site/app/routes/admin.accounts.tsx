import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listAccountsForExport, listAccountsPage } from "../lib/resellers.server";
import { PRICING_TIERS, RESELLER_STATUSES } from "../lib/reseller-constants";
import { ACCOUNT_SORTS, isAccountFiltered, parseAccountQuery, type AccountSort } from "../lib/accounts-query";
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, withParams, withRepeated } from "../lib/query-params";
import { ClickableRow } from "../components/admin/ClickableRow";
import { Pager } from "../components/admin/Pager";
import { accountsCsv } from "../lib/admin-csv";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Trade accounts | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const url = new URL(request.url);
  const query = parseAccountQuery(url.searchParams);

  if (url.searchParams.get("export") === "csv") {
    return accountsCsv(await listAccountsForExport(supabase, query), responseHeaders);
  }

  const page = await listAccountsPage(supabase, query);
  return data({ query, page }, { headers: responseHeaders });
}

const TIER_LABELS: Record<string, string> = { standard: "Standard", silver: "Silver", gold: "Gold" };
const STATUS_LABELS: Record<string, string> = { active: "Active", suspended: "Suspended", closed: "Closed" };

export default function AdminAccounts() {
  const { query, page } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const filtered = isAccountFiltered(query);

  const href = (changes: Record<string, string | number | null>) => `/admin/accounts${withParams(params, changes)}`;
  const repeated = (key: string, values: string[]) => `/admin/accounts${withRepeated(params, key, values)}`;
  const toggle = (key: string, current: string[], value: string) =>
    repeated(key, current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);

  const sortHref = (column: AccountSort) =>
    href({ sort: column, dir: query.sort === column && query.direction === "asc" ? "desc" : "asc" });
  const sortMark = (column: AccountSort) => (query.sort === column ? (query.direction === "asc" ? " ▲" : " ▼") : "");
  const ariaSort = (column: AccountSort) =>
    query.sort === column ? (query.direction === "asc" ? "ascending" : "descending") : "none";

  const unfilteredTotal = Object.values(page.statusCounts).reduce((total, count) => total + count, 0);

  return (
    <main className="admin-main" aria-busy={navigation.state === "loading"}>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade accounts</p>
          <h1>Accounts</h1>
          <p>Approved stockists, their trade terms and their trading history.</p>
        </div>
        <a className="admin-primary-link" href={`/admin/accounts${withParams(params, { export: "csv", page: null })}`}>
          Download CSV
        </a>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat">
          <span>{filtered ? "Matching accounts" : "Accounts"}</span>
          <b>{page.stats.total}</b>
        </div>
        <div className="admin-stat">
          <span>Active</span>
          <b>{page.stats.active}</b>
        </div>
        <div className="admin-stat is-flagged">
          <span>Suspended</span>
          <b>{page.stats.suspended}</b>
        </div>
        <div className="admin-stat">
          <span>Signed up to the portal</span>
          <b>{page.stats.signedUp}</b>
        </div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter accounts by status">
        <Link to={repeated("status", [])} className={query.statuses.length === 0 ? "is-active" : undefined} preventScrollReset>
          All ({unfilteredTotal})
        </Link>
        {RESELLER_STATUSES.map((status) => (
          <Link
            key={status}
            to={toggle("status", query.statuses, status)}
            className={query.statuses.includes(status) ? "is-active" : undefined}
            preventScrollReset
          >
            {STATUS_LABELS[status]} ({page.statusCounts[status] ?? 0})
          </Link>
        ))}
        <span className="admin-filters-divider" aria-hidden="true" />
        {PRICING_TIERS.map((tier) => (
          <Link
            key={tier}
            to={toggle("tier", query.tiers, tier)}
            className={query.tiers.includes(tier) ? "is-active" : undefined}
            preventScrollReset
          >
            {TIER_LABELS[tier]} ({page.tierCounts[tier] ?? 0})
          </Link>
        ))}
      </div>

      <Form method="get" action="/admin/accounts" className="admin-toolbar" role="search">
        <div className="admin-toolbar-search">
          <label htmlFor="accounts-q">Search</label>
          <input
            id="accounts-q"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Business, account code, contact, email, phone or internal note"
          />
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="accounts-portal">Portal</label>
          <select id="accounts-portal" name="portal" defaultValue={query.portal}>
            <option value="">Everyone</option>
            <option value="yes">Signed up</option>
            <option value="no">Not signed up</option>
          </select>
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="accounts-market">Market</label>
          <select id="accounts-market" name="market" defaultValue={query.market}>
            <option value="">All markets</option>
            {page.markets.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-toolbar-field">
          <label htmlFor="accounts-sort">Sort by</label>
          <select id="accounts-sort" name="sort" defaultValue={query.sort}>
            {ACCOUNT_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-toolbar-field is-narrow">
          <label htmlFor="accounts-per-page">Per page</label>
          <select id="accounts-per-page" name="perPage" defaultValue={String(query.perPage)}>
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Keep the pills and the sort direction when the form is submitted. */}
        {query.statuses.map((status) => (
          <input key={`status-${status}`} type="hidden" name="status" value={status} />
        ))}
        {query.tiers.map((tier) => (
          <input key={`tier-${tier}`} type="hidden" name="tier" value={tier} />
        ))}
        <input type="hidden" name="dir" value={query.direction} />

        <div className="admin-toolbar-actions">
          <button type="submit" className="admin-primary">
            Apply
          </button>
          {filtered || query.perPage !== DEFAULT_PER_PAGE ? <Link to="/admin/accounts">Clear</Link> : null}
        </div>
      </Form>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>{filtered ? "Matching accounts" : "All accounts"}</h2>
          <p className="admin-result-count">
            {page.total === 0 ? "No results" : `Showing ${page.from}–${page.to} of ${page.total}`}
          </p>
        </div>

        {page.rows.length === 0 ? (
          <div className="admin-empty">
            {filtered ? (
              <>
                Nothing matches those filters. <Link to="/admin/accounts">Clear them</Link> to see every account.
              </>
            ) : (
              "No trade accounts yet. Approve an application to create one."
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" aria-sort={ariaSort("business_name")}>
                    <Link to={sortHref("business_name")} preventScrollReset>
                      Account{sortMark("business_name")}
                    </Link>
                  </th>
                  <th scope="col">Contact</th>
                  <th scope="col" aria-sort={ariaSort("pricing_tier")}>
                    <Link to={sortHref("pricing_tier")} preventScrollReset>
                      Tier{sortMark("pricing_tier")}
                    </Link>
                  </th>
                  <th scope="col">Orders</th>
                  <th scope="col">Lifetime value</th>
                  <th scope="col">Portal</th>
                  <th scope="col" aria-sort={ariaSort("status")}>
                    <Link to={sortHref("status")} preventScrollReset>
                      Status{sortMark("status")}
                    </Link>
                  </th>
                  <th scope="col" aria-sort={ariaSort("approved_at")}>
                    <Link to={sortHref("approved_at")} preventScrollReset>
                      Approved{sortMark("approved_at")}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((reseller) => (
                  <ClickableRow key={reseller.id} to={`/admin/accounts/${reseller.id}`}>
                    <td>
                      <strong>
                        <Link to={`/admin/accounts/${reseller.id}`}>{reseller.business_name}</Link>
                      </strong>
                      <span>{reseller.account_code}</span>
                    </td>
                    <td>
                      {reseller.contact_name}
                      <span>{reseller.email}</span>
                    </td>
                    <td className="admin-capitalise">
                      {reseller.pricing_tier}
                      {Number(reseller.discount_percent) > 0 ? <span>{reseller.discount_percent}% off trade</span> : null}
                    </td>
                    <td className="admin-nowrap">
                      {reseller.orderCount}
                      {reseller.openOrders > 0 ? <span>{reseller.openOrders} awaiting action</span> : null}
                    </td>
                    <td className="admin-nowrap">
                      {gbpFromPence(reseller.lifetimePence)}
                      {reseller.lastOrderAt ? (
                        <span>last {new Date(reseller.lastOrderAt).toLocaleDateString("en-GB")}</span>
                      ) : null}
                    </td>
                    <td>{reseller.user_id ? "Signed up" : "Not signed up"}</td>
                    <td>
                      <span className={`admin-status admin-status-${reseller.status}`}>{reseller.status}</span>
                    </td>
                    <td className="admin-nowrap">
                      {reseller.approved_at ? new Date(reseller.approved_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pager page={page.page} pageCount={page.pageCount} hrefFor={(number) => href({ page: number })} label="Account pages" />
      </section>
    </main>
  );
}
