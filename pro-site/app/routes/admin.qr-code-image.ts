import type { LoaderFunctionArgs } from "react-router";
import QRCode from "qrcode";
import { requireArticleStaff } from "../lib/article-auth.server";
import { qrRedirectUrl } from "../lib/qr-codes.server";

const options = {
  errorCorrectionLevel: "Q" as const,
  margin: 4,
  width: 2048,
  color: { dark: "#000000", light: "#FFFFFF" },
};

function filenameFor(name: string, format: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "jimmy-coco-qr";
  return `${base}-qr.${format}`;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const format = params.format?.toLowerCase();
  if (!format || !["svg", "png"].includes(format)) {
    throw new Response("Unsupported QR image format.", { status: 404, headers: responseHeaders });
  }

  const { data: qrCode, error } = await supabase
    .from("qr_codes")
    .select("code, name")
    .eq("id", params.qrId ?? "")
    .maybeSingle();

  if (error) {
    console.error("Unable to load QR image record", error.message);
    throw new Response("The QR image is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }
  if (!qrCode) {
    throw new Response("QR code not found.", { status: 404, headers: responseHeaders });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  responseHeaders.set(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${filenameFor(qrCode.name, format)}"`,
  );

  if (format === "svg") {
    const svg = await QRCode.toString(qrRedirectUrl(qrCode.code), {
      ...options,
      type: "svg",
    });
    responseHeaders.set("Content-Type", "image/svg+xml; charset=utf-8");
    return new Response(svg, { headers: responseHeaders });
  }

  const png = await QRCode.toBuffer(qrRedirectUrl(qrCode.code), {
    ...options,
    type: "png",
  });
  responseHeaders.set("Content-Type", "image/png");
  return new Response(new Uint8Array(png), { headers: responseHeaders });
}
