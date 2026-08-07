import { Link } from "react-router";
import { PRODUCT_PATH, gbp } from "../../lib/site";

const A = "/assets/site/";

function DropIcon() {
  return <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3.5 4.8 6.5 8.2 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.2 8.5 7.8 12 3z" /></svg>;
}

export function Hero() {
  return (
    <div className="fold">
      <section className="hero" id="top">
        <div className="hero-inner"><div className="hero-copy">
          <p className="eyebrow">For salons, spas &amp; mobile professionals</p>
          <h1>The tan your<br />clients ask for.<br /><em>Now in your booth.</em></h1>
          <div className="hero-stats"><div>Hollywood's professional spray tan system.</div><div>Approx. 28 full-body tans per bottle.</div><div>Designed to create clients who come back.</div></div>
          <div className="hero-ctas"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order Malibu 1L — £60</Link><a className="btn btn-ghost" href="#trial">Request a free trial</a><a className="hero-profit-link" href="#calculator">Calculate your salon profits →</a></div>
        </div></div>
        <div className="hero-img"><img src="/img/hero-1100.webp" srcSet="/img/hero-560.webp 560w, /img/hero-760.webp 760w, /img/hero-1100.webp 1100w" sizes="(max-width: 900px) 100vw, 50vw" alt="Professional model holding the Sunless by Jimmy Coco spray tan" width="1100" height="1213" fetchPriority="high" /></div>
      </section>
      <div className="metrics"><div className="metrics-inner">
        <div className="metric"><DropIcon /><div><b>35<small>ml</small></b><span>Ideal application</span></div></div>
        <div className="metric"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3.5 2" /></svg><div><b>6–8<small>hrs</small></b><span>Classic development</span></div></div>
        <div className="metric"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg><div><b>3–4<small>hrs</small></b><span>Express development</span></div></div>
      </div></div>
      <div className="benefits"><div className="wrap"><span>Professional only</span><span>Hollywood formula</span><span>Fast dry down</span><span>Zero transfer</span><span>Soft focus finish</span></div></div>
    </div>
  );
}

export function Story() {
  return <section id="story"><div className="wrap story-grid">
    <img src={`${A}jimmy-coco-story-760.webp`} srcSet={`${A}jimmy-coco-story-460.webp 460w, ${A}jimmy-coco-story-760.webp 760w`} sizes="(max-width: 900px) 100vw, 42vw" alt="Jimmy Coco — the Hollywood tan artist behind the Sunless professional range" width="760" height="932" loading="lazy" decoding="async" />
    <div><p className="eyebrow">Why leading salons choose Jimmy Coco</p><blockquote className="big">“I wanted to bring my <em>Hollywood Glow</em> to the world's best salons.”</blockquote><p>For more than 15 years, Jimmy Coco has been the trusted tanning expert behind Hollywood's biggest stars, iconic red-carpet moments, and world-renowned beauty campaigns.</p><p style={{ marginTop: 12 }}>The iconic red-carpet radiance Jimmy Coco is known for has been meticulously bottled — offering your most selective clients exclusive access to Hollywood's signature glow.</p><p style={{ marginTop: 12 }}>A premium name your clients already recognise means a service you can price and present as premium — never a race to the bottom.</p><div className="sig">Jimmy Coco<small>Hollywood Tan Guru</small></div></div>
  </div></section>;
}

export function Formula() {
  const features = [
    ["Tailored to every client", "Custom-blended pigments enhance undertones for a flawless, natural finish."],
    ["Skin-loving hydration", "A curated infusion of hydrating ingredients delivers long-lasting colour with an even fade."],
    ["Dry before they dress", "Instant dry-down. No transfer."],
    ["A finish clients photograph", "Soft-focus, camera-ready colour that looks beautiful in every light."],
  ];
  return <section className="formula" id="formula"><div className="fx-bg" aria-hidden="true" /><div className="wrap fx-grid">
    <div className="fx-rail" aria-hidden="true"><span className="fx-line" /><span className="fx-vert">Sunless by Jimmy Coco</span></div>
    <div className="fx-copy"><p className="eyebrow">Professional solutions · Formula highlights</p><h2 className="fx-h">Professional<br />results<br /><em>your clients<br />notice.</em></h2><span className="fx-rule" /><p className="fx-lead">Confidence in the booth.<br />Compliments after.<br />Clients who come back.<br />That’s the Jimmy Coco effect.</p><div className="fx-quote"><span className="fx-qmark">“</span><p>The tan looks so natural, I thought you’d just been on holiday.</p><small>—&ensp;Client feedback</small></div></div>
    <div className="fx-stat"><div className="fx-badge"><b>83%</b><span>of clients would rebook sooner after a Jimmy&nbsp;Coco tan*</span></div><p className="fx-note">*Independent survey of 200 salon clients, 2024</p></div>
    <div className="fx-feats">{features.map(([title, copy], index) => <div className="fx-feat" key={title}><i>{index < 2 ? <svg viewBox="0 0 24 24" fill="#B0764A"><path d={index === 0 ? "M12 2l2.2 6.6L21 12l-6.8 3.4L12 22l-2.2-6.6L3 12l6.8-3.4z" : "M12 2.5c3.4 4.6 6.5 8 6.5 11.6A6.5 6.5 0 0 1 12 20.6a6.5 6.5 0 0 1-6.5-6.5C5.5 10.5 8.6 7.1 12 2.5z"} /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="#B0764A" strokeWidth="1.8"><path d={index === 2 ? "M3 9.5c3-3.2 6 3.2 9 0s4.5-2.4 9 0 M3 15c3-3.2 6 3.2 9 0s4.5-2.4 9 0" : "M3 7h18v13H3z M8.5 7 10 4.5h4L15.5 7"} /></svg>}</i><h3>{title}</h3><p>{copy}</p></div>)}</div>
  </div></section>;
}

