import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import homeStyles from "../styles/home.css?url";
import chromeStyles from "../styles/chrome.css?url";
import toolStyles from "../styles/tools.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { ProfitCalculator } from "../components/shared/ProfitCalculator";
import { useCurrency } from "../components/shared/CurrencyContext";
import { ORG_ID, brandEntities } from "../lib/entity";
import { ASSUMPTIONS, DEFAULTS, calculate, calculatorFaq, levers } from "../lib/calculator";
import { handleCalculatorReportSubmit } from "../lib/calculator-report.server";
import { CONTENT_UPDATED, PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";

export const TOOL_PATH = "/tools/spray-tan-profit-calculator";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: "/assets/site/calculator-page/header-hero-1440.webp",
    imageSrcSet:
      "/assets/site/calculator-page/header-hero-480.webp 480w, /assets/site/calculator-page/header-hero-768.webp 768w, /assets/site/calculator-page/header-hero-1080.webp 1080w, /assets/site/calculator-page/header-hero-1440.webp 1440w, /assets/site/calculator-page/header-hero-1920.webp 1920w, /assets/site/calculator-page/header-hero-2560.webp 2560w",
    imageSizes: "100vw",
  },
  { rel: "stylesheet", href: homeStyles },
  { rel: "stylesheet", href: chromeStyles },
  { rel: "stylesheet", href: toolStyles },
];

const canonical = absoluteUrl(TOOL_PATH);
const socialImage = absoluteUrl("/social/calculator-og-1200x630.jpg");
const title = "Spray Tan Profit Calculator (UK, £) | Sunless by Jimmy Coco";
const description =
  "Free UK spray tan profit calculator in pounds. Solution, consumables, chair time and premises — see your real cost per tan and what each change is worth per year.";

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: description },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Sunless by Jimmy Coco Professional" },
  { property: "og:title", content: "Spray Tan Profit Calculator — in pounds, for UK salons" },
  { property: "og:description", content: description },
  { property: "og:url", content: canonical },
  { property: "og:image", content: socialImage },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:alt", content: "Calculate your tanning profit with the Sunless by Jimmy Coco salon calculator" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:image", content: socialImage },
  { name: "twitter:image:alt", content: "Calculate your tanning profit with the Sunless by Jimmy Coco salon calculator" },
  { name: "twitter:title", content: "Spray Tan Profit Calculator (UK, £)" },
  { name: "twitter:description", content: description },
  { tagName: "link", rel: "canonical", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonical },
];

const faq = calculatorFaq();

const schema = [
  ...brandEntities,
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${canonical}#tool`,
    name: "Spray Tan Profit Calculator",
    url: canonical,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any modern web browser",
    inLanguage: "en-GB",
    description,
    publisher: { "@id": ORG_ID },
    dateModified: CONTENT_UPDATED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    featureList: [
      "Cost per spray tan in pounds sterling",
      "Solution, disposables, filters and laundry modelled separately",
      "Loaded chair time including employer on-costs",
      "Overhead apportionment per treatment",
      "Retail attach contribution",
      "Annual value of each improvement, ranked",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Professional", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools/spray-tan-profit-calculator") },
      { "@type": "ListItem", position: 3, name: "Spray tan profit calculator", item: canonical },
    ],
  },
];

export async function action({ request }: ActionFunctionArgs) {
  return handleCalculatorReportSubmit(request);
}

/**
 * Everything below the calculator is server-rendered prose.
 *
 * The interactive part computes in the browser, which means none of its numbers
 * exist in the HTML. A crawler or an AI assistant reading this page sees only
 * what is written out here — so the worked example, the method, the assumptions
 * and the FAQ are all rendered from the same model the calculator uses.
 */
