import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient } from "./supabase.server";

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 8;
const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|curl|wget|python-requests|axios|node-fetch/i;
const MOBILE = /android|iphone|ipod|iemobile|blackberry|opera mini|mobile safari|windows phone/i;

export type QrCodeRecord = {
  id: string;
  code: string;
  name: string;
  destination_url: string;
  is_active: boolean;
  scan_count: number;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
};

const QR_SELECT = `
  id, code, name, destination_url, is_active, scan_count,
  last_scanned_at, created_at, updated_at
`;

function generatedCode() {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normaliseQrName(value: FormDataEntryValue | null) {
  const name = String(value ?? "").trim();
  if (!name || name.length > 120) {
    throw new Error("Give the QR code a name between 1 and 120 characters.");
  }
  return name;
}

export function normaliseDestinationUrl(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.length > 2048) {
    throw new Error("Enter a destination URL no longer than 2,048 characters.");
  }

  let destination: URL;
  try {
    destination = new URL(raw);
  } catch {
    throw new Error("Enter a complete destination URL beginning with https:// or http://.");
  }

  if (!["https:", "http:"].includes(destination.protocol)) {
    throw new Error("The destination must use https:// or http://.");
  }
  if (destination.username || destination.password) {
    throw new Error("Destination URLs cannot contain embedded login details.");
  }

  const host = destination.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "jimmycoco.pro" && destination.pathname.startsWith("/q/")) {
    throw new Error("A QR destination cannot point to another Jimmy Coco QR redirect.");
  }

  return destination.toString();
}

export async function listQrCodes(supabase: SupabaseClient) {
  return supabase
    .from("qr_codes")
    .select(QR_SELECT)
    .order("updated_at", { ascending: false })
    .returns<QrCodeRecord[]>();
}

export async function createQrCode(
  supabase: SupabaseClient,
  input: { name: string; destinationUrl: string; userId: string },
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generatedCode();
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        code,
        name: input.name,
        destination_url: input.destinationUrl,
        created_by: input.userId,
        updated_by: input.userId,
      })
      .select(QR_SELECT)
      .single();

    if (!error) return data as QrCodeRecord;
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("A unique QR code could not be allocated. Please try again.");
}

export async function updateQrCode(
  supabase: SupabaseClient,
  input: {
    id: string;
    name: string;
    destinationUrl: string;
    isActive: boolean;
    userId: string;
  },
) {
  const { data, error } = await supabase
    .from("qr_codes")
    .update({
      name: input.name,
      destination_url: input.destinationUrl,
      is_active: input.isActive,
      updated_by: input.userId,
    })
    .eq("id", input.id)
    .select(QR_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as QrCodeRecord;
}

function referrerHost(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "";
}

export async function resolveQrDestination(request: Request, rawCode: string) {
  const code = rawCode.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{4,31}$/.test(code)) return null;

  const userAgent = request.headers.get("user-agent") ?? "";
  const trackable = Boolean(userAgent) && !BOT.test(userAgent);
  const doNotTrack = request.headers.get("dnt") === "1";
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = trackable && !doNotTrack
    ? createHash("sha256")
        .update(`${day}:${clientAddress(request)}:${userAgent}`)
        .digest("hex")
        .slice(0, 32)
    : null;

  const { data, error } = await createPublicSupabaseClient().rpc("resolve_qr_code", {
    p_code: code,
    p_referrer: referrerHost(request.headers.get("referer")),
    p_device: userAgent ? (MOBILE.test(userAgent) ? "mobile" : "desktop") : null,
    p_visitor_hash: visitorHash,
    p_record: trackable,
  });

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  const destination = row?.destination_url;
  if (typeof destination !== "string") return null;

  try {
    const parsed = new URL(destination);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}
