import { retailVolumeIncentive } from "../../lib/order-pricing";
import { gbp } from "../../lib/site";

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
    maxOrderQuantity: 4,
    alt: "Buff & Glow Mitt in navy",
    badge: "The easy add-on",
    title: "Buff & Glow Mitt",
    description: "The world's first 3-in-1 tanning mitt — streak-free maintenance between visits. The natural “add this to your visit” at checkout.",
    price: "RRP £15",
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
    price: "RRP £22",
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
    price: "RRP £22",
    suffix: "",
  },
  {
    id: "kit",
    src: "retail-kit.webp",
    maxOrderQuantity: 4,
    alt: "The A-List Glow Kit complete routine",
    badge: "The gift purchase",
    title: "The A-List Glow Kit",
    description: "The complete six-piece routine — soufflé, world-first mitt, luxury brushes, face mist and lip balm. Your premium shelf anchor.",
    price: "RRP £59",
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
  quantities,
  onQuantityChange,
}: {
  orderMode?: boolean;
  quantities?: RetailQuantities;
  onQuantityChange?: (id: RetailProductId, quantity: number) => void;
}) {
  return (
    <div className="shop-grid">
      {RETAIL_PRODUCTS.map((product) => {
        const { id, src, responsiveBase, maxOrderQuantity, hasVolumeTiers, alt, badge, title, description, price, suffix } = product;
        const quantity = quantities?.[id] ?? 0;
        const maximumSelected = Boolean(maxOrderQuantity && quantity >= maxOrderQuantity);
        const incentive = hasVolumeTiers ? retailVolumeIncentive(quantity) : undefined;
        const responsiveSrcSet = responsiveBase
          ? [480, 700, 960, 1200, 1600].map((width) => `${asset(`${responsiveBase}-${width}.webp`)} ${width}w`).join(", ")
          : undefined;
        return <div className={`pcard${quantity > 0 ? " is-added" : ""}`} key={src}>
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
            {orderMode && incentive ? <div className={`retail-tier-nudge${incentive.nextTier ? "" : " is-unlocked"}`}>
              {incentive.nextTier ? <><span>{quantity ? `${incentive.unitsNeeded} more` : `Add ${incentive.unitsNeeded}`} to unlock {incentive.nextTier.name}</span><b>+{gbp(incentive.additionalProfit)} potential profit</b><small>{gbp(incentive.targetProfit)} total profit at {incentive.nextTier.quantity} sold · {gbp(incentive.nextTier.unitPrice, incentive.nextTier.unitPrice % 1 ? 2 : 0)} each</small></> : <><span>Premium rate unlocked</span><b>{gbp(incentive.currentProfit)} potential profit</b><small>{gbp(incentive.currentTier?.unitPrice ?? 0)} each · at current quantity sold at RRP</small></>}
            </div> : null}
            {orderMode ? (
              <div className="retail-order-controls">
                <button type="button" className="retail-remove" disabled={quantity === 0} onClick={() => onQuantityChange?.(id, Math.max(0, quantity - 1))} aria-label={`Remove one ${title}`}>−</button>
                <output aria-live="polite">{quantity === 0 ? "Not added" : `${quantity} added`}</output>
                <button type="button" className="retail-add" disabled={maximumSelected} onClick={() => onQuantityChange?.(id, quantity + 1)}>{quantity === 0 ? "Add to order" : maximumSelected ? "Maximum selected" : "Add another"}<i aria-hidden="true">{maximumSelected ? "✓" : "+"}</i></button>
              </div>
            ) : null}
          </div>
        </div>
      })}
    </div>
  );
}
