import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gbp } from "../../lib/site";

export type PurchaseState = { shade: string; qty: number };

export const SHADE_OPTIONS = [
  { name: "Light · 6% DHA", label: "LIGHT", className: "s1" },
  { name: "Medium · 8% DHA", label: "MEDIUM", className: "s2" },
  { name: "Medium / Dark · 10% DHA", label: "MED / DARK", className: "s3" },
  { name: "Dark · 12% DHA", label: "DARK", className: "s4" },
];

const gallery = [
  ["product-01-0003c7706e6e.jpg", "Bottle"],
  ["product-02-90c11d032981.jpg", "Product details"],
  ["product-03-d9921088377a.jpg", "Solution texture"],
  ["product-04-313d9d6a60b1.jpg", "Results"],
  ["product-05-e60eda7f1217.jpg", "Application"],
];

const asset = (name: string) => `/assets/site/${name}`;

export function ProductPurchase({ state, setState, ctaRef }: {
  state: PurchaseState;
  setState: React.Dispatch<React.SetStateAction<PurchaseState>>;
  ctaRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const total = 60 * state.qty;
  const lo = 25 * state.qty;
  const hi = 30 * state.qty;
  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;

  const setQty = (qty: number) => setState((current) => ({ ...current, qty: Math.max(1, Math.min(48, qty)) }));

  return <div className="wrap pdp">
    <div className="gallery">
      <div className="gmain"><img src={asset(gallery[selectedImage][0])} alt="Malibu professional spray tan solution, 1 litre bottle" fetchPriority="high" /></div>
      <div className="gthumbs">{gallery.map(([src, label], index) => <button className={selectedImage === index ? "active" : ""} onClick={() => setSelectedImage(index)} aria-label={label} type="button" key={src}><img src={asset(src)} alt="" loading="lazy" decoding="async" /></button>)}</div>
    </div>
    <div className="buybox">
      <p className="bb-eyebrow">Professional self tan · Salon order</p>
      <h1>Malibu Professional Spray <br className="bbr" />1 Litre</h1>
      <div className="social-row"><div className="rating-row"><span className="stars">★★★★★</span><span><b>4.9</b> · 1,842 verified reviews</span></div><div className="press">Featured in <b>VOGUE</b><b>BAZAAR</b><b>COSMOPOLITAN</b></div></div>
      <div className="price-row"><span className="price-big">£60 <small>per litre</small></span><span className="pertan">≈ £2.22 per tan</span></div>
      <p className="klarna">Or 3 interest-free payments of £20.00 with Klarna · Trade terms confirmed on your setup call</p>
      <div className="bicons"><div><i>☀</i>Natural looking</div><div><i>❋</i>Buildable colour</div><div><i>✦</i>Professional formula</div></div>
      <p className="sel-label">Choose your shade <output>{state.shade}</output></p>
      <div className="shades">{SHADE_OPTIONS.map((shade) => <button type="button" className={`shade-opt ${shade.className}${state.shade === shade.name ? " active" : ""}`} onClick={() => setState((current) => ({ ...current, shade: shade.name }))} key={shade.name}><i />{shade.label}</button>)}</div>
      <div className="qty-line"><p className="sel-label">Quantity <output>{litres}</output></p><div className="qtyrow">
        <div className="stepper"><button type="button" onClick={() => setQty(state.qty - 1)} aria-label="Decrease quantity">−</button><output>{state.qty}</output><button type="button" onClick={() => setQty(state.qty + 1)} aria-label="Increase quantity">+</button></div>
        {[1, 3, 6].map((qty) => <button type="button" className={`qpick${state.qty === qty ? " active" : ""}`} onClick={() => setQty(qty)} key={qty}>{qty} {qty === 1 ? "litre" : "litres"}</button>)}
      </div></div>
      <div className="maths"><div><span>Order total</span><b>{gbp(total)}</b><small>{litres}</small></div><div><span>Tan capacity</span><b>{lo}–{hi}</b><small>full body tans</small></div><div><span>Revenue potential</span><b>{gbp(lo * 25)}+</b><small>at £25 per tan · <Link to="/#calculator" style={{ color: "#C9BCAB" }}>your maths</Link></small></div></div>
      <div className="cta-col" ref={ctaRef}><a className="btn btn-bronze" href="#order">Order for your salon</a><Link className="btn btn-ghost" to="/#trial"><span className="cta-long">New to Jimmy Coco? </span>Start with a free trial</Link></div>
      <div className="trust-row"><div><i>⛟</i><b>Free UK delivery</b>on orders £40+</div><div><i>↺</i><b>14-day returns</b>100% money-back</div><div><i>✓</i><b>Secure checkout</b>card · Klarna · PayPal</div><div><i>★</i><b>Trusted by</b>professionals</div></div>
    </div>
  </div>;
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
  return <div className={`sticky-order${visible ? " show" : ""}`}><div className="wrap"><div className="so-name">Malibu Professional Spray · 1L<small>{state.shade.split(" · ")[0]} · {litres}</small></div><div className="so-price">{gbp(60 * state.qty)}</div><a className="btn btn-bronze" href="#order">Order now</a></div></div>;
}

export function usePurchaseState() {
  const [state, setState] = useState<PurchaseState>({ shade: "Medium / Dark · 10% DHA", qty: 1 });
  const ctaRef = useRef<HTMLDivElement>(null);
  return { state, setState, ctaRef };
}
