import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import {
  approveApplication,
  getApplication,
  setApplicationStatus,
} from "../lib/resellers.server";
import { emitResellerEventSafely } from "../lib/reseller-events.server";
import { loadFollowUpHistory, startManualFollowUp, stopManualFollowUp, type FollowUpCampaignId } from "../lib/manual-follow-ups.server";
import { startUKTrialFollowUpManually } from "../lib/free-trial-email-integration.server";
import { getTradeDataVisibility } from "../lib/trade-data-settings.server";
import { SITE_URL } from "../lib/site";
import { ManualFollowUpPanel } from "../components/admin/ManualFollowUpPanel";

export const meta: MetaFunction = () => [
  { title: "Application | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const visibility = await getTradeDataVisibility(supabase);
  const application = await getApplication(supabase, params.applicationId as string, visibility);
  if (!application) throw new Response("Application not found", { status: 404, headers: responseHeaders });
  const followUpHistory = await loadFollowUpHistory(application.email);
  return data({ staff, application, followUpHistory }, { headers: responseHeaders });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const note = String(form.get("note") ?? "").trim() || undefined;
  const applicationId = params.applicationId as string;
  const visibility = await getTradeDataVisibility(supabase);

  try {
    if (intent === "start-follow-up") {
      const campaignId = String(form.get("campaignId") ?? "") as FollowUpCampaignId;
      if (!(["uk-pro-trial-follow-up", "uk-calculator-follow-up", "uk-pro-order-follow-up"] as FollowUpCampaignId[]).includes(campaignId)) throw new Error("Choose a valid manual follow-up campaign.");
      const application = await getApplication(supabase, applicationId, visibility);
      if (!application) throw new Error("Application not found.");
      if (application.market !== "UK") throw new Error("Manual follow-up campaigns are currently available for UK applications only.");
      if (application.status === "declined") throw new Error("A declined application cannot enter a promotional follow-up.");
      if (campaignId === "uk-pro-trial-follow-up" && !application.wants_trial) throw new Error("This application did not request a free trial.");
      if (campaignId === "uk-calculator-follow-up" && application.source !== "pro-site-calculator-report") throw new Error("Start the calculator follow-up from a calculator PDF request.");
      if (campaignId === "uk-pro-order-follow-up" && application.source !== "pro-site-order") throw new Error("Start the order follow-up from a website order enquiry or a confirmed order.");
      if (campaignId === "uk-pro-trial-follow-up") {
        await startUKTrialFollowUpManually({
          applicationId: application.id,
          email: application.email,
          contactName: application.contact_name,
          businessName: application.business_name,
          businessType: application.business_type,
          ownerUserId: staff.userId,
        });
      } else {
        const calculatorInputs = application.metadata?.calculator_inputs as Record<string, unknown> | undefined;
        const calculatorTotals = application.metadata?.calculator_totals as Record<string, unknown> | undefined;
        const isCalculator = campaignId === "uk-calculator-follow-up";
        const netMonth = Number(calculatorTotals?.netMonth);
        const litresPerMonth = Number(calculatorTotals?.litresPerMonth);
        const tansPerWeek = Number(calculatorInputs?.tansPerWeek);
        if (isCalculator && (![netMonth, litresPerMonth, tansPerWeek].every(Number.isFinite))) {
          throw new Error("This calculator request is missing the saved calculation required for follow-up personalisation.");
        }
        await startManualFollowUp({
          campaignId,
          sourceType: isCalculator ? "calculator_report" : "application",
          sourceId: application.id,
          owner: staff.userId,
          contact: { email: application.email, firstName: application.contact_name.split(" ")[0] ?? "there", businessName: application.business_name, market: "UK" },
          startAt: isCalculator ? new Date(Date.now() + 86_400_000).toISOString() : undefined,
          context: {
            APPLICATION_ID: application.id,
            APPLICATION_SOURCE: application.source,
            BUSINESS_TYPE: application.business_type,
            ...(isCalculator ? {
              MONTHLY_PROFIT: Number.isFinite(netMonth) ? `£${Math.round(netMonth).toLocaleString("en-GB")}` : null,
              LITRES_PER_MONTH: Number.isFinite(litresPerMonth) ? litresPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : null,
              TANS_PER_WEEK: Number.isFinite(tansPerWeek) ? String(tansPerWeek) : null,
            } : {}),
          },
        });
      }
      return data({ notice: "Manual follow-up enrolled. The campaign remains subject to its release gates." }, { headers: responseHeaders });
    }

    if (intent === "stop-follow-up") {
      const campaignId = String(form.get("campaignId") ?? "") as FollowUpCampaignId;
      if (!(["uk-pro-trial-follow-up", "uk-calculator-follow-up", "uk-pro-order-follow-up"] as FollowUpCampaignId[]).includes(campaignId)) throw new Error("Choose a valid manual follow-up campaign.");
      const application = await getApplication(supabase, applicationId, visibility);
      if (!application) throw new Error("Application not found.");
      await stopManualFollowUp({
        campaignId,
        sourceType: "application",
        sourceId: application.id,
        owner: staff.userId,
        email: application.email,
        reason: String(form.get("reason") ?? "manual_suppression"),
      });
      return data({ notice: "Manual follow-up stopped. No future promotional steps will be sent from that enrollment." }, { headers: responseHeaders });
    }

    if (intent === "approve") {
      const application = await getApplication(supabase, applicationId, visibility);
      if (!application) throw new Error("Application not found.");
      const tier = String(form.get("pricingTier") ?? "standard") as "standard" | "silver" | "gold";
      const discount = Number.parseFloat(String(form.get("discountPercent") ?? "0")) || 0;
      const reseller = await approveApplication(supabase, applicationId, staff.userId, {
        pricingTier: tier,
        discountPercent: discount,
        note,
      });
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
      return data({ notice: `Approved — account ${reseller.account_code} created.` }, { headers: responseHeaders });
    }

    if (intent === "decline" || intent === "on_hold") {
      const application = await getApplication(supabase, applicationId, visibility);
      if (!application) throw new Error("Application not found.");
      const status = intent === "decline" ? "declined" : "on_hold";
      const app = await setApplicationStatus(supabase, applicationId, status, staff.userId, note);
      if (status === "declined") {
        await emitResellerEventSafely({
          trigger: "reseller_declined",
          eventId: `reseller-application-${applicationId}-declined`,
          contact: {
            email: app.email,
            first_name: app.contact_name.split(" ")[0] ?? null,
            business_name: app.business_name,
            market: app.market,
          },
          context: { SALON_NAME: app.business_name, CONTACT_NAME: app.contact_name },
        });
      }
      return data(
        { notice: status === "declined" ? "Application declined." : "Application put on hold." },
        { headers: responseHeaders },
      );
    }

    return data({ error: "Unknown action." }, { status: 400, headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 500, headers: responseHeaders });
  }
}

export default function ApplicationDetail() {
  const { application, followUpHistory } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const decided = application.status !== "pending";
  const originCampaign = String(application.metadata.origin_campaign || "Direct site");
  const originEmail = String(application.metadata.origin_email || "—");
  const serviceability = String(application.metadata.serviceability_status || "not_applicable");
  const serviceState = String(application.metadata.service_state || "—");

  return (
    <main className="admin-main">
      <p className="admin-crumb">
        <Link to="/admin/resellers">← Applications</Link>
      </p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade application</p>
          <h1>{application.business_name}</h1>
          <p>
            Received {new Date(application.created_at).toLocaleString("en-GB")} ·{" "}
            <span className={`admin-status admin-status-${application.status}`}>{application.status}</span>
          </p>
        </div>
      </header>

      {result?.error ? <p className="admin-alert" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="admin-alert admin-alert-ok" role="status">{result.notice}</p> : null}

      <div className="admin-split">
        <div>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Applicant</h2></div>
            <dl className="admin-dl">
              <div><dt>Business</dt><dd>{application.business_name}</dd></div>
              <div><dt>Contact</dt><dd>{application.contact_name}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${application.email}`}>{application.email}</a></dd></div>
              <div><dt>Phone</dt><dd>{application.phone || "—"}</dd></div>
              <div><dt>Business type</dt><dd>{application.business_type}</dd></div>
              <div><dt>Market</dt><dd>{application.market}</dd></div>
              <div><dt>Website</dt><dd>{application.website || "—"}</dd></div>
              <div><dt>Instagram</dt><dd>{application.instagram || "—"}</dd></div>
              <div><dt>Wants trial</dt><dd>{application.wants_trial ? "Yes" : "No"}</dd></div>
              <div><dt>Source</dt><dd>{application.source}</dd></div>
              <div><dt>Origin campaign</dt><dd>{originCampaign}</dd></div>
              <div><dt>Origin email</dt><dd>{originEmail}</dd></div>
              <div><dt>Service state</dt><dd>{serviceState}</dd></div>
              <div><dt>Serviceability</dt><dd>{serviceability.replaceAll("_", " ")}</dd></div>
            </dl>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><h2>What they told us</h2></div>
            <div className="admin-prose">
              {application.message ? <p>{application.message}</p> : <p className="admin-muted">No message was left.</p>}
            </div>
          </section>

          {application.review_note ? (
            <section className="admin-panel">
              <div className="admin-panel-head"><h2>Review note</h2></div>
              <div className="admin-prose"><p>{application.review_note}</p></div>
            </section>
          ) : null}
        </div>

        <aside>
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Decision</h2></div>
            <div className="admin-panel-body">
              {decided ? (
                <p className="admin-muted">
                  Already {application.status}
                  {application.reviewed_at ? ` on ${new Date(application.reviewed_at).toLocaleDateString("en-GB")}` : ""}.
                </p>
              ) : null}

              <Form method="post" replace>
                <div className="admin-field">
                  <label htmlFor="pricingTier">Pricing tier on approval</label>
                  <select id="pricingTier" name="pricingTier" defaultValue="standard">
                    <option value="standard">Standard</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="discountPercent">Discount off trade (%)</label>
                  <input id="discountPercent" name="discountPercent" type="number" min={0} max={90} step="0.5" defaultValue={0} />
                </div>
                <div className="admin-field">
                  <label htmlFor="note">Internal note</label>
                  <textarea id="note" name="note" rows={3} placeholder="Why this decision — visible to staff only." />
                </div>
                <div className="admin-actions">
                  <button className="admin-primary" name="intent" value="approve" type="submit" disabled={busy}>
                    Approve &amp; create account
                  </button>
                  <button name="intent" value="on_hold" type="submit" disabled={busy}>Put on hold</button>
                  <button className="admin-danger" name="intent" value="decline" type="submit" disabled={busy}>Decline</button>
                </div>
              </Form>
              <p className="admin-hint">
                Approving creates the trade account and fires the welcome email. Declining fires the
                close email. Hold changes the status and sends nothing.
              </p>
            </div>
          </section>
          {application.wants_trial ? (
            <ManualFollowUpPanel
              campaignId="uk-pro-trial-follow-up"
              label="Trial follow-up"
              sourceLabel="trial application"
              eligible={application.market === "UK" && application.status !== "declined"}
              ineligibleReason={application.status === "declined" ? "Declined applications cannot enter a follow-up." : "This follow-up is currently available for UK applications only."}
              history={followUpHistory}
              busy={busy}
            />
          ) : null}
          {application.source === "pro-site-calculator-report" ? (
            <ManualFollowUpPanel
              campaignId="uk-calculator-follow-up"
              label="Calculator PDF follow-up"
              sourceLabel="calculator PDF request"
              eligible={application.market === "UK" && application.status !== "declined"}
              ineligibleReason={application.status === "declined" ? "Declined applications cannot enter a follow-up." : "This follow-up is currently available for UK calculator requests only."}
              history={followUpHistory}
              busy={busy}
            />
          ) : null}
          {application.source === "pro-site-order" ? (
            <ManualFollowUpPanel
              campaignId="uk-pro-order-follow-up"
              label="Order follow-up"
              sourceLabel="website order enquiry"
              eligible={application.market === "UK" && application.status !== "declined"}
              ineligibleReason={application.status === "declined" ? "Declined applications cannot enter a follow-up." : "This follow-up is currently available for UK order enquiries only."}
              history={followUpHistory}
              busy={busy}
            />
          ) : null}
        </aside>
      </div>
    </main>
  );
}
