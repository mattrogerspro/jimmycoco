import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useLocation, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import {
  accountOrderTotals,
  getReseller,
  listOrdersForExport,
  listOrdersPage,
  updateReseller,
} from "../lib/resellers.server";
import { parseOrderQuery, withParams } from "../lib/orders-query";
import { OrdersPanel } from "../components/admin/OrdersPanel";
import { ordersCsv } from "../lib/admin-csv";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Trade account | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const reseller = await getReseller(supabase, params.resellerId as string);
  if (!reseller) throw new Response("Account not found", { status: 404, headers: responseHeaders });

  const url = new URL(request.url);
  // The account is not a filter the user can change here — it is the page.
  const query = { ...parseOrderQuery(url.searchParams), resellerId: reseller.id };

  if (url.searchParams.get("export") === "csv") {
    return ordersCsv(await listOrdersForExport(supabase, query), responseHeaders);
  }

  const [orders, totals] = await Promise.all([
    listOrdersPage(supabase, query),
    accountOrderTotals(supabase, reseller.id),
  ]);

  return data({ reseller, query, orders, totals }, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  try {
    await updateReseller(supabase, params.resellerId as string, {
      pricing_tier: String(form.get("pricingTier") ?? "standard") as "standard" | "silver" | "gold",
      discount_percent: Number.parseFloat(String(form.get("discountPercent") ?? "0")) || 0,
      status: String(form.get("status") ?? "active") as "active" | "suspended" | "closed",
      phone: String(form.get("phone") ?? "").trim() || null,
      internal_notes: String(form.get("internalNotes") ?? "").trim() || null,
    });
    return data({ notice: "Account updated." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 500, headers: responseHeaders });
  }
}

export default function AccountDetail() {
  const { reseller, query, orders, totals } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const [params] = useSearchParams();
  const busy = navigation.state === "submitting";
  const basePath = location.pathname;

  return (
    <main className="admin-main">
      <p className="admin-crumb">
        <Link to="/admin/accounts">← Accounts</Link>
      </p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade account · {reseller.account_code}</p>
          <h1>{reseller.business_name}</h1>
          <p>
            {reseller.contact_name} · {reseller.email} ·{" "}
            <span className={`admin-status admin-status-${reseller.status}`}>{reseller.status}</span>
          </p>
        </div>
        <a className="admin-primary-link" href={`${basePath}${withParams(params, { export: "csv", page: null })}`}>
          Download CSV
        </a>
      </header>

      {result?.error ? (
        <p className="admin-alert" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.notice ? (
        <p className="admin-alert admin-alert-ok" role="status">
          {result.notice}
        </p>
      ) : null}

      <div className="admin-stat-row">
        <div className="admin-stat">
          <span>Orders</span>
          <b>{totals.count}</b>
        </div>
        <div className="admin-stat">
          <span>Lifetime value</span>
          <b>{gbpFromPence(totals.valuePence)}</b>
        </div>
        <div className="admin-stat">
          <span>Pricing tier</span>
          <b className="admin-capitalise admin-stat-sm">{reseller.pricing_tier}</b>
        </div>
        <div className="admin-stat is-flagged">
          <span>Portal</span>
          <b className="admin-stat-sm">{reseller.user_id ? "Signed up" : "Not signed up"}</b>
        </div>
      </div>

      <div className="admin-split">
        <div>
          <OrdersPanel basePath={basePath} query={query} page={orders} scoped title="Orders" />

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Account record</h2>
            </div>
            <dl className="admin-dl">
              <div>
                <dt>Account code</dt>
                <dd>{reseller.account_code}</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>{reseller.market}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${reseller.email}`}>{reseller.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{reseller.phone || "—"}</dd>
              </div>
              <div>
                <dt>Last order</dt>
                <dd>{totals.lastOrderAt ? new Date(totals.lastOrderAt).toLocaleString("en-GB") : "—"}</dd>
              </div>
              <div>
                <dt>Approved</dt>
                <dd>{reseller.approved_at ? new Date(reseller.approved_at).toLocaleString("en-GB") : "—"}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(reseller.created_at).toLocaleString("en-GB")}</dd>
              </div>
              <div>
                <dt>Application</dt>
                <dd>
                  {reseller.application_id ? (
                    <Link to={`/admin/applications/${reseller.application_id}`}>View original</Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Edit account</h2>
            </div>
            <div className="admin-panel-body">
              <Form method="post" replace>
                <div className="admin-field">
                  <label htmlFor="pricingTier">Pricing tier</label>
                  <select id="pricingTier" name="pricingTier" defaultValue={reseller.pricing_tier}>
                    <option value="standard">Standard</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="discountPercent">Discount off trade (%)</label>
                  <input
                    id="discountPercent"
                    name="discountPercent"
                    type="number"
                    min={0}
                    max={90}
                    step="0.5"
                    defaultValue={Number(reseller.discount_percent)}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" defaultValue={reseller.status}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" defaultValue={reseller.phone ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="internalNotes">Internal notes</label>
                  <textarea id="internalNotes" name="internalNotes" rows={4} defaultValue={reseller.internal_notes ?? ""} />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" type="submit" disabled={busy}>
                    Save changes
                  </button>
                </div>
              </Form>
              <p className="admin-hint">
                Changing the tier or discount affects the price shown in the portal and applied to future orders.
                Existing orders keep the price they were placed at.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
