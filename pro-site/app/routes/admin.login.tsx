import type {
  ActionFunctionArgs,
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import adminStyles from "../styles/admin.css?url";
import portalStyles from "../styles/portal.css?url";
import { PortalEmblem, PortalField, PortalSplit } from "../components/portal/PortalSplit";
import { safeAdminDestination } from "../lib/article-auth.server";
import {
  createSupabaseServerClient,
  isSameOriginPost,
  privateNoStoreHeaders,
} from "../lib/supabase.server";

type LoginActionData = { error: string };

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: adminStyles },
  { rel: "stylesheet", href: portalStyles },
];

export const meta: MetaFunction = () => [
  { title: "Article admin | Sunless by Jimmy Coco" },
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
  const next = safeAdminDestination(formData.get("next"));

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
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

    const { data: profile, error: profileError } = await supabase
      .from("article_admin_profiles")
      .select("role, is_active")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile?.is_active ||
      !["admin", "editor"].includes(profile.role)
    ) {
      await supabase.auth.signOut({ scope: "local" });
      return data<LoginActionData>(
        { error: "This account does not have access to the article workspace." },
        { status: 403, headers: responseHeaders },
      );
    }

    return redirect(next, { headers: responseHeaders });
  } catch (error) {
    console.error(
      "Article admin sign-in failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return data<LoginActionData>(
      { error: "Article admin is not configured yet. Please contact an administrator." },
      { status: 503, headers: privateNoStoreHeaders() },
    );
  }
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const signingIn = navigation.state === "submitting";
  const accessRemoved = searchParams.get("reason") === "inactive";

  return (
    <PortalSplit
      eyebrow="Private publishing workspace"
      headline={<>Welcome <em>back.</em></>}
      blurb="The Jimmy Coco admin — articles, media, trade applications and stockist orders."
    >
      <Form method="post" className="portal-form" data-form-id="admin_login" replace>
        <PortalEmblem />
        <h1 id="admin-login-title">Sign in</h1>
        <p>Sign in with the account assigned to you by an administrator.</p>

        {actionData?.error || accessRemoved ? (
          <p className="portal-alert alert-error" role="alert">
            {actionData?.error ?? "Your article access is inactive. Contact an administrator."}
          </p>
        ) : null}

        <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />

        <PortalField id="admin-email" name="email" label="Email address" type="email" icon="email" autoComplete="username" inputMode="email" required autoFocus />
        <PortalField id="admin-password" name="password" label="Password" type="password" icon="lock" autoComplete="current-password" required />

        <button className="portal-btn portal-btn-wide" type="submit" disabled={signingIn}>
          {signingIn ? "Signing in…" : "Sign in securely"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
        </button>

        <p className="portal-divider">Staff only</p>

        <p className="portal-note">
          <i aria-hidden="true">◆</i>
          <span>Access is limited to approved Jimmy Coco administrators and editors.</span>
        </p>
        <p className="portal-note">
          <i aria-hidden="true">✦</i>
          <span>
            <Link to="/">Return to the professional website</Link>
          </span>
        </p>
      </Form>
    </PortalSplit>
  );
}
