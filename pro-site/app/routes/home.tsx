import { useCallback, useState } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import homeStyles from "../styles/home.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { Formula, Hero, Retail, Ritual, Shades, Story, Trial } from "../components/home/HomeSections";
import { ProfitCalculator } from "../components/home/ProfitCalculator";
import { SITE_URL, absoluteUrl } from "../lib/site";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: homeStyles }];

export const meta: MetaFunction = () => [
  { title: "Professional Spray Tan Solutions for Salons | Sunless by Jimmy Coco" },
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
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sunless by Jimmy Coco",
    url: SITE_URL,
    email: "pro@jimmycoco.co.uk",
    founder: { "@type": "Person", name: "Jimmy Coco" },
    sameAs: ["https://jimmycoco.co.uk"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sunless by Jimmy Coco Professional",
    url: SITE_URL,
    inLanguage: "en-GB",
  },
];

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
        <Ritual />
        <Retail />
        <Trial monthlyProfit={monthlyProfit} />
      </main>
      <SiteFooter />
      <div className="sticky-cta"><a className="btn btn-bronze" href="#trial">Free trial</a><a className="btn btn-dark" href="#calculator">Profit calculator</a></div>
    </>
  );
}
