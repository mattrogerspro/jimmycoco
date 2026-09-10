import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import {
  listSampleRequests,
  updateSampleRequest,
  type SampleRequestUpdate,
} from "../lib/sample-requests.server";
import { createSupabaseServiceClient, isSameOriginPost } from "../lib/supabase.server";

export const meta: MetaFunction = () => [
  { title: "Sample requests | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { responseHeaders, staff } = await requireArticleStaff(request);
  const sampleRequests = await listSampleRequests(createSupabaseServiceClient());
  return data({ staff, sampleRequests }, { headers: responseHeaders });
}

function value(form: FormData, name: string, maxLength = 500) {
  return String(form.get(name) ?? "").trim().slice(0, maxLength);
}

function requestFrom(form: FormData): SampleRequestUpdate {
  return {
    sample_shipped: form.get("sampleShipped") === "on",
    tracking_details: value(form, "trackingDetails", 2000) || null,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const { responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const intent = value(form, "intent", 40);
  const supabase = createSupabaseServiceClient();

  try {
    if (intent === "save") {
      const id = value(form, "id", 80);
      if (!id) throw new Error("The sample request ID is missing.");
      await updateSampleRequest(supabase, id, requestFrom(form));
      return data({ notice: "Sample request updated." }, { headers: responseHeaders });
    }

    throw new Error("Choose a valid sample request action.");
  } catch (error) {
    return data(
      { error: error instanceof Error ? error.message : "The sample request could not be saved." },
      { status: 400, headers: responseHeaders },
    );
  }
}

const FILTERS = ["pending", "sent", "all"] as const;

export default function AdminSampleRequests() {
  const { staff, sampleRequests } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const [params, setParams] = useSearchParams();
  const filter = (params.get("status") ?? "pending") as (typeof FILTERS)[number];
  const visible = sampleRequests.filter((item) => filter === "all" || (filter === "sent" ? item.sample_shipped : !item.sample_shipped));
  const busy = navigation.state !== "idle";
  const sent = sampleRequests.filter((item) => item.sample_shipped).length;

  return (
    <main className="admin-main sample-requests-main">
      <header className="admin-page-head">
        <h1>Sample requests</h1>
      </header>

      {result && "error" in result ? <div className="admin-alert">{result.error}</div> : null}
      {result && "notice" in result ? <div className="admin-alert admin-alert-ok">{result.notice}</div> : null}

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged"><span>Awaiting dispatch</span><b>{sampleRequests.length - sent}</b></div>
        <div className="admin-stat"><span>Samples sent</span><b>{sent}</b></div>
        <div className="admin-stat"><span>Total requests</span><b>{sampleRequests.length}</b></div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter sample requests">
        {FILTERS.map((option) => (
          <button key={option} type="button" className={filter === option ? "is-active" : undefined} onClick={() => setParams(option === "pending" ? {} : { status: option })}>
            {option === "pending" ? "Awaiting dispatch" : option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <section className="admin-panel sample-request-queue">
        <div className="admin-panel-head">
          <h2>{filter === "all" ? "All requests" : filter === "sent" ? "Sent samples" : "Awaiting dispatch"} ({visible.length})</h2>
        </div>
        {visible.length === 0 ? <div className="admin-empty">No sample requests in this view.</div> : (
          <div className="sample-request-list">
            <div className="sample-request-row sample-request-row-head" aria-hidden="true">
              <span>Salon / business</span><span>Contact</span><span>Email</span><span>Sent</span><span>Tracking details</span><span />
            </div>
            {visible.map((sampleRequest) => (
              <Form method="post" key={sampleRequest.id} className={"sample-request-row" + (sampleRequest.sample_shipped ? " is-sent" : "")} aria-busy={busy}>
                <input type="hidden" name="intent" value="save" />
                <input type="hidden" name="id" value={sampleRequest.id} />
                <strong className="sample-request-business">{sampleRequest.business_name}</strong>
                <span>{sampleRequest.contact_name}</span>
                <span className={sampleRequest.email ? undefined : "admin-muted"}>{sampleRequest.email ?? "Not provided"}</span>
                <input className="sample-request-sent" name="sampleShipped" type="checkbox" defaultChecked={sampleRequest.sample_shipped} aria-label={"Sample sent to " + sampleRequest.business_name} />
                <input className="sample-request-tracking" name="trackingDetails" defaultValue={sampleRequest.tracking_details ?? ""} placeholder="Courier, tracking number or notes" aria-label={"Tracking details for " + sampleRequest.business_name} />
                <button className="admin-primary" type="submit" disabled={busy}>Save</button>
              </Form>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