export function Shades() {
  const shades = [
    ["shade-universal-v2.webp", "Malibu 10% DHA universal shade texture", <>Our signature shade is custom blended by Jimmy to deliver a <b>universal bronze glow</b> you would expect from <b>a weekend in the sun</b> after just one application.</>],
  ];
  const specs = [
    [
      <svg viewBox="8 6 28 32" fill="none" stroke="#2B211A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19h9.5a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-9.5a3 3 0 0 1-3-3V22a3 3 0 0 1 3-3Z" /><path d="M18.6 19v-4.4h6.8V19" /><path d="M25.4 15.6h4.3l2.3 2.2" /><path d="M14.5 24.6h-3" /><path d="M34.4 12.6h2.6M34.2 16.4h3M34.6 20.2l2.6 1.3" /></svg>,
      "Professional spray tan", "Designed for a flawless full body tan",
    ],
    [
      <svg viewBox="8 6 28 32"><path fill="#2B211A" d="M19.4 9.2h5.2v3.1c0 1.2.5 1.9 1.3 2.7 1.6 1.5 2.6 3 2.6 5.4v13.2c0 1.9-1.2 3.4-3 3.4h-7c-1.8 0-3-1.5-3-3.4V20.4c0-2.4 1-3.9 2.6-5.4.8-.8 1.3-1.5 1.3-2.7V9.2Z" /><rect x="18.5" y="7" width="7" height="2.6" rx="1.1" fill="#2B211A" /></svg>,
      "1 Litre · 33.81 fl.oz.", "Salon size for maximum value",
    ],
    [
      <svg viewBox="8 6 28 32" fill="none" stroke="#2B211A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="20.5" cy="14.6" r="4.6" /><path d="M11 36c0-6.3 4.3-11 9.5-11s9.5 4.7 9.5 11" /><path d="M20.5 25.4V36" /><path d="M32.6 10.4l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#8B5B31" stroke="none" /></svg>,
      "Approx. 28", "Full body tans per bottle",
    ],
  ];
  const facts = [
    ["home-06-bbf76ab992a8.jpg", "Professional spray tan icon", "Professional spray tan", "Designed for a flawless full body tan"],
    ["home-07-8b070f95baed.jpg", "One litre bottle icon", "1 Litre · 33.81 fl.oz.", "Salon size for maximum value"],
    ["home-09-ed59b9dc4a36.jpg", "Full body figure icon", "Approx. 28", "Full body tans per bottle"],
  ];
  return <>
    <section className="shades-showcase" id="shades"><div className="wrap">
      <p className="eyebrow">The Malibu professional solution</p><h2>One universal shade.<br /><em>Every client<br />covered.</em></h2>
      <div className="shade-intro"><span className="shade-rule" /><p>One custom-blended formula, engineered to deliver a natural, believable glow — for every skin tone and every moment.</p></div>
      <div className="shade-grid">{shades.map(([src, alt, copy]) => <div className="shade" key={src as string}><span className="shade-swatch"><img src={`${A}${src}`} alt={alt as string} width="408" height="218" loading="lazy" decoding="async" /><b>Malibu 10% DHA</b></span><div><p>{copy}</p></div></div>)}</div>
    </div></section>
    <section className="litre-offer" id="malibu-litre"><div className="wrap"><div className="litre-grid"><div className="prodcard"><div className="pc-main"><div className="pc-stage"><ul className="pc-notes"><li><span>Shade compliments all skin tones and depth of colour</span><i aria-hidden="true" /></li><li><span>Jimmy’s iconic scent</span><i aria-hidden="true" /></li><li><span>Moisture locking formula</span><i aria-hidden="true" /></li><li><span>Anti-orange tone</span><i aria-hidden="true" /></li></ul><img className="pc-shot" src={`${A}malibu-bottle.webp`} alt="Malibu 1 litre professional spray tan solution bottle" width="700" height="1954" loading="lazy" decoding="async" /></div><div className="pc-spec"><div className="pc-tile"><p className="pc-shade">Universal<br /><b>Bronze Glow</b><br />Shade</p><span>10% DHA</span></div><p className="pc-size">1 Litre ℮ 33.81 fl.oz.<br />Approx. 28 Full Body Tans</p><ul className="pc-list">{specs.map(([icon, title, copy]) => <li key={title as string}><i aria-hidden="true">{icon}</i><div><b>{title}</b><span>{copy}</span></div></li>)}</ul></div></div><p className="pc-foot"><i aria-hidden="true">♥</i><b>Perfect for mobile &amp; salon professionals</b><span>Consistent results. Maximum value from every drop.</span></p></div><div><p className="eyebrow">Professional salon size</p><h2>The salon-size litre that pays for itself.</h2><p className="sub">Professional spray solution, designed for flawless full-body tans — salon size for maximum value, consistent results from every drop.</p><div className="lstat lstat-one"><div><b>~£2.15 per tan</b><span>your solution cost, at £60 per litre*</span></div></div><p className="note">*Based on the standard £60 litre at 28 tans. Trade pricing improves this further — confirmed on your setup call.</p><div className="litre-actions"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the litre — £60</Link><Link className="btn btn-ghost" to={`${PRODUCT_PATH}#order`}>View shades &amp; trade order</Link></div></div></div></div></section>
    <div className="facts-strip"><div className="wrap"><div className="facts">{facts.map(([src, alt, title, copy]) => <div className="fact" key={src}><img src={`${A}${src}`} alt={alt} width="130" height="130" loading="lazy" decoding="async" /><div><b>{title}</b><span>{copy}</span></div></div>)}</div><p className="facts-tag"><b>♥</b> Perfect for mobile &amp; salon professionals — consistent results, maximum value from every drop.</p></div></div>
  </>;
}

