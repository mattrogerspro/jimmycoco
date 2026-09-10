import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import {
  createSampleRequest,
  listSampleRequests,
  updateSampleRequest,
  type SampleRequest,
  type SampleRequestInput,
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

function requestFrom(form: FormData): SampleRequestInput {
  const contactName = value(form, "contactName", 160);
  const businessName = value(form, "businessName", 180) || contactName;

  if (!contactName) throw new Error("Enter the contact name.");

  return {
    business_name: businessName,
    contact_name: contactName,
    email: value(form, "email", 320) || null,
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
    if (intent === "create") {
      await createSampleRequest(supabase, requestFrom(form));
      return data({ notice: "Sample request added." }, { headers: responseHeaders });
    }

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

function RequestFields({ sampleRequest }: { sampleRequest?: SampleRequest }) {
  const suffix = sampleRequest?.id ?? "new";

  return (
    <div className="sample-request-fields">
      <div className="admin-field">
        <label htmlFor={"sample-business-" + suffix}>Salon / business</label>
        <input id={"sample-business-" + suffix} name="businessName" defaultValue={sampleRequest?.business_name ?? ""} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-contact-" + suffix}>Contact name</label>
        <input id={"sample-contact-" + suffix} name="contactName" required defaultValue={sampleRequest?.contact_name ?? ""} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-email-" + suffix}>Email</label>
        <input id={"sample-email-" + suffix} name="email" type="email" defaultValue={sampleRequest?.email ?? ""} />
      </div>
      <label className="sample-request-check">
        <input name="sampleShipped" type="checkbox" defaultChecked={sampleRequest?.sample_shipped ?? false} />
        <span>Sample sent</span>
      </label>
      <div className="admin-field sample-request-tracking">
        <label htmlFor={"sample-tracking-" + suffix}>Tracking details</label>
        <textarea id={"sample-tracking-" + suffix} name="trackingDetails" rows={3} defaultValue={sampleRequest?.tracking_details ?? ""} placeholder="Courier, tracking number or dispatch notes" />
      </div>
    </div>
  );
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
        <div>
          <p className="admin-eyebrow">Trade fulfilment</p>
          <h1>Sample requests</h1>
          <p>Manage salon delivery details, dispatch status and tracking · signed in as {staff.displayName}</p>
        </div>
      </header>

      {result && "error" in result ? <div className="admin-alert">{result.error}</div> : null}
      {result && "notice" in result ? <div className="admin-alert admin-alert-ok">{result.notice}</div> : null}

      <div className="admin-stat-row">
        <div className="admin-stat is-flagged"><span>Awaiting dispatch</span><b>{sampleRequests.length - sent}</b></div>
        <div className="admin-stat"><span>Samples sent</span><b>{sent}</b></div>
        <div className="admin-stat"><span>Total requests</span><b>{sampleRequests.length}</b></div>
      </div>

      <section className="admin-panel sample-request-create">
        <div className="admin-panel-head"><h2>Add sample request</h2></div>
        <Form method="post" className="admin-panel-body">
          <input type="hidden" name="intent" value="create" />
          <RequestFields />
          <div className="admin-actions"><button className="admin-primary" type="submit" disabled={busy}>Add request</button></div>
        </Form>
      </section>

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
                <label><span>Salon / business</span><input name="businessName" defaultValue={sampleRequest.business_name} /></label>
                <label><span>Contact</span><input name="contactName" required defaultValue={sampleRequest.contact_name} /></label>
                <label><span>Email</span><input name="email" type="email" defaultValue={sampleRequest.email ?? ""} placeholder="Not provided" /></label>
                <label className="sample-request-row-check"><span>Sent</span><input name="sampleShipped" type="checkbox" defaultChecked={sampleRequest.sample_shipped} aria-label={"Sample sent to " + sampleRequest.business_name} /></label>
                <label><span>Tracking details</span><textarea name="trackingDetails" rows={2} defaultValue={sampleRequest.tracking_details ?? ""} placeholder="Courier, number or notes" /></label>
                <button className="admin-primary" type="submit" disabled={busy}>Save</button>
              </Form>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
