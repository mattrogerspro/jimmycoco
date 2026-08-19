import { startManualFollowUp } from "./manual-follow-ups.server";
import { emitResellerEventSafely } from "./reseller-events.server";

/**
 * Server-only integration contract for a free-trial application.
 *
 * The transactional welcome is emitted through the existing lifecycle service,
 * which owns the live-send, Resend-template and audit-copy safeguards. The
 * promotional Trial Follow-Up is intentionally separate and must be started by
 * a member of staff from the Pro admin; it is never called automatically here.
 */
export type FreeTrialWelcomeInput = {
  applicationId: string;
  email: string;
  contactName: string;
  businessName: string;
  businessType: string;
};

export type ManualTrialFollowUpInput = FreeTrialWelcomeInput & {
  ownerUserId: string;
};

function firstName(contactName: string) {
  return contactName.trim().split(/\s+/)[0] || "there";
}

/**
 * Queues the existing free-sample receipt through the lifecycle service.
 * It is idempotent per application and does not enroll any promotional sequence.
 */
export function queueFreeTrialWelcome(input: FreeTrialWelcomeInput) {
  return emitResellerEventSafely({
    trigger: "reseller_trial_request_received",
    eventId: `reseller-application-${input.applicationId}-received`,
    contact: {
      email: input.email,
      first_name: firstName(input.contactName),
      business_name: input.businessName,
      market: "UK",
    },
    context: {
      APPLICANT_NAME: input.contactName,
      BUSINESS_NAME: input.businessName,
      SALON_NAME: input.businessName,
      CONTACT_NAME: input.contactName,
      BUSINESS_TYPE: input.businessType,
      REQUEST_TYPE: "Free sample request",
    },
  });
}

/**
 * Starts the separately approved promotional Trial Follow-Up only after an
 * administrator chooses the in-page action. The campaign API enforces its own
 * registry and Supabase enabled gates before an enrollment can be created.
 */
export function startUKTrialFollowUpManually(input: ManualTrialFollowUpInput) {
  return startManualFollowUp({
    campaignId: "uk-pro-trial-follow-up",
    sourceType: "application",
    sourceId: input.applicationId,
    owner: input.ownerUserId,
    contact: {
      email: input.email,
      firstName: firstName(input.contactName),
      businessName: input.businessName,
      market: "UK",
    },
    context: {
      APPLICATION_ID: input.applicationId,
      BUSINESS_TYPE: input.businessType,
      REQUEST_TYPE: "Free sample request",
    },
  });
}
