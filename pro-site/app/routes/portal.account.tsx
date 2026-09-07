import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireReseller } from "../lib/reseller-auth.server";
import { updatePortalBusinessDetails } from "../lib/reseller-profile.server";
import { isSameOriginPost } from "../lib/supabase.server";

type ActionData = { error?: string; notice?: string };

export const meta: MetaFunction = () => [
  { title: "Account details | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { responseHeaders, reseller } = await requireReseller(request);
  return data({ reseller }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { responseHeaders, reseller } = await requireReseller(request);
  if (!isSameOriginPost(request)) {
    return data<ActionData>({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  try {
    await updatePortalBusinessDetails(
      { resellerId: reseller.id, userId: reseller.user_id },
      await request.formData(),
    );
    return data<ActionData>({ notice: "Account details saved." }, { headers: responseHeaders });
  } catch (error) {
    return data<ActionData>({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

export default function PortalAccount() {
  const { reseller } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  return (
    <main className="portal-main">
      <header className="portal-page-head">
        <div>
          <p className="portal-eyebrow">Account record</p>
          <h1>Account details</h1>
          <p>Review your Jimmy Coco trade account and keep your contact details current.</p>
        </div>
        <span className={`portal-pill pill-${reseller.status}`}>{reseller.status}</span>
      </header>

      {result?.error ? <p className="portal-alert alert-error" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="portal-alert alert-ok" role="status">{result.notice}</p> : null}

      <div className="portal-details-grid">
        <section className="portal-panel">
          <div className="portal-panel-head">
            <div>
              <p className="portal-eyebrow">Your profile</p>
              <h2>Business and contact</h2>
            </div>
          </div>
          <div className="portal-panel-body">
            <Form method="post" replace className="portal-edit-form">
              <div className="portal-field-grid">
                <label className="portal-edit-field portal-field-wide" htmlFor="businessName">
                  <span>Business name</span>
                  <input id="businessName" name="businessName" maxLength={200} required defaultValue={reseller.business_name} />
                </label>
                <label className="portal-edit-field" htmlFor="contactName">
                  <span>Primary contact</span>
                  <input id="contactName" name="contactName" maxLength={200} required defaultValue={reseller.contact_name} />
                </label>
                <label className="portal-edit-field" htmlFor="phone">
                  <span>Phone</span>
                  <input id="phone" name="phone" type="tel" maxLength={60} autoComplete="tel" defaultValue={reseller.phone ?? ""} />
                </label>
              </div>
              <div className="portal-form-actions">
                <button className="portal-primary" type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save account details"}
                </button>
              </div>
            </Form>
          </div>
        </section>

        <aside className="portal-panel">
          <div className="portal-panel-head">
            <div>
              <p className="portal-eyebrow">Managed account</p>
              <h2>Trade settings</h2>
            </div>
          </div>
          <dl className="portal-dl">
            <div><dt>Account code</dt><dd>{reseller.account_code}</dd></div>
            <div><dt>Email / sign-in</dt><dd>{reseller.email}</dd></div>
            <div><dt>Market</dt><dd>{reseller.market}</dd></div>
            <div><dt>Pricing tier</dt><dd className="portal-capitalize">{reseller.pricing_tier}</dd></div>
            <div><dt>Account discount</dt><dd>{Number(reseller.discount_percent)}%</dd></div>
            <div><dt>Approved</dt><dd>{reseller.approved_at ? new Date(reseller.approved_at).toLocaleDateString("en-GB") : "—"}</dd></div>
            <div><dt>Created</dt><dd>{new Date(reseller.created_at).toLocaleDateString("en-GB")}</dd></div>
          </dl>
          <p className="portal-panel-hint">
            Contact Jimmy Coco support to change the sign-in email, market, pricing or account status.
          </p>
        </aside>
      </div>
    </main>
  );
}
