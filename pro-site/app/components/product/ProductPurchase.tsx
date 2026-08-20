import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { MALIBU_UNIVERSAL_SHADE } from "../../lib/product-features";
import { RETAIL_PRODUCTS, retailQuantitiesFromSearchParams, type RetailQuantities } from "../shared/RetailProductCards";
import { DEFAULT_TREATMENT_PRICE, PROFESSIONAL_VOLUME_TIERS, TANS_PER_LITRE, professionalOrderPricing } from "../../lib/order-pricing";
import { VolumeProfitModal } from "../shared/VolumeProfitModal";
import { OrderConfiguratorModal } from "./OrderConfiguratorModal";
import { CurrencyDisclosure, useCurrency } from "../shared/CurrencyContext";

export type PurchaseState = { shade: string; qty: number; retail: RetailQuantities };

const PURCHASE_STORAGE_KEY = "jimmy-coco-salon-order:v1";
const PURCHASE_STORAGE_VERSION = 1;

type StoredPurchaseState = PurchaseState & { version: number; updatedAt: string };

function normalisePurchaseState(value: unknown): PurchaseState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<StoredPurchaseState>;
  if (candidate.version !== PURCHASE_STORAGE_VERSION) return null;

  const qty = typeof candidate.qty === "number" && Number.isFinite(candidate.qty)
    ? Math.max(1, Math.min(48, Math.round(candidate.qty)))
    : 1;
  const retail = { mitt: 0, souffleMedium: 0, souffleDark: 0, kit: 0 } satisfies RetailQuantities;

  RETAIL_PRODUCTS.forEach(({ id, maxOrderQuantity = 48 }) => {
    const savedQuantity = candidate.retail?.[id];
    if (typeof savedQuantity === "number" && Number.isFinite(savedQuantity)) {
      retail[id] = Math.max(0, Math.min(maxOrderQuantity, Math.round(savedQuantity)));
    }
  });

  return { shade: MALIBU_UNIVERSAL_SHADE, qty, retail };
}

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
  const { money, baseReference, currency } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(0);
  const pricing = professionalOrderPricing(state.qty);
  const total = pricing.total;
  const capacity = pricing.capacity;
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
        <p className="bb-eyebrow">Configure Pro solution · Step 1</p>
        <h1>Malibu Professional Spray <span className="title-number">1</span> Litre</h1>
      </div>

      <div className="price-block">
        <div className="price-row"><span className="price-big">{money(pricing.unitPrice)} <small>per litre</small></span><span className="pertan">≈ {money(pricing.unitPrice / TANS_PER_LITRE, 2)} per tan</span></div>
        {baseReference(pricing.unitPrice) && <p className="currency-base-reference">{baseReference(pricing.unitPrice)}</p>}
        <p>{pricing.tier.name} volume rate · {pricing.saving ? `${money(pricing.saving)} additional margin on this order · ` : ""}{currency === "USD" ? "US terms confirmed before invoicing" : "Free UK delivery"}</p>
        <CurrencyDisclosure />
        <VolumeProfitModal />
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
          {PROFESSIONAL_VOLUME_TIERS.slice(1).map((tier) => <button type="button" aria-pressed={state.qty === tier.minQuantity} aria-label={`Select ${tier.minQuantity} litres for the ${tier.name} volume rate`} className={`qpick${state.qty === tier.minQuantity ? " active" : ""}`} onClick={() => setQty(tier.minQuantity)} key={tier.name}><span>{tier.name} · {tier.minQuantity}L</span><i aria-hidden="true">{state.qty === tier.minQuantity ? "✓" : "+"}</i></button>)}
        </div>
      </div>

      <div className="maths">
        <div><span>Order total</span><b>{money(total)}</b><small>{litres}</small></div>
        <div><span>Tan capacity</span><b>≈{capacity}</b><small>full body tans</small></div>
        <div><span>Estimated stock cover</span><b>{stockCover}</b><small>at 12 tans per week</small></div>
        <div><span>Revenue potential</span><b>{money(capacity * DEFAULT_TREATMENT_PRICE)}+</b><small>at {money(DEFAULT_TREATMENT_PRICE)} per tan · <Link to="/#calculator">your margins</Link></small></div>
      </div>

      <div className="cta-col" ref={ctaRef}><OrderConfiguratorModal state={state} setState={setState} /><Link className="trial-link" to="/#trial">New to Jimmy Coco? Start with a free trial →</Link></div>
      <p className="trust-line"><span>{currency === "USD" ? "US terms confirmed before invoicing" : "Free UK delivery"}</span><span>14-day returns</span><span>Secure ordering</span></p>
    </div>
  </div>;
}

export function ProductProofStrip() {
  return <div className="product-proof"><div className="wrap"><p><span>Featured in</span><b>VOGUE</b><b>BAZAAR</b><b>COSMOPOLITAN</b></p><ul><li>Natural-looking colour</li><li>Buildable depth</li><li>Professional formula</li></ul></div></div>;
}

export function StickyOrder({ state, target }: { state: PurchaseState; target: React.RefObject<HTMLDivElement | null> }) {
  const { money } = useCurrency();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!target.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target]);

  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;
  const retailCount = Object.values(state.retail).reduce((sum, quantity) => sum + quantity, 0);
  const pricing = professionalOrderPricing(state.qty);
  return <div className={`sticky-order${visible ? " show" : ""}`}><div className="wrap"><div className="so-name">Malibu Professional Spray · 1L<small>{state.shade.split(" · ")[0]} · {litres}{retailCount ? ` · ${retailCount} retail add-on${retailCount === 1 ? "" : "s"}` : ""}</small></div><div className="so-price">{money(pricing.total)}</div><a className="btn btn-bronze" href="#retail-products">Add retail products</a></div></div>;
}

export function usePurchaseState() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PurchaseState>(() => ({ shade: MALIBU_UNIVERSAL_SHADE, qty: 1, retail: retailQuantitiesFromSearchParams(searchParams) }));
  const [storageReady, setStorageReady] = useState(false);
  const incomingSearch = useRef(searchParams.toString());
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(incomingSearch.current);
    const incomingRetail = retailQuantitiesFromSearchParams(params);
    let restored: PurchaseState = { shade: MALIBU_UNIVERSAL_SHADE, qty: 1, retail: incomingRetail };

    try {
      const savedValue = window.localStorage.getItem(PURCHASE_STORAGE_KEY);
      const savedState = savedValue ? normalisePurchaseState(JSON.parse(savedValue)) : null;
      if (savedState) restored = savedState;
    } catch {
      // A malformed or unavailable local store should never prevent ordering.
    }

    const requestedQuantity = Number(params.get("qty"));
    if (Number.isFinite(requestedQuantity) && requestedQuantity >= 1) {
      restored.qty = Math.max(1, Math.min(48, Math.round(requestedQuantity)));
      params.delete("qty");
    }

    RETAIL_PRODUCTS.forEach(({ id }) => {
      if (params.has(id)) {
        restored.retail[id] = incomingRetail[id];
        params.delete(id);
      }
    });

    if (params.toString() !== incomingSearch.current) {
      const remainingSearch = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ""}${window.location.hash}`,
      );
    }

    setState(restored);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const stored: StoredPurchaseState = {
      ...state,
      version: PURCHASE_STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Private browsing/storage restrictions should not interrupt the order flow.
    }
  }, [state, storageReady]);

  return { state, setState, ctaRef };
}
