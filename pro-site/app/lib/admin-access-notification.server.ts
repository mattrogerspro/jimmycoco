import { absoluteUrl } from "./site";

const INTERNAL_ACCESS_REVIEWER = "matthew@jimmycoco.pro";
const DEFAULT_FROM = "Jimmy Coco Professional <partnerships@email.jimmycoco.pro>";
const DEFAULT_REPLY_TO = "partnerships@email.jimmycoco.pro";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

export type AdminAccessRequestNotification = {
  requestId: string;
  email: string;
};

/**
 * Sends an operational alert for a new PRO admin access request. This is
 * deliberately separate from the marketing/lifecycle email bridge: it sends
 * no customer email and never enrols a contact in a sequence.
 */
export async function sendAdminAccessRequestNotification({
  requestId,
  email,
}: AdminAccessRequestNotification) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Internal access-request notification is not configured. Set RESEND_API_KEY first.");
  }

  const reviewUrl = absoluteUrl("/admin/access-requests");
  const safeEmail = escapeHtml(email);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `admin-access-request-${requestId}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [INTERNAL_ACCESS_REVIEWER],
      reply_to: process.env.RESEND_REPLY_TO || DEFAULT_REPLY_TO,
      subject: "New Jimmy Coco PRO access request",
      html: `<!doctype html><html lang="en"><body style="margin:0;background:#f5f1ec;color:#1e1a17;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px 18px"><section style="background:#fff;padding:34px;border-top:5px solid #9a6038"><p style="margin:0 0 18px;color:#756e68;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Jimmy Coco Professional</p><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:400">New access request</h1><p style="margin:0;color:#514a45;line-height:1.6"><strong>${safeEmail}</strong> has registered for Jimmy Coco PRO admin access.</p><p style="margin:18px 0 0;color:#514a45;line-height:1.6">Verify the request, choose <strong>Admin</strong> or <strong>Editor</strong>, then approve or decline it in the protected access-request screen.</p><p style="margin:26px 0 0"><a href="${reviewUrl}" style="display:inline-block;padding:12px 18px;background:#98603a;color:#fffdf9;text-decoration:none;font-weight:700">Review access request</a></p></section></main></body></html>`,
      text: `${email} has registered for Jimmy Coco PRO admin access.\n\nReview the request and assign Admin or Editor privileges: ${reviewUrl}`,
      tags: [
        { name: "type", value: "admin_access_request" },
        { name: "access_request_id", value: requestId },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!response.ok || !payload.id) {
    throw new Error(
      `Could not send access-request notification: ${payload.message ?? payload.name ?? `Resend returned ${response.status}`}`,
    );
  }

  return { resendId: payload.id };
}
