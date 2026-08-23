import { useCallback, useMemo, useState } from "react";
import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "react-router";
import { Link, useLocation } from "react-router";
import homeStyles from "../styles/home.css?url";
import ritualStyles from "../styles/ritual.css?url";
import chromeStyles from "../styles/chrome.css?url";
import commerceStyles from "../styles/commerce.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { ApplicationRitual } from "../components/shared/ApplicationRitual";
import { Certification, Formula, GlowDuo, Hero, InstagramShowcase, Retail, Shades, Story, Trial } from "../components/home/HomeSections";
import { ProfitCalculator } from "../components/shared/ProfitCalculator";
import { parseTrialHandoff, type TrialCalculatorContext } from "../lib/calculator";
import { siteEntityGraph } from "../lib/entity";
import { PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";
import { handleApplicationSubmit } from "../lib/application-action.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStyles },
  { rel: "stylesheet", href: ritualStyles },
  { rel: "stylesheet", href: chromeStyles },
  { rel: "stylesheet", href: commerceStyles },
  {
    rel: "preload",
    as: "image",
    href: "/img/hero-kk-996.webp",
    imageSrcSet: "/img/hero-kk-560.webp 560w, /img/hero-kk-760.webp 760w, /img/hero-kk-996.webp 996w",
    imageSizes: "(max-width: 900px) 100vw, 34vw",
  } as never,
];

const socialImage = absoluteUrl("/social/home-og-1200x630.jpg");

export const meta: MetaFunction = () => [
  { title: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { name: "description", content: "Premium professional spray tan solutions, salon training and retail support from Hollywood tan artist Jimmy Coco. Request a complimentary salon trial." },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Sunless by Jimmy Coco Professional" },
  { property: "og:title", content: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { property: "og:description", content: "Hollywood's professional spray tan system for salons, spas and mobile professionals." },
  { property: "og:url", content: SITE_URL },
  { property: "og:image", content: socialImage },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:alt", content: "Sunless by Jimmy Coco professional spray tan system" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { name: "twitter:description", content: "Hollywood's professional spray tan system for salons, spas and mobile professionals." },
  { name: "twitter:image", content: socialImage },
  { name: "twitter:image:alt", content: "Sunless by Jimmy Coco professional spray tan system" },
  { tagName: "link", rel: "canonical", href: SITE_URL },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: SITE_URL },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: SITE_URL },
];

const schema = siteEntityGraph;

export async function action({ request }: ActionFunctionArgs) {
  return handleApplicationSubmit(request, { source: "pro-site-trial", adminBaseUrl: SITE_URL });
}

export default function HomePage() {
  const location = useLocation();
  const incomingCalculatorHandoff = useMemo(() => parseTrialHandoff(location.search), [location.search]);
  const [monthlyProfit, setMonthlyProfit] = useState(1282);
  const [trialCalculatorContext, setTrialCalculatorContext] = useState<TrialCalculatorContext | null>(null);
  const updateMonthlyProfit = useCallback((value: number) => setMonthlyProfit(value), []);
  const updateTrialCalculatorContext = useCallback((context: TrialCalculatorContext) => setTrialCalculatorContext(context), []);

  return (
    <>
      <StructuredData data={schema} />
      <Announcement />
      <SiteHeader />
      <main data-asset-revision="2026-08-13-home-reset-2">
        <Hero />
        <Story />
        <InstagramShowcase />
        <Formula />
        <Shades />
        <ProfitCalculator mode="compact" onMonthlyChange={updateMonthlyProfit} onTrialContextChange={updateTrialCalculatorContext} />
        <ApplicationRitual />
        <Retail />
        <GlowDuo />
        <Trial
          monthlyProfit={incomingCalculatorHandoff?.monthlyProfit ?? monthlyProfit}
          calculatorContext={incomingCalculatorHandoff?.context ?? trialCalculatorContext}
        />
        <Certification />
      </main>
      <SiteFooter />
      <div className="sticky-cta"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the litre</Link><a className="btn btn-dark" href="#trial">Free trial</a></div>
    </>
  );
}
