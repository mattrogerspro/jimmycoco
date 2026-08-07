import { isPlausibleEmail, normaliseBusinessType, submitApplication } from "./resellers.server";
import {
  INTERNAL_NOTICE_ADDRESS,
  emitResellerEventSafely,
} from "./reseller-events.server";
import { isSameOriginPost } from "./supabase.server";

export type ApplicationActionResult =
  | { ok: true; reference: string }
  | { ok: false; message: string };

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
    return { ok: true, reference: "ignored" };
  }

  const businessName = String(form.get("salon") ?? "").trim();
  const contactName = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const businessType = normaliseBusinessType(form.get("type"));
  const message = String(form.get("order") ?? form.get("notes") ?? "").trim();

  if (!businessName || !contactName || !email) {
    return { ok: false, message: "Please give us your salon name, your name and an email address." };
  }
  if (!isPlausibleEmail(email)) {
    return { ok: false, message: "That email address does not look right — please check it." };
  }

  let applicationId: string;
  try {
    applicationId = await submitApplication({
      businessName,
      contactName,
      email,
      phone: phone || null,
      businessType,
      message: message || null,
      source: options.source,
      metadata: { user_agent: request.headers.get("User-Agent") ?? null },
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
    market: "UK",
  };

  await Promise.all([
    emitResellerEventSafely({
      trigger: "reseller_application_received",
      eventId: `reseller-application-${applicationId}-received`,
      contact,
      context: { SALON_NAME: businessName, CONTACT_NAME: contactName },
    }),
    emitResellerEventSafely({
      trigger: "reseller_application_internal_notice",
      eventId: `reseller-application-${applicationId}-internal`,
      contact: { email: INTERNAL_NOTICE_ADDRESS, business_name: "Sunless by Jimmy Coco", market: "UK" },
      context: {
        SALON_NAME: businessName,
        CONTACT_NAME: contactName,
        CONTACT_EMAIL: email,
        BUSINESS_TYPE: businessType,
        ADMIN_LINK: `${options.adminBaseUrl ?? ""}/admin/resellers`,
      },
    }),
  ]);

  return { ok: true, reference: applicationId };
}
