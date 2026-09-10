import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import {
  createSampleRequest,
  listSampleRequests,
  updateSampleRequest,
  type SampleAddress,
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

function addressFrom(form: FormData): SampleAddress {
  return {
    line1: value(form, "line1", 200),
    line2: value(form, "line2", 200),
    city: value(form, "city", 120),
    county: value(form, "county", 120),
    postcode: value(form, "postcode", 40),
    country: value(form, "country", 80),
  };
}

function requestFrom(form: FormData): SampleRequestInput {
  const contactName = value(form, "contactName", 160);
  const businessName = value(form, "businessName", 180) || contactName;
  const address = addressFrom(form);

  if (!contactName) throw new Error("Enter the contact name.");
  if (!address.line1 || !address.country) {
    throw new Error("Enter address line 1 and country.");
  }

  return {
    business_name: businessName,
    contact_name: contactName,
    email: value(form, "email", 320) || null,
    phone: value(form, "phone", 80) || null,
    market: value(form, "market", 40) || "UK",
    address,
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

const EMPTY_ADDRESS: SampleAddress = { line1: "", line2: "", city: "", county: "", postcode: "", country: "UK" };

function RequestFields({ sampleRequest }: { sampleRequest?: SampleRequest }) {
  const address = sampleRequest?.address ?? EMPTY_ADDRESS;
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
      <div className="admin-field">
        <label htmlFor={"sample-phone-" + suffix}>Phone</label>
        <input id={"sample-phone-" + suffix} name="phone" type="tel" defaultValue={sampleRequest?.phone ?? ""} />
      </div>
      <div className="admin-field sample-request-wide">
        <label htmlFor={"sample-line1-" + suffix}>Address line 1</label>
        <input id={"sample-line1-" + suffix} name="line1" required defaultValue={address.line1} />
      </div>
      <div className="admin-field sample-request-wide">
        <label htmlFor={"sample-line2-" + suffix}>Address line 2</label>
        <input id={"sample-line2-" + suffix} name="line2" defaultValue={address.line2} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-city-" + suffix}>Town / city</label>
        <input id={"sample-city-" + suffix} name="city" defaultValue={address.city} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-county-" + suffix}>County / state</label>
        <input id={"sample-county-" + suffix} name="county" defaultValue={address.county} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-postcode-" + suffix}>Postcode / ZIP</label>
        <input id={"sample-postcode-" + suffix} name="postcode" defaultValue={address.postcode} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-country-" + suffix}>Country</label>
        <input id={"sample-country-" + suffix} name="country" required defaultValue={address.country} />
      </div>
      <div className="admin-field">
        <label htmlFor={"sample-market-" + suffix}>Market</label>
        <select id={"sample-market-" + suffix} name="market" defaultValue={sampleRequest?.market ?? "UK"}>
          <option value="UK">UK</option>
          <option value="US">US</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="admin-field sample-request-wide">
        <label htmlFor={"sample-tracking-" + suffix}>Tracking details</label>
        <textarea id={"sample-tracking-" + suffix} name="trackingDetails" rows={3} defaultValue={sampleRequest?.tracking_details ?? ""} placeholder="Courier, tracking number or dispatch notes" />
      </div>
      <label className="sample-request-check">
        <input name="sampleShipped" type="checkbox" defaultChecked={sampleRequest?.sample_shipped ?? false} />
        <span>Sample sent</span>
      </label>
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

      {visible.length === 0 ? <div className="admin-empty">No sample requests in this view.</div> : (
        <div className="sample-request-list">
          {visible.map((sampleRequest) => (
            <section key={sampleRequest.id} className={"admin-panel sample-request-card" + (sampleRequest.sample_shipped ? " is-sent" : "")}>
              <div className="admin-panel-head sample-request-card-head">
                <div>
                  <h2>{sampleRequest.business_name}</h2>
                  <p>{sampleRequest.contact_name} · {sampleRequest.market}</p>
                </div>
                <div className="sample-request-card-status">
                  <span className={"admin-status admin-status-" + (sampleRequest.sample_shipped ? "shipped" : "pending")}>{sampleRequest.sample_shipped ? "Sent" : "Awaiting dispatch"}</span>
                  {sampleRequest.reseller_application_id ? <Link to={"/admin/applications/" + sampleRequest.reseller_application_id}>View application</Link> : null}
                </div>
              </div>
              <Form method="post" className="admin-panel-body" aria-busy={busy}>
                <input type="hidden" name="intent" value="save" />
                <input type="hidden" name="id" value={sampleRequest.id} />
                <RequestFields sampleRequest={sampleRequest} />
                <div className="admin-actions"><button className="admin-primary" type="submit" disabled={busy}>Save changes</button></div>
              </Form>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
