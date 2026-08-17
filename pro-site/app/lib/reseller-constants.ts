/** Client-safe reseller constants. Kept out of *.server so route components may import them. */
export const ORDER_STATUSES = [
  "submitted",
  "confirmed",
  "invoiced",
  "shipped",
  "cancelled",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const PRICING_TIERS = ["standard", "silver", "gold"] as const;
export const RESELLER_STATUSES = ["active", "suspended", "closed"] as const;

export const ORDER_SOURCES = ["pro_website", "retail_website", "manual"] as const;
export type OrderSourceValue = (typeof ORDER_SOURCES)[number];
export const ORDER_SOURCE_LABELS: Record<OrderSourceValue, string> = {
  pro_website: "Pro website",
  retail_website: "Retail website",
  manual: "Manual",
};
