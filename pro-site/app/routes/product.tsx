import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import productStyles from "../styles/product.css?url";
import chromeStyles from "../styles/chrome.css?url";
import commerceStyles from "../styles/commerce.css?url";
import { Announcement, SiteFooter, SiteHeader, StructuredData } from "../components/shared/SiteChrome";
import { ProductPurchase, StickyOrder, usePurchaseState } from "../components/product/ProductPurchase";
import { CrossSell, OrderSection, ProductDetails } from "../components/product/ProductSections";
import { ORG_ID, brandEntities } from "../lib/entity";
import { LITRE_PRICE_GBP, priceValidUntil, specSchemaProperties } from "../lib/specs";
import { CONTENT_UPDATED, PRODUCT_PATH, SITE_URL, absoluteUrl } from "../lib/site";
import { handleApplicationSubmit } from "../lib/application-action.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: productStyles }, { rel: "stylesheet", href: chromeStyles }, { rel: "stylesheet", href: commerceStyles }];

const canonical = absoluteUrl(PRODUCT_PATH);
const socialImage = absoluteUrl("/social/product-og-1200x630.jpg");

export const meta: MetaFunction = () => [
  { title: "Malibu Professional Spray Tan Solution 1L | Jimmy Coco" },
  { name: "description", content: "Order Malibu universal bronze glow professional spray tan solution in a salon-size 1 litre bottle, providing approximately 28 full-body tans." },
  { name: "robots", content: "index, follow, max-image-preview:large" },
  { property: "og:type", content: "product" },
  { property: "og:site_name", content: "Sunless by Jimmy Coco Professional" },
  { property: "og:title", content: "Malibu Professional Spray Tan Solution 1L" },
  { property: "og:description", content: "Salon-size professional spray tan solution in one universal bronze glow shade, with approximately 28 full-body tans per bottle." },
  { property: "og:url", content: canonical },
  { property: "og:image", content: socialImage },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:alt", content: "Malibu Professional Spray 1L by Sunless by Jimmy Coco" },
  { property: "product:price:amount", content: LITRE_PRICE_GBP.toFixed(2) },
  { property: "product:price:currency", content: "GBP" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Malibu Professional Spray Tan Solution 1L" },
  { name: "twitter:description", content: "Professional salon spray tan solution by Jimmy Coco." },
  { name: "twitter:image", content: socialImage },
  { name: "twitter:image:alt", content: "Malibu Professional Spray 1L by Sunless by Jimmy Coco" },
  { tagName: "link", rel: "canonical", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "en-GB", href: canonical },
  { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonical },
];

const schema = [
  ...brandEntities,
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Malibu Professional Spray Tan Solution 1L",
    description: "Professional salon spray tan solution in a 1 litre bottle, providing approximately 28 full-body tans.",
    image: [absoluteUrl("/assets/site/product-01-0003c7706e6e.jpg")],
    brand: { "@id": ORG_ID },
    manufacturer: { "@id": ORG_ID },
    offers: {
      "@type": "Offer", url: canonical, priceCurrency: "GBP", price: LITRE_PRICE_GBP.toFixed(2),
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
    <main data-asset-revision="2026-08-14-order-builder">
      <section className="pdp-shell" id="configure-solution">
        <div className="wrap crumbs"><Link to="/">Professional</Link> › <Link to="/#shades">Malibu Solution</Link> › <b>1 Litre · Salon Order</b></div>
        <ProductPurchase state={state} setState={setState} ctaRef={ctaRef} />
      </section>
      <ProductDetails />
      <CrossSell state={state} setState={setState} />
      <OrderSection state={state} />
    </main>
    <SiteFooter page="product" />
    <StickyOrder state={state} target={ctaRef} />
  </>;
}
