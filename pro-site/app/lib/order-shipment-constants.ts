export const SHIPMENT_STATUSES = ["preparing", "dispatched", "in_transit", "delivered", "exception"] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  preparing: "Preparing dispatch",
  dispatched: "Dispatched",
  in_transit: "In transit",
  delivered: "Delivered",
  exception: "Delivery exception",
};

export type OrderShipment = {
  id: string;
  order_id: string;
  status: ShipmentStatus;
  carrier: string | null;
  service_level: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  dispatched_at: string | null;
  estimated_delivery_date: string | null;
  delivered_at: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
};
