import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listOrdersForExport, listOrdersPage, listResellerOptions } from "../lib/resellers.server";
import { getTradeDataVisibility } from "../lib/trade-data-settings.server";
import { isFiltered, parseOrderQuery, withParams } from "../lib/orders-query";
import { OrdersPanel } from "../components/admin/OrdersPanel";
import { ordersCsv } from "../lib/admin-csv";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Orders | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const url = new URL(request.url);
  const query = parseOrderQuery(url.searchParams);
  const visibility = await getTradeDataVisibility(supabase);

  if (url.searchParams.get("export") === "csv") {
    const rows = await listOrdersForExport(supabase, query, 5000, visibility);
    return ordersCsv(rows, responseHeaders);
  }

  const [page, accounts] = await Promise.all([listOrdersPage(supabase, query, visibility), listResellerOptions(supabase, visibility)]);
  return data({ query, page, accounts, demoModeOn: visibility.showDemoData }, { headers: responseHeaders });
}

export default function AdminOrders() {
  const { query, page, accounts, demoModeOn } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigation = useNavigation();

  return (
    <main className="admin-main" aria-busy={navigation.state === "loading"}>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade orders</p>
          <h1>Orders</h1>
          <p>Order requests from the stockist portal. Nothing is charged online — confirm, then invoice.</p>
          {!demoModeOn ? <p>Demo records are hidden. Switch Data mode on to review them.</p> : null}
        </div>
        <a className="admin-primary-link" href={`/admin/orders${withParams(params, { export: "csv", page: null })}`}>
          Download CSV
        </a>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged">
          <span>Awaiting action</span>
          <b>{page.stats.open}</b>
        </div>
        <div className="admin-stat">
          <span>{isFiltered(query) ? "Matching orders" : "Orders total"}</span>
          <b>{page.stats.total}</b>
        </div>
        <div className="admin-stat">
          <span>Value (excl. cancelled)</span>
          <b>{gbpFromPence(page.stats.valuePence)}</b>
        </div>
        <div className="admin-stat">
          <span>Cancelled</span>
          <b>{page.stats.cancelled}</b>
        </div>
      </div>

      <OrdersPanel basePath="/admin/orders" query={query} page={page} accounts={accounts} title="Orders" />
    </main>
  );
}
