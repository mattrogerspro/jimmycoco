import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gbp } from "../../lib/site";
import { MALIBU_UNIVERSAL_SHADE } from "../../lib/product-features";
import type { RetailQuantities } from "../shared/RetailProductCards";

export type PurchaseState = { shade: string; qty: number; retail: RetailQuantities };

export const SHADE_OPTIONS = [
  { name: "Light · 6% DHA", label: "LIGHT", className: "s1" },
  { name: "Medium · 8% DHA", label: "MEDIUM", className: "s2" },
  { name: "Medium / Dark · 10% DHA", label: "MED / DARK", className: "s3" },
  { name: "Dark · 12% DHA", label: "DARK", className: "s4" },
];

const gallery: Array<[string, string, number, number]> = [
  ["product-01-0003c7706e6e.jpg", "Bottle", 900, 900],
  ["product-02-90c11d032981.jpg", "Product details", 900, 855],
  ["product-03-d9921088377a.jpg", "Solution texture", 440, 492],
  ["product-04-313d9d6a60b1.jpg", "Results", 760, 1777],
  ["product-05-e60eda7f1217.jpg", "Application", 1000, 1678],
];

const asset = (name: string) => `/assets/site/${name}`;

export function ProductPurchase({ state, setState, ctaRef }: {
  state: PurchaseState;
  setState: React.Dispatch<React.SetStateAction<PurchaseState>>;
  ctaRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const total = 60 * state.qty;
  const capacity = 28 * state.qty;
  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;
  const coverWeeks = capacity / 12;
  const formatDuration = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });
  const stockCover = coverWeeks >= 12
    ? `${formatDuration(coverWeeks / 4.33)} months`
    : `${formatDuration(coverWeeks)} weeks`;

  const setQty = (qty: number) => setState((current) => ({ ...current, qty: Math.max(1, Math.min(48, qty)) }));

  return <div className="wrap pdp">
    <div className="gallery">
      <div className="gmain"><img src={asset(gallery[selectedImage][0])} alt="Malibu professional spray tan solution, 1 litre bottle" width={gallery[selectedImage][2]} height={gallery[selectedImage][3]} fetchPriority="high" /></div>
      <div className="gthumbs">{gallery.map(([src, label, width, height], index) => <button className={selectedImage === index ? "active" : ""} onClick={() => setSelectedImage(index)} aria-label={label} type="button" key={src}><img src={asset(src)} alt="" width={width} height={height} loading="lazy" decoding="async" /></button>)}</div>
    </div>
    <div className="buybox">
      <div className="product-heading">
        <p className="bb-eyebrow">Professional self tan · Salon order</p>
        <h1>Malibu Professional Spray <span className="title-number">1</span> Litre</h1>
      </div>

      <div className="price-block">
        <div className="price-row"><span className="price-big">£60 <small>per litre</small></span><span className="pertan">≈ £2.14 per tan</span></div>
        <p>Free UK delivery · Trade terms confirmed before payment</p>
      </div>

      <div className="purchase-control">
        <p className="sel-label">Shade <output>{MALIBU_UNIVERSAL_SHADE}</output></p>
        <div className="shades shades-universal"><button type="button" aria-pressed="true" className="shade-opt universal active" onClick={() => setState((current) => ({ ...current, shade: MALIBU_UNIVERSAL_SHADE }))}><i />UNIVERSAL</button></div>
      </div>

      <div className="purchase-control quantity-control">
        <p className="sel-label">Quantity <output>{litres}</output></p>
        <div className="qtyrow">
          <div className="stepper"><button type="button" onClick={() => setQty(state.qty - 1)} aria-label="Decrease quantity">−</button><output aria-live="polite">{state.qty}</output><button type="button" onClick={() => setQty(state.qty + 1)} aria-label="Increase quantity">+</button></div>
          <span className="shortcut-label">Quick select</span>
          {[3, 6].map((qty) => <button type="button" aria-pressed={state.qty === qty} aria-label={`Select ${qty} litres${qty === 3 ? ", popular quantity" : ", best value quantity"}`} className={`qpick${state.qty === qty ? " active" : ""}`} onClick={() => setQty(qty)} key={qty}><span>{qty === 3 ? "Popular · 3L" : "Best value · 6L"}</span><i aria-hidden="true">{state.qty === qty ? "✓" : "+"}</i></button>)}
        </div>
      </div>

      <div className="maths">
        <div><span>Order total</span><b>{gbp(total)}</b><small>{litres}</small></div>
        <div><span>Tan capacity</span><b>≈{capacity}</b><small>full body tans</small></div>
        <div><span>Estimated stock cover</span><b>{stockCover}</b><small>at 12 tans per week</small></div>
        <div><span>Revenue potential</span><b>{gbp(capacity * 25)}+</b><small>at £25 per tan · <Link to="/#calculator">your margins</Link></small></div>
      </div>

      <div className="cta-col" ref={ctaRef}><a className="btn btn-bronze" href="#complete-order">Compose your trade order</a><Link className="trial-link" to="/#trial">New to Jimmy Coco? Start with a free trial →</Link></div>
      <p className="trust-line"><span>Free UK delivery</span><span>14-day returns</span><span>Secure ordering</span></p>
    </div>
  </div>;
}

export function ProductProofStrip() {
  return <div className="product-proof"><div className="wrap"><p><span>Featured in</span><b>VOGUE</b><b>BAZAAR</b><b>COSMOPOLITAN</b></p><ul><li>Natural-looking colour</li><li>Buildable depth</li><li>Professional formula</li></ul></div></div>;
}

export function StickyOrder({ state, target }: { state: PurchaseState; target: React.RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!target.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target]);

  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;
  const retailCount = Object.values(state.retail).reduce((sum, quantity) => sum + quantity, 0);
  return <div className={`sticky-order${visible ? " show" : ""}`}><div className="wrap"><div className="so-name">Malibu Professional Spray · 1L<small>{state.shade.split(" · ")[0]} · {litres}{retailCount ? ` · ${retailCount} retail add-on${retailCount === 1 ? "" : "s"}` : ""}</small></div><div className="so-price">{gbp(60 * state.qty)}</div><a className="btn btn-bronze" href="#complete-order">Compose order</a></div></div>;
}

export function usePurchaseState() {
  const [state, setState] = useState<PurchaseState>({ shade: MALIBU_UNIVERSAL_SHADE, qty: 1, retail: { mitt: 0, souffle: 0, kit: 0 } });
  const ctaRef = useRef<HTMLDivElement>(null);
  return { state, setState, ctaRef };
}
