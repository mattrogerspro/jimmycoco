import type { PurchaseState } from "./ProductPurchase";
import { SHADE_OPTIONS } from "./ProductPurchase";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { ApplicationActionResult } from "../../lib/application-action.server";
import { track } from "../../lib/analytics";
import { gbp } from "../../lib/site";
import { SALON_FAQ } from "../../lib/faq";
import { PRODUCT_SPECS, workedExamples } from "../../lib/specs";
import { SHOW_LEGACY_MALIBU_SHADE_RANGE } from "../../lib/product-features";
import { RETAIL_PRODUCTS, RetailProductCards, type RetailProductId } from "../shared/RetailProductCards";
import { professionalOrderPricing, professionalTierProfit, retailProductPotentialProfit, retailProductPricing } from "../../lib/order-pricing";
import { VolumeProfitModal } from "../shared/VolumeProfitModal";

export function ShadeComparison({ onChoose }: { onChoose: (shade: string) => void }) {
  const cards = [
    ["c1", "Light", "Fair skin · first-time tan clients", "Sunkissed, a day in the sun", SHADE_OPTIONS[0].name],
    ["c2", "Medium", "Light-to-medium skin · all levels", "A weekend in the sun", SHADE_OPTIONS[1].name],
    ["c3 pop", "Med / Dark", "Medium-to-olive skin · all levels", "Golden bronze finish", SHADE_OPTIONS[2].name],
    ["c4", "Dark", "Olive-to-dark skin · experienced tanners", "A long sunny vacation", SHADE_OPTIONS[3].name],
  ];
  const choose = (shade: string) => { onChoose(shade); document.querySelector(".pdp")?.scrollIntoView({ behavior: "smooth" }); };
  return <section className="steps-band"><div className="wrap"><p className="eyebrow">Which shades should your salon stock?</p><h2>Build your shade menu.</h2><p className="sub">Most salons stock two or three depths to cover their full client mix.</p><div className="cmp-grid">{cards.map(([className, title, bestFor, result, shade], index) => <div className={`cmp-card ${className}`} key={title}>{index === 2 && <span className="pop-tag">Most popular</span>}<i /><h3>{title}</h3><dl><dt>Best for</dt><dd>{bestFor}</dd><dt>Result</dt><dd>{result}</dd><dt>Development</dt><dd>6–8 hours</dd></dl><button type="button" className={`btn ${index === 2 ? "btn-dark" : "btn-ghost"} btn-sm pick-shade`} onClick={() => choose(shade)}>Choose {title}</button></div>)}</div></div></section>;
}

export function CrossSell({ state, setState }: { state: PurchaseState; setState: Dispatch<SetStateAction<PurchaseState>> }) {
  const setRetailQuantity = (id: RetailProductId, quantity: number) => {
    setState((current) => ({ ...current, retail: { ...current.retail, [id]: Math.max(0, Math.min(24, quantity)) } }));
  };

  return <section className="steps-band cross-sell" id="complete-order"><div className="wrap"><p className="eyebrow">Complete the order · Step 1</p><h2>Would you like to add any retail?</h2><p className="sub">Add products one at a time. Each Soufflé card shows how close you are to the next volume rate and the additional profit that level can create.</p><div className="cross-sell-profit"><VolumeProfitModal triggerLabel="Compare every volume level" /></div><RetailProductCards orderMode quantities={state.retail} onQuantityChange={setRetailQuantity} /><div className="cross-sell-next"><p>Happy with the mix? Your litre and retail selections are ready below.</p><a className="btn btn-dark" href="#order">Continue to salon details</a></div></div></section>;
}

export function ProductDetails() {
  return <section style={{ paddingTop: 60, paddingBottom: 60 }}><div className="wrap" style={{ maxWidth: "min(90vw,1100px)" }}>
    <details className="acc"><summary>What's in the formula</summary><div className="acc-body">Colloidal gold for a radiant soft-focus finish · hyaluronic acid attracting 1000× its weight in water · Jimmy's signature scent with fine-fragrance aromaguard technology · blue daisy to soothe sensitive skin · Pentavitin to lock moisture in place. Custom-blended, skin-tone–sympathetic pigments enhance every client's natural undertones.</div></details>
    <details className="acc"><summary>Delivery</summary><div className="acc-body">UK &amp; NI: 1–3 working days (£5.50, free over £40 with FREESHIP40) · ROI: 1–3 working days (€6.50, free over €30) · US: 3–4 working days ($7, free over $50) · EU: 5–7 working days (£14.95, free over €100). Orders placed after 1pm dispatch the following working day.</div></details>
    <details className="acc"><summary>Returns &amp; guarantee</summary><div className="acc-body">14-day return and refund policy with a 100% money-back guarantee on every order. New salons: start with the complimentary trial instead — judge the colour on a real client before your first litre.</div></details>
    
  </div></section>;
}

