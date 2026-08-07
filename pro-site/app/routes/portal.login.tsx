import type {
  ActionFunctionArgs,
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Form, Link, data, redirect, useActionData, useNavigation, useSearchParams } from "react-router";
import portalStyles from "../styles/portal.css?url";
import { claimResellerAccount, safePortalDestination } from "../lib/reseller-auth.server";
import { createSupabaseServerClient, isSameOriginPost, privateNoStoreHeaders } from "../lib/supabase.server";
import { PortalEmblem, PortalField, PortalSplit } from "../components/portal/PortalSplit";

type LoginActionData = { error: string };

export const links: LinksFunction = () => [{ rel: "stylesheet", href: portalStyles }];

export const meta: MetaFunction = () => [
  { title: "Trade portal sign in | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader(_: LoaderFunctionArgs) {
  return data(null, { headers: privateNoStoreHeaders() });
}

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) =>
  actionHeaders.has("Cache-Control") ? actionHeaders : loaderHeaders;

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) {
    return data<LoginActionData>(
      { error: "That sign-in request could not be verified. Please try again." },
      { status: 403, headers: privateNoStoreHeaders() },
    );
  }

  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safePortalDestination(formData.get("next"));

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return data<LoginActionData>(
      { error: "Enter your email address and password." },
      { status: 400, headers: privateNoStoreHeaders() },
    );
  }

  try {
    const { supabase, responseHeaders } = createSupabaseServerClient(request);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !authData.user) {
      return data<LoginActionData>(
        { error: "That email address or password was not accepted." },
        { status: 400, headers: responseHeaders },
      );
    }

    // Binds first-time sign-ins to their approved account; a no-op afterwards.
    const claimed = await claimResellerAccount(supabase);
    if (!claimed.ok) {
      await supabase.auth.signOut({ scope: "local" });
      return data<LoginActionData>(
        {
          error:
            "That sign-in worked, but there is no approved trade account for this email address yet.",
        },
        { status: 403, headers: responseHeaders },
      );
    }

    return redirect(next, { headers: responseHeaders });
  } catch (error) {
    console.error("Reseller sign-in failed", error instanceof Error ? error.message : "Unknown error");
    return data<LoginActionData>(
      { error: "The trade portal is not configured yet. Please contact us." },
      { status: 503, headers: privateNoStoreHeaders() },
    );
  }
}

export default function PortalLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const signingIn = navigation.state === "submitting";
  const reason = searchParams.get("reason");

  return (
    <PortalSplit
      eyebrow="Stockist access"
      headline={<>Welcome <em>back.</em></>}
      blurb="Your trade pricing, your order history and everything you need to reorder — in one place."
    >
      <Form method="post" className="portal-form" data-form-id="portal_login" replace>
        <PortalEmblem />
        <h1>Sign in</h1>
        <p>For approved Jimmy Coco stockists.</p>

        {reason === "unlinked" ? (
          <p className="portal-alert alert-error" role="alert">
            We could not match your sign-in to an approved trade account.
          </p>
        ) : null}
        {reason === "suspended" ? (
          <p className="portal-alert alert-error" role="alert">
            This trade account is not active. Please get in touch and we will sort it out.
          </p>
        ) : null}
        {actionData?.error ? (
          <p className="portal-alert alert-error" role="alert">
            {actionData.error}
          </p>
        ) : null}

        <PortalField id="email" name="email" label="Email address" type="email" icon="email" autoComplete="email" inputMode="email" required autoFocus />
        <PortalField id="password" name="password" label="Password" type="password" icon="lock" autoComplete="current-password" required />

        <input type="hidden" name="next" value={searchParams.get("next") ?? "/portal"} />

        <button className="portal-btn portal-btn-wide" type="submit" disabled={signingIn}>
          {signingIn ? "Signing in…" : "Sign in"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
        </button>

        <p className="portal-divider">Need help?</p>

        <p className="portal-note">
          <i aria-hidden="true">◆</i>
          <span>
            Approved but never signed in? <Link to="/portal/register">Set your password</Link>.
          </span>
        </p>
        <p className="portal-note">
          <i aria-hidden="true">✦</i>
          <span>
            Not a stockist yet? <Link to="/#trial">Apply for a trade account</Link>.
          </span>
        </p>
      </Form>
    </PortalSplit>
  );
}
