import { retailProductRrp, retailProductVolumeIncentive } from "../../lib/order-pricing";
import { gbp } from "../../lib/site";
import type { ReactNode } from "react";

const asset = (name: string) => `/assets/site/${name}`;

const BUFF_MITT_SRCSET = [480, 700, 960, 1200]
  .map((width) => `${asset(`buff-mitt-pro-${width}.webp`)} ${width}w`)
  .concat(`${asset("buff-mitt-pro.webp")} 1600w`)
  .join(", ");

const BUFF_MITT_SIZES = "(max-width: 620px) calc(100vw - 80px), (max-width: 900px) 420px, 320px";

export type RetailProductId = "mitt" | "souffleMedium" | "souffleDark" | "kit";

type RetailProduct = {
  id: RetailProductId;
  src: string;
  responsiveBase?: string;
  maxOrderQuantity?: number;
  hasVolumeTiers?: boolean;
  alt: string;
  badge: string;
  title: string;
  description: string;
  price: string;
  suffix: string;
};

export const RETAIL_PRODUCTS: readonly RetailProduct[] = [
  {
    id: "mitt",
    src: "buff-mitt-pro.webp",
    maxOrderQuantity: 48,
    hasVolumeTiers: true,
    alt: "Buff & Glow Mitt in navy",
    badge: "The easy add-on",
    title: "Buff & Glow Mitt",
    description: "The world's first 3-in-1 tanning mitt — streak-free maintenance between visits. The natural “add this to your visit” at checkout.",
    price: `RRP ${gbp(retailProductRrp("mitt"), 2)}`,
    suffix: "",
  },
  {
    id: "souffleMedium",
    src: "self-tan-souffle-medium-1600.webp",
    responsiveBase: "self-tan-souffle-medium",
    maxOrderQuantity: 48,
    hasVolumeTiers: true,
    alt: "Malibu Medium Self Tan Soufflé",
    badge: "The top-up seller · Medium",
    title: "Self Tan Soufflé · Medium",
    description: "Instant tint, Jimmy's iconic scent and a moisture-locking formula — a believable medium glow clients can maintain between appointments.",
    price: `RRP ${gbp(retailProductRrp("souffleMedium"))}`,
    suffix: "",
  },
  {
    id: "souffleDark",
    src: "self-tan-souffle-dark-1600.webp",
    responsiveBase: "self-tan-souffle-dark",
    maxOrderQuantity: 48,
    hasVolumeTiers: true,
    alt: "Malibu Dark Self Tan Soufflé",
    badge: "The top-up seller · Dark",
    title: "Self Tan Soufflé · Dark",
    description: "The same moisture-locking, instantly tinted formula in Dark — a deeper take-home colour for clients who want more intensity.",
    price: `RRP ${gbp(retailProductRrp("souffleDark"))}`,
    suffix: "",
  },
  {
    id: "kit",
    src: "retail-kit.webp",
    maxOrderQuantity: 48,
    hasVolumeTiers: true,
    alt: "The A-List Glow Kit complete routine",
    badge: "The gift purchase",
    title: "The A-List Glow Kit",
    description: "The complete six-piece routine — soufflé, world-first mitt, luxury brushes, face mist and lip balm. Your premium shelf anchor.",
    price: `RRP ${gbp(retailProductRrp("kit"))}`,
    suffix: " · 6 pieces",
  },
] as const;
export type RetailQuantities = Record<RetailProductId, number>;

export const EMPTY_RETAIL_QUANTITIES: RetailQuantities = { mitt: 0, souffleMedium: 0, souffleDark: 0, kit: 0 };

export function retailQuantitiesToSearchParams(quantities: RetailQuantities) {
  const params = new URLSearchParams();
  RETAIL_PRODUCTS.forEach(({ id }) => {
    if (quantities[id] > 0) params.set(id, String(quantities[id]));
  });
  return params;
}

