import { isPlausibleEmail, normaliseBusinessType, submitApplication } from "./resellers.server";
import {
  INTERNAL_NOTICE_ADDRESS,
  type ResellerTrigger,
  emitResellerEventSafely,
} from "./reseller-events.server";
import { isSameOriginPost } from "./supabase.server";
import {
  classifyUsTrialServiceability,
  isUsTrialAttribution,
  parseTrialAttribution,
} from "../../../shared/trial-journey.js";

export type ApplicationActionResult =
  | {
      ok: true;
      reference: string;
      market: "UK" | "US-West-Coast";
      serviceability: "not_applicable" | "eligible_area" | "outside_current_area";
      serviceState?: string;
    }
  | { ok: false; message: string };

function submittedFieldSnapshot(form: FormData) {
  const snapshot: Record<string, string | string[]> = {};
  for (const [key, value] of form.entries()) {
    if (key === "company_website") continue;
    if (typeof value !== "string") continue;
    const current = snapshot[key];
    if (Array.isArray(current)) snapshot[key] = [...current, value];
    else if (current !== undefined) snapshot[key] = [current, value];
    else snapshot[key] = value;
  }
  return snapshot;
}

function messageFrom(orderSummary: string, notes: string) {
  const parts = [];
  if (orderSummary) parts.push(orderSummary);
  if (notes) parts.push(`Customer notes:\n${notes}`);
  return parts.join("\n\n") || null;
}

function receivedTriggerFor(source: string): ResellerTrigger {
  return source === "pro-site-order"
    ? "reseller_order_request_received"
    : "reseller_trial_request_received";
}

function requestTypeFor(source: string) {
  return source === "pro-site-order" ? "Trade order request" : "Free sample request";
}

/**
 * Shared handler for the trade application forms on the home and product pages.
 * Returns a plain object so both routes can render inline success/error states.
 */
export async function handleApplicationSubmit(
  request: Request,
  options: { source: string; adminBaseUrl?: string } = { source: "pro-site" },
): Promise<ApplicationActionResult> {
  if (!isSameOriginPost(request)) {
    return { ok: false, message: "That request could not be verified. Please try again." };
  }

  const form = await request.formData();

  // Bots fill every field; humans never see this one.
  if (typeof form.get("company_website") === "string" && form.get("company_website") !== "") {
    return { ok: true, reference: "ignored", market: "UK", serviceability: "not_applicable" };
  }

  const businessName = String(form.get("salon") ?? "").trim();
  const contactName = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const businessType = normaliseBusinessType(form.get("type"));
  const orderSummary = String(form.get("order") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const attribution = parseTrialAttribution(form);
  const isUsJourney = isUsTrialAttribution(attribution);
  const market = isUsJourney ? "US-West-Coast" : "UK";
  const serviceState = String(form.get("service_state") ?? "").trim().toUpperCase();
  const usServiceability = isUsJourney ? classifyUsTrialServiceability(serviceState) : null;
  const message = messageFrom(orderSummary, notes);
  const submittedFields = submittedFieldSnapshot(form);
  const requestType = requestTypeFor(options.source);
  const isTradeOrderEnquiry = options.source === "pro-site-order";

  if (!businessName || !contactName || !email) {
    return { ok: false, message: "Please give us your salon name, your name and an email address." };
  }
  if (!isPlausibleEmail(email)) {
    return { ok: false, message: "That email address does not look right — please check it." };
  }
  if (isUsJourney && !/^[A-Z]{2}$/.test(serviceState)) {
    return { ok: false, message: "Please enter the two-letter abbreviation for your U.S. state." };
  }

  let applicationId: string;
  try {
    applicationId = await submitApplication({
      businessName,
      contactName,
      email,
      phone: phone || null,
      businessType,
      market,
      message,
      wantsTrial: !isTradeOrderEnquiry,
      source: attribution ? "email-outreach-trial" : options.source,
      metadata: {
        request_type: requestType,
        intake_type: isTradeOrderEnquiry ? "trade_order_enquiry" : "free_sample_request",
        submission_source: options.source,
        origin_campaign: attribution?.campaignId ?? null,
        origin_email: attribution?.emailStep ?? null,
        origin_market: attribution?.market ?? market,
        service_state: usServiceability?.state || null,
        serviceability_status: usServiceability?.status ?? "not_applicable",
        submitted_fields: submittedFields,
        user_agent: request.headers.get("User-Agent") ?? null,
      },
    });
  } catch (error) {
    console.error("Trade application failed", (error as Error).message);
    return {
      ok: false,
      message: "We could not save that just now. Please try again, or call us if it keeps happening.",
    };
  }

  const contact = {
    email,
    first_name: contactName.split(" ")[0] ?? null,
    business_name: businessName,
    market,
  };

  const applicantReceipt = isUsJourney
    ? Promise.resolve({ dispatched: false as const, reason: "us_trial_review_requires_market_specific_receipt" as const })
    : emitResellerEventSafely({
      trigger: receivedTriggerFor(options.source),
      eventId: `reseller-application-${applicationId}-received`,
      contact,
      context: {
        APPLICANT_NAME: contactName,
        BUSINESS_NAME: businessName,
        SALON_NAME: businessName,
        CONTACT_NAME: contactName,
        ORDER_SUMMARY: orderSummary || "No order summary submitted.",
        CUSTOMER_NOTES: notes || "None supplied.",
        ORIGIN_CAMPAIGN: attribution?.campaignId ?? "direct-site",
        ORIGIN_EMAIL: attribution?.emailStep ?? "none",
        ORIGIN_MARKET: attribution?.market ?? market,
        SERVICE_STATE: usServiceability?.state || "Not supplied",
        SERVICEABILITY_STATUS: usServiceability?.status ?? "not_applicable",
      },
    });

  await Promise.all([
    applicantReceipt,
    emitResellerEventSafely({
      trigger: "reseller_application_internal_notice",
      eventId: `reseller-application-${applicationId}-internal`,
      contact: { email: INTERNAL_NOTICE_ADDRESS, business_name: "Sunless by Jimmy Coco", market },
      context: {
        APPLICANT_NAME: contactName,
        APPLICANT_EMAIL: email,
        BUSINESS_NAME: businessName,
        SALON_NAME: businessName,
        CONTACT_NAME: contactName,
        CONTACT_EMAIL: email,
        BUSINESS_TYPE: businessType,
        REQUEST_TYPE: requestType,
        ORIGIN_CAMPAIGN: attribution?.campaignId ?? "direct-site",
        ORIGIN_EMAIL: attribution?.emailStep ?? "none",
        ORIGIN_MARKET: attribution?.market ?? market,
        SERVICE_STATE: usServiceability?.state || "Not supplied",
        SERVICEABILITY_STATUS: usServiceability?.status ?? "not_applicable",
        SUBMISSION_SUMMARY: message ?? "No notes or order summary submitted.",
        ADMIN_LINK: `${options.adminBaseUrl ?? ""}/admin/applications/${applicationId}`,
      },
    }),
  ]);

  return {
    ok: true,
    reference: applicationId,
    market,
    serviceability: usServiceability?.status === "outside_current_area" ? "outside_current_area" : usServiceability?.status === "eligible_area" ? "eligible_area" : "not_applicable",
    serviceState: usServiceability?.state || undefined,
  };
}
