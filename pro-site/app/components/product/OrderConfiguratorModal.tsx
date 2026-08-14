import { useRef, type Dispatch, type SetStateAction } from "react";
import {
  PROFESSIONAL_VOLUME_TIERS,
  professionalOrderPricing,
  professionalTierProfit,
  retailProductPotentialProfit,
  retailProductPricing,
  retailProductTierFor,
  retailProductVolumeTiers,
} from "../../lib/order-pricing";
import { gbp } from "../../lib/site";
import { RETAIL_PRODUCTS, type RetailProductId } from "../shared/RetailProductCards";
import type { PurchaseState } from "./ProductPurchase";

type ConfigurableItem = "professional" | RetailProductId;
const asset = (name: string) => `/assets/site/${name}`;

function levelClass(name?: string) {
  return name ? `config-level-${name.toLowerCase()}` : "config-level-building";
}

function sliderPosition(value: number, minimum: number, maximum: number) {
  return `${((value - minimum) / Math.max(maximum - minimum, 1)) * 100}%`;
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
  const retailTiers = product?.hasVolumeTiers ? retailProductVolumeTiers(product.id) : [];
  const retailProfit = product ? retailProductPotentialProfit(product.id, quantity) : undefined;
  const retailTier = product?.hasVolumeTiers ? retailProductTierFor(product.id, quantity) : undefined;
  const currentLevel = professionalPricing?.tier.name ?? retailTier?.name;
  const nextTier = professional
    ? PROFESSIONAL_VOLUME_TIERS.find((tier) => tier.minQuantity > quantity)
    : product?.hasVolumeTiers
      ? retailTiers.find((tier) => tier.minQuantity > quantity)
      : undefined;
  const nextQuantity = nextTier?.minQuantity;
  const nextProfit = nextTier
    ? professional
      ? professionalTierProfit(nextQuantity ?? quantity, nextTier.unitPrice).contribution
      : retailProductPotentialProfit(item, nextQuantity ?? quantity).profit
    : undefined;
  const currentPotentialProfit = professionalProfit?.contribution ?? retailProfit?.profit ?? 0;
  const orderSubtotal = professionalPricing?.total ?? (retailPricing ? retailPricing.unitPrice * quantity : retailProfit?.cost ?? 0);
  const title = professional ? "Malibu Spray · 1 Litre" : product?.title ?? "Retail product";
  const image = professional ? "product-01-0003c7706e6e.jpg" : product?.src ?? "";
  const unitPrice = professionalPricing?.unitPrice ?? retailPricing?.unitPrice;
  const currentLevelLabel = currentLevel === "Single"
    ? "Single-unit price"
    : currentLevel
      ? `${currentLevel} level`
      : "Building to Starter";
  const sliderMinimum = professional ? 1 : 0;
  const sliderLabels = professional
    ? [
        ...PROFESSIONAL_VOLUME_TIERS.map((tier) => ({ value: tier.minQuantity, label: tier.name, suffix: "L" })),
        { value: maximum, label: "Maximum", suffix: "L" },
      ]
    : [
        { value: 0, label: "Not added", suffix: "" },
        ...retailTiers.map((tier) => ({ value: tier.minQuantity, label: tier.name, suffix: "" })),
        { value: maximum, label: "Maximum", suffix: "" },
      ];

  const setQuantity = (next: number) => {
    const bounded = Math.max(professional ? 1 : 0, Math.min(maximum, next));
    if (professional) {
      setState((current) => ({ ...current, qty: bounded }));
      return;
    }
    setState((current) => ({ ...current, retail: { ...current.retail, [item]: bounded } }));
  };

  const resolvedTriggerLabel = triggerLabel ?? (professional ? "Configure professional solution" : quantity ? "Edit item/s" : "Add item/s");
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
          <h2>{title}</h2>
        </header>

        {hasVolumeTiers ? <div className="config-tier-key" aria-label="Volume level colours"><span className="starter"><i />Starter</span><span className="growth"><i />Growth</span><span className="premium"><i />Premium</span></div> : null}

        <section className={`config-professional config-single-item ${hasVolumeTiers ? levelClass(currentLevel) : "config-level-fixed"}`}>
          <div className="config-product-intro config-product-image"><img src={asset(image)} alt={title} width="900" height="900" /></div>
          <div className="config-slider-panel">
            <div className="config-current-level"><span>{hasVolumeTiers ? currentLevelLabel : "Choose quantity"}</span><strong>{professional ? `${quantity}L` : quantity}</strong><small>{unitPrice ? `${gbp(unitPrice, unitPrice % 1 ? 2 : 0)} per ${professional ? "litre" : "unit"}` : hasVolumeTiers ? `Trade pricing begins at ${nextQuantity ?? 6} units · ${product?.price}` : product?.price}</small></div>
            <input className={`tier-slider ${professional ? "tier-slider-professional" : hasVolumeTiers ? "tier-slider-retail" : "tier-slider-fixed"}`} type="range" min={sliderMinimum} max={maximum} step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label={`${title} quantity`} />
            {hasVolumeTiers ? <div className={`tier-slider-labels ${professional ? "professional-scale" : "retail-scale"}`}>{sliderLabels.map(({ value, label, suffix }, index) => <span className={index === 0 ? "scale-start" : index === sliderLabels.length - 1 ? "scale-end" : undefined} style={{ left: sliderPosition(value, sliderMinimum, maximum) }} key={`${value}-${label}`}>{value}{suffix}<br />{label}</span>)}</div> : <div className="tier-slider-labels fixed-scale"><span className="scale-start" style={{ left: "0%" }}>0<br />Not added</span><span className="scale-end" style={{ left: "100%" }}>{maximum}<br />Maximum</span></div>}
          </div>
          {hasVolumeTiers ? <div className="config-profit-panel"><div className="config-cost-breakdown"><div><span>Price</span><strong>{unitPrice ? `${gbp(unitPrice, unitPrice % 1 ? 2 : 0)}/${professional ? "l" : "unit"}` : "—"}</strong></div><div><span>Total</span><strong>{gbp(orderSubtotal)}</strong></div></div><span>{professional ? "Potential booth profit*" : "Potential retail profit*"}</span><strong>{gbp(currentPotentialProfit)}</strong><small>{professionalProfit ? `*Maximum potential from ${gbp(professionalProfit.revenue)} sales at full treatment price.` : retailProfit ? `*Maximum potential from ${gbp(retailProfit.revenue)} sales at full retail price.` : ""}</small>{nextTier && nextQuantity && nextProfit !== undefined ? <p><b>Add {nextQuantity - quantity}{professional ? "L" : ""} to reach {nextTier.name}</b><span>{gbp(nextProfit)} potential profit · <strong>+{gbp(nextProfit - currentPotentialProfit)}</strong></span></p> : <p className="is-max"><b>{currentLevel === "Premium" ? "Premium price unlocked" : "Move the slider to begin"}</b><span>{currentLevel === "Premium" ? "You are receiving the best available unit price." : "The first tier begins at six units."}</span></p>}</div> : <div className="config-profit-panel config-fixed-result"><span>Trade subtotal</span><strong>{gbp(orderSubtotal)}</strong><small>{quantity ? `${quantity} × ${gbp(unitPrice ?? 0)} per unit` : "Move the slider to add this product."}</small><p><b>Fixed trade price</b><span>This item has no volume levels.</span></p></div>}
        </section>

        <footer className="order-config-footer"><p><b>Configuring {title}</b></p><form method="dialog"><button className="btn btn-bronze">{confirmLabel}</button></form></footer>
      </div>
    </dialog>
  </>;
}
