import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function readSupabaseEnvironment() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
    ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return { url, publishableKey };
}

export function getSupabasePublicConfig() {
  return readSupabaseEnvironment();
}

export function createPublicSupabaseClient() {
  const { url, publishableKey } = readSupabaseEnvironment();
  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabaseServiceClient() {
  const { url } = readSupabaseEnvironment();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!serviceKey) {
    throw new Error("Supabase service access is not configured. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function articleMediaUrl(path: string | null | undefined) {
  if (!path) return null;
  const { url } = readSupabaseEnvironment();
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${url}/storage/v1/object/public/article-media/${encoded}`;
}

export function privateNoStoreHeaders(initial?: HeadersInit) {
  const headers = new Headers(initial);
  applyPrivateNoStoreHeaders(headers);
  return headers;
}

function applyPrivateNoStoreHeaders(headers: Headers) {
  headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  headers.set("Expires", "0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Vary", "Cookie");
}

export function createSupabaseServerClient(request: Request) {
  const { url, publishableKey } = readSupabaseEnvironment();
  const responseHeaders = privateNoStoreHeaders();
  const secure = new URL(request.url).protocol === "https:";

  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: THIRTY_DAYS,
    },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet, cacheHeaders) {
        for (const { name, value, options } of cookiesToSet) {
          const maxAge = options.maxAge === 0
            ? 0
            : Math.min(options.maxAge ?? THIRTY_DAYS, THIRTY_DAYS);
          responseHeaders.append(
            "Set-Cookie",
            serializeCookieHeader(name, value, { ...options, maxAge }),
          );
        }

        for (const [name, value] of Object.entries(cacheHeaders)) {
          responseHeaders.set(name, value);
        }

        applyPrivateNoStoreHeaders(responseHeaders);
      },
    },
  });

  return { supabase, responseHeaders };
}

export function isSameOriginPost(request: Request) {
  if (request.method.toUpperCase() !== "POST") return false;

  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
