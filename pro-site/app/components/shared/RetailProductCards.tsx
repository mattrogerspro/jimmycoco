const asset = (name: string) => `/assets/site/${name}`;

const BUFF_MITT_SRCSET = [480, 700, 960, 1200]
  .map((width) => `${asset(`buff-mitt-pro-${width}.webp`)} ${width}w`)
  .concat(`${asset("buff-mitt-pro.webp")} 1600w`)
  .join(", ");

const BUFF_MITT_SIZES = "(max-width: 620px) calc(100vw - 80px), (max-width: 900px) 420px, 320px";

export const RETAIL_PRODUCTS = [
  {
    id: "mitt",
    src: "buff-mitt-pro.webp",
    alt: "Buff & Glow Mitt in navy",
    badge: "The easy add-on",
    title: "Buff & Glow Mitt",
    description: "The world's first 3-in-1 tanning mitt — streak-free maintenance between visits. The natural “add this to your visit” at checkout.",
    price: "RRP £15",
    suffix: "",
  },
  {
    id: "souffle",
    src: "retail-souffle.webp",
    alt: "The Self Tan Soufflé with mitt and face mist bundle",
    badge: "The top-up seller",
    title: "The Self Tan Soufflé",
    description: "Instant tint, Jimmy's iconic scent and a moisture-locking formula — the take-home that extends your work between appointments.",
    price: "Medium · Dark",
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

export type RetailProductId = typeof RETAIL_PRODUCTS[number]["id"];
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
      {RETAIL_PRODUCTS.map(({ id, src, alt, badge, title, description, price, suffix }) => {
        const quantity = quantities?.[id] ?? 0;
        return <div className={`pcard${quantity > 0 ? " is-added" : ""}`} key={src}>
          <div className="pimg">
            <img
              src={asset(src)}
              srcSet={src === "buff-mitt-pro.webp" ? BUFF_MITT_SRCSET : undefined}
              sizes={src === "buff-mitt-pro.webp" ? BUFF_MITT_SIZES : undefined}
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
                <button type="button" className="retail-remove" disabled={quantity === 0} onClick={() => onQuantityChange?.(id, Math.max(0, quantity - 1))} aria-label={`Remove one ${title}`}>−</button>
                <output aria-live="polite">{quantity === 0 ? "Not added" : `${quantity} added`}</output>
                <button type="button" className="retail-add" onClick={() => onQuantityChange?.(id, quantity + 1)}>{quantity === 0 ? "Add to order" : "Add another"}<i aria-hidden="true">+</i></button>
              </div>
            ) : null}
          </div>
        </div>
      })}
    </div>
  );
}
