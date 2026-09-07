import {
  PROFESSIONAL_VOLUME_TIERS,
  professionalOrderPricing,
  retailProductConfig,
  retailProductPricing,
  retailProductVolumeTiers,
  type RetailPricingProductId,
} from "./order-pricing";

export type PortalPriceProduct = {
  sku: string;
  retail_price_pence: number | null;
  trade_price_pence: number;
};

export type PortalPriceTier = {
  name: string;
  minQuantity: number;
  maxQuantity: number | null;
  range: string;
  baseUnitPricePence: number;
  unitPricePence: number;
};

type CanonicalProduct =
  | { kind: "professional" }
  | { kind: "retail"; productId: RetailPricingProductId };

const CANONICAL_PRODUCTS: Record<string, CanonicalProduct> = {
  "MALIBU-1L": { kind: "professional" },
  "MITT-BUFF-GLOW": { kind: "retail", productId: "mitt" },
  "SOUFFLE-SELF-TAN": { kind: "retail", productId: "souffleMedium" },
  "SOUFFLE-MEDIUM": { kind: "retail", productId: "souffleMedium" },
  "SOUFFLE-DARK": { kind: "retail", productId: "souffleDark" },
  "KIT-A-LIST-GLOW": { kind: "retail", productId: "kit" },
};

function pence(gbp: number) {
  return Math.round(gbp * 100);
}

function normaliseDiscount(discountPercent: number) {
  return Math.min(100, Math.max(0, Number.isFinite(discountPercent) ? discountPercent : 0));
}

function applyDiscount(baseUnitPricePence: number, discountPercent: number) {
  return Math.round(baseUnitPricePence * (1 - normaliseDiscount(discountPercent) / 100));
}

function quantityRange(minQuantity: number, maxQuantity: number | null, unit: string) {
  return maxQuantity === null
    ? `${minQuantity}+ ${unit}`
    : `${minQuantity}–${maxQuantity} ${unit}`;
}

export function portalPriceTiers(
  product: PortalPriceProduct,
  discountPercent = 0,
): PortalPriceTier[] {
  const canonical = CANONICAL_PRODUCTS[product.sku];

  if (canonical?.kind === "professional") {
    return PROFESSIONAL_VOLUME_TIERS.map((tier, index, tiers) => {
      const maxQuantity = index < tiers.length - 1 ? tiers[index + 1].minQuantity - 1 : null;
      const baseUnitPricePence = pence(tier.unitPrice);
      return {
        name: tier.name,
        minQuantity: tier.minQuantity,
        maxQuantity,
        range: quantityRange(tier.minQuantity, maxQuantity, "litres"),
        baseUnitPricePence,
        unitPricePence: applyDiscount(baseUnitPricePence, discountPercent),
      };
    });
  }

  if (canonical?.kind === "retail") {
    const config = retailProductConfig(canonical.productId);
    if (config) {
      const volumeTiers = retailProductVolumeTiers(canonical.productId);
      const tiers = [
        {
          name: "Single",
          minQuantity: 1,
          unitPrice: config.singleUnitTradePrice,
        },
        ...volumeTiers,
      ];

      return tiers.map((tier, index) => {
        const maxQuantity = index < tiers.length - 1 ? tiers[index + 1].minQuantity - 1 : null;
        const baseUnitPricePence = pence(tier.unitPrice);
        return {
          name: tier.name,
          minQuantity: tier.minQuantity,
          maxQuantity,
          range: quantityRange(tier.minQuantity, maxQuantity, "units"),
          baseUnitPricePence,
          unitPricePence: applyDiscount(baseUnitPricePence, discountPercent),
        };
      });
    }
  }

  const baseUnitPricePence = product.trade_price_pence;
  return [{
    name: "Standard",
    minQuantity: 1,
    maxQuantity: null,
    range: "1+ units",
    baseUnitPricePence,
    unitPricePence: applyDiscount(baseUnitPricePence, discountPercent),
  }];
}

export function portalProductPricing(
  product: PortalPriceProduct,
  quantity: number,
  discountPercent = 0,
) {
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));
  const canonical = CANONICAL_PRODUCTS[product.sku];
  let baseUnitPricePence = product.trade_price_pence;
  let tierName = "Standard";

  if (canonical?.kind === "professional") {
    const pricing = professionalOrderPricing(safeQuantity);
    baseUnitPricePence = pence(pricing.unitPrice);
    tierName = pricing.tier.name;
  } else if (canonical?.kind === "retail") {
    const pricing = retailProductPricing(canonical.productId, safeQuantity);
    if (pricing) {
      baseUnitPricePence = pence(pricing.unitPrice);
      tierName = pricing.name;
    }
  }

  const unitPricePence = applyDiscount(baseUnitPricePence, discountPercent);
  return {
    quantity: safeQuantity,
    tierName,
    baseUnitPricePence,
    unitPricePence,
    lineTotalPence: unitPricePence * safeQuantity,
  };
}

export function portalReferencePrice(product: PortalPriceProduct) {
  const canonical = CANONICAL_PRODUCTS[product.sku];
  if (canonical?.kind === "professional") {
    return { label: "Website", pricePence: pence(PROFESSIONAL_VOLUME_TIERS[0].unitPrice) };
  }
  if (canonical?.kind === "retail") {
    const config = retailProductConfig(canonical.productId);
    if (config) return { label: "RRP", pricePence: pence(config.rrp) };
  }
  return {
    label: product.retail_price_pence ? "RRP" : "Website",
    pricePence: product.retail_price_pence ?? product.trade_price_pence,
  };
}