export function OrderSection({ state }: { state: PurchaseState }) {
  const orderResult = useActionData() as ApplicationActionResult | undefined;
  const navigation = useNavigation();
  const sending = navigation.state === "submitting";

  useEffect(() => {
    if (!orderResult) return;
    track(orderResult.ok ? "generate_lead" : "form_error", {
      form_id: "product_order",
      value: orderResult.ok ? 1 : 0,
      error_message: orderResult.ok ? undefined : orderResult.message,
    });
  }, [orderResult]);
  const professionalPricing = professionalOrderPricing(state.qty);
  const total = professionalPricing.total;
  const capacity = professionalPricing.capacity;
  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;
  const retailLines = RETAIL_PRODUCTS.filter(({ id }) => state.retail[id] > 0);
  const retailCount = retailLines.reduce((sum, { id }) => sum + state.retail[id], 0);
  const pricedRetailLines = retailLines.map((product) => ({ product, tier: retailProductPricing(product.id, state.retail[product.id]) })).filter((line) => line.tier);
  const retailTradeSubtotal = pricedRetailLines.reduce((sum, { product, tier }) => sum + state.retail[product.id] * (tier?.unitPrice ?? 0), 0);
  const unpricedRetailCount = retailLines.filter(({ id }) => !retailProductPricing(id, state.retail[id])).reduce((sum, { id }) => sum + state.retail[id], 0);
  const boothPotentialProfit = professionalTierProfit(state.qty, professionalPricing.unitPrice).contribution;
  const retailPotentialProfit = retailLines.reduce((sum, { id }) => sum + retailProductPotentialProfit(id, state.retail[id]).profit, 0);
  const totalPotentialProfit = boothPotentialProfit + retailPotentialProfit;
  const retailPricingSummary = (id: RetailProductId) => {
    const quantity = state.retail[id];
    const tier = retailProductPricing(id, quantity);
    if (tier) return `${tier.name} · ${gbp(tier.unitPrice, tier.unitPrice % 1 ? 2 : 0)} each · ${gbp(quantity * tier.unitPrice)} subtotal`;
    if (id === "souffleMedium" || id === "souffleDark") return `Add ${6 - quantity} more to unlock Starter pricing`;
    return "Trade price confirmed before payment";
  };
  const order = [
    "Malibu Professional Spray 1L",
    `Shade: ${state.shade}`,
    `Quantity: ${litres}`,
    `Professional solution subtotal (${professionalPricing.tier.name}): ${gbp(total)}`,
    `Estimated booth gross profit potential: ${gbp(boothPotentialProfit)}`,
    "",
    "Retail additions:",
    ...(retailLines.length ? retailLines.map(({ id, title }) => `${title}: ${state.retail[id]} · ${retailPricingSummary(id)}`) : ["None selected"]),
    `Estimated retail profit potential: ${gbp(retailPotentialProfit)}`,
    `Estimated combined gross profit potential: ${gbp(totalPotentialProfit)}`,
    "",
    "Trade terms and retail pricing to be confirmed before payment.",
  ].join("\n");

  return <section className="order-band" id="order"><div className="wrap"><p className="eyebrow">Salon order · Step 2</p><h2>Your order, <em>composed.</em></h2><p className="sub">Add your salon details and review the live composition beside the form. Nothing is charged until your trade terms are confirmed.</p><div className="order-grid">
    <Form method="post" className="orderform" data-form-id="product_order" replace>
      <div className="orderform-head"><span>Trade order request</span><h3>Where should we send the confirmation?</h3><p>Complete your details and the partnerships team will confirm pricing and availability.</p></div>
      <label htmlFor="f-salon">Salon or business name</label><input id="f-salon" type="text" name="salon" autoComplete="organization" required />
      <div className="orderform-fields"><div><label htmlFor="f-name">Your name</label><input id="f-name" type="text" name="name" autoComplete="name" required /></div><div><label htmlFor="f-phone">Phone</label><input id="f-phone" type="tel" name="phone" autoComplete="tel" /></div></div>
      <label htmlFor="f-email">Email address</label><input id="f-email" type="email" name="email" autoComplete="email" required />
      <label htmlFor="f-notes">Anything else we should know? <small>Optional</small></label><textarea id="f-notes" name="notes" placeholder="Delivery timing, equipment or any questions…" />
      <input type="hidden" name="order" value={order} />
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
      {orderResult && !orderResult.ok ? <p className="form-error" role="alert">{orderResult.message}</p> : null}
      {orderResult?.ok ? <p className="form-ok" role="status">Thank you — your order request is with us. We will confirm trade terms and invoice by email.</p> : null}
      <button className="btn btn-bronze" type="submit" disabled={sending}>{sending ? "Sending…" : "Send my composed order"}</button><small className="order-reassurance">No payment taken now · trade terms confirmed first · 14-day guarantee</small>
    </Form>

    <aside className="ocomposition" aria-live="polite">
      <div className="ocomposition-head"><div><span>Live order composition</span><h3>Your salon order</h3></div><b>{state.qty + retailCount} item{state.qty + retailCount === 1 ? "" : "s"}</b></div>
      <div className="order-profit-hero"><span>Estimated gross profit potential</span><strong>{gbp(totalPotentialProfit)}</strong><p><b>{gbp(boothPotentialProfit)}</b> from the booth <i>+</i> <b>{gbp(retailPotentialProfit)}</b> from the shelf</p><small>Assumes 28 tans per litre at £25 and retail sell-through at RRP.{unpricedRetailCount ? " Soufflé selections below six use the projected Starter unit cost." : ""} Before labour, premises, card fees and tax.</small></div>
      <div className="order-product order-product-main"><img src="/assets/site/product-01-0003c7706e6e.jpg" alt="" width="900" height="900" /><div><span>Professional solution · {professionalPricing.tier.name}</span><strong>Malibu Spray · 1L</strong><small>{gbp(professionalPricing.unitPrice)} per litre · Universal bronze glow · ≈{capacity} tans</small></div><output>×{state.qty}</output></div>
      <div className="order-retail-heading"><span>Retail additions</span><a href="#complete-order">Edit selection ↑</a></div>
      {retailLines.length ? retailLines.map(({ id, src, title, badge }) => <div className="order-product" key={id}><img src={`/assets/site/${src}`} alt="" width="700" height="700" /><div><span>{badge}</span><strong>{title}</strong><small>{retailPricingSummary(id)}</small></div><output>×{state.retail[id]}</output></div>) : <div className="order-empty"><b>No retail added yet</b><span>Your professional litre is ready. Retail products are completely optional.</span><a href="#complete-order">Add retail products</a></div>}
      <div className="order-totals"><div><span>Professional subtotal</span><b>{gbp(total)}</b></div><div><span>Priced retail subtotal</span><b>{retailTradeSubtotal ? gbp(retailTradeSubtotal) : "None"}</b></div>{unpricedRetailCount ? <div><span>Soufflé building to Starter</span><b>{unpricedRetailCount} selected</b></div> : null}<div className="order-known-total"><span>Known order subtotal</span><b>{gbp(total + retailTradeSubtotal)}</b></div><p>Final trade terms are confirmed before invoicing. No payment is taken from this page.</p></div>
    </aside>
  </div></div></section>;
}