export function retailQuantitiesFromSearchParams(params: URLSearchParams): RetailQuantities {
  const quantities = { ...EMPTY_RETAIL_QUANTITIES };
  RETAIL_PRODUCTS.forEach(({ id, maxOrderQuantity }) => {
    const quantity = Number.parseInt(params.get(id) ?? "0", 10);
    if (maxOrderQuantity && quantity >= 1 && quantity <= maxOrderQuantity) quantities[id] = quantity;
  });
  return quantities;
}

export function RetailProductCards({
  orderMode = false,
  cardHref,
  quantities,
  onQuantityChange,
  renderConfigurator,
}: {
  orderMode?: boolean;
  cardHref?: string;
  quantities?: RetailQuantities;
  onQuantityChange?: (id: RetailProductId, quantity: number) => void;
  renderConfigurator?: (id: RetailProductId, quantity: number) => ReactNode;
}) {
  return (
    <div className="shop-grid">
      {RETAIL_PRODUCTS.map((product) => {
        const { id, src, responsiveBase, maxOrderQuantity, hasVolumeTiers, alt, badge, title, description, price, suffix } = product;
        const quantity = quantities?.[id] ?? 0;
        const maximumSelected = Boolean(maxOrderQuantity && quantity >= maxOrderQuantity);
        const incentive = hasVolumeTiers ? retailProductVolumeIncentive(id, quantity) : undefined;
        const responsiveSrcSet = responsiveBase
          ? [480, 700, 960, 1200, 1600].map((width) => `${asset(`${responsiveBase}-${width}.webp`)} ${width}w`).join(", ")
          : undefined;
        const cardContent = <>
          <div className="pimg">
            <img
              src={asset(src)}
              srcSet={src === "buff-mitt-pro.webp" ? BUFF_MITT_SRCSET : responsiveSrcSet}
              sizes={src === "buff-mitt-pro.webp" || responsiveBase ? BUFF_MITT_SIZES : undefined}
              alt={alt}
              width="700"
              height="700"
              loading="lazy"
              decoding="async"
            />
            <span className="badge pimage-badge">{badge}</span>
            <div className="pimage-copy"><h3>{title}</h3></div>
          </div>
          <div className="pbody">
            <p className="pdesc">{description}</p>
            <span className="price">{price}<span>{suffix}</span></span>
            {orderMode && incentive ? <div className="retail-tier-nudge">
              <b>{gbp(incentive.currentProfit)} Profit*</b>
            </div> : null}
            {orderMode ? (
              renderConfigurator ? <div className="retail-order-controls retail-configure-control"><output aria-live="polite">{quantity === 0 ? "Not added" : `${quantity} added`}</output>{renderConfigurator(id, quantity)}</div> : <div className="retail-order-controls">
                  <button type="button" className="retail-remove" disabled={quantity === 0} onClick={() => onQuantityChange?.(id, Math.max(0, quantity - 1))} aria-label={`Remove one ${title}`}>−</button>
                  <output aria-live="polite">{quantity === 0 ? "Not added" : `${quantity} added`}</output>
                  <button type="button" className="retail-add" disabled={maximumSelected} onClick={() => onQuantityChange?.(id, quantity + 1)}>{quantity === 0 ? "Add to order" : maximumSelected ? "Maximum selected" : "Add another"}<i aria-hidden="true">{maximumSelected ? "✓" : "+"}</i></button>
                </div>
            ) : null}
            {cardHref ? <span className="pcard-link-label">View in salon order <i aria-hidden="true">→</i></span> : null}
          </div>
        </>;
        const className = `pcard${quantity > 0 ? " is-added" : ""}${cardHref ? " pcard-link" : ""}`;
        return cardHref
          ? <a className={className} href={cardHref} aria-label={`View ${title} in the salon order`} key={src}>{cardContent}</a>
          : <div className={className} key={src}>{cardContent}</div>;
      })}
    </div>
  );
}
