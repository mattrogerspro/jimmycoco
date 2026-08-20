import { LITRE_PRICE_GBP, TANS_PER_LITRE } from "./specs";

/**
 * Spray tan cost and profit model — single source of truth.
 *
 * Drives the interactive calculator, the crawlable worked example rendered
 * beneath it, the levers table and the FAQ schema. As with faq.ts and specs.ts,
 * never hand-write any of those outputs separately: the divergence between a
 * component's arithmetic and the prose describing it is exactly how a page ends
 * up contradicting itself.
 *
 * The model, its defaults and its assumption ranges are documented in
 * content/04-pipeline/what-a-spray-tan-costs/. If you change a default here,
 * change the article too — a calculator that disagrees with the article linking
 * to it damages the credibility of both.
 */

/** Employer NIC plus holiday-pay accrual, on top of gross wage. */
export const ON_COST_MULTIPLIER = 1.2;

/** National Living Wage from April 2026 (Low Pay Commission / gov.uk). */
export const NLW_HOURLY_GBP = 12.71;

/** Tanning no-show rate — the highest of any UK treatment category (Treatwell, 2025). */
export const NO_SHOW_RATE = 0.0314;

const WEEKS_PER_YEAR = 52;
const WEEKS_PER_MONTH = WEEKS_PER_YEAR / 12;

export type Inputs = {
  pricePerTan: number;
  tansPerWeek: number;
  tansPerLitre: number;
  litrePrice: number;
  disposablesPerTan: number;
  sundriesPerTan: number;
  minutesPerTan: number;
  hourlyRate: number;
  roomFixedCostsMonthly: number;
  retailUnitsPerWeek: number;
  retailPrice: number;
  retailMarginPercent: number;
  cardRatePercent: number;
};

/**
 * Defaults are the worked example in the article, exactly. A visitor who
 * changes nothing sees the same numbers the article publishes.
 */
export const DEFAULTS: Inputs = {
  pricePerTan: 30,
  tansPerWeek: 12,
  tansPerLitre: TANS_PER_LITRE,
  litrePrice: LITRE_PRICE_GBP,
  disposablesPerTan: 0.75,
  sundriesPerTan: 0.35,
  minutesPerTan: 25,
  hourlyRate: NLW_HOURLY_GBP,
  roomFixedCostsMonthly: 450,
  retailUnitsPerWeek: 3,
  retailPrice: 18,
  retailMarginPercent: 50,
  cardRatePercent: 1.5,
};

export type Totals = {
  solutionPerTan: number;
  consumablesPerTan: number;
  cardFeePerTan: number;
  labourPerTan: number;
  overheadPerTan: number;
  /** Before labour and premises — the contribution an extra booking makes. */
  grossPerTan: number;
  /** After everything. */
  netPerTan: number;
  netMarginPercent: number;
  tansPerMonth: number;
  tansPerYear: number;
  retailProfitWeek: number;
  boothGrossWeek: number;
  boothNetWeek: number;
  grossMonth: number;
  netMonth: number;
  grossYear: number;
  netYear: number;
  litresPerMonth: number;
};

export function calculate(input: Inputs): Totals {
  const solutionPerTan = input.tansPerLitre > 0 ? input.litrePrice / input.tansPerLitre : 0;
  const consumablesPerTan = solutionPerTan + input.disposablesPerTan + input.sundriesPerTan;
  const cardFeePerTan = input.pricePerTan * (input.cardRatePercent / 100);
  const labourPerTan = input.hourlyRate * (input.minutesPerTan / 60) * ON_COST_MULTIPLIER;

  const tansPerMonth = input.tansPerWeek * WEEKS_PER_MONTH;
  const tansPerYear = input.tansPerWeek * WEEKS_PER_YEAR;
  const overheadPerTan = tansPerMonth > 0 ? input.roomFixedCostsMonthly / tansPerMonth : 0;

  const grossPerTan = input.pricePerTan - consumablesPerTan - cardFeePerTan;
  const netPerTan = grossPerTan - labourPerTan - overheadPerTan;

  const retailProfitWeek = input.retailUnitsPerWeek * input.retailPrice * (input.retailMarginPercent / 100);
  const boothGrossWeek = grossPerTan * input.tansPerWeek;
  const boothNetWeek = netPerTan * input.tansPerWeek;

  return {
    solutionPerTan,
    consumablesPerTan,
    cardFeePerTan,
    labourPerTan,
    overheadPerTan,
    grossPerTan,
    netPerTan,
    netMarginPercent: input.pricePerTan > 0 ? (netPerTan / input.pricePerTan) * 100 : 0,
    tansPerMonth,
    tansPerYear,
    retailProfitWeek,
    boothGrossWeek,
    boothNetWeek,
    grossMonth: (boothGrossWeek + retailProfitWeek) * WEEKS_PER_MONTH,
    netMonth: (boothNetWeek + retailProfitWeek) * WEEKS_PER_MONTH,
    grossYear: (boothGrossWeek + retailProfitWeek) * WEEKS_PER_YEAR,
    netYear: (boothNetWeek + retailProfitWeek) * WEEKS_PER_YEAR,
    litresPerMonth: input.tansPerLitre > 0 ? tansPerMonth / input.tansPerLitre : 0,
  };
}

export type Lever = { id: string; label: string; note: string; annual: number };

/**
 * What each change is worth over a year, at the visitor's own numbers.
 *
 * Marginal, not average: an extra tan does not add fixed overhead, so it is
 * valued at gross minus labour rather than at net. Sorted descending, which is
 * the point of the panel — for realistic inputs a cheaper litre lands last.
 */
