import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import productStyles from "../styles/product.css?url";
import ritualStyles from "../styles/ritual.css?url";
import chromeStyles from "../styles/chrome.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { ApplicationRitual } from "../components/shared/ApplicationRitual";
import { ProductProofStrip, ProductPurchase, StickyOrder, usePurchaseState } from "../components/product/ProductPurchase";
import { CrossSell, JimmyStory, OrderSection, ProductDetails, SalonFaq, ShadeComparison, Specification } from "../components/product/ProductSections";
import { ORG_ID, brandEntities } from "../lib/entity";
import { faqPageSchema } from "../lib/faq";
import { priceValidUntil, specSchemaProperties } from "../lib/specs";
import { CONTENT_UPDATED, PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";
import { handleApplicationSubmit } from "../lib/application-action.server";
import { SHOW_LEGACY_MALIBU_SHADE_RANGE } from "../lib/product-features";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: productStyles }, { rel: "stylesheet", href: ritualStyles }, { rel: "stylesheet", href: chromeStyles }];

const canonical = absoluteUrl(PRODUCT_PATH);

export const meta: MetaFunction = () => [
  { title: "Malibu Professional Spray Tan Solution 1L | Jimmy Coco" },
  { name: "description", content: "Order Malibu universal bronze glow professional spray tan solution in a salon-size 1 litre bottle, providing approximately 28 full-body tans." },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "product" },
  { property: "og:site_name", content: "Sunless by Jimmy Coco Professional" },
  { property: "og:title", content: "Malibu Professional Spray Tan Solution 1L" },
  { property: "og:description", content: "Salon-size professional spray tan solution in one universal bronze glow shade, with approximately 28 full-body tans per bottle." },
  { property: "og:url", content: canonical },
  { property: "og:image", content: absoluteUrl("/assets/site/product-01-0003c7706e6e.jpg") },
  { property: "product:price:amount", content: "60.00" },
  { property: "product:price:currency", content: "GBP" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Malibu Professional Spray Tan Solution 1L" },
  { name: "twitter:description", content: "Professional salon spray tan solution by Jimmy Coco." },
  { name: "twitter:image", content: absoluteUrl("/assets/site/product-01-0003c7706e6e.jpg") },
  { tagName: "link", rel: "canonical", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonical },
];

const schema = [
  ...brandEntities,
  faqPageSchema,
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Malibu Professional Spray Tan Solution 1L",
    description: "Professional salon spray tan solution in a 1 litre bottle, providing approximately 28 full-body tans.",
    image: [absoluteUrl("/assets/site/product-01-0003c7706e6e.jpg")],
    brand: { "@id": ORG_ID },
    manufacturer: { "@id": ORG_ID },
    offers: {
      "@type": "Offer", url: canonical, priceCurrency: "GBP", price: "60.00",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      priceValidUntil: priceValidUntil(),
    },
    sku: "MALIBU-1L",
    additionalProperty: specSchemaProperties,
    dateModified: CONTENT_UPDATED,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Professional", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Malibu Solution", item: absoluteUrl("/#shades") },
      { "@type": "ListItem", position: 3, name: "Malibu Professional Spray 1L", item: canonical },
    ],
  },
];

export async function action({ request }: ActionFunctionArgs) {
  return handleApplicationSubmit(request, { source: "pro-site-order", adminBaseUrl: SITE_URL });
}

export default function ProductPage() {
  const { state, setState, ctaRef } = usePurchaseState();
  return <>
    <StructuredData data={schema} />
    <Announcement page="product" />
    <SiteHeader page="product" />
    <main>
      <section className="pdp-shell">
        <div className="wrap crumbs"><Link to="/">Professional</Link> › <Link to="/#shades">Malibu Solution</Link> › <b>1 Litre · Salon Order</b></div>
        <ProductPurchase state={state} setState={setState} ctaRef={ctaRef} />
      </section>
      <ProductProofStrip />
      <JimmyStory />
      {SHOW_LEGACY_MALIBU_SHADE_RANGE ? <ShadeComparison onChoose={(shade) => setState((current) => ({ ...current, shade }))} /> : null}
      <ApplicationRitual />
      <CrossSell />
      <Specification />
      <ProductDetails />
      <SalonFaq />
      <OrderSection state={state} />
    </main>
    <SiteFooter page="product" />
    <StickyOrder state={state} target={ctaRef} />
  </>;
}
