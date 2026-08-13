import pricing from "../../retail-pricing.json";

export type RetailPricingProductId = keyof typeof pricing.retail;
type RetailTier = { name: string; minQuantity: number; unitPrice: number };

export const TANS_PER_LITRE = pricing.assumptions.tansPerLitre;
export const DEFAULT_TREATMENT_PRICE = pricing.assumptions.treatmentPrice;

export const PROFESSIONAL_VOLUME_TIERS = pricing.professional.malibu1L.tiers.map((tier) => ({
  name: tier.name,
  range: tier.maxQuantity === null ? `${tier.minQuantity}+ litres` : `${tier.minQuantity}–${tier.maxQuantity} litres`,
  minQuantity: tier.minQuantity,
  exampleQuantity: tier.exampleQuantity,
  unitPrice: tier.unitPrice,
}));

export function retailProductConfig(productId: string) {
  if (!(productId in pricing.retail)) return undefined;
  return pricing.retail[productId as RetailPricingProductId];
}

export function retailProductRrp(productId: string) {
  return retailProductConfig(productId)?.rrp ?? 0;
}

export function retailProductVolumeTiers(productId: string): RetailTier[] {
  return (retailProductConfig(productId)?.volumeTiers ?? []).map((tier) => ({ ...tier }));
}

export const RETAIL_VOLUME_TIERS = retailProductVolumeTiers("souffleMedium").map((tier) => ({
  name: tier.name,
  quantity: tier.minQuantity,
  unitPrice: tier.unitPrice,
}));
export const RETAIL_MITT_VOLUME_TIERS = retailProductVolumeTiers("mitt").map((tier) => ({ name: tier.name, quantity: tier.minQuantity, unitPrice: tier.unitPrice }));
export const RETAIL_KIT_VOLUME_TIERS = retailProductVolumeTiers("kit").map((tier) => ({ name: tier.name, quantity: tier.minQuantity, unitPrice: tier.unitPrice }));
export const RETAIL_SOUFFLE_RRP = retailProductRrp("souffleMedium");
export const RETAIL_MITT_RRP = retailProductRrp("mitt");
export const RETAIL_KIT_RRP = retailProductRrp("kit");
export const RETAIL_MITT_UNIT_PRICE = retailProductConfig("mitt")?.singleUnitTradePrice ?? 0;
export const RETAIL_KIT_UNIT_PRICE = retailProductConfig("kit")?.singleUnitTradePrice ?? 0;

export function professionalTierFor(quantity: number) {
  return [...PROFESSIONAL_VOLUME_TIERS].reverse().find((tier) => quantity >= tier.minQuantity) ?? PROFESSIONAL_VOLUME_TIERS[0];
}

export function professionalOrderPricing(quantity: number) {
  const tier = professionalTierFor(quantity);
  return {
    tier,
    unitPrice: tier.unitPrice,
    total: tier.unitPrice * quantity,
    saving: (PROFESSIONAL_VOLUME_TIERS[0].unitPrice - tier.unitPrice) * quantity,
    capacity: TANS_PER_LITRE * quantity,
  };
}

export function professionalTierProfit(quantity: number, unitPrice: number) {
  const revenue = quantity * TANS_PER_LITRE * DEFAULT_TREATMENT_PRICE;
  const cost = quantity * unitPrice;
  return {
    revenue,
    cost,
    contribution: revenue - cost,
    additionalMargin: quantity * (PROFESSIONAL_VOLUME_TIERS[0].unitPrice - unitPrice),
  };
}

export function retailProductTierFor(productId: string, quantity: number) {
  const config = retailProductConfig(productId);
  if (!config || quantity <= 0) return undefined;
  const volumeTier = [...retailProductVolumeTiers(productId)].reverse().find((tier) => quantity >= tier.minQuantity);
  return volumeTier ?? { name: "Single", minQuantity: 1, unitPrice: config.singleUnitTradePrice };
}

export function retailTierFor(quantity: number) {
  return retailProductTierFor("souffleMedium", quantity);
}

export function retailProductVolumeIncentive(productId: string, quantity: number) {
  const tiers = retailProductVolumeTiers(productId);
  const currentTier = retailProductTierFor(productId, quantity);
  const nextTier = tiers.find((tier) => tier.minQuantity > quantity && tier.unitPrice < (currentTier?.unitPrice ?? Infinity));
  const current = retailProductPotentialProfit(productId, quantity);

  if (!nextTier) {
    return { currentTier, nextTier: undefined, unitsNeeded: 0, currentProfit: current.profit, targetProfit: current.profit, additionalProfit: 0 };
  }

  const target = retailProductPotentialProfit(productId, nextTier.minQuantity);
  return {
    currentTier,
    nextTier: { ...nextTier, quantity: nextTier.minQuantity },
    unitsNeeded: nextTier.minQuantity - quantity,
    currentProfit: current.profit,
    targetProfit: target.profit,
    additionalProfit: target.profit - current.profit,
  };
}

export function retailVolumeIncentive(quantity: number) {
  return retailProductVolumeIncentive("souffleMedium", quantity);
}

export function retailProductPotentialProfit(productId: string, quantity: number) {
  const config = retailProductConfig(productId);
  const tier = retailProductTierFor(productId, quantity);
  if (!config || !tier || quantity <= 0) return { revenue: 0, cost: 0, profit: 0 };
  const revenue = quantity * config.rrp;
  const cost = quantity * tier.unitPrice;
  return { revenue, cost, profit: revenue - cost };
}

export function retailProductPricing(productId: string, quantity: number) {
  const tier = retailProductTierFor(productId, quantity);
  if (!tier) return undefined;
  return { name: tier.name, quantity, unitPrice: tier.unitPrice };
}

export function retailTierProfit(quantity: number, unitPrice: number) {
  const revenue = quantity * RETAIL_SOUFFLE_RRP;
  const cost = quantity * unitPrice;
  return {
    revenue,
    cost,
    profit: revenue - cost,
    additionalMargin: quantity * ((retailProductConfig("souffleMedium")?.singleUnitTradePrice ?? unitPrice) - unitPrice),
  };
}
