/**
 * Fire-and-forget bridge to the campaign engine in /api/lifecycle/trigger.
 *
 * The engine refuses to send unless the campaign is enabled in
 * shared/campaign-registry.js AND in email_campaigns AND EMAIL_LIVE_MODE is on.
 * Lifecycle email HTML is rendered from repository source; Resend is transport.
 */

export type ResellerTrigger =
  | "reseller_trial_request_received"
  | "reseller_order_request_received"
  | "reseller_application_internal_notice"
  | "reseller_approved"
  | "reseller_order_submitted"
  | "reseller_order_internal_notice"
  | "reseller_declined";

const CAMPAIGN_ID = "uk-reseller-lifecycle";

type Contact = {
  email: string;
  first_name?: string | null;
  business_name?: string | null;
  market?: string | null;
};

type EmitOptions = {
  trigger: ResellerTrigger;
  eventId: string;
  contact: Contact;
  context?: Record<string, unknown>;
};

function automationEndpoint() {
  const base = process.env.AUTOMATION_API_BASE_URL;
  const key = process.env.AUTOMATION_API_KEY;
  if (!base || !key) return null;
  return { url: `${base.replace(/\/$/, "")}/api/lifecycle/trigger`, key };
}

export async function emitResellerEvent({ trigger, eventId, contact, context = {} }: EmitOptions) {
  const endpoint = automationEndpoint();
  if (!endpoint) {
    console.info(`[reseller-events] ${trigger} not dispatched — automation API not configured.`);
    return { dispatched: false as const, reason: "not_configured" as const };
  }

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${endpoint.key}`,
      },
      body: JSON.stringify({
        campaign_id: CAMPAIGN_ID,
        trigger,
        event_id: eventId,
        contact,
        context,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[reseller-events] ${trigger} rejected (${response.status}): ${detail.slice(0, 200)}`);
      return { dispatched: false as const, reason: `http_${response.status}` as const };
    }

    return { dispatched: true as const };
  } catch (error) {
    console.warn(`[reseller-events] ${trigger} failed to dispatch:`, (error as Error).message);
    return { dispatched: false as const, reason: "network_error" as const };
  }
}

/** Never let an email problem break a form submission or an approval. */
export function emitResellerEventSafely(options: EmitOptions) {
  return emitResellerEvent(options).catch(() => ({ dispatched: false as const }));
}

/**
 * Professional-system internal operational notices have one controlled recipient.
 * Never source this from a deployment environment variable: a stale value could
 * silently redirect trade, sample or order notifications to the legacy domain.
 */
export const INTERNAL_NOTICE_ADDRESS = "matthew@jimmycoco.pro";
