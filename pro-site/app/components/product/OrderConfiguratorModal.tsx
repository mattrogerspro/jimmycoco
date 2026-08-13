import { useRef, type Dispatch, type SetStateAction } from "react";
import {
  PROFESSIONAL_VOLUME_TIERS,
  RETAIL_VOLUME_TIERS,
  professionalOrderPricing,
  professionalTierProfit,
  retailProductPotentialProfit,
  retailProductPricing,
  retailTierFor,
} from "../../lib/order-pricing";
import { gbp } from "../../lib/site";
import { RETAIL_PRODUCTS, type RetailProductId } from "../shared/RetailProductCards";
import type { PurchaseState } from "./ProductPurchase";

const asset = (name: string) => `/assets/site/${name}`;

function levelClass(name?: string) {
  return name ? `config-level-${name.toLowerCase()}` : "config-level-building";
}

export function OrderConfiguratorModal({
  state,
  setState,
  triggerLabel = "Configure your order",
  triggerClassName = "btn btn-bronze",
}: {
  state: PurchaseState;
  setState: Dispatch<SetStateAction<PurchaseState>>;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const professionalPricing = professionalOrderPricing(state.qty);
  const professionalProfit = professionalTierProfit(state.qty, professionalPricing.unitPrice);
  const nextProfessionalTier = PROFESSIONAL_VOLUME_TIERS.find((tier) => tier.minQuantity > state.qty);
  const nextProfessionalProfit = nextProfessionalTier
    ? professionalTierProfit(nextProfessionalTier.exampleQuantity, nextProfessionalTier.unitPrice)
    : undefined;
  const retailProfit = RETAIL_PRODUCTS.reduce(
    (sum, product) => sum + retailProductPotentialProfit(product.id, state.retail[product.id]).profit,
    0,
  );
  const retailSubtotal = RETAIL_PRODUCTS.reduce((sum, product) => {
    const pricing = retailProductPricing(product.id, state.retail[product.id]);
    return sum + (pricing ? pricing.unitPrice * state.retail[product.id] : 0);
  }, 0);
  const retailCount = Object.values(state.retail).reduce((sum, quantity) => sum + quantity, 0);

  const setProfessionalQuantity = (quantity: number) => {
    setState((current) => ({ ...current, qty: Math.max(1, Math.min(48, quantity)) }));
  };
  const setRetailQuantity = (id: RetailProductId, quantity: number, maximum: number) => {
    setState((current) => ({
      ...current,
      retail: { ...current.retail, [id]: Math.max(0, Math.min(maximum, quantity)) },
    }));
  };
  const continueToDetails = () => {
    dialogRef.current?.close();
    window.setTimeout(() => document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return <>
    <button type="button" className={triggerClassName} onClick={() => dialogRef.current?.showModal()}>{triggerLabel}</button>
    <dialog className="order-config-dialog" ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="order-config-shell">
        <form method="dialog"><button className="order-config-close" aria-label="Close order configurator">×</button></form>
        <header className="order-config-header">
          <div><p className="eyebrow">Build your salon order</p><h2>Choose quantities.<br /><em>See the profit grow.</em></h2><p>Move each slider to compare volume levels. Your order and profit estimate update immediately.</p></div>
          <aside className="order-config-summary" aria-live="polite">
            <span>Current order</span><strong>{state.qty + retailCount} items</strong>
            <dl><div><dt>Known trade subtotal</dt><dd>{gbp(professionalPricing.total + retailSubtotal)}</dd></div><div><dt>Potential total profit</dt><dd>{gbp(professionalProfit.contribution + retailProfit)}</dd></div></dl>
          </aside>
        </header>

        <div className="config-tier-key" aria-label="Volume level colours"><span className="starter"><i />Starter</span><span className="growth"><i />Growth</span><span className="premium"><i />Premium</span></div>

        <section className={`config-professional ${levelClass(professionalPricing.tier.name)}`}>
          <div className="config-product-intro"><img src="/assets/site/product-01-0003c7706e6e.jpg" alt="Malibu professional spray tan solution" width="900" height="900" /><div><span>Professional solution</span><h3>Malibu Spray · 1 Litre</h3><p>Approximately 28 full-body tans per litre at an illustrative £25 treatment price.</p></div></div>
          <div className="config-slider-panel">
            <div className="config-current-level"><span>{professionalPricing.tier.name} level</span><strong>{state.qty}L</strong><small>{gbp(professionalPricing.unitPrice)} per litre</small></div>
            <input className="tier-slider tier-slider-professional" type="range" min="1" max="48" step="1" value={state.qty} onChange={(event) => setProfessionalQuantity(Number(event.target.value))} aria-label="Professional solution litres" />
            <div className="tier-slider-labels"><span>1L<br />Starter</span><span>5L<br />Growth</span><span>10L<br />Premium</span><span>48L</span></div>
            <div className="config-stepper"><button type="button" onClick={() => setProfessionalQuantity(state.qty - 1)} aria-label="Remove one litre">−</button><output>{state.qty} {state.qty === 1 ? "litre" : "litres"}</output><button type="button" onClick={() => setProfessionalQuantity(state.qty + 1)} aria-label="Add one litre">+</button></div>
          </div>
          <div className="config-profit-panel"><span>Potential booth profit</span><strong>{gbp(professionalProfit.contribution)}</strong><small>{gbp(professionalProfit.revenue)} potential sales · {gbp(professionalProfit.cost)} solution cost</small>{nextProfessionalTier && nextProfessionalProfit ? <p><b>Add {nextProfessionalTier.minQuantity - state.qty}L to reach {nextProfessionalTier.name}</b><span>{gbp(nextProfessionalProfit.contribution)} potential profit · <strong>+{gbp(nextProfessionalProfit.contribution - professionalProfit.contribution)}</strong></span></p> : <p className="is-max"><b>Premium price unlocked</b><span>{gbp(professionalPricing.saving)} saved through volume pricing</span></p>}</div>
        </section>

        <section className="config-retail-section">
          <div className="config-section-heading"><div><p className="eyebrow">Retail additions</p><h3>Build the shelf around your clients.</h3></div><p>Soufflé volume prices apply separately to Medium and Dark. Mitt and A-List pricing is fixed.</p></div>
          <div className="config-retail-grid">
            {RETAIL_PRODUCTS.map((product) => {
              const quantity = state.retail[product.id];
              const maximum = product.maxOrderQuantity ?? 48;
              const tier = product.hasVolumeTiers ? retailTierFor(quantity) : undefined;
              const nextTier = product.hasVolumeTiers ? RETAIL_VOLUME_TIERS.find((item) => item.quantity > quantity) : undefined;
              const current = retailProductPotentialProfit(product.id, quantity);
              const next = nextTier ? retailProductPotentialProfit(product.id, nextTier.quantity) : undefined;
              const level = product.hasVolumeTiers ? levelClass(tier?.name) : "config-level-fixed";
              return <article className={`config-retail-product ${level}`} key={product.id}>
                <div className="config-retail-title"><img src={asset(product.src)} alt="" width="700" height="700" /><div><span>{product.badge}</span><h4>{product.title}</h4><small>{product.price}</small></div></div>
                <div className="config-current-level"><span>{product.hasVolumeTiers ? (tier ? `${tier.name} level` : "Building to Starter") : "Fixed price"}</span><strong>{quantity}</strong><small>{quantity === 1 ? "unit" : "units"} selected</small></div>
                <input className={`tier-slider ${product.hasVolumeTiers ? "tier-slider-retail" : "tier-slider-fixed"}`} type="range" min="0" max={maximum} step="1" value={quantity} onChange={(event) => setRetailQuantity(product.id, Number(event.target.value), maximum)} aria-label={`${product.title} quantity`} />
                {product.hasVolumeTiers ? <div className="tier-slider-labels retail"><span>0</span><span>6<br />Starter</span><span>12<br />Growth</span><span>24<br />Premium</span><span>48</span></div> : <div className="tier-slider-labels fixed"><span>0</span><span>{maximum}</span></div>}
                <div className="config-stepper"><button type="button" disabled={quantity === 0} onClick={() => setRetailQuantity(product.id, quantity - 1, maximum)} aria-label={`Remove one ${product.title}`}>−</button><output>{quantity} selected</output><button type="button" disabled={quantity === maximum} onClick={() => setRetailQuantity(product.id, quantity + 1, maximum)} aria-label={`Add one ${product.title}`}>+</button></div>
                {product.hasVolumeTiers ? <div className="config-retail-profit"><span>Potential retail profit</span><strong>{gbp(current.profit)}</strong>{nextTier && next ? <p><b>Add {nextTier.quantity - quantity} to reach {nextTier.name}</b><span>{gbp(next.profit)} potential profit · <strong>+{gbp(next.profit - current.profit)}</strong></span></p> : <p className="is-max"><b>Premium price unlocked</b><span>{quantity ? `${gbp(current.profit)} at current quantity` : "Move the slider to build this line"}</span></p>}</div> : <div className="config-fixed-total"><span>Order subtotal</span><strong>{gbp(current.cost)}</strong><small>No volume levels for this product</small></div>}
              </article>;
            })}
          </div>
        </section>

        <footer className="order-config-footer"><p><b>{state.qty + retailCount} items selected</b><span>Potential profit is illustrative and shown before labour, premises, card fees and tax.</span></p><button type="button" className="btn btn-bronze" onClick={continueToDetails}>Use this order &amp; continue</button></footer>
      </div>
    </dialog>
  </>;
}
