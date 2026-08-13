import { useRef } from "react";
import { gbp } from "../../lib/site";
import {
  DEFAULT_TREATMENT_PRICE,
  PROFESSIONAL_VOLUME_TIERS,
  RETAIL_KIT_UNIT_PRICE,
  RETAIL_MITT_UNIT_PRICE,
  RETAIL_SOUFFLE_RRP,
  RETAIL_VOLUME_TIERS,
  professionalTierProfit,
  retailTierProfit,
} from "../../lib/order-pricing";

export function VolumeProfitModal({ triggerLabel = "See volume discounts & profit" }: { triggerLabel?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return <>
    <button type="button" className="profit-modal-trigger" onClick={() => dialogRef.current?.showModal()}>{triggerLabel}<span aria-hidden="true">↗</span></button>
    <dialog className="profit-dialog" ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="profit-dialog-shell">
        <form method="dialog"><button className="profit-dialog-close" aria-label="Close volume profit comparison">×</button></form>
        <header><p className="eyebrow">Volume profit comparison</p><h2>See what every order level can earn.</h2><p>Compare the trade price, expected sales and gross contribution before labour, premises and other salon costs.</p></header>

        <section className="profit-modal-section">
          <div className="profit-modal-heading"><div><span>Professional solution · 1 litre</span><h3>Profit from the booth</h3></div><p>Uses {DEFAULT_TREATMENT_PRICE === 25 ? "£25" : gbp(DEFAULT_TREATMENT_PRICE)} per tan and approximately 28 tans per litre.</p></div>
          <div className="profit-tier-grid">
            {PROFESSIONAL_VOLUME_TIERS.map((tier) => {
              const result = professionalTierProfit(tier.exampleQuantity, tier.unitPrice);
              return <article className={`profit-tier profit-tier-${tier.name.toLowerCase()}`} key={tier.name}><span>{tier.name}</span><h4>{tier.range}</h4><p><b>{gbp(tier.unitPrice)}</b> per litre</p><dl><div><dt>Example order</dt><dd>{tier.exampleQuantity}L · {gbp(result.cost)}</dd></div><div><dt>Estimated sales</dt><dd>{gbp(result.revenue)}</dd></div><div className="profit-primary"><dt>Gross contribution</dt><dd>{gbp(result.contribution)}</dd></div><div><dt>Extra from volume rate</dt><dd>{result.additionalMargin ? `+${gbp(result.additionalMargin)}` : "Base level"}</dd></div></dl></article>;
            })}
          </div>
        </section>

        <section className="profit-modal-section profit-modal-retail">
          <div className="profit-modal-heading"><div><span>Malibu Medium or Dark · RRP {gbp(RETAIL_SOUFFLE_RRP)}</span><h3>Profit from the shelf</h3></div><p>Assumes every unit sells at the stated recommended retail price.</p></div>
          <div className="profit-tier-grid">
            {RETAIL_VOLUME_TIERS.map((tier) => {
              const result = retailTierProfit(tier.quantity, tier.unitPrice);
              return <article className={`profit-tier profit-tier-${tier.name.toLowerCase()}`} key={tier.name}><span>{tier.name}</span><h4>{tier.quantity} units</h4><p><b>{gbp(tier.unitPrice, tier.unitPrice % 1 ? 2 : 0)}</b> per unit</p><dl><div><dt>Order cost</dt><dd>{gbp(result.cost)}</dd></div><div><dt>Sales at RRP</dt><dd>{gbp(result.revenue)}</dd></div><div className="profit-primary"><dt>Retail profit</dt><dd>{gbp(result.profit)}</dd></div><div><dt>Extra from volume rate</dt><dd>{result.additionalMargin ? `+${gbp(result.additionalMargin)}` : "Base level"}</dd></div></dl></article>;
            })}
          </div>
          <div className="profit-fixed-prices"><span>Also in the order builder</span><p><b>Buff &amp; Glow Mitt</b> · 1–4 units at {gbp(RETAIL_MITT_UNIT_PRICE)} each</p><p><b>A-List Glow Kit</b> · 1–4 units at {gbp(RETAIL_KIT_UNIT_PRICE)} each</p></div>
        </section>

        <footer><p>Illustrative gross contribution only. Professional figures assume 28 full-body tans per litre at £25 each. Retail figures assume sale at RRP. Labour, premises, card fees, tax and other operating costs are not deducted.</p><form method="dialog"><button className="btn btn-dark">Close comparison</button></form></footer>
      </div>
    </dialog>
  </>;
}
