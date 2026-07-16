export const SITE_URL = "https://pro.jimmycoco.email";
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