export default function CalculatorPage() {
  const { isUsd, money } = useCurrency();
  const gbp = money;
  const totals = calculate(DEFAULTS);
  const leverRows = levers(DEFAULTS);
  const fullCost = DEFAULTS.pricePerTan - totals.netPerTan;

  return (
    <>
      <StructuredData data={schema} />
      <Announcement />
      <SiteHeader page="content" />
      <main className="tool-page">
        <header className="tool-hero">
          <div className="wrap">
            <p className="eyebrow">Free tool · no email required</p>
            <h1>
              Spray tan profit calculator,
              <br />
              <em>{isUsd ? "in USD." : "in pounds."}</em>
            </h1>
            <p className="sub">
              {isUsd
                ? "Indicative USD equivalents for the UK base assumptions — adjust the inputs to explore your own salon model."
                : "Put your own figures in — solution, consumables, chair time, premises and the shelf — and see what a tan actually leaves you."}
            </p>
          </div>
        </header>

        <ProfitCalculator mode="full" />

        <section className="tool-prose">
          <div className="wrap">
            {isUsd && <p className="tool-note">The methodology and assumptions below remain GBP-base reference material. Displayed figures are indicative USD equivalents, not US pricing commitments or an earnings forecast.</p>}
            <h2>What a spray tan costs to deliver</h2>
            <p>
              At {gbp(DEFAULTS.litrePrice)} a litre and {DEFAULTS.tansPerLitre} tans to the litre, the
              solution in the bottle costs {gbp(totals.solutionPerTan, 2)} a tan. That is the number
              most people mean when they talk about what a tan costs — and it is the smallest part of
              it.
            </p>
            <p>
              Add disposables, filters, liners and laundry and consumables come to{" "}
              {gbp(totals.consumablesPerTan, 2)}. Add card fees, the loaded cost of the chair time,
              and the share of your premises that the tanning room uses, and the full cost of a{" "}
              {gbp(DEFAULTS.pricePerTan)} tan is about {gbp(fullCost, 2)} — leaving{" "}
              {gbp(totals.netPerTan, 2)} of profit, or {totals.netMarginPercent.toFixed(1)}%.
            </p>

            <h3>The worked example</h3>
            <p>
              One salon, one treatment room, an employed therapist. {DEFAULTS.tansPerWeek} tans a
              week at {gbp(DEFAULTS.pricePerTan)} each — {Math.round(totals.tansPerYear)} a year.
              Spray tans run {gbp(20)}–{gbp(40)} across the UK, so these are middling numbers on purpose.
            </p>
            <table className="tool-table">
              <caption>Cost of one spray tan at {gbp(DEFAULTS.pricePerTan)}</caption>
              <tbody>
                <tr>
                  <th scope="row">Client pays</th>
                  <td>{gbp(DEFAULTS.pricePerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Solution</th>
                  <td>−{gbp(totals.solutionPerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Disposables</th>
                  <td>−{gbp(DEFAULTS.disposablesPerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Filters, liners and laundry</th>
                  <td>−{gbp(DEFAULTS.sundriesPerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Card fee</th>
                  <td>−{gbp(totals.cardFeePerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Chair time, loaded</th>
                  <td>−{gbp(totals.labourPerTan, 2)}</td>
                </tr>
                <tr>
                  <th scope="row">Share of fixed costs</th>
                  <td>−{gbp(totals.overheadPerTan, 2)}</td>
                </tr>
                <tr className="tool-total">
                  <th scope="row">Profit</th>
                  <td>{gbp(totals.netPerTan, 2)}</td>
                </tr>
              </tbody>
            </table>

            <h3>How the chair time is costed</h3>
            <p>
              A spray tan is not a fifteen-minute treatment. Door to door — consultation, prep,
              treatment, clean-down and reset — the model assumes {DEFAULTS.minutesPerTan} minutes.
              At the National Living Wage of {gbp(DEFAULTS.hourlyRate, 2)} an hour from April 2026,
              that is {gbp(DEFAULTS.hourlyRate * (DEFAULTS.minutesPerTan / 60), 2)} of wage, and
              about {gbp(totals.labourPerTan, 2)} once employer National Insurance and holiday pay
              accrual are added. If you do the tans yourself, set the hourly rate to zero — but the
              minutes are still the scarcest thing you own.
            </p>

            <h3>How the overhead is apportioned</h3>
            <p>
              Take the fixed costs attributable to the tanning room each month — a share of rent and
              rates, the room's heat, light and water, your treatment liability insurance, a slice of
              the booking software — and divide by the treatments you did that month. At{" "}
              {gbp(DEFAULTS.roomFixedCostsMonthly)} a month and {Math.round(totals.tansPerMonth)}{" "}
              tans, that is {gbp(totals.overheadPerTan, 2)} a tan.
            </p>
            <p>
              Note what that does: overhead per tan is a function of how busy you are, not of how
              much you spend. Doing more tans in the same room is the same thing as making the room
              cheaper.
            </p>

            <h3>What actually moves the number</h3>
            <p>
              Same salon, {Math.round(totals.tansPerYear)} tans a year, one change at a time:
            </p>
            <table className="tool-table">
              <caption>Annual value of each change, at the default figures</caption>
              <thead>
                <tr>
                  <th scope="col">Change</th>
                  <th scope="col">Extra profit per year</th>
                </tr>
              </thead>
              <tbody>
                {leverRows.map((lever) => (
                  <tr key={lever.id}>
                    <th scope="row">{lever.label}</th>
                    <td>{gbp(lever.annual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Read that from the bottom. A litre 20% cheaper is the smallest lever available to you,
              and it is the one the industry spends most of its time arguing about. Retail is the
              largest, and it costs no chair time at all.
            </p>

            <h3>The assumptions</h3>
            <p>
              Everything the model chooses rather than measures, with the range it realistically
              moves in. Change any of them in the calculator above.
            </p>
            <table className="tool-table">
              <caption>Stated assumptions and their realistic ranges</caption>
              <thead>
                <tr>
                  <th scope="col">Assumption</th>
                  <th scope="col">Used here</th>
                  <th scope="col">Realistic range</th>
                </tr>
              </thead>
              <tbody>
                {ASSUMPTIONS.map((assumption) => (
                  <tr key={assumption.name}>
                    <th scope="row">{assumption.name}</th>
                    <td>{assumption.used}</td>
                    <td>{assumption.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Questions</h2>
            <dl className="tool-faq">
              {faq.map((item) => (
                <div key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>

            <p className="tool-note">
              These figures are a model, not a forecast. Substitute your own numbers — the
              assumptions are listed above so you can. Retail margin is illustrative — standard
              UK trade margin is ~50% (keystone markup). Full trade wholesale pricing is included
              inside your order confirmation and trial box.
            </p>

          </div>
        </section>

        <section className="tool-footer-hero" aria-labelledby="calculator-footer-title">
          <div className="wrap">
            <p className="eyebrow">Turn the calculation into a plan</p>
            <h2 id="calculator-footer-title">
              Run the numbers,
              <br />
              then order what the room needs.
            </h2>
            <p>
              Start with the litre that anchors the profit model, or request the salon trial if you
              want to test the finish first.
            </p>
            <div className="tool-next">
              <Link className="btn btn-bronze" to={PRODUCT_PATH}>
                Order the litre — {gbp(DEFAULTS.litrePrice)}
              </Link>
              <Link className="btn btn-ghost" to="/#trial">
                Request a free salon trial
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter page="content" />
    </>
  );
}
