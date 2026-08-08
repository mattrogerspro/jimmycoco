export const SITE_URL = "https://www.jimmycoco.pro";
/** Injected by Vite at build time — see resolveContentDate() in vite.config.ts. */
declare const __CONTENT_UPDATED__: string;

/**
 * Date the site's content last changed. Resolved automatically at build time
 * from the last commit touching app/routes, app/components or app/styles, so
 * there is nothing to remember to bump. Feeds sitemap <lastmod> and
 * dateModified in structured data.
 */
export const CONTENT_UPDATED = __CONTENT_UPDATED__;

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
