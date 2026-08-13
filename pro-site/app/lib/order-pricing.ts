export const TANS_PER_LITRE = 28;
export const DEFAULT_TREATMENT_PRICE = 25;
export const RETAIL_SOUFFLE_RRP = 22;
export const RETAIL_MITT_UNIT_PRICE = 15;
export const RETAIL_KIT_UNIT_PRICE = 59;

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

export function retailVolumeIncentive(quantity: number) {
  const currentTier = retailTierFor(quantity);
  const nextTier = RETAIL_VOLUME_TIERS.find((tier) => tier.quantity > quantity);
  const currentProfit = currentTier ? quantity * (RETAIL_SOUFFLE_RRP - currentTier.unitPrice) : 0;

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

export function retailProductPricing(productId: string, quantity: number) {
  if (productId === "souffleMedium" || productId === "souffleDark") {
    return retailTierFor(quantity);
  }
  if (productId === "mitt" && quantity >= 1 && quantity <= 4) {
    return { name: "Standard", quantity, unitPrice: RETAIL_MITT_UNIT_PRICE } as const;
  }
  if (productId === "kit" && quantity >= 1 && quantity <= 4) {
    return { name: "Standard", quantity, unitPrice: RETAIL_KIT_UNIT_PRICE } as const;
  }
  return undefined;
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
