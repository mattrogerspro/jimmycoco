import type { PurchaseState } from "./ProductPurchase";
import { SHADE_OPTIONS } from "./ProductPurchase";
import { Form, useActionData, useNavigation } from "react-router";
import type { ApplicationActionResult } from "../../lib/application-action.server";
import { gbp } from "../../lib/site";

const asset = (name: string) => `/assets/site/${name}`;

export function JimmyStory() {
  return <section className="jimmy-band"><div className="wrap jimmy-grid"><img src={asset("product-06-78d26bf05e35.jpg")} alt="Jimmy Coco, Hollywood celebrity tan artist" loading="lazy" decoding="async" /><div><p className="eyebrow">Created by Jimmy Coco · Hollywood celebrity tan artist</p><h2>For decades I've created flawless skin for Hollywood's most photographed faces.</h2><ul className="creds"><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.3 12.3 2.6 2.6 4.8-5.4" /></svg></i><span>Preferred tan artist to the Kardashians for over 15 years.</span></li><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5.4" /><path d="M8.7 13.6 7.4 21l4.6-2.4L16.6 21l-1.3-7.4" /></svg></i><span>Red Carpet &amp; Editorial Expert</span></li><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9z" /></svg></i><span>Hollywood&rsquo;s Leading Tan Guru</span></li></ul><p className="sub" style={{ maxWidth: "none" }}>This formula brings that same professional approach into your booth — the exact solution behind the red-carpet colour your clients photograph, bottled at salon scale.</p><div className="jtip"><b>Jimmy's tip for your therapists</b><p>Don't aim for maximum colour on the first pass. Apply one light layer, let it develop fully, then build depth on the next application. That's exactly how I create natural-looking skin for camera work.</p></div><div className="sig">Jimmy Coco<small>Hollywood Tan Guru</small></div></div></div></section>;
}

export function Results() {
  const reviews = [["The most natural tan I've ever had.", "Sophie M."], ["Buildable, streak-free and looks amazing.", "Lauren T."], ["Finally a tan that looks real, not fake.", "James K."]];
  return <section><div className="wrap"><p className="eyebrow">Real results · real people</p><h2>The colour your clients will talk about.</h2><div className="res-grid">{reviews.map(([review, name]) => <div className="res-card" key={name}><p>{review}</p><b>{name}</b><span className="stars">★★★★★</span></div>)}</div><p className="res-note">Verified customer reviews · individual results may vary.</p></div></section>;
}

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

export function CrossSell() {
  const items = [
    ["product-08-66f48742c941.jpg", "Buff & Glow Mitt", "The 30-second checkout add-on · ★ 5.0", "RRP £15"],
    ["product-09-d075d24d746f.jpg", "The Self Tan Soufflé", "The top-up seller between visits · L / M / D", "From RRP £28"],
    ["product-10-64a58fd5e4a1.jpg", "The A-List Glow Kit", "The gift purchase · six pieces", "RRP £79"],
  ];
  return <section className="steps-band"><div className="wrap"><p className="eyebrow">Complete the order</p><h2>Stock the shelf while you're at it.</h2><p className="sub">The retail range turns every tanning visit into a second sale — same brand, real margin, no extra chair time.</p><div className="xs-grid">{items.map(([src, title, copy, price]) => <div className="xs-card" key={src}><div className="xi"><img src={asset(src)} alt={title} loading="lazy" decoding="async" /></div><div className="xb"><h3>{title}</h3><p>{copy}</p><b>{price}</b></div></div>)}</div><p style={{ marginTop: 22, fontSize: 16.5, color: "var(--muted)" }}>Add retail to your order in the notes below — trade pricing across the range on your setup call.</p></div></section>;
}

