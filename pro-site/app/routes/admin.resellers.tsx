import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import {
  approveApplication,
  listApplications,
  listOrders,
  listResellers,
  setApplicationStatus,
} from "../lib/resellers.server";
import { emitResellerEventSafely } from "../lib/reseller-events.server";
import { SITE_URL, gbpFromPence } from "../lib/site";

type ResellerActionData = { error?: string; notice?: string };

export const meta: MetaFunction = () => [
  { title: "Resellers | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const [applications, resellers, orders] = await Promise.all([
    listApplications(supabase),
    listResellers(supabase),
    listOrders(supabase),
  ]);

  return data({ staff, applications, resellers, orders }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request, ["admin", "editor"]);

  if (!isSameOriginPost(request)) {
    return data<ResellerActionData>(
      { error: "That request could not be verified." },
      { status: 403, headers: responseHeaders },
    );
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const applicationId = String(form.get("applicationId") ?? "");
  const note = String(form.get("note") ?? "").trim() || undefined;

  if (!applicationId) {
    return data<ResellerActionData>(
      { error: "Missing application reference." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    if (intent === "approve") {
      const reseller = await approveApplication(supabase, applicationId, staff.userId, { note });
      await emitResellerEventSafely({
        trigger: "reseller_approved",
        eventId: `reseller-${reseller.id}-approved`,
        contact: {
          email: reseller.email,
          first_name: reseller.contact_name.split(" ")[0] ?? null,
          business_name: reseller.business_name,
          market: reseller.market,
        },
        context: {
          SALON_NAME: reseller.business_name,
          CONTACT_NAME: reseller.contact_name,
          ACCOUNT_CODE: reseller.account_code,
          PORTAL_LINK: `${SITE_URL}/portal/register`,
        },
      });
      return data<ResellerActionData>(
        { notice: `Approved — account ${reseller.account_code} created.` },
        { headers: responseHeaders },
      );
    }

    if (intent === "decline" || intent === "on_hold") {
      const status = intent === "decline" ? "declined" : "on_hold";
      const application = await setApplicationStatus(supabase, applicationId, status, staff.userId, note);

      if (status === "declined") {
        await emitResellerEventSafely({
          trigger: "reseller_declined",
          eventId: `reseller-application-${applicationId}-declined`,
          contact: {
            email: application.email,
            first_name: application.contact_name.split(" ")[0] ?? null,
            business_name: application.business_name,
            market: application.market,
          },
          context: {
            SALON_NAME: application.business_name,
            CONTACT_NAME: application.contact_name,
          },
        });
      }

      return data<ResellerActionData>(
        { notice: status === "declined" ? "Application declined." : "Application put on hold." },
        { headers: responseHeaders },
      );
    }

    return data<ResellerActionData>(
      { error: "Unknown action." },
      { status: 400, headers: responseHeaders },
    );
  } catch (error) {
    console.error("Reseller admin action failed", (error as Error).message);
    return data<ResellerActionData>(
      { error: (error as Error).message },
      { status: 500, headers: responseHeaders },
    );
  }
}

export default function AdminResellers() {
  const { staff, applications, resellers, orders } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  const pending = applications.filter((application) => application.status === "pending");
  const reviewed = applications.filter((application) => application.status !== "pending");

  return (
    <main className="admin-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade accounts</p>
          <h1>Resellers</h1>
          <p>
            Signed in as {staff.displayName} · <span className="admin-role">{staff.role}</span>
          </p>
        </div>
      </header>

      {result?.error ? (
        <p className="admin-empty" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.notice ? (
        <p className="admin-empty" role="status">
          {result.notice}
        </p>
      ) : null}

      <section className="admin-panel" aria-labelledby="pending-title">
        <div className="admin-panel-head">
          <h2 id="pending-title">Applications awaiting review ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <div className="admin-empty">Nothing waiting. New applications land here.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Business</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Type</th>
                  <th scope="col">Received</th>
                  <th scope="col">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.business_name}</strong>
                      <span>{application.market} · via {application.source}</span>
                      {application.message ? <span>{application.message}</span> : null}
                    </td>
                    <td>
                      {application.contact_name}
                      <span>{application.email}</span>
                      {application.phone ? <span>{application.phone}</span> : null}
                    </td>
                    <td>{application.business_type}</td>
                    <td>{new Date(application.created_at).toLocaleDateString("en-GB")}</td>
                    <td>
                      <Form method="post" replace style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input type="hidden" name="applicationId" value={application.id} />
                        <button name="intent" value="approve" type="submit" disabled={busy}>
                          Approve
                        </button>
                        <button name="intent" value="on_hold" type="submit" disabled={busy}>
                          Hold
                        </button>
                        <button name="intent" value="decline" type="submit" disabled={busy}>
                          Decline
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="accounts-title">
        <div className="admin-panel-head">
          <h2 id="accounts-title">Approved accounts ({resellers.length})</h2>
        </div>
        {resellers.length === 0 ? (
          <div className="admin-empty">No trade accounts yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Tier</th>
                  <th scope="col">Portal</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {resellers.map((reseller) => (
                  <tr key={reseller.id}>
                    <td>
                      <strong>{reseller.business_name}</strong>
                      <span>{reseller.account_code}</span>
                    </td>
                    <td>
                      {reseller.contact_name}
                      <span>{reseller.email}</span>
                    </td>
                    <td>
                      {reseller.pricing_tier}
                      {Number(reseller.discount_percent) > 0 ? (
                        <span>{reseller.discount_percent}% off trade</span>
                      ) : null}
                    </td>
                    <td>{reseller.user_id ? "Signed up" : "Not signed up yet"}</td>
                    <td>{reseller.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="orders-title">
        <div className="admin-panel-head">
          <h2 id="orders-title">Order requests ({orders.length})</h2>
        </div>
        {orders.length === 0 ? (
          <div className="admin-empty">No orders yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Placed</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.reference}</strong>
                    </td>
                    <td>{new Date(order.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td>{order.status}</td>
                    <td>{gbpFromPence(order.subtotal_pence)}</td>
                    <td>{order.customer_note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="reviewed-title">
        <div className="admin-panel-head">
          <h2 id="reviewed-title">Reviewed applications ({reviewed.length})</h2>
        </div>
        {reviewed.length === 0 ? (
          <div className="admin-empty">Nothing reviewed yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Business</th>
                  <th scope="col">Outcome</th>
                  <th scope="col">Reviewed</th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.business_name}</strong>
                      <span>{application.email}</span>
                    </td>
                    <td>{application.status}</td>
                    <td>
                      {application.reviewed_at
                        ? new Date(application.reviewed_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td>{application.review_note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-return">
        <Link to="/admin/articles">Back to articles</Link>
      </p>
    </main>
  );
}
