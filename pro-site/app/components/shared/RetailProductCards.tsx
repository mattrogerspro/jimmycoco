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
  orderSteps?: readonly number[];
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
    orderSteps: [1, 2, 3, 4],
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
    orderSteps: [6, 12, 24],
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
    orderSteps: [6, 12, 24],
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
    alt: "The A-List Glow Kit complete routine",
    badge: "The gift purchase",
    title: "The A-List Glow Kit",
    description: "The complete six-piece routine — soufflé, world-first mitt, luxury brushes, face mist and lip balm. Your premium shelf anchor.",
    price: "RRP £59",
    suffix: " · 6 pieces",
  },
] as const;
export type RetailQuantities = Record<RetailProductId, number>;

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
        const { id, src, responsiveBase, orderSteps, alt, badge, title, description, price, suffix } = product;
        const quantity = quantities?.[id] ?? 0;
        const nextQuantity = orderSteps ? orderSteps.find((step) => step > quantity) ?? quantity : quantity + 1;
        const previousQuantity = orderSteps ? [...orderSteps].reverse().find((step) => step < quantity) ?? 0 : Math.max(0, quantity - 1);
        const maximumTierSelected = Boolean(orderSteps && quantity === orderSteps[orderSteps.length - 1]);
        const hasVolumeTiers = orderSteps?.[0] === 6;
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
            {orderMode ? (
              <div className="retail-order-controls">
                <button type="button" className="retail-remove" disabled={quantity === 0} onClick={() => onQuantityChange?.(id, previousQuantity)} aria-label={`Reduce ${title} quantity`}>−</button>
                <output aria-live="polite">{quantity === 0 ? "Not added" : `${quantity} added`}</output>
                <button type="button" className="retail-add" disabled={maximumTierSelected} onClick={() => onQuantityChange?.(id, nextQuantity)}>{quantity === 0 ? (hasVolumeTiers ? "Add starter 6" : "Add to order") : maximumTierSelected ? (hasVolumeTiers ? "Premium selected" : "Maximum selected") : hasVolumeTiers ? `Move to ${nextQuantity}` : "Add another"}<i aria-hidden="true">{maximumTierSelected ? "✓" : "+"}</i></button>
              </div>
            ) : null}
          </div>
        </div>
      })}
    </div>
  );
}
