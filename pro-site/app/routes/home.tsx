import { useCallback, useState } from "react";
import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import homeStyles from "../styles/home.css?url";
import ritualStyles from "../styles/ritual.css?url";
import chromeStyles from "../styles/chrome.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { ApplicationRitual } from "../components/shared/ApplicationRitual";
import { Certification, Formula, GlowDuo, Hero, Retail, Shades, Story, Trial } from "../components/home/HomeSections";
import { ProfitCalculator } from "../components/home/ProfitCalculator";
import { siteEntityGraph } from "../lib/entity";
import { PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";
import { handleApplicationSubmit } from "../lib/application-action.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStyles },
  { rel: "stylesheet", href: ritualStyles },
  { rel: "stylesheet", href: chromeStyles },
  {
    rel: "preload",
    as: "image",
    href: "/img/hero-1100.webp",
    imageSrcSet: "/img/hero-560.webp 560w, /img/hero-760.webp 760w, /img/hero-1100.webp 1100w",
    imageSizes: "(max-width: 900px) 100vw, 50vw",
  } as never,
];

export const meta: MetaFunction = () => [
  { title: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { name: "description", content: "Premium professional spray tan solutions, salon training and retail support from Hollywood tan artist Jimmy Coco. Request a complimentary salon trial." },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Sunless by Jimmy Coco Professional" },
  { property: "og:title", content: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { property: "og:description", content: "Hollywood's professional spray tan system for salons, spas and mobile professionals." },
  { property: "og:url", content: SITE_URL },
  { property: "og:image", content: absoluteUrl("/img/hero.webp") },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Professional Spray Tan Solutions | Sunless by Jimmy Coco" },
  { name: "twitter:description", content: "Hollywood's professional spray tan system for salons, spas and mobile professionals." },
  { name: "twitter:image", content: absoluteUrl("/img/hero.webp") },
  { tagName: "link", rel: "canonical", href: SITE_URL },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: SITE_URL },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: SITE_URL },
];

const schema = siteEntityGraph;

export async function action({ request }: ActionFunctionArgs) {
  return handleApplicationSubmit(request, { source: "pro-site-trial", adminBaseUrl: SITE_URL });
}

export default function HomePage() {
  const [monthlyProfit, setMonthlyProfit] = useState(1282);
  const updateMonthlyProfit = useCallback((value: number) => setMonthlyProfit(value), []);

  return (
    <>
      <StructuredData data={schema} />
      <Announcement />
      <SiteHeader />
      <main>
        <Hero />
        <Story />
        <Formula />
        <Shades />
        <ProfitCalculator onMonthlyChange={updateMonthlyProfit} />
        <ApplicationRitual />
        <Retail />
        <GlowDuo />
        <Trial monthlyProfit={monthlyProfit} />
        <Certification />
      </main>
      <SiteFooter />
      <div className="sticky-cta"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the litre</Link><a className="btn btn-dark" href="#trial">Free trial</a></div>
    </>
  );
}
