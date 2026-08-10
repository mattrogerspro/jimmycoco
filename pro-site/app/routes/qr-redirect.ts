import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { resolveQrDestination } from "../lib/qr-codes.server";

function redirectHeaders() {
  return {
    "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const destination = await resolveQrDestination(request, params.code ?? "");
    if (!destination) {
      throw new Response("QR code not found or inactive.", {
        status: 404,
        headers: redirectHeaders(),
      });
    }

    return redirect(destination, { status: 302, headers: redirectHeaders() });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Unable to resolve QR code", error);
    throw new Response("The QR destination is temporarily unavailable.", {
      status: 503,
      headers: redirectHeaders(),
    });
  }
}
