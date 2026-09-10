import type { SupabaseClient } from "@supabase/supabase-js";

import { type OrderShipment, type ShipmentStatus } from "./order-shipment-constants";
export { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS } from "./order-shipment-constants";
export type { OrderShipment, ShipmentStatus } from "./order-shipment-constants";

const COLUMNS = "id, order_id, status, carrier, service_level, tracking_number, tracking_url, dispatched_at, estimated_delivery_date, delivered_at, internal_note, created_at, updated_at";

export async function latestOrderShipment(supabase: SupabaseClient, orderId: string) {
  const { data, error } = await supabase
    .from("reseller_order_shipments")
    .select(COLUMNS)
    .eq("order_id", orderId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not load shipment details: ${error.message}`);
  return (data as unknown as OrderShipment) ?? null;
}

export async function saveOrderShipment(
  supabase: SupabaseClient,
  orderId: string,
  patch: {
    status: ShipmentStatus;
    carrier?: string | null;
    service_level?: string | null;
    tracking_number?: string | null;
    tracking_url?: string | null;
    estimated_delivery_date?: string | null;
    internal_note?: string | null;
  },
  staffUserId?: string,
) {
  const current = await latestOrderShipment(supabase, orderId);
  const now = new Date().toISOString();
  const next = {
    ...patch,
    dispatched_at: patch.status === "dispatched" || patch.status === "in_transit" || patch.status === "delivered"
      ? current?.dispatched_at ?? now
      : current?.dispatched_at ?? null,
    delivered_at: patch.status === "delivered" ? current?.delivered_at ?? now : null,
  };

  if (current) {
    const { data, error } = await supabase
      .from("reseller_order_shipments")
      .update(next)
      .eq("id", current.id)
      .select(COLUMNS)
      .single();
    if (error) throw new Error(`Could not update shipment details: ${error.message}`);
    return data as unknown as OrderShipment;
  }

  const { data, error } = await supabase
    .from("reseller_order_shipments")
    .insert({ order_id: orderId, created_by: staffUserId ?? null, ...next })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(`Could not create shipment details: ${error.message}`);
  return data as unknown as OrderShipment;
}