export function Retail() {
  const products = [
    ["retail-mitt.webp", "Buff & Glow Mitt in navy", "The easy add-on", "Buff & Glow Mitt", "The world's first 3-in-1 tanning mitt — streak-free maintenance between visits. The natural “add this to your visit” at checkout.", "RRP £15", " · ★ 5.0 from 20 reviews"],
    ["retail-souffle.webp", "The Self Tan Soufflé with mitt and face mist bundle", "The top-up seller", "The Self Tan Soufflé", "Instant tint, Jimmy's iconic scent and a moisture-locking formula — the take-home that extends your work between appointments.", "Light · Medium · Dark", ""],
    ["retail-kit.webp", "The A-List Glow Kit complete routine", "The gift purchase", "The A-List Glow Kit", "The complete six-piece routine — soufflé, world-first mitt, luxury brushes, face mist and lip balm. Your premium shelf anchor.", "RRP £79", " · 6 pieces"],
  ];
  return <section className="retail" id="retail"><div className="wrap"><p className="eyebrow">The second revenue line</p><h2>The moment they step out of the booth<br /><em>is the moment they buy.</em></h2><p className="sub">A tight retail range at reception lets clients keep their colour looking fresh for a week longer — real margin, no extra chair time, and the same brand story from booth to shelf.</p><div className="shop-grid">{products.map(([src, alt, badge, title, description, price, suffix]) => <div className="pcard" key={src}><div className="pimg"><img src={`${A}${src}`} alt={alt} width="700" height="700" loading="lazy" decoding="async" /></div><div className="pbody"><span className="badge">{badge}</span><h3>{title}</h3><p className="pdesc">{description}</p><span className="price">{price}<span>{suffix}</span></span></div></div>)}</div><div className="section-actions"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the professional litre — £60</Link><a className="btn btn-ghost" href="#trial">Request a free trial instead</a></div></div></section>;
}

export function GlowDuo() {
  const shots = [
    ["signature-glow.webp", "Press quote from Hello Magazine calling Jimmy Coco the magician behind Kylie Jenner's signature bronzed glow"],
    ["sunless-bikini.webp", "Sun-kissed tan finish with a Sunless by Jimmy Coco branded towel"],
  ];
  return <section className="glow-duo"><div className="wrap"><div className="gd-grid">{shots.map(([src, alt]) => <figure className="gd-shot" key={src}><img src={`${A}${src}`} alt={alt} width="1200" height="1394" loading="lazy" decoding="async" sizes="(max-width: 820px) 100vw, 50vw" /></figure>)}</div></div></section>;
}

