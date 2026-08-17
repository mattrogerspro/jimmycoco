import { useRef } from "react";
import {
  DEFAULT_TREATMENT_PRICE,
  PROFESSIONAL_VOLUME_TIERS,
  RETAIL_KIT_VOLUME_TIERS,
  RETAIL_MITT_VOLUME_TIERS,
  RETAIL_SOUFFLE_RRP,
  RETAIL_VOLUME_TIERS,
  professionalTierProfit,
  retailTierProfit,
} from "../../lib/order-pricing";
import { CurrencyDisclosure, useCurrency } from "./CurrencyContext";

export function VolumeProfitModal({ triggerLabel = "See volume discounts & profit" }: { triggerLabel?: string }) {
  const { money } = useCurrency();
  const gbp = money;
  const dialogRef = useRef<HTMLDialogElement>(null);

  return <>
    <button type="button" className="profit-modal-trigger" onClick={() => dialogRef.current?.showModal()}>{triggerLabel}<span aria-hidden="true">↗</span></button>
    <dialog className="profit-dialog" ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="profit-dialog-shell">
        <form method="dialog"><button className="profit-dialog-close" aria-label="Close volume profit comparison">×</button></form>
        <header><p className="eyebrow">Volume pricing &amp; profit</p><h2>Compare every order level.</h2><p>See what you pay, what you could sell, and the potential profit at each level before salon operating costs.</p></header>

        <section className="profit-modal-section">
          <div className="profit-modal-heading"><div><span>Professional solution · 1 litre</span><h3>Profit from the booth</h3></div><p>Uses {gbp(DEFAULT_TREATMENT_PRICE)} per tan and approximately 28 tans per litre.</p></div>
          <div className="profit-tier-grid">
            {PROFESSIONAL_VOLUME_TIERS.map((tier, index) => {
              const result = professionalTierProfit(tier.exampleQuantity, tier.unitPrice);
              const levelNote = index === 0 ? "Standard rate" : index === 1 ? "Lower unit cost" : "Best unit cost";
              return <article className={`profit-tier profit-tier-${tier.name.toLowerCase()}`} key={tier.name}><div className="profit-tier-label"><span>{String(index + 1).padStart(2, "0")} · {tier.name}</span><small>{levelNote}</small></div><h4>{tier.range}</h4><p className="profit-trade-price"><span>Trade price</span><b>{gbp(tier.unitPrice)}</b><small>per litre</small></p><dl><div><dt>Example order</dt><dd>{tier.exampleQuantity}L · {gbp(result.cost)}</dd></div><div><dt>Potential sales</dt><dd>{gbp(result.revenue)}</dd></div><div className="profit-primary"><dt>Potential booth profit</dt><dd>{gbp(result.contribution)}</dd></div><div className="profit-volume-gain"><dt>Extra profit from volume price</dt><dd>{result.additionalMargin ? `+${gbp(result.additionalMargin)}` : "Standard price"}</dd></div></dl></article>;
            })}
          </div>
        </section>

        <section className="profit-modal-section profit-modal-retail">
          <div className="profit-modal-heading"><div><span>Malibu Medium or Dark · RRP {gbp(RETAIL_SOUFFLE_RRP)}</span><h3>Profit from the shelf</h3></div><p>Assumes every unit sells at the stated recommended retail price.</p></div>
          <div className="profit-tier-grid">
            {RETAIL_VOLUME_TIERS.map((tier, index) => {
              const result = retailTierProfit(tier.quantity, tier.unitPrice);
              const levelNote = index === 0 ? "Start your shelf" : index === 1 ? "Lower unit cost" : "Best unit cost";
              return <article className={`profit-tier profit-tier-${tier.name.toLowerCase()}`} key={tier.name}><div className="profit-tier-label"><span>{String(index + 1).padStart(2, "0")} · {tier.name}</span><small>{levelNote}</small></div><h4>{tier.quantity} units</h4><p className="profit-trade-price"><span>Trade price</span><b>{gbp(tier.unitPrice, tier.unitPrice % 1 ? 2 : 0)}</b><small>per unit</small></p><dl><div><dt>Order cost</dt><dd>{gbp(result.cost)}</dd></div><div><dt>Potential sales at RRP</dt><dd>{gbp(result.revenue)}</dd></div><div className="profit-primary"><dt>Potential retail profit</dt><dd>{gbp(result.profit)}</dd></div><div className="profit-volume-gain"><dt>Extra profit from volume price</dt><dd>{result.additionalMargin ? `+${gbp(result.additionalMargin)}` : "Standard price"}</dd></div></dl></article>;
            })}
          </div>
          <div className="profit-fixed-prices"><span>More retail volume levels</span><p><b>Buff &amp; Glow Mitt</b> · {RETAIL_MITT_VOLUME_TIERS.map((tier) => `${tier.quantity} at ${gbp(tier.unitPrice, tier.unitPrice % 1 ? 2 : 0)}`).join(" · ")}</p><p><b>A-List Glow Kit</b> · {RETAIL_KIT_VOLUME_TIERS.map((tier) => `${tier.quantity} at ${gbp(tier.unitPrice, tier.unitPrice % 1 ? 2 : 0)}`).join(" · ")}</p></div>
        </section>

        <footer><p>Illustrative potential profit only. Professional figures assume 28 full-body tans per litre at {gbp(DEFAULT_TREATMENT_PRICE)} each. Retail figures assume every unit sells at RRP. Labour, premises, card fees, tax and other operating costs are not deducted.</p><CurrencyDisclosure /><form method="dialog"><button className="btn btn-dark">Close comparison</button></form></footer>
      </div>
    </dialog>
  </>;
}
