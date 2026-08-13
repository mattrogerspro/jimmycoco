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

type ConfigurableItem = "professional" | RetailProductId;
const asset = (name: string) => `/assets/site/${name}`;

function levelClass(name?: string) {
  return name ? `config-level-${name.toLowerCase()}` : "config-level-building";
}

export function OrderConfiguratorModal({
  item = "professional",
  state,
  setState,
  triggerLabel,
  triggerClassName = "btn btn-bronze",
}: {
  item?: ConfigurableItem;
  state: PurchaseState;
  setState: Dispatch<SetStateAction<PurchaseState>>;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const professional = item === "professional";
  const product = professional ? undefined : RETAIL_PRODUCTS.find(({ id }) => id === item);
  if (!professional && !product) return null;

  const quantity = professional ? state.qty : state.retail[item as RetailProductId];
  const maximum = professional ? 48 : (product?.maxOrderQuantity ?? 48);
  const hasVolumeTiers = professional || Boolean(product?.hasVolumeTiers);
  const professionalPricing = professional ? professionalOrderPricing(quantity) : undefined;
  const professionalProfit = professionalPricing
    ? professionalTierProfit(quantity, professionalPricing.unitPrice)
    : undefined;
  const retailPricing = product ? retailProductPricing(product.id, quantity) : undefined;
  const retailProfit = product ? retailProductPotentialProfit(product.id, quantity) : undefined;
  const retailTier = product?.hasVolumeTiers ? retailTierFor(quantity) : undefined;
  const currentLevel = professionalPricing?.tier.name ?? retailTier?.name;
  const nextTier = professional
    ? PROFESSIONAL_VOLUME_TIERS.find((tier) => tier.minQuantity > quantity)
    : product?.hasVolumeTiers
      ? RETAIL_VOLUME_TIERS.find((tier) => tier.quantity > quantity)
      : undefined;
  const nextQuantity = nextTier && "minQuantity" in nextTier ? nextTier.minQuantity : nextTier?.quantity;
  const nextProfit = nextTier
    ? professional
      ? professionalTierProfit(nextQuantity ?? quantity, nextTier.unitPrice).contribution
      : retailProductPotentialProfit(item, nextQuantity ?? quantity).profit
    : undefined;
  const currentPotentialProfit = professionalProfit?.contribution ?? retailProfit?.profit ?? 0;
  const orderSubtotal = professionalPricing?.total ?? (retailPricing ? retailPricing.unitPrice * quantity : retailProfit?.cost ?? 0);
  const title = professional ? "Malibu Spray · 1 Litre" : product?.title ?? "Retail product";
  const eyebrow = professional ? "Professional solution" : product?.badge ?? "Retail addition";
  const image = professional ? "product-01-0003c7706e6e.jpg" : product?.src ?? "";
  const description = professional
    ? "Approximately 28 full-body tans per litre at an illustrative £25 treatment price."
    : product?.description ?? "";
  const unitPrice = professionalPricing?.unitPrice ?? retailPricing?.unitPrice;

  const setQuantity = (next: number) => {
    const bounded = Math.max(professional ? 1 : 0, Math.min(maximum, next));
    if (professional) {
      setState((current) => ({ ...current, qty: bounded }));
      return;
    }
    setState((current) => ({ ...current, retail: { ...current.retail, [item]: bounded } }));
  };

  const resolvedTriggerLabel = triggerLabel ?? (professional ? "Configure professional solution" : quantity ? "Edit quantity" : "Configure this item");
  const confirmLabel = professional
    ? `Use ${quantity} ${quantity === 1 ? "litre" : "litres"} in order`
    : quantity
      ? `Use ${quantity} ${quantity === 1 ? "unit" : "units"} in order`
      : "Leave this item out";

  return <>
    <button type="button" className={triggerClassName} onClick={() => dialogRef.current?.showModal()}>{resolvedTriggerLabel}<i aria-hidden="true">{quantity ? "↗" : "+"}</i></button>
    <dialog className="order-config-dialog order-config-dialog-single" ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="order-config-shell">
        <form method="dialog"><button className="order-config-close" aria-label={`Close ${title} configurator`}>×</button></form>
        <header className="order-config-header">
          <div><p className="eyebrow">Configure one item</p><h2>{title}</h2><p>Choose the quantity for this product only. The price, volume level and potential profit update immediately.</p></div>
          <aside className="order-config-summary" aria-live="polite"><span>Selected quantity</span><strong>{quantity}</strong><dl><div><dt>Trade subtotal</dt><dd>{gbp(orderSubtotal)}</dd></div><div><dt>{hasVolumeTiers ? "Potential profit" : "Current level"}</dt><dd>{hasVolumeTiers ? gbp(currentPotentialProfit) : quantity ? "Selected" : "Not added"}</dd></div></dl></aside>
        </header>

        {hasVolumeTiers ? <div className="config-tier-key" aria-label="Volume level colours"><span className="starter"><i />Starter</span><span className="growth"><i />Growth</span><span className="premium"><i />Premium</span></div> : null}

        <section className={`config-professional config-single-item ${hasVolumeTiers ? levelClass(currentLevel) : "config-level-fixed"}`}>
          <div className="config-product-intro"><img src={asset(image)} alt={title} width="900" height="900" /><div><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p></div></div>
          <div className="config-slider-panel">
            <div className="config-current-level"><span>{hasVolumeTiers ? (currentLevel ? `${currentLevel} level` : "Building to Starter") : "Choose quantity"}</span><strong>{professional ? `${quantity}L` : quantity}</strong><small>{unitPrice ? `${gbp(unitPrice, unitPrice % 1 ? 2 : 0)} per ${professional ? "litre" : "unit"}` : product?.price}</small></div>
            <input className={`tier-slider ${professional ? "tier-slider-professional" : hasVolumeTiers ? "tier-slider-retail" : "tier-slider-fixed"}`} type="range" min={professional ? 1 : 0} max={maximum} step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label={`${title} quantity`} />
            {professional ? <div className="tier-slider-labels"><span>1L<br />Starter</span><span>5L<br />Growth</span><span>10L<br />Premium</span><span>48L</span></div> : hasVolumeTiers ? <div className="tier-slider-labels retail"><span>0</span><span>6<br />Starter</span><span>12<br />Growth</span><span>24<br />Premium</span><span>48</span></div> : <div className="tier-slider-labels fixed"><span>0</span><span>{maximum}</span></div>}
            <div className="config-stepper"><button type="button" disabled={quantity === (professional ? 1 : 0)} onClick={() => setQuantity(quantity - 1)} aria-label={`Remove one ${title}`}>−</button><output>{quantity} {professional ? (quantity === 1 ? "litre" : "litres") : (quantity === 1 ? "unit" : "units")}</output><button type="button" disabled={quantity === maximum} onClick={() => setQuantity(quantity + 1)} aria-label={`Add one ${title}`}>+</button></div>
          </div>
          {hasVolumeTiers ? <div className="config-profit-panel"><span>{professional ? "Potential booth profit" : "Potential retail profit"}</span><strong>{gbp(currentPotentialProfit)}</strong><small>{professionalProfit ? `${gbp(professionalProfit.revenue)} potential sales · ${gbp(professionalProfit.cost)} solution cost` : retailProfit ? `${gbp(retailProfit.revenue)} potential sales · ${gbp(retailProfit.cost)} product cost` : ""}</small>{nextTier && nextQuantity && nextProfit !== undefined ? <p><b>Add {nextQuantity - quantity}{professional ? "L" : ""} to reach {nextTier.name}</b><span>{gbp(nextProfit)} potential profit · <strong>+{gbp(nextProfit - currentPotentialProfit)}</strong></span></p> : <p className="is-max"><b>{currentLevel === "Premium" ? "Premium price unlocked" : "Move the slider to begin"}</b><span>{currentLevel === "Premium" ? "You are receiving the best available unit price." : "The first tier begins at six units."}</span></p>}</div> : <div className="config-profit-panel config-fixed-total"><span>Trade subtotal</span><strong>{gbp(orderSubtotal)}</strong><small>This product has one fixed trade price and no volume levels.</small></div>}
        </section>

        <footer className="order-config-footer"><p><b>Configuring {title}</b><span>No other product quantities are changed in this window.</span></p><form method="dialog"><button className="btn btn-bronze">{confirmLabel}</button></form></footer>
      </div>
    </dialog>
  </>;
}