export function ProductDetails() {
  return <section style={{ paddingTop: 60, paddingBottom: 60 }}><div className="wrap" style={{ maxWidth: "min(90vw,1100px)" }}>
    <details className="acc"><summary>What's in the formula</summary><div className="acc-body">Colloidal gold for a radiant soft-focus finish · hyaluronic acid attracting 1000× its weight in water · Jimmy's signature scent with fine-fragrance aromaguard technology · blue daisy to soothe sensitive skin · Pentavitin to lock moisture in place. Custom-blended, skin-tone–sympathetic pigments enhance every client's natural undertones.</div></details>
    <details className="acc"><summary>Delivery</summary><div className="acc-body">UK &amp; NI: 1–3 working days (£5.50, free over £40 with FREESHIP40) · ROI: 1–3 working days (€6.50, free over €30) · US: 3–4 working days ($7, free over $50) · EU: 5–7 working days (£14.95, free over €100). Orders placed after 1pm dispatch the following working day.</div></details>
    <details className="acc"><summary>Returns &amp; guarantee</summary><div className="acc-body">14-day return and refund policy with a 100% money-back guarantee on every order. New salons: start with the complimentary trial instead — judge the colour on a real client before your first litre.</div></details>
    <details className="acc"><summary>Salon FAQ</summary><div className="acc-body"><b>Does it work with my existing spray equipment?</b> The solution is designed for standard professional HVLP spray systems — confirm your setup on the trade call.<br /><br /><b>How many tans per litre?</b> approximately 28 full body tans at the recommended &lt;35ml per session.<br /><br /><b>Do you supply mobile professionals?</b> Yes — salons, spas, mobile pros and multi-site groups.<br /><br /><b>Is training really included?</b> Yes: Jimmy's shade method training and guide come with every salon account.<br /><br /><b>What are the trade terms?</b> Confirmed on your setup call — pricing on this page is standard list.</div></details>
  </div></section>;
}

export function OrderSection({ state }: { state: PurchaseState }) {
  const orderResult = useActionData() as ApplicationActionResult | undefined;
  const navigation = useNavigation();
  const sending = navigation.state === "submitting";
  const total = state.qty * 60;
  const capacity = state.qty * 28;
  const litres = `${state.qty} ${state.qty === 1 ? "litre" : "litres"}`;
  const order = `Malibu Professional Spray 1L\nShade: ${state.shade}\nQuantity: ${litres}\nList total: ${gbp(total)} (trade terms to be applied)`;
  return <section className="order-band" id="order"><div className="wrap"><p className="eyebrow">Salon order</p><h2>Your order, <em>composed.</em></h2><p className="sub">Review the summary — it follows your selections above — add your details, and it's with the partnerships team same-day. Trade terms applied before anything is charged.</p><div className="order-grid"><div className="osummary"><h3>Order summary</h3><div className="oline"><span>Product</span><b>Malibu Professional Spray</b></div><div className="oline"><span>Shade</span><b>{state.shade}</b></div><div className="oline"><span>Quantity</span><b>{litres}</b></div><div className="oline"><span>Tan capacity</span><b>≈{capacity} tans</b></div><div className="oline total"><span>List total</span><b>{gbp(total)}</b></div><p className="onote">Standard list pricing shown. Your trade terms are applied on the setup call before payment — nothing is charged from this page.</p></div>
    <Form method="post" className="orderform" replace><h3>Send the order</h3><p>Same-day response, Monday to Friday.</p><label htmlFor="f-salon">Salon or business name</label><input id="f-salon" type="text" name="salon" autoComplete="organization" required /><label htmlFor="f-name">Your name</label><input id="f-name" type="text" name="name" autoComplete="name" required /><label htmlFor="f-email">Email address</label><input id="f-email" type="email" name="email" autoComplete="email" required /><label htmlFor="f-phone">Phone</label><input id="f-phone" type="tel" name="phone" autoComplete="tel" /><label htmlFor="f-order">Your order (auto-filled)</label><textarea id="f-order" name="order" readOnly value={order} /><label htmlFor="f-notes">Notes — retail add-ons, equipment, questions (optional)</label><textarea id="f-notes" name="notes" style={{ minHeight: 70 }} /><input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />{orderResult && !orderResult.ok ? <p className="form-error" role="alert">{orderResult.message}</p> : null}{orderResult?.ok ? <p className="form-ok" role="status">Thank you — your order request is with us. We will confirm trade terms and invoice by email.</p> : null}<button className="btn btn-bronze" type="submit" disabled={sending}>{sending ? "Sending…" : "Send my salon order"}</button><small>No payment taken now · trade terms confirmed first · 14-day guarantee</small></Form>
  </div></div></section>;
}
