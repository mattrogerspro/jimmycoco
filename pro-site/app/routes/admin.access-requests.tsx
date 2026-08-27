import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Form, data, redirect, useActionData, useLoaderData } from "react-router";
import { requireArticleStaff, type ArticleRole } from "../lib/article-auth.server";
import { createSupabaseServiceClient, isSameOriginPost } from "../lib/supabase.server";

type AccessRequestStatus = "pending" | "approved" | "declined";

type AccessRequestRow = {
  id: string;
  auth_user_id: string;
  email: string;
  status: AccessRequestStatus;
  email_verified_at: string | null;
  assigned_role: ArticleRole | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_note: string | null;
  internal_notification_sent_at: string | null;
  created_at: string;
};

type DisplayRequest = AccessRequestRow & {
  currentlyVerified: boolean;
};

type ActionData = { error?: string; notice?: string };

export const meta: MetaFunction = () => [
  { title: "Access requests | Jimmy Coco PRO" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) =>
  actionHeaders.has("Cache-Control") ? actionHeaders : loaderHeaders;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: AccessRequestStatus) {
  return `admin-status admin-status-${status}`;
}

function reviewErrorMessage(message: string) {
  if (message.includes("must verify their email")) {
    return "This requester must confirm their email address before you can approve access.";
  }
  if (message.includes("already been decided")) {
    return "This access request has already been decided. Refresh the page to see its current status.";
  }
  if (message.includes("Choose Admin or Editor")) {
    return "Choose either Admin or Editor before approving this access request.";
  }
  if (message.includes("Only active Administrators")) {
    return "Only an active Administrator can review access requests.";
  }
  return "The access request could not be updated. Please try again.";
}

