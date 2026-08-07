import type {
  ActionFunctionArgs,
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { useState } from "react";
import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import portalStyles from "../styles/portal.css?url";
import { claimResellerAccount } from "../lib/reseller-auth.server";
import { createSupabaseServerClient, isSameOriginPost, privateNoStoreHeaders } from "../lib/supabase.server";
import { PortalEmblem, PortalField, PortalSplit } from "../components/portal/PortalSplit";
import { PasswordStrength } from "../components/portal/PasswordStrength";
import { evaluatePassword } from "../lib/password-policy";

type RegisterActionData = { error?: string; notice?: string };

export const links: LinksFunction = () => [{ rel: "stylesheet", href: portalStyles }];

export const meta: MetaFunction = () => [
  { title: "Set your trade portal password | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader(_: LoaderFunctionArgs) {
  return data(null, { headers: privateNoStoreHeaders() });
}

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) =>
  actionHeaders.has("Cache-Control") ? actionHeaders : loaderHeaders;

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) {
    return data<RegisterActionData>(
      { error: "That request could not be verified. Please try again." },
      { status: 403, headers: privateNoStoreHeaders() },
    );
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email || !password) {
    return data<RegisterActionData>(
      { error: "Enter the email address on your trade account and choose a password." },
      { status: 400, headers: privateNoStoreHeaders() },
    );
  }
  const strength = evaluatePassword(password, { email });
  if (!strength.isStrong) {
    return data<RegisterActionData>(
      { error: strength.message || "Please choose a stronger password." },
      { status: 400, headers: privateNoStoreHeaders() },
    );
  }
  if (password !== confirm) {
    return data<RegisterActionData>(
      { error: "Those two passwords do not match." },
      { status: 400, headers: privateNoStoreHeaders() },
    );
  }

  try {
    const { supabase, responseHeaders } = createSupabaseServerClient(request);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      // An existing auth user is not an error the visitor needs to decode.
      return data<RegisterActionData>(
        {
          error:
            "We could not set that password. If you have signed in before, use the sign-in page or reset your password.",
        },
        { status: 400, headers: responseHeaders },
      );
    }

    // Email confirmation on: no session yet, so nothing to claim until they confirm.
    if (!signUpData.session) {
      return data<RegisterActionData>(
        {
          notice:
            "Check your inbox — confirm your email address and then sign in to reach the trade portal.",
        },
        { headers: responseHeaders },
      );
    }

    const claimed = await claimResellerAccount(supabase);
    if (!claimed.ok) {
      await supabase.auth.signOut({ scope: "local" });
      return data<RegisterActionData>(
        {
          error:
            "There is no approved trade account for that email address yet. Apply first and we will be in touch.",
        },
        { status: 403, headers: responseHeaders },
      );
    }

    return redirect("/portal", { headers: responseHeaders });
  } catch (error) {
    console.error("Reseller registration failed", error instanceof Error ? error.message : "Unknown");
    return data<RegisterActionData>(
      { error: "The trade portal is not configured yet. Please contact us." },
      { status: 503, headers: privateNoStoreHeaders() },
    );
  }
}

export default function PortalRegister() {
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
      eyebrow="First sign-in"
      headline={<>You are <em>approved.</em></>}
      blurb="Choose a password and your trade account is ready — pricing, orders and launch assets."
    >
      <Form method="post" className="portal-form" data-form-id="portal_register" replace>
        <PortalEmblem />
        <h1>Set your password</h1>
        <p>Use the email address on your approved trade account.</p>

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
          id="email"
          name="email"
          label="Email address"
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
          id="password"
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
          id="confirm"
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
          {saving ? "Saving…" : "Set password"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
        </button>

        <p className="portal-divider">Already registered?</p>

        <p className="portal-note">
          <i aria-hidden="true">◆</i>
          <span>
            Already set up? <Link to="/portal/login">Sign in</Link>.
          </span>
        </p>
        <small>
          <i aria-hidden="true">✦</i>
          <span>Use at least 10 characters. We never see your password.</span>
        </small>
      </Form>
    </PortalSplit>
  );
}
