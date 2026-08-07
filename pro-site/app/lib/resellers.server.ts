import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient } from "./supabase.server";

export type ApplicationStatus = "pending" | "approved" | "declined" | "on_hold";
export type ResellerStatus = "active" | "suspended" | "closed";
export type OrderStatus = "submitted" | "confirmed" | "invoiced" | "shipped" | "cancelled";

export type ResellerApplication = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  business_type: string;
  market: string;
  message: string | null;
  wants_trial: boolean;
  status: ApplicationStatus;
  source: string;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Reseller = {
  id: string;
  account_code: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  market: string;
  pricing_tier: "standard" | "silver" | "gold";
  discount_percent: number;
  status: ResellerStatus;
  user_id: string | null;
  approved_at: string | null;
  created_at: string;
};

export type ResellerProduct = {
  sku: string;
  title: string;
  description: string | null;
  unit_label: string;
  retail_price_pence: number | null;
  trade_price_pence: number;
  case_quantity: number;
  sort_order: number;
};

export type ResellerOrder = {
  id: string;
  reference: string;
  status: OrderStatus;
  currency: string;
  subtotal_pence: number;
  customer_note: string | null;
  submitted_at: string;
};

export type ApplicationInput = {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  businessType?: string | null;
  market?: string | null;
  message?: string | null;
  wantsTrial?: boolean;
  source?: string;
  metadata?: Record<string, unknown>;
};

const BUSINESS_TYPES = ["Salon", "Spa", "Mobile professional", "Multi-site group", "Other"];

export function normaliseBusinessType(value: FormDataEntryValue | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return BUSINESS_TYPES.includes(candidate) ? candidate : "Salon";
}

export function isPlausibleEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Public intake. Uses the anonymous key and the security-definer RPC so the
 * marketing site never holds write rights on the applications table itself.
 */
export async function submitApplication(input: ApplicationInput) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("submit_reseller_application", {
    p_business_name: input.businessName,
    p_contact_name: input.contactName,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_business_type: input.businessType ?? "Salon",
    p_market: input.market ?? "UK",
    p_message: input.message ?? null,
    p_wants_trial: input.wantsTrial ?? true,
    p_source: input.source ?? "pro-site",
    p_metadata: input.metadata ?? {},
  });

  if (error) throw new Error(`Could not lodge the trade application: ${error.message}`);
  return data as string;
}

export async function listApplications(supabase: SupabaseClient, status?: ApplicationStatus) {
  let query = supabase
    .from("reseller_applications")
    .select(
      "id, business_name, contact_name, email, phone, business_type, market, message, wants_trial, status, source, review_note, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load trade applications: ${error.message}`);
  return (data ?? []) as ResellerApplication[];
}

export async function listResellers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("resellers")
    .select(
      "id, account_code, business_name, contact_name, email, phone, market, pricing_tier, discount_percent, status, user_id, approved_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`Could not load reseller accounts: ${error.message}`);
  return (data ?? []) as Reseller[];
}

function accountCodeFrom(businessName: string) {
  const letters = businessName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "X");
  const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
  return `${letters}${suffix}`;
}

export async function approveApplication(
  supabase: SupabaseClient,
  applicationId: string,
  reviewerId: string,
  options: { pricingTier?: Reseller["pricing_tier"]; discountPercent?: number; note?: string } = {},
) {
  const { data: application, error: loadError } = await supabase
    .from("reseller_applications")
    .select("id, business_name, contact_name, email, phone, market, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (loadError) throw new Error(`Could not load the application: ${loadError.message}`);
  if (!application) throw new Error("That application no longer exists.");
  if (application.status === "approved") throw new Error("That application is already approved.");

  const { data: reseller, error: insertError } = await supabase
    .from("resellers")
    .insert({
      application_id: application.id,
      account_code: accountCodeFrom(application.business_name),
      business_name: application.business_name,
      contact_name: application.contact_name,
      email: application.email,
      phone: application.phone,
      market: application.market,
      pricing_tier: options.pricingTier ?? "standard",
      discount_percent: options.discountPercent ?? 0,
      approved_by: reviewerId,
      approved_at: new Date().toISOString(),
    })
    .select("id, account_code, business_name, contact_name, email, market")
    .single();

  if (insertError) throw new Error(`Could not create the reseller account: ${insertError.message}`);

  const { error: updateError } = await supabase
    .from("reseller_applications")
    .update({
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: options.note ?? null,
    })
    .eq("id", application.id);

  if (updateError) throw new Error(`Approved, but the application status did not update: ${updateError.message}`);

  return reseller;
}

export async function setApplicationStatus(
  supabase: SupabaseClient,
  applicationId: string,
  status: Exclude<ApplicationStatus, "approved">,
  reviewerId: string,
  note?: string,
) {
  const { data, error } = await supabase
    .from("reseller_applications")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", applicationId)
    .select("id, business_name, contact_name, email, market")
    .single();

  if (error) throw new Error(`Could not update the application: ${error.message}`);
  return data;
}

export async function loadCatalogue(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("reseller_products")
    .select("sku, title, description, unit_label, retail_price_pence, trade_price_pence, case_quantity, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Could not load the trade catalogue: ${error.message}`);
  return (data ?? []) as ResellerProduct[];
}

export async function listOrders(supabase: SupabaseClient, resellerId?: string) {
  let query = supabase
    .from("reseller_orders")
    .select("id, reference, status, currency, subtotal_pence, customer_note, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (resellerId) query = query.eq("reseller_id", resellerId);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return (data ?? []) as ResellerOrder[];
}

export type OrderLineInput = { sku: string; quantity: number };

export function orderReference() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear().toString().slice(2)}${(now.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JC-${stamp}-${random}`;
}

export async function createOrder(
  supabase: SupabaseClient,
  reseller: Pick<Reseller, "id" | "discount_percent">,
  lines: OrderLineInput[],
  customerNote?: string,
) {
  const wanted = lines.filter((line) => line.quantity > 0);
  if (wanted.length === 0) throw new Error("Add at least one product before submitting an order.");

  const catalogue = await loadCatalogue(supabase);
  const bySku = new Map(catalogue.map((product) => [product.sku, product]));

  const items = wanted.map((line) => {
    const product = bySku.get(line.sku);
    if (!product) throw new Error(`Unknown product: ${line.sku}`);
    const discounted = Math.round(
      product.trade_price_pence * (1 - Number(reseller.discount_percent ?? 0) / 100),
    );
    return {
      sku: product.sku,
      title: product.title,
      unit_price_pence: discounted,
      quantity: line.quantity,
      line_total_pence: discounted * line.quantity,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from("reseller_orders")
    .insert({
      reseller_id: reseller.id,
      reference: orderReference(),
      customer_note: customerNote?.trim() || null,
    })
    .select("id, reference")
    .single();

  if (orderError) throw new Error(`Could not open the order: ${orderError.message}`);

  const { error: itemsError } = await supabase
    .from("reseller_order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) throw new Error(`Could not save the order lines: ${itemsError.message}`);

  return order;
}
