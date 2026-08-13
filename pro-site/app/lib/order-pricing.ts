export const TANS_PER_LITRE = 28;
export const DEFAULT_TREATMENT_PRICE = 25;
export const RETAIL_SOUFFLE_RRP = 22;
export const RETAIL_MITT_UNIT_PRICE = 15;
export const RETAIL_KIT_UNIT_PRICE = 59;
export const RETAIL_MITT_RRP = 15;
export const RETAIL_KIT_RRP = 59;

export const PROFESSIONAL_VOLUME_TIERS = [
  { name: "Starter", range: "1–4 litres", minQuantity: 1, exampleQuantity: 1, unitPrice: 60 },
  { name: "Growth", range: "5–9 litres", minQuantity: 5, exampleQuantity: 5, unitPrice: 55 },
  { name: "Premium", range: "10+ litres", minQuantity: 10, exampleQuantity: 10, unitPrice: 50 },
] as const;

export const RETAIL_VOLUME_TIERS = [
  { name: "Starter", quantity: 6, unitPrice: 14 },
  { name: "Growth", quantity: 12, unitPrice: 12.5 },
  { name: "Premium", quantity: 24, unitPrice: 11 },
] as const;

export const RETAIL_MITT_VOLUME_TIERS = [
  { name: "Starter", quantity: 6, unitPrice: 11.5 },
  { name: "Growth", quantity: 12, unitPrice: 9.5 },
  { name: "Premium", quantity: 24, unitPrice: 7.5 },
] as const;

export const RETAIL_KIT_VOLUME_TIERS = [
  { name: "Starter", quantity: 6, unitPrice: 49 },
  { name: "Growth", quantity: 12, unitPrice: 42.5 },
  { name: "Premium", quantity: 24, unitPrice: 37.5 },
] as const;

export function retailProductVolumeTiers(productId: string) {
  if (productId === "mitt") return RETAIL_MITT_VOLUME_TIERS;
  if (productId === "kit") return RETAIL_KIT_VOLUME_TIERS;
  return RETAIL_VOLUME_TIERS;
}

export function professionalTierFor(quantity: number) {
  if (quantity >= 10) return PROFESSIONAL_VOLUME_TIERS[2];
  if (quantity >= 5) return PROFESSIONAL_VOLUME_TIERS[1];
  return PROFESSIONAL_VOLUME_TIERS[0];
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

export function retailTierFor(quantity: number) {
  if (quantity >= 24) return RETAIL_VOLUME_TIERS[2];
  if (quantity >= 12) return RETAIL_VOLUME_TIERS[1];
  if (quantity >= 6) return RETAIL_VOLUME_TIERS[0];
  return undefined;
}

export function retailProductTierFor(productId: string, quantity: number) {
  const tiers = retailProductVolumeTiers(productId);
  if (quantity >= tiers[2].quantity) return tiers[2];
  if (quantity >= tiers[1].quantity) return tiers[1];
  if (quantity >= tiers[0].quantity) return tiers[0];
  return undefined;
}

export function retailVolumeIncentive(quantity: number) {
  const currentTier = retailTierFor(quantity);
  const nextTier = RETAIL_VOLUME_TIERS.find((tier) => tier.quantity > quantity);
  const projectedTier = currentTier ?? nextTier;
  const currentProfit = projectedTier ? quantity * (RETAIL_SOUFFLE_RRP - projectedTier.unitPrice) : 0;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: undefined,
      unitsNeeded: 0,
      currentProfit,
      targetProfit: currentProfit,
      additionalProfit: 0,
      additionalMarginFromRate: quantity * (RETAIL_VOLUME_TIERS[0].unitPrice - (currentTier?.unitPrice ?? RETAIL_VOLUME_TIERS[0].unitPrice)),
    };
  }

  const targetProfit = nextTier.quantity * (RETAIL_SOUFFLE_RRP - nextTier.unitPrice);
  return {
    currentTier,
    nextTier,
    unitsNeeded: nextTier.quantity - quantity,
    currentProfit,
    targetProfit,
    additionalProfit: targetProfit - currentProfit,
    additionalMarginFromRate: nextTier.quantity * (RETAIL_VOLUME_TIERS[0].unitPrice - nextTier.unitPrice),
  };
}

export function retailProductVolumeIncentive(productId: string, quantity: number) {
  const tiers = retailProductVolumeTiers(productId);
  const currentTier = retailProductTierFor(productId, quantity);
  const nextTier = tiers.find((tier) => tier.quantity > quantity);
  const current = retailProductPotentialProfit(productId, quantity);

  if (!nextTier) {
    return { currentTier, nextTier: undefined, unitsNeeded: 0, currentProfit: current.profit, targetProfit: current.profit, additionalProfit: 0 };
  }

  const target = retailProductPotentialProfit(productId, nextTier.quantity);
  return {
    currentTier,
    nextTier,
    unitsNeeded: nextTier.quantity - quantity,
    currentProfit: current.profit,
    targetProfit: target.profit,
    additionalProfit: target.profit - current.profit,
  };
}

export function retailProductPotentialProfit(productId: string, quantity: number) {
  if (quantity <= 0) return { revenue: 0, cost: 0, profit: 0 };
  const rrp = productId === "mitt" ? RETAIL_MITT_RRP : productId === "kit" ? RETAIL_KIT_RRP : RETAIL_SOUFFLE_RRP;
  const tier = retailProductTierFor(productId, quantity);
  if (!tier) return { revenue: quantity * rrp, cost: 0, profit: 0 };
  const revenue = quantity * rrp;
  const cost = quantity * tier.unitPrice;
  return { revenue, cost, profit: revenue - cost };
}

export function retailProductPricing(productId: string, quantity: number) {
  return retailProductTierFor(productId, quantity);
}

export function retailTierProfit(quantity: number, unitPrice: number) {
  const revenue = quantity * RETAIL_SOUFFLE_RRP;
  const cost = quantity * unitPrice;
  return {
    revenue,
    cost,
    profit: revenue - cost,
    additionalMargin: quantity * (RETAIL_VOLUME_TIERS[0].unitPrice - unitPrice),
  };
}
