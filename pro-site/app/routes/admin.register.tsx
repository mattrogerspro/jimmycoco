import type {
  ActionFunctionArgs,
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { useState } from "react";
import { Form, Link, data, useActionData, useNavigation } from "react-router";
import portalStyles from "../styles/portal.css?url";
import { PortalEmblem, PortalField, PortalSplit } from "../components/portal/PortalSplit";
import { PasswordStrength } from "../components/portal/PasswordStrength";
import { sendAdminAccessRequestNotification } from "../lib/admin-access-notification.server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  isSameOriginPost,
  privateNoStoreHeaders,
} from "../lib/supabase.server";
import { absoluteUrl } from "../lib/site";
import { evaluatePassword } from "../lib/password-policy";

type RegisterActionData = { error?: string; notice?: string };

type RecordedRequest = {
  request_id: string;
  was_created: boolean;
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: portalStyles }];

export const meta: MetaFunction = () => [
  { title: "Request PRO admin access | Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader(_: LoaderFunctionArgs) {
  return data(null, { headers: privateNoStoreHeaders() });
}

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) =>
  actionHeaders.has("Cache-Control") ? actionHeaders : loaderHeaders;

function invalidRequest(message: string, status = 400) {
  return data<RegisterActionData>({ error: message }, { status, headers: privateNoStoreHeaders() });
}

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) {
    return invalidRequest("That registration request could not be verified. Please try again.", 403);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email || !password) {
    return invalidRequest("Enter your work email address and choose a strong password.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalidRequest("Enter a valid email address.");
  }

  const strength = evaluatePassword(password, { email });
  if (!strength.isStrong) {
    return invalidRequest(strength.message || "Please choose a stronger password.");
  }
  if (password !== confirm) {
    return invalidRequest("Those two passwords do not match.");
  }

  try {
    const { supabase, responseHeaders } = createSupabaseServerClient(request);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This is intentionally a fixed first-party URL, not a submitted value.
        emailRedirectTo: absoluteUrl("/admin/register"),
      },
    });

    if (signUpError || !signUpData.user) {
      // Do not disclose whether a particular email address already has an account.
      return data<RegisterActionData>(
        { notice: "If this email can be registered, check your inbox to verify it. Admin access is granted only after manual approval." },
        { headers: responseHeaders },
      );
    }

    const service = createSupabaseServiceClient();
    const { data: recordedRequests, error: requestError } = await service.rpc(
      "record_admin_access_request",
      { p_auth_user_id: signUpData.user.id, p_email: email },
    );
    const recorded = (recordedRequests as RecordedRequest[] | null)?.[0];

    if (requestError || !recorded?.request_id) {
      console.error("Could not record PRO admin access request", requestError?.message ?? "No request id returned");
      return data<RegisterActionData>(
        { error: "Your request could not be completed. Please contact Jimmy Coco Professional support." },
        { status: 503, headers: responseHeaders },
      );
    }

    if (recorded.was_created) {
      try {
        const { resendId } = await sendAdminAccessRequestNotification({
          requestId: recorded.request_id,
          email,
        });
        const { error: notificationAuditError } = await service
          .from("admin_access_requests")
          .update({
            internal_notification_sent_at: new Date().toISOString(),
            internal_notification_resend_id: resendId,
          })
          .eq("id", recorded.request_id);

        if (notificationAuditError) {
          console.error("Could not save internal access-request notification audit", notificationAuditError.message);
        }
      } catch (notificationError) {
        console.error(
          "Could not notify the access reviewer",
          notificationError instanceof Error ? notificationError.message : "Unknown notification error",
        );
      }
    }

    return data<RegisterActionData>(
      {
        notice: signUpData.session
          ? "Your access request has been received. An Administrator must approve it before you can use the PRO admin area."
          : "Check your inbox to verify your email address. Your access request is pending manual Administrator approval.",
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("PRO admin registration failed", error instanceof Error ? error.message : "Unknown error");
    return data<RegisterActionData>(
      { error: "Registration is temporarily unavailable. Please contact Jimmy Coco Professional support." },
      { status: 503, headers: privateNoStoreHeaders() },
    );
  }
}

export default function AdminRegister() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const strength = evaluatePassword(password, { email });
  const matches = password.length > 0 && password === confirm;
  const canSubmit = strength.isStrong && matches && !saving;

  return (
    <PortalSplit
      eyebrow="Private professional workspace"
      headline={<>Request <em>access.</em></>}
      blurb="Email verification and manual Administrator approval are both required before the PRO admin workspace becomes available."
    >
      <Form method="post" className="portal-form" data-form-id="admin_register" replace>
        <PortalEmblem />
        <h1>Request admin access</h1>
        <p>Use your work email address. You cannot choose your own privileges.</p>

        {actionData?.error ? (
          <p className="portal-alert alert-error" role="alert">
            {actionData.error}
          </p>
        ) : null}
        {actionData?.notice ? (
          <p className="portal-alert alert-ok" role="status">
            {actionData.notice}
          </p>
        ) : null}

        <PortalField
          id="admin-register-email"
          name="email"
          label="Work email address"
          type="email"
          icon="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PortalField
          id="admin-register-password"
          name="password"
          label="Choose a password"
          type="password"
          icon="lock"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <PasswordStrength password={password} email={email} />

        <PortalField
          id="admin-register-confirm"
          name="confirm"
          label="Confirm password"
          type="password"
          icon="shield"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        {confirm.length > 0 && !matches ? (
          <p className="pw-mismatch" role="alert">Those two passwords do not match.</p>
        ) : null}

        <button className="portal-btn portal-btn-wide" type="submit" disabled={!canSubmit}>
          {saving ? "Requesting access…" : "Request access"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
        </button>

        <p className="portal-divider">Already registered?</p>
        <p className="portal-note">
          <i aria-hidden="true">◆</i>
          <span><Link to="/admin/login">Sign in to the PRO admin workspace</Link>.</span>
        </p>
        <small>
          <i aria-hidden="true">✦</i>
          <span>Verification alone does not grant access. An Administrator assigns either Admin or Editor privileges.</span>
        </small>
      </Form>
    </PortalSplit>
  );
}
