import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, data, useLoaderData, useSearchParams } from "react-router";
import { ClickableRow } from "../components/admin/ClickableRow";
import { requireArticleStaff } from "../lib/article-auth.server";
import { listApplications, resellerCounts } from "../lib/resellers.server";
import { getTradeDataVisibility } from "../lib/trade-data-settings.server";
import { gbpFromPence } from "../lib/site";

export const meta: MetaFunction = () => [
  { title: "Applications | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const visibility = await getTradeDataVisibility(supabase);
  const [applications, counts] = await Promise.all([
    listApplications(supabase, undefined, visibility),
    resellerCounts(supabase, visibility),
  ]);
  return data({ staff, applications, counts, demoModeOn: visibility.showDemoData }, { headers: responseHeaders });
}

const FILTERS = ["pending", "approved", "on_hold", "declined", "all"] as const;

export default function AdminApplications() {
  const { staff, applications, counts, demoModeOn } = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();
  const filter = (params.get("status") ?? "pending") as (typeof FILTERS)[number];
  const visible = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade accounts</p>
          <h1>Applications</h1>
          <p>Signed in as {staff.displayName} · <span className="admin-role">{staff.role}</span></p>
          {!demoModeOn ? <p>Demo records are hidden. Switch Data mode on to review them.</p> : null}
        </div>
      </header>

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged"><span>Awaiting review</span><b>{counts.pending}</b></div>
        <div className="admin-stat"><span>Applications</span><b>{counts.applicationsTotal}</b></div>
        <div className="admin-stat"><span>Active accounts</span><b>{counts.activeAccounts}</b></div>
        <div className="admin-stat"><span>Order value</span><b>{gbpFromPence(counts.orderValuePence)}</b></div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter applications">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={option === filter ? "is-active" : undefined}
            onClick={() => setParams(option === "pending" ? {} : { status: option })}
          >
            {option === "on_hold" ? "On hold" : option.charAt(0).toUpperCase() + option.slice(1)}
            {option !== "all" ? ` (${applications.filter((a) => a.status === option).length})` : ` (${applications.length})`}
          </button>
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>{filter === "all" ? "All applications" : `${filter.replace("_", " ")} applications`} ({visible.length})</h2>
        </div>
        {visible.length === 0 ? (
          <div className="admin-empty">Nothing here. New applications land in the pending queue.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Business</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Type</th>
                  <th scope="col">Received</th>
                  <th scope="col">Data</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((application) => (
                  <ClickableRow key={application.id} to={`/admin/applications/${application.id}`}>
                    <td>
                      <strong><Link to={`/admin/applications/${application.id}`}>{application.business_name}</Link></strong>
                      <span>{application.market} · via {application.source}</span>
                    </td>
                    <td>{application.contact_name}<span>{application.email}</span></td>
                    <td>{application.business_type}</td>
                    <td>{new Date(application.created_at).toLocaleDateString("en-GB")}</td>
                    <td><span className={`admin-status admin-status-mode-${application.data_mode}`}>{application.data_mode}</span></td>
                    <td><span className={`admin-status admin-status-${application.status}`}>{application.status}</span></td>
                  </ClickableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
