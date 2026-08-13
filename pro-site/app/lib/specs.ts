/**
 * Product specification — single source of truth.
 *
 * Drives both the visible specification table on the product page and the
 * additionalProperty entries in the Product JSON-LD. As with faq.ts, do not
 * hand-write either output separately.
 *
 * Every value must be traceable to a fact stated elsewhere on the site. The
 * per-tan and worked-economics figures are DERIVED from the litre price and the
 * stated yield, so they update automatically if either changes.
 */

import pricing from "../../retail-pricing.json";

export const LITRE_PRICE_GBP = pricing.professional.malibu1L.tiers[0].unitPrice;
export const TANS_PER_LITRE = pricing.assumptions.tansPerLitre;
export const MAX_DOSE_ML = 35;

/** Solution cost of a single full-body tan, in pounds. */
export const costPerTan = () => LITRE_PRICE_GBP / TANS_PER_LITRE;

export type Spec = { name: string; value: string };

export const PRODUCT_SPECS: Spec[] = [
  { name: "Product type", value: "Professional spray tan solution, salon size" },
  { name: "Volume", value: "1 litre (33.8 fl oz)" },
  { name: "Active tanning agent", value: "10% DHA" },
  { name: "Shade", value: "Universal bronze glow, one custom-blended shade" },
  { name: "Shade depths available", value: "Light, Medium, Medium/Dark, Dark" },
  { name: "Coverage", value: "Approximately 28 full-body tans per litre" },
  { name: "Recommended dose", value: "Under 35ml per full-body session" },
  { name: "Development time", value: "6 to 8 hours" },
  { name: "Equipment", value: "Standard professional HVLP spray systems" },
  { name: "Key actives", value: "Colloidal gold, hyaluronic acid, Pentavitin, blue daisy" },
  { name: "Fragrance", value: "Jimmy\u2019s signature scent with aromaguard technology" },
  { name: "Tone correction", value: "Anti-orange, skin-tone-sympathetic pigments" },
  { name: "Solution cost per tan", value: `Approximately \u00a3${costPerTan().toFixed(2)} at \u00a3${LITRE_PRICE_GBP} per litre` },
  { name: "Trade unit", value: `1 litre, \u00a3${LITRE_PRICE_GBP} standard list price` },
  { name: "Returns", value: "14 days, 100% money-back guarantee" },
];

/**
 * Worked salon economics, rendered as static text.
 *
 * The profit calculator on the home page computes these in the browser from
 * slider positions, which means none of its numbers exist in the HTML and no
 * crawler or AI assistant can read them. These three worked examples are the
 * crawlable equivalent.
 */
export type Worked = {
  tansPerWeek: number;
  pricePerTan: number;
  weeklyRevenue: number;
  weeklySolutionCost: number;
  weeklyGross: number;
  litresPerMonth: number;
};

export const workedExamples = (): Worked[] =>
  [
    { tansPerWeek: 10, pricePerTan: 25 },
    { tansPerWeek: 20, pricePerTan: 30 },
    { tansPerWeek: 40, pricePerTan: 35 },
  ].map(({ tansPerWeek, pricePerTan }) => {
    const weeklySolutionCost = tansPerWeek * costPerTan();
    return {
      tansPerWeek,
      pricePerTan,
      weeklyRevenue: tansPerWeek * pricePerTan,
      weeklySolutionCost,
      weeklyGross: tansPerWeek * pricePerTan - weeklySolutionCost,
      litresPerMonth: (tansPerWeek * 52) / 12 / TANS_PER_LITRE,
    };
  });

/** Product.additionalProperty entries, generated from the same table. */
export const specSchemaProperties = PRODUCT_SPECS.map((spec) => ({
  "@type": "PropertyValue",
  name: spec.name,
  value: spec.value,
}));

/** Rolling one-year price validity for the Offer. */
export const priceValidUntil = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};
