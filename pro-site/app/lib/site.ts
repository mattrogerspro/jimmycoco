export const SITE_URL = "https://www.jimmycoco.pro";
/**
 * Date the site's static content last changed materially. Feeds dateModified in
 * structured data and lastmod for static routes in the sitemap. Bump it when you
 * change page copy — not on every deploy, or the freshness signal means nothing.
 */
export const CONTENT_UPDATED = "2026-08-07";

export const PRODUCT_PATH = "/products/malibu-professional-spray-1l";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function gbp(value: number, decimals = 0) {
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function gbpFromPence(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}