export function Certification() {
  const included = [
    "1-hour online training with Jimmy Coco",
    "Hollywood application techniques",
    "Product knowledge & consultation tips",
    "Professional certification quiz",
    "Official Jimmy Coco certificate",
    "Digital accreditation badge for social media & website",
    "Listed as a Jimmy Coco Certified Salon (if applicable)",
  ];
  const matters = [
    "Builds trust with new clients",
    "Adds prestige to your salon",
    "Differentiates you from competitors",
    "Gives clients confidence they're receiving a professional Hollywood-standard tan",
  ];
  return <section className="certify" id="certification"><div className="cert-grid">
    <div className="cert-copy">
      <p className="eyebrow">The accreditation</p>
      <h2>Become a Jimmy Coco <em>Certified Salon.</em></h2>
      <p className="sub cert-lead">Give your clients Hollywood's most sought-after glow.</p>
      <p className="cert-body">Be selected as a Jimmy Coco Professional Partner and you'll gain exclusive access to Jimmy's online certification programme, where he personally teaches the signature tanning techniques used on some of the world's most photographed women.</p>
      <p className="cert-body">Complete the online training and short assessment to become a Jimmy Coco Certified Salon, and receive your official certificate and accreditation badge to display in your salon, on your website and across social media.</p>
      <div className="cert-lists">
        <div><h3>What's included</h3><ul className="cert-list cert-check">{included.map((item) => <li key={item}><i aria-hidden="true">&#10003;</i><span>{item}</span></li>)}</ul></div>
        <div><h3>Why it matters</h3><ul className="cert-list cert-star">{matters.map((item) => <li key={item}><i aria-hidden="true">&#10022;</i><span>{item}</span></li>)}</ul></div>
      </div>
    </div>
    <div className="cert-art">
      <img className="cert-badge" src={`${A}certified-badge.webp`} alt="Certified Jimmy Coco Hollywood Tan Artist accreditation badge" width="620" height="616" loading="lazy" decoding="async" />
      <img className="cert-jimmy" src={`${A}jimmy-certified.webp`} alt="Jimmy Coco presenting the certification programme" width="1600" height="872" loading="lazy" decoding="async" />
    </div>
  </div></section>;
}

export function Trial({ monthlyProfit }: { monthlyProfit: number }) {
  return <section className="partner-close" id="trial"><div className="wrap"><p className="eyebrow">The partnership · complimentary trial</p><h2>Try it on a real client. <em>Free.</em></h2><p className="sub">Party season books out before it starts. Salons that trial now are stocked, trained and ready before the rush — and the trial costs you nothing but one appointment.</p><div className="close-grid"><div>
    <div className="trialbox"><span className="tb-tag">In your trial box</span><ul><li><b>The Sunset professional solution</b><span>Enough to tan a real client — judge the colour on skin, not on a screen.</span></li><li><b>Jimmy's shade guide</b><span>The method behind 20+ years of red-carpet colour. Yours to keep, either way.</span></li></ul><p>Posted this week · no cost · no commitment</p></div>
    <div className="perks"><div><i>◆</i><b>Trade pricing</b><span>on the professional litre and the retail range</span></div><div><i>✦</i><b>Team training</b><span>Jimmy's shade method — confident from day one</span></div><div><i>❋</i><b>Launch assets</b><span>marketing, ready to use on day one</span></div></div>
    <p className="close-note">No lock-in and no pressure at any step. Trial it, judge it, then we talk terms — or we don't, and the shade guide is still yours.</p><div className="trial-order"><b>Ready to place an order?</b><Link to={PRODUCT_PATH}>Order Malibu 1L — £60 →</Link></div>
  </div><form className="trialform"><div className="tf-head"><h3>Get the trial box</h3><span className="tf-badge">Free</span></div><p>Thirty seconds now. Posted this week.</p><p className="tf-echo">You calculated <b>{gbp(monthlyProfit)}</b> a month. The trial is how you check the colour deserves it.</p><input type="text" name="salon" autoComplete="organization" aria-label="Salon or business name" placeholder="Salon or business name" required /><input type="text" name="name" autoComplete="name" aria-label="Your name" placeholder="Your name" required /><input type="email" name="email" autoComplete="email" aria-label="Email address" placeholder="Email address" required /><input type="tel" name="phone" autoComplete="tel" aria-label="Phone number (optional)" placeholder="Phone (optional)" /><select name="type" aria-label="Business type" defaultValue="Salon"><option>Salon</option><option>Spa</option><option>Mobile professional</option><option>Multi-site group</option></select><button className="btn btn-bronze" type="submit">Post me a trial — free</button><ol className="tf-steps"><li><b>This week:</b> your trial box is posted</li><li><b>You tan</b> one real client and judge the result</li><li><b>15 minutes</b> on trade terms — only if you love it</li></ol><small>No card. No commitment. One email stops everything.</small></form></div></div></section>;
}
