export const FOLLOW_UP_CAMPAIGN_IDS = ["uk-pro-trial-follow-up", "uk-pro-order-follow-up"] as const;
export type FollowUpCampaignId = (typeof FOLLOW_UP_CAMPAIGN_IDS)[number];
export type FollowUpSourceType = "application" | "order";

export type FollowUpEnrollment = {
  id: string;
  campaign_id: FollowUpCampaignId;
  status: "active" | "completed" | "exited" | "paused" | "needs_attention";
  next_step: number;
  enrolled_at: string;
  next_send_at: string | null;
  exited_at: string | null;
  exit_reason: string | null;
  owner: string | null;
  context: Record<string, unknown>;
};

export type FollowUpMessage = {
  id: string;
  enrollment_id: string | null;
  campaign_id: FollowUpCampaignId;
  step_key: string;
  step_number: number;
  status: string;
  subject: string;
  queued_at: string;
  sent_at: string | null;
};

export type FollowUpHistory = {
  configured: boolean;
  unavailableReason?: "not_configured" | "request_failed";
  enrollments: FollowUpEnrollment[];
  messages: FollowUpMessage[];
};

type Contact = {
  email: string;
  firstName: string;
  businessName: string;
  market: "UK";
};

function endpoint(path: string) {
  const base = process.env.AUTOMATION_API_BASE_URL;
  const key = process.env.AUTOMATION_API_KEY;
  if (!base || !key) return null;
  return { url: `${base.replace(/\/$/, "")}${path}`, key };
}

async function callAutomation<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const configured = endpoint(path);
  if (!configured) throw new Error("manual_follow_up_service_not_configured");
  const response = await fetch(configured.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${configured.key}` },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `manual_follow_up_service_http_${response.status}`);
  return payload;
}

export async function loadFollowUpHistory(email: string): Promise<FollowUpHistory> {
  if (!endpoint("/api/campaigns/history")) {
    return { configured: false, unavailableReason: "not_configured", enrollments: [], messages: [] };
  }
  try {
    const payload = await callAutomation<{ enrollments?: FollowUpEnrollment[]; messages?: FollowUpMessage[] }>("/api/campaigns/history", {
      email,
      campaign_ids: FOLLOW_UP_CAMPAIGN_IDS,
    });
    return { configured: true, enrollments: payload.enrollments ?? [], messages: payload.messages ?? [] };
  } catch (error) {
    console.warn("[manual-follow-ups] history unavailable:", (error as Error).message);
    return { configured: false, unavailableReason: "request_failed", enrollments: [], messages: [] };
  }
}

export async function startManualFollowUp(input: {
  campaignId: FollowUpCampaignId;
  sourceType: FollowUpSourceType;
  sourceId: string;
  owner: string;
  contact: Contact;
  context?: Record<string, unknown>;
}) {
  return callAutomation<{ enrollment_id: string; status: string; next_send_at: string | null }>("/api/campaigns/enroll", {
    campaign_id: input.campaignId,
    event_id: `manual-follow-up/${input.campaignId}/${input.sourceType}/${input.sourceId}`,
    source_type: input.sourceType,
    source_id: input.sourceId,
    owner: input.owner,
    email: input.contact.email,
    first_name: input.contact.firstName,
    business_name: input.contact.businessName,
    market: input.contact.market,
    context: {
      FIRST_NAME: input.contact.firstName || "there",
      BUSINESS_NAME: input.contact.businessName || "your business",
      SOURCE_TYPE: input.sourceType,
      SOURCE_ID: input.sourceId,
      ...input.context,
    },
  });
}

export async function stopManualFollowUp(input: {
  campaignId: FollowUpCampaignId;
  sourceType: FollowUpSourceType;
  sourceId: string;
  owner: string;
  email: string;
  reason: string;
}) {
  return callAutomation<{ stopped: number }>("/api/campaigns/stop", {
    campaign_id: input.campaignId,
    event_id: `manual-follow-up-stop/${input.campaignId}/${input.sourceType}/${input.sourceId}`,
    source_type: input.sourceType,
    source_id: input.sourceId,
    owner: input.owner,
    email: input.email,
    reason: input.reason,
  });
}
