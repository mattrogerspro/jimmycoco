/** Existing public product photography, keyed by the immutable trade SKU. */
const PRODUCT_IMAGES: Record<string, string> = {
  "MALIBU-1L": "/assets/site/malibu-bottle.webp",
  "MITT-BUFF-GLOW": "/assets/site/buff-mitt-pro-480.webp",
  "SOUFFLE-SELF-TAN": "/assets/site/retail-souffle.webp",
  "KIT-A-LIST-GLOW": "/assets/site/retail-kit.webp",
};

export function productImageForSku(sku: string | null | undefined) {
  return sku ? PRODUCT_IMAGES[sku] ?? null : null;
}