export function SalonFaq() {
  const visibleFaq = SHOW_LEGACY_MALIBU_SHADE_RANGE
    ? SALON_FAQ
    : SALON_FAQ.filter((item) => item.question !== "Which shade depths should a salon stock?");
  return <section className="faq-band" id="faq"><div className="wrap">
    <p className="eyebrow">Straight answers</p>
    <h2>Everything a salon owner asks <i>before the first litre.</i></h2>
    <p className="sub">The questions that come up on every trade call, answered in full.</p>
    <div className="faq-list">
      {visibleFaq.map((item, index) => (
        <details className="acc faq-item" key={item.question} open={index === 0}>
          <summary>{item.question}</summary>
          <div className="acc-body">{item.answer}</div>
        </details>
      ))}
    </div>
  </div></section>;
}

export function Specification() {
  const money = (value: number) => `\u00a3${value.toFixed(2)}`;
  const visibleSpecs = SHOW_LEGACY_MALIBU_SHADE_RANGE
    ? PRODUCT_SPECS
    : PRODUCT_SPECS.filter((spec) => spec.name !== "Shade depths available");
  return <section className="spec-band" id="specification"><div className="wrap">
    <p className="eyebrow">Specification</p>
    <h2>The numbers, <i>in full.</i></h2>
    <table className="spec-table">
      <tbody>
        {visibleSpecs.map((spec) => (
          <tr key={spec.name}><th scope="row">{spec.name}</th><td>{spec.value}</td></tr>
        ))}
      </tbody>
    </table>

    <h3 className="spec-sub">What that means in the booth</h3>
    <div className="spec-worked">
      {workedExamples().map((row) => (
        <p key={row.tansPerWeek}>
          At <b>{row.tansPerWeek} tans a week</b> charging <b>{money(row.pricePerTan)}</b> a tan, a salon takes{" "}
          {money(row.weeklyRevenue)} a week. The solution costs {money(row.weeklySolutionCost)} of that, leaving{" "}
          <b>{money(row.weeklyGross)}</b> before chair time — and works through about{" "}
          {row.litresPerMonth.toFixed(1)} litres a month.
        </p>
      ))}
    </div>
    <p className="spec-note">Figures use the standard {money(60)} list litre at approximately 28 full-body tans. Trade pricing is confirmed on your setup call.</p>
  </div></section>;
}