export function levers(input: Inputs): Lever[] {
  const totals = calculate(input);
  const marginalPerTan = totals.grossPerTan - totals.labourPerTan;
  const retailUnitProfit = input.retailPrice * (input.retailMarginPercent / 100);

  return [
    {
      id: "retail",
      label: "Sell three more retail items a week",
      note: `${fmtUnit(retailUnitProfit)} profit per item, and no extra chair time at all`,
      annual: 3 * retailUnitProfit * WEEKS_PER_YEAR,
    },
    {
      id: "price",
      label: "Put your price up £2",
      note: "Across every tan you already do",
      annual: 2 * totals.tansPerYear * (1 - input.cardRatePercent / 100),
    },
    {
      id: "volume",
      label: "One more tan a week",
      note: "Valued at gross less labour — an extra booking adds no fixed cost",
      annual: marginalPerTan * WEEKS_PER_YEAR,
    },
    {
      id: "noshows",
      label: "Eliminate no-shows entirely",
      note: `At the ${(NO_SHOW_RATE * 100).toFixed(2)}% category rate — about ${Math.round(
        totals.tansPerYear * NO_SHOW_RATE,
      )} slots a year`,
      annual: totals.tansPerYear * NO_SHOW_RATE * marginalPerTan,
    },
    {
      id: "solution",
      label: "Find a solution 20% cheaper",
      note: "The number the industry argues about most",
      annual: ((input.litrePrice * 0.2) / (input.tansPerLitre || 1)) * totals.tansPerYear,
    },
  ].sort((a, b) => b.annual - a.annual);
}

function fmtUnit(value: number) {
  return `£${value.toFixed(2)}`;
}

/** Stated assumptions, with ranges — rendered as crawlable prose on the tool page. */
export const ASSUMPTIONS: Array<{ name: string; used: string; range: string }> = [
  { name: "Yield per litre", used: "28 tans", range: "the product figure — measure your own" },
  { name: "Disposables per tan", used: "£0.75", range: "£0.40–£1.50" },
  { name: "Filters, liners and laundry per tan", used: "£0.35", range: "£0.15–£0.70" },
  { name: "Chair time, door to door", used: "25 minutes", range: "20–35 minutes" },
  { name: "Employer on-cost multiplier", used: "1.20×", range: "1.15–1.25×" },
  { name: "Room-attributable fixed costs", used: "£450 per month", range: "£250–£900" },
  { name: "Retail margin at RRP", used: "50%", range: "40–60%" },
  { name: "Card processing rate", used: "1.5%", range: "1.0–2.0%" },
  { name: "Ticket price", used: "£30", range: "£20–£40 nationally" },
];

/**
 * FAQ for the tool page. Numbers are generated from the model above so they
 * cannot drift away from what the calculator actually computes.
 */
export function calculatorFaq(): Array<{ question: string; answer: string }> {
  const t = calculate(DEFAULTS);
  const ordered = levers(DEFAULTS);
  const solution = ordered.find((lever) => lever.id === "solution")!;
  const retail = ordered.find((lever) => lever.id === "retail")!;
  const money = (value: number) => `£${Math.round(value).toLocaleString("en-GB")}`;

  return [
    {
      question: "How much does a spray tan cost to deliver?",
      answer: `At £${DEFAULTS.litrePrice} a litre and ${DEFAULTS.tansPerLitre} tans to the litre, the solution is £${t.solutionPerTan.toFixed(
        2,
      )}. With disposables, filters and laundry, consumables come to £${t.consumablesPerTan.toFixed(
        2,
      )} a tan. Add card fees, loaded chair time and a share of your premises and the full cost is about £${(
        DEFAULTS.pricePerTan - t.netPerTan
      ).toFixed(2)} on a £${DEFAULTS.pricePerTan} treatment.`,
    },
    {
      question: "What profit is there in a spray tan?",
      answer: `About £${t.netPerTan.toFixed(2)} on a £${DEFAULTS.pricePerTan} tan with an employed therapist — roughly ${t.netMarginPercent.toFixed(
        0,
      )}%. Before labour and premises the contribution is £${t.grossPerTan.toFixed(
        2,
      )}, which is the figure to use when deciding whether to take one more booking.`,
    },
    {
      question: "Is a cheaper spray tan solution worth switching to?",
      answer: `At ${DEFAULTS.tansPerWeek} tans a week, a solution 20% cheaper saves about ${money(
        solution.annual,
      )} a year. Selling three more retail items a week is worth ${money(
        retail.annual,
      )}. Solution price is the smallest lever in the model, and one client lost to a poor result wipes out the saving.`,
    },
    {
      question: "How do I work out my overhead per spray tan?",
      answer: `Divide the fixed costs attributable to the tanning room each month — a share of rent, rates, utilities, insurance and booking software — by the treatments you did that month. At £${DEFAULTS.roomFixedCostsMonthly} and ${Math.round(
        t.tansPerMonth,
      )} tans that is £${t.overheadPerTan.toFixed(
        2,
      )} a tan, and it falls as you get busier. Filling the room is the same thing as making it cheaper.`,
    },
    {
      question: "How many spray tans do you get from a litre?",
      answer: `${DEFAULTS.tansPerLitre} for the Malibu Professional Spray litre. Your own number will sit either side of that depending on equipment, technique and coverage. Measure your own: mark the bottle, count the tans over a week and divide. Every other figure in this calculator depends on it.`,
    },
    {
      question: "Is this calculator free?",
      answer:
        "Yes. No email, no registration and no limit on use. It is built in pounds sterling for UK salons, mobile therapists and multi-site operators.",
    },
  ];
}