async function requireApprovingAdmin(request: Request) {
  const context = await requireArticleStaff(request);
  if (context.staff.role !== "admin") {
    throw new Response("Only active Administrators can review access requests.", {
      status: 403,
      headers: context.responseHeaders,
    });
  }
  return context;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { staff, responseHeaders } = await requireApprovingAdmin(request);
  const service = createSupabaseServiceClient();
  const { data: records, error } = await service
    .from("admin_access_requests")
    .select("id, auth_user_id, email, status, email_verified_at, assigned_role, reviewed_by, reviewed_at, decision_note, internal_notification_sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Unable to load PRO admin access requests", error.message);
    throw new Response("Access requests are temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  const accessRequests = (records ?? []) as AccessRequestRow[];
  const verificationResults = await Promise.all(
    accessRequests.map(async (accessRequest) => {
      const { data: authData, error: authError } = await service.auth.admin.getUserById(accessRequest.auth_user_id);
      if (authError) {
        console.error("Unable to check access-request email verification", authError.message);
      }
      return [accessRequest.auth_user_id, Boolean(authData.user?.email_confirmed_at)] as const;
    }),
  );
  const verifiedByUserId = new Map(verificationResults);

  return data(
    {
      staff,
      requests: accessRequests.map((accessRequest) => ({
        ...accessRequest,
        currentlyVerified: verifiedByUserId.get(accessRequest.auth_user_id) ?? false,
      })) satisfies DisplayRequest[],
    },
    { headers: responseHeaders },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) {
    return data<ActionData>(
      { error: "That access decision could not be verified. Please try again." },
      { status: 403 },
    );
  }

  const { staff, responseHeaders } = await requireApprovingAdmin(request);
  const formData = await request.formData();
  const requestId = String(formData.get("request_id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const assignedRole = String(formData.get("assigned_role") ?? "");
  const decisionNote = String(formData.get("decision_note") ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return data<ActionData>({ error: "The selected access request is invalid." }, { status: 400, headers: responseHeaders });
  }
  if (intent !== "approve" && intent !== "decline") {
    return data<ActionData>({ error: "Choose whether to approve or decline the access request." }, { status: 400, headers: responseHeaders });
  }
  if (decisionNote.length > 1000) {
    return data<ActionData>({ error: "Internal decision notes must be 1,000 characters or fewer." }, { status: 400, headers: responseHeaders });
  }
  if (intent === "approve" && !["admin", "editor"].includes(assignedRole)) {
    return data<ActionData>({ error: "Choose either Admin or Editor before approving this access request." }, { status: 400, headers: responseHeaders });
  }

  try {
    const service = createSupabaseServiceClient();
    const { error } = await service.rpc("review_admin_access_request", {
      p_request_id: requestId,
      p_reviewer_id: staff.userId,
      p_decision: intent === "approve" ? "approved" : "declined",
      p_assigned_role: intent === "approve" ? assignedRole : null,
      p_decision_note: decisionNote || null,
    });

    if (error) {
      console.error("Could not review PRO admin access request", error.message);
      return data<ActionData>({ error: reviewErrorMessage(error.message) }, { status: 400, headers: responseHeaders });
    }
  } catch (error) {
    console.error("PRO admin access request review failed", error instanceof Error ? error.message : "Unknown error");
    return data<ActionData>(
      { error: "Access requests are temporarily unavailable. Please try again." },
      { status: 503, headers: responseHeaders },
    );
  }

  const outcome = intent === "approve" ? "approved" : "declined";
  return redirect(`/admin/access-requests?notice=${outcome}`, { headers: responseHeaders });
}

export default function AdminAccessRequests() {
  const { requests } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const pending = requests.filter((accessRequest) => accessRequest.status === "pending");
  const approved = requests.filter((accessRequest) => accessRequest.status === "approved");
  const declined = requests.filter((accessRequest) => accessRequest.status === "declined");

  return (
    <main className="admin-main admin-access-requests">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">PRO workspace security</p>
          <h1>Access requests</h1>
          <p>Verify each requester, assign the least privilege needed, then approve or decline access.</p>
        </div>
      </header>

      {actionData?.error ? <p className="admin-alert" role="alert">{actionData.error}</p> : null}

      <section className="admin-stat-row" aria-label="Access request summary">
        <article className="admin-stat is-flagged"><span>Pending review</span><b>{pending.length}</b></article>
        <article className="admin-stat"><span>Approved</span><b>{approved.length}</b></article>
        <article className="admin-stat"><span>Declined</span><b>{declined.length}</b></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Pending requests</h2>
          <span className="admin-muted">Approval is unavailable until Supabase confirms the requester’s email.</span>
        </div>
        {pending.length === 0 ? (
          <p className="admin-empty">There are no pending PRO admin access requests.</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Requester</th>
                  <th scope="col">Registered</th>
                  <th scope="col">Email verification</th>
                  <th scope="col">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((accessRequest) => (
                  <tr key={accessRequest.id}>
                    <td><strong>{accessRequest.email}</strong><span>Notification {accessRequest.internal_notification_sent_at ? "sent" : "not confirmed"}</span></td>
                    <td>{formatDate(accessRequest.created_at)}</td>
                    <td>
                      <span className={`admin-status ${accessRequest.currentlyVerified ? "admin-status-confirmed" : "admin-status-pending"}`}>
                        {accessRequest.currentlyVerified ? "Confirmed" : "Awaiting verification"}
                      </span>
                    </td>
                    <td>
                      <Form method="post" className="admin-access-request-decision" replace>
                        <input type="hidden" name="request_id" value={accessRequest.id} />
                        <label>
                          <span>Privilege on approval</span>
                          <select name="assigned_role" required defaultValue="">
                            <option value="" disabled>Select role</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                        <label>
                          <span>Internal note <em>(optional)</em></span>
                          <textarea name="decision_note" rows={2} maxLength={1000} placeholder="Reason or context for this decision" />
                        </label>
                        <div className="admin-access-request-actions">
                          <button type="submit" name="intent" value="approve" disabled={!accessRequest.currentlyVerified}>Approve</button>
                          <button type="submit" name="intent" value="decline">Decline</button>
                        </div>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Decision history</h2></div>
        {approved.length + declined.length === 0 ? (
          <p className="admin-empty">Completed access decisions will appear here.</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Requester</th>
                  <th scope="col">Status</th>
                  <th scope="col">Assigned role</th>
                  <th scope="col">Reviewed</th>
                  <th scope="col">Internal note</th>
                </tr>
              </thead>
              <tbody>
                {requests.filter((accessRequest) => accessRequest.status !== "pending").map((accessRequest) => (
                  <tr key={accessRequest.id}>
                    <td><strong>{accessRequest.email}</strong><span>Requested {formatDate(accessRequest.created_at)}</span></td>
                    <td><span className={statusClass(accessRequest.status)}>{accessRequest.status}</span></td>
                    <td>{accessRequest.assigned_role ? <span className="admin-role">{accessRequest.assigned_role}</span> : "—"}</td>
                    <td>{formatDate(accessRequest.reviewed_at)}</td>
                    <td>{accessRequest.decision_note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
