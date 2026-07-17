import { redirect } from "react-router";
import { createSupabaseServerClient } from "./supabase.server";

export type ArticleRole = "admin" | "editor";

export type ArticleStaff = {
  userId: string;
  email: string;
  displayName: string;
  role: ArticleRole;
};

function loginRedirectUrl(request: Request, reason?: "inactive") {
  const requestUrl = new URL(request.url);
  const params = new URLSearchParams();
  const next = `${requestUrl.pathname}${requestUrl.search}`;

  if (requestUrl.pathname !== "/admin" && requestUrl.pathname !== "/admin/login") {
    params.set("next", next);
  }
  if (reason) params.set("reason", reason);

  const query = params.toString();
  return `/admin/login${query ? `?${query}` : ""}`;
}

export async function requireArticleStaff(
  request: Request,
  allowedRoles: readonly ArticleRole[] = ["admin", "editor"],
) {
  const { supabase, responseHeaders } = createSupabaseServerClient(request);
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    throw redirect(loginRedirectUrl(request), { headers: responseHeaders });
  }

  const { data: profile, error: profileError } = await supabase
    .from("article_admin_profiles")
    .select("display_name, role, is_active")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load article staff profile", profileError.message);
    throw new Response("The article admin is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  if (
    !profile ||
    !profile.is_active ||
    !allowedRoles.includes(profile.role as ArticleRole)
  ) {
    await supabase.auth.signOut({ scope: "local" });
    throw redirect(loginRedirectUrl(request, "inactive"), {
      headers: responseHeaders,
    });
  }

  return {
    supabase,
    responseHeaders,
    staff: {
      userId: claims.sub,
      email: typeof claims.email === "string" ? claims.email : "",
      displayName: profile.display_name,
      role: profile.role as ArticleRole,
    } satisfies ArticleStaff,
  };
}

export function safeAdminDestination(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/admin/articles";

  try {
    const destination = new URL(value, "https://admin.invalid");
    const path = `${destination.pathname}${destination.search}${destination.hash}`;
    const isLocal = destination.origin === "https://admin.invalid";
    const isAdmin = destination.pathname.startsWith("/admin/");
    const isAuthRoute = ["/admin/login", "/admin/logout"].includes(destination.pathname);

    return isLocal && isAdmin && !isAuthRoute ? path : "/admin/articles";
  } catch {
    return "/admin/articles";
  }
}
