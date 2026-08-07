import { redirect } from "react-router";
import { createSupabaseServerClient } from "./supabase.server";
import type { Reseller } from "./resellers.server";

const RESELLER_COLUMNS =
  "id, account_code, business_name, contact_name, email, phone, market, pricing_tier, discount_percent, status, user_id, approved_at, created_at";

function loginRedirectUrl(request: Request, reason?: "unlinked" | "suspended") {
  const requestUrl = new URL(request.url);
  const params = new URLSearchParams();
  const next = `${requestUrl.pathname}${requestUrl.search}`;

  if (requestUrl.pathname !== "/portal" && !requestUrl.pathname.startsWith("/portal/login")) {
    params.set("next", next);
  }
  if (reason) params.set("reason", reason);

  const query = params.toString();
  return `/portal/login${query ? `?${query}` : ""}`;
}

/**
 * Guards every portal route. A signed-in user only becomes a reseller once
 * their auth account has been bound to an approved row by claim_reseller_account.
 */
export async function requireReseller(request: Request) {
  const { supabase, responseHeaders } = createSupabaseServerClient(request);
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    throw redirect(loginRedirectUrl(request), { headers: responseHeaders });
  }

  const { data: reseller, error } = await supabase
    .from("resellers")
    .select(RESELLER_COLUMNS)
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    console.error("Unable to load reseller account", error.message);
    throw new Response("The trade portal is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  if (!reseller) {
    throw redirect(loginRedirectUrl(request, "unlinked"), { headers: responseHeaders });
  }

  if (reseller.status !== "active") {
    await supabase.auth.signOut({ scope: "local" });
    throw redirect(loginRedirectUrl(request, "suspended"), { headers: responseHeaders });
  }

  return { supabase, responseHeaders, reseller: reseller as Reseller };
}

/** Binds the signed-in auth user to an approved reseller row, if one exists. */
export async function claimResellerAccount(
  supabase: ReturnType<typeof createSupabaseServerClient>["supabase"],
) {
  const { data, error } = await supabase.rpc("claim_reseller_account");
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, resellerId: data as string };
}

export function safePortalDestination(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/portal";

  try {
    const destination = new URL(value, "https://portal.invalid");
    const path = `${destination.pathname}${destination.search}${destination.hash}`;
    const isLocal = destination.origin === "https://portal.invalid";
    const isPortal = destination.pathname === "/portal" || destination.pathname.startsWith("/portal/");
    const isAuthRoute = ["/portal/login", "/portal/logout", "/portal/register"].includes(
      destination.pathname,
    );

    return isLocal && isPortal && !isAuthRoute ? path : "/portal";
  } catch {
    return "/portal";
  }
}
