import { useEffect, useRef, useState } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import type { ApplicationActionResult } from "../../lib/application-action.server";
import { track } from "../../lib/analytics";
import type { TrialCalculatorContext } from "../../lib/calculator";
import { PRODUCT_PATH } from "../../lib/site";
import { RetailProductCards } from "../shared/RetailProductCards";
import { LITRE_PRICE_GBP, TANS_PER_LITRE, costPerTan } from "../../lib/specs";
import { useCurrency } from "../shared/CurrencyContext";
import {
  TRIAL_ATTRIBUTION_FIELDS,
  isUsTrialAttribution,
  type TrialAttribution,
} from "../../../../shared/trial-journey.js";

const A = "/assets/site/";
const STORY_IMAGE_SIZES = "(max-width: 900px) 100vw, 45vw";
const JIMMY_BACKGROUND_SRCSET = [480, 768, 1080]
  .map((width) => `${A}jimmy-coco-story-background-${width}.webp ${width}w`)
  .join(", ");
const JIMMY_CUTOUT_SRCSET = [480, 768, 1080]
  .map((width) => `${A}jimmy-coco-story-cutout-${width}.webp ${width}w`)
  .join(", ");
const HEIDI_SRCSET = [480, 768, 1080, 1650]
  .map((width) => `${A}heidi-${width}.webp ${width}w`)
  .join(", ");
const REVENUE_BACKGROUND_SRCSET = [480, 768, 1080, 1440, 1920, 2560]
  .map((width) => `${A}revenue-line-background-${width}.webp ${width}w`)
  .join(", ");

function DropIcon() {
  return <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3.5 4.8 6.5 8.2 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.2 8.5 7.8 12 3z" /></svg>;
}

function HeroBottle() {
  return (
    <figure className="hero-bottle">
      <img src={`${A}pro-bottle.webp`} alt="Malibu 1 litre professional spray tan solution bottle" width={620} height={1708} fetchPriority="high" decoding="async" />
    </figure>
  );
}

export function Hero() {
  const { money } = useCurrency();
  return (
    <div className="fold" data-asset-revision="2026-08-13-sections-reset-2">
      <section className="hero" id="top">
        <div className="hero-inner"><div className="hero-copy">
          <p className="eyebrow">For salons, spas &amp; mobile professionals</p>
          <h1>The tan your<br />clients ask for.<br /><em>Now in your booth.</em></h1>
          <div className="hero-stats"><div>Hollywood's professional spray tan system.</div><div>Approx. {TANS_PER_LITRE} full-body tans per bottle.</div><div>Designed to create clients who come back.</div></div>
          <div className="hero-ctas" aria-label="Choose how you would like to start"><a className="btn hero-trial-cta" href="#trial">Request Free 100ml Trial Box</a><Link className="btn btn-ghost hero-order-cta" to={PRODUCT_PATH}>Order Malibu 1L ({money(LITRE_PRICE_GBP)})</Link><p className="hero-profit-line">Curious about margins? <a href="#calculator">See the salon profit breakdown <span aria-hidden="true">↓</span></a></p></div>
        </div>
        <HeroBottle /></div>
        {/* The headline over this photo used to be burnt into the raster, which
            meant one fixed line-break for every screen and nothing for search or
            screen readers. It is live text now. */}
        <div className="hero-img">
          <img src="/img/hero-kk-996.webp" srcSet="/img/hero-kk-560.webp 560w, /img/hero-kk-760.webp 760w, /img/hero-kk-996.webp 996w" sizes="(max-width: 900px) 100vw, 34vw" alt="Professional model with a Sunless by Jimmy Coco spray tan" width="996" height="1270" fetchPriority="high" />
          <div className="hero-overlay">
            <p className="ho-head"><span className="ho-serif">Glow like</span><span className="ho-sans">a Kardashian</span></p>
            <p className="ho-sub">Hollywood&rsquo;s sunless tan experts<br />Professional tan formula</p>
          </div>
        </div>
      </section>
      <div className="metrics"><div className="metrics-inner">
        <div className="metric"><DropIcon /><div><b>35<small>ml</small></b><span>Ideal application</span></div></div>
        <div className="metric metric-empty" aria-hidden="true" />
        <div className="metric"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3.5 2" /></svg><div><b>6–8<small>hrs</small></b><span>Development</span></div></div>
      </div></div>
      <div className="benefits"><div className="wrap"><span>Professional only</span><span>Hollywood formula</span><span>Fast dry down</span><span>Zero transfer</span><span>Soft focus finish</span></div></div>
    </div>
  );
}

function StoryPortrait() {
  const sceneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || scene.dataset.storyMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scene.dataset.storyMotion = "react";

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const render = () => {
      frame = 0;
      const section = scene.closest<HTMLElement>("#story");
      const visualTrack = scene.closest<HTMLElement>(".story-visual-track");
      const sectionRect = section?.getBoundingClientRect();
      const visualTrackRect = visualTrack?.getBoundingClientRect();
      const sceneRect = scene.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isDesktop = window.matchMedia("(min-width: 901px)").matches;
      const headerHeight = document.querySelector<HTMLElement>("header.site-header")?.offsetHeight ?? 74;
      const stickyHeight = Math.max(viewportHeight - headerHeight, 1);
      const scrollRange = Math.max((section?.offsetHeight ?? stickyHeight) - stickyHeight, 1);
      const mobileScrollRange = Math.max((visualTrack?.offsetHeight ?? sceneRect.height) - sceneRect.height, 1);
      const progress = isDesktop
        ? Math.max(0, Math.min(1, (headerHeight - (sectionRect?.top ?? sceneRect.top)) / scrollRange))
        : Math.max(0, Math.min(1, (headerHeight - (visualTrackRect?.top ?? sceneRect.top)) / mobileScrollRange));
      const reveal = isDesktop ? Math.max(0, Math.min(1, (progress - .18) / .64)) : progress;
      const scrollDepth = progress * 2 - 1;
      scene.style.setProperty("--story-x", pointerX.toFixed(3));
      scene.style.setProperty("--story-y", pointerY.toFixed(3));
      scene.style.setProperty("--story-scroll", scrollDepth.toFixed(3));
      scene.style.setProperty("--story-reveal", reveal.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - .5) * 2));
      pointerY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - .5) * 2));
      schedule();
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    render();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      delete scene.dataset.storyMotion;
    };
  }, []);

  return <figure className="story-portrait" ref={sceneRef}>
    <img className="story-layer story-background" src={`${A}jimmy-coco-story-background-1080.webp`} srcSet={JIMMY_BACKGROUND_SRCSET} sizes={STORY_IMAGE_SIZES} alt="" width="1080" height="1325" loading="lazy" decoding="async" aria-hidden="true" />
    <img className="story-layer story-foreground" src={`${A}jimmy-coco-story-cutout-1080.webp`} srcSet={JIMMY_CUTOUT_SRCSET} sizes={STORY_IMAGE_SIZES} alt="Jimmy Coco — the Hollywood tan artist behind the Sunless professional range" width="1080" height="1325" loading="lazy" decoding="async" />
    <img className="story-layer story-heidi" src={`${A}heidi-1650.webp`} srcSet={HEIDI_SRCSET} sizes={STORY_IMAGE_SIZES} alt="Campaign photograph featuring Kim and Heidi" width="1650" height="1984" loading="lazy" decoding="async" />
    <span className="story-heidi-shade" aria-hidden="true" />
    <p className="story-proof"><span>Tanning Kim and Heidi</span><strong>for over 15 years</strong></p>
  </figure>;
}

export function Story() {
  return <section id="story"><div className="wrap story-grid">
    <div className="story-visual-track"><StoryPortrait /></div>
    <div className="story-copy-track"><div className="story-copy-pin"><div className="story-copy"><p className="eyebrow">Why leading salons choose Jimmy Coco</p><blockquote className="big">“I wanted to bring my <em>Hollywood Glow</em> to the world's best salons.”</blockquote><ul className="creds"><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.3 12.3 2.6 2.6 4.8-5.4" /></svg></i><span>Preferred tan artist to the Kardashians for over 15 years.</span></li><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5.4" /><path d="M8.7 13.6 7.4 21l4.6-2.4L16.6 21l-1.3-7.4" /></svg></i><span>Red Carpet &amp; Editorial Expert</span></li><li><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9z" /></svg></i><span>Hollywood&rsquo;s Leading Tan Expert</span></li></ul><p>For more than 15 years, Jimmy Coco has been the trusted tanning expert behind Hollywood's biggest stars, iconic red-carpet moments, and world-renowned beauty campaigns.</p><p style={{ marginTop: 12 }}>The iconic red-carpet radiance Jimmy Coco is known for has been meticulously bottled — offering your most selective clients exclusive access to Hollywood's signature glow.</p><p style={{ marginTop: 12 }}>A premium name your clients already recognise means a service you can price and present as premium — never a race to the bottom.</p><div className="sig">Jimmy Coco<small>Hollywood Tan Expert</small></div></div></div></div>
  </div></section>;
}

const INSTAGRAM_POSTS = [
  { shortcode: "DcMLuOxjBHv", label: "A-List Face Mist glow" },
  { shortcode: "DcJhBotjJS4", label: "Signature Malibu glow" },
  { shortcode: "DcG6Gj9DKHS", label: "Bridal Party Glow guide" },
  { shortcode: "DcDpfZyDBOh", label: "Camera-ready Malibu glow" },
];

export function InstagramShowcase() {
  return <section className="instagram-showcase" aria-labelledby="instagram-heading">
    <div className="wrap">
      <div className="instagram-heading">
        <div>
          <p className="eyebrow">From the studio</p>
          <h2 id="instagram-heading">The latest <em>Jimmy Coco glow.</em></h2>
        </div>
        <a href="https://www.instagram.com/jimmyjimmycoco/" target="_blank" rel="noreferrer">Follow @jimmyjimmycoco <span aria-hidden="true">↗</span></a>
      </div>
      <div className="instagram-grid">
        {INSTAGRAM_POSTS.map(({ shortcode, label }) => {
          const postUrl = `https://www.instagram.com/p/${shortcode}/`;
          return <article className="instagram-post" key={shortcode}>
            <iframe
              title={`Instagram post: ${label}`}
              src={`${postUrl}embed/captioned/`}
              loading="lazy"
              allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a className="instagram-post-link" href={postUrl} target="_blank" rel="noreferrer">
              <span>{label}</span><span aria-hidden="true">View post ↗</span>
            </a>
          </article>;
        })}
      </div>
    </div>
  </section>;
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
    <div className="fx-feats">{features.map(([title, copy], index) => <div className="fx-feat" key={title}><i>{index < 2 ? <svg viewBox="0 0 24 24" fill="currentColor"><path d={index === 0 ? "M12 2l2.2 6.6L21 12l-6.8 3.4L12 22l-2.2-6.6L3 12l6.8-3.4z" : "M12 2.5c3.4 4.6 6.5 8 6.5 11.6A6.5 6.5 0 0 1 12 20.6a6.5 6.5 0 0 1-6.5-6.5C5.5 10.5 8.6 7.1 12 2.5z"} /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={index === 2 ? "M3 9.5c3-3.2 6 3.2 9 0s4.5-2.4 9 0 M3 15c3-3.2 6 3.2 9 0s4.5-2.4 9 0" : "M3 7h18v13H3z M8.5 7 10 4.5h4L15.5 7"} /></svg>}</i><h3>{title}</h3><p>{copy}</p></div>)}</div>
  </div></section>;
}

export function Shades() {
  const { money } = useCurrency();
  const gbp = money;
  const shadeCopy = <>Our signature shade is custom blended by Jimmy to deliver a <b>universal bronze glow</b> you would expect from <b>a weekend in the sun</b> after just one application.</>;
  const specs = [
    ["home-06-bbf76ab992a8.jpg", "Professional spray tan icon", "Professional spray tan", "Designed for a flawless full body tan"],
    ["home-07-8b070f95baed.jpg", "One litre bottle icon", "1 Litre · 33.81 fl.oz.", "Salon size for maximum value"],
    ["home-09-ed59b9dc4a36.jpg", "Full body figure icon", "Approx. 28", "Full body tans per bottle"],
  ];
  const facts = specs;
  return <>
    <section className="shades-showcase" id="shades"><div className="wrap">
      <div className="shade-text"><p className="eyebrow">The Malibu professional solution</p><h2>One universal shade.<br /><em>Every client<br />covered.</em></h2>
      <div className="shade-intro"><span className="shade-rule" /><p>One custom-blended formula, engineered to deliver a natural, believable glow — for every skin tone.</p></div></div>
      <div className="shade-grid"><div className="shade shade-universal">
        <img className="shade-badge" src={`${A}malibu-badge.webp`} alt="Malibu" width="871" height="238" loading="lazy" decoding="async" />
        <div className="shade-identity" aria-label="Universal Bronze Glow Shade, 10% DHA"><span>Universal</span><strong>Bronze Glow</strong><span>Shade</span><small>10% DHA</small></div>
        <div className="shade-copy"><p>{shadeCopy}</p></div>
      </div></div>
      <img className="shade-product-shoot" src="/img/backgrounds/pro-bundle.webp" alt="Malibu professional spray tan solution bottles" width="1080" height="1440" loading="lazy" decoding="async" />
    </div></section>
    <section className="litre-offer" id="malibu-litre"><div className="wrap"><div className="litre-grid"><div className="prodcard"><div className="pc-main"><div className="pc-stage"><ul className="pc-notes"><li><span>Shade compliments all skin tones and depth of colour</span><i aria-hidden="true" /></li><li><span>Jimmy’s iconic scent</span><i aria-hidden="true" /></li><li><span>Moisture locking formula</span><i aria-hidden="true" /></li><li><span>Anti-orange tone</span><i aria-hidden="true" /></li></ul><img className="pc-shot" src={`${A}malibu-bottle.webp`} alt="Malibu 1 litre professional spray tan solution bottle" width="700" height="1954" loading="lazy" decoding="async" /></div><div className="pc-spec"><div className="pc-tile pc-tile-badged"><img className="pc-malibu-badge" src={`${A}malibu-badge.webp`} alt="Malibu" width="871" height="238" loading="lazy" decoding="async" /><p className="pc-shade">Universal<br /><b>Bronze Glow</b><br />Shade</p><span>10% DHA</span></div><p className="pc-size">1 Litre ℮ 33.81 fl.oz.<br />Approx. {TANS_PER_LITRE} Full Body Tans</p><ul className="pc-list">{specs.map(([src, alt, title, copy]) => <li key={title}><i aria-hidden="true"><img src={`${A}${src}`} alt="" width="130" height="130" loading="lazy" decoding="async" /></i><div><b>{title}</b><span>{copy}</span></div></li>)}</ul></div></div><p className="pc-foot"><i aria-hidden="true">♥</i><b>Perfect for mobile &amp; salon professionals</b><span>Consistent results. Maximum value from every drop.</span></p></div><div><p className="eyebrow">Professional salon size</p><h2>The salon-size litre that pays for itself.</h2><p className="sub">Professional spray solution, designed for flawless full-body tans — salon size for maximum value, consistent results from every drop.</p><div className="lstat lstat-one"><div><b>~{gbp(costPerTan(), 2)} per tan</b><span>your solution cost, at {gbp(LITRE_PRICE_GBP)} per litre*</span></div></div><p className="note">*Based on the standard {gbp(LITRE_PRICE_GBP)} litre at {TANS_PER_LITRE} tans. Trade pricing improves this further — confirmed on your setup call.</p><div className="litre-actions"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the litre — {gbp(LITRE_PRICE_GBP)}</Link><Link className="btn btn-ghost" to={`${PRODUCT_PATH}#complete-order`}>Build your trade order</Link></div></div></div></div></section>
    <div className="facts-strip"><div className="wrap"><div className="facts">{facts.map(([src, alt, title, copy]) => <div className="fact" key={src}><span className="fact-icon" aria-hidden="true"><img src={`${A}${src}`} alt="" width="130" height="130" loading="lazy" decoding="async" /></span><div><b>{title}</b><span>{copy}</span></div></div>)}</div><p className="facts-tag"><b>♥</b> Perfect for mobile &amp; salon professionals — consistent results, maximum value from every drop.</p></div></div>
  </>;
}

export function Retail() {
  const orderStart = `${PRODUCT_PATH}#configure-solution`;

  return <section className="retail" id="retail">
    <picture className="retail-background" aria-hidden="true">
      <img src={`${A}revenue-line-background-2560.webp`} srcSet={REVENUE_BACKGROUND_SRCSET} sizes="100vw" alt="" width="2560" height="1118" loading="lazy" decoding="async" />
    </picture>
    <div className="wrap">
      <div className="retail-intro"><div><p className="eyebrow">The second revenue line</p><h2>The moment they step out of the booth<br /><em>is the moment they buy.</em></h2><p className="sub">Explore the take-home range here, then start with your professional solution on the order page before choosing any retail quantities.</p></div></div>
      <RetailProductCards cardHref={orderStart} />
      <div className="retail-compose"><div><span>Build your salon order</span><strong>Start with the professional solution</strong><small>Retail quantities are selected in Step 2 of the order page.</small></div><div className="section-actions"><Link className="btn btn-bronze" to={orderStart}>Start at Step 1</Link></div></div>
    </div>
  </section>;
}

export function GlowDuo() {
  const shots = [
    ["glow-duo-bikini.webp", "Sun-kissed tan finish with a Sunless by Jimmy Coco branded towel", 1080, 1620],
    ["glow-duo-quote.webp", "Press quote from Hello Magazine calling Jimmy Coco the magician behind Kylie Jenner's signature bronzed glow", 1080, 1674],
  ];
  return <section className="glow-duo"><div className="wrap"><div className="gd-grid">{shots.map(([src, alt, w, h]) => <figure className="gd-shot" key={src as string}><img src={`${A}${src}`} alt={alt as string} width={w as number} height={h as number} loading="lazy" decoding="async" sizes="(max-width: 820px) 100vw, 60vw" /></figure>)}</div></div></section>;
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

export function Trial({
  monthlyProfit,
  calculatorContext,
  attribution,
}: {
  monthlyProfit: number;
  calculatorContext: TrialCalculatorContext | null;
  attribution: TrialAttribution | null;
}) {
  const { money } = useCurrency();
  const gbp = money;
  const isUsJourney = isUsTrialAttribution(attribution);
  const monthlyLitres = calculatorContext ? (Math.round(calculatorContext.litresPerMonth * 10) / 10).toLocaleString("en-GB", { maximumFractionDigits: 1 }) : null;
  const calculatorNote = calculatorContext
    ? `Calculator estimate: ${Math.round(monthlyProfit).toLocaleString("en-GB")} GBP base-reference monthly profit, approximately ${calculatorContext.tansPerWeek} tans per week, ${monthlyLitres} litres required per month at ${calculatorContext.tansPerLitre} tans per litre.`
    : "";
  const result = useActionData() as ApplicationActionResult | undefined;
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!result) return;
    track(result.ok ? "generate_lead" : "form_error", {
      form_id: "trade_trial",
      value: result.ok ? 1 : 0,
      error_message: result.ok ? undefined : result.message,
      campaign_id: attribution?.campaignId,
      sequence_step: attribution?.emailStep,
      market: result.ok ? result.market : attribution?.market,
    });
    if (result.ok) successHeadingRef.current?.focus();
  }, [attribution, result]);

  if (result?.ok) {
    const completedUsJourney = result.market === "US-West-Coast";
    const outsideCurrentArea = result.serviceability === "outside_current_area";
    return <section className="partner-close trial-complete" id="trial"><div className="wrap">
      <div className="trial-success" role="status" aria-live="polite">
        <div className="ts-intro">
          <span className="ts-check" aria-hidden="true">✓</span>
          <p className="eyebrow">{completedUsJourney ? "U.S. trial review received" : "Trial request received"}</p>
          <h2 ref={successHeadingRef} tabIndex={-1}>Thank you.<br /><em>Your request is in.</em></h2>
          <p>{completedUsJourney
            ? outsideCurrentArea
              ? `${result.serviceState || "Your location"} is outside our current California, Oregon and Washington trial area. We have recorded your interest, but we will not dispatch anything automatically.`
              : "We will review current U.S. availability for your business and confirm the fulfilment route before anything is shipped."
            : "We have your details. There is nothing else you need to do right now."}</p>
        </div>
        <div className="ts-next">
          <h3>What happens next</h3>
          {completedUsJourney ? <ol>
            <li><div><b>We review your professional request</b><span>We check the business details, location and current U.S. trial availability.</span></div></li>
            <li><div><b>We confirm the available route</b><span>{outsideCurrentArea ? "Matthew will contact you only if an alternative route is available for your state." : "If the trial is available, we will explain shipping and timing before fulfilment."}</span></div></li>
            <li><div><b>You decide after the review</b><span>No card and no commitment. No U.S. shipping or availability promise is made until we confirm it directly.</span></div></li>
          </ol> : <ol>
            <li><div><b>We post your complimentary 100 ml trial bottle</b><span>No card details needed — just your salon delivery information.</span></div></li>
            <li><div><b>Test it in your booth</b><span>Tan a team member or regular client, then judge the colour and 6–8 hour fade for yourself.</span></div></li>
            <li><div><b>Order only if you love it</b><span>Order online at trade rates, or keep Jimmy&rsquo;s shade guide with our compliments.</span></div></li>
          </ol>}
        </div>
        <p className="ts-reassurance"><b>No card. No commitment.</b> {completedUsJourney ? "Your originating U.S. outreach sequence has been stopped." : "We will be in touch this week."}</p>
      </div>
    </div></section>;
  }

  return <section className="partner-close" id="trial"><div className="wrap"><p className="eyebrow">{isUsJourney ? "U.S. professional partnership · availability review" : "The partnership · complimentary trial"}</p><h2>{isUsJourney ? <>Request a professional <em>trial review.</em></> : <>Try it on a real client. <em>Free.</em></>}</h2><p className="sub">{isUsJourney ? "Eligible California, Oregon and Washington salons can request a complimentary 100 ml professional sample. We confirm current availability, shipping and timing for each business before anything is dispatched." : "Party season books out before it starts. Salons that trial now are stocked, trained and ready before the rush — and the trial costs you nothing but one appointment."}</p><div className="close-grid"><div>
    <div className="trialbox"><span className="tb-tag">{isUsJourney ? "U.S. professional availability review" : "Become a Jimmy Coco Certified Salon."}</span><ul><li><b>Malibu Professional Spray (10% DHA)</b>{" "}<span>Enough to tan a real client — judge the colour and fade on skin, not on a screen.</span></li><li><b>Jimmy's shade guide</b>{" "}<span>The method behind 20+ years of red-carpet colour. {isUsJourney ? "Included when a U.S. trial is confirmed." : "Yours to keep, either way."}</span></li></ul><p>{isUsJourney ? "Availability reviewed individually · no card · no commitment" : "Posted this week · no cost · no commitment"}</p></div>
    <div className="perks"><div><i>◆</i><b>Trade pricing</b><span>on the professional litre and the retail range</span></div><div><i>✦</i><b>Team training</b><span>Jimmy's shade method — confident from day one</span><a className="perk-link" href="#certification">Become a Jimmy Coco Certified Salon →</a></div><div><i>❋</i><b>Launch assets</b><span>marketing, ready to use on day one</span></div></div>
    <p className="close-note">{isUsJourney ? "No lock-in and no pressure. Requests outside California, Oregon and Washington are recorded for review but are not dispatched automatically." : "No lock-in and no pressure at any step. Trial it in your own booth, then choose whether to order online at trade rates. Either way, the shade guide is yours to keep."}</p>{isUsJourney ? <div className="trial-order"><b>Already have a U.S. availability question?</b><a href="mailto:partnerships@email.jimmycoco.pro">Email Partnerships →</a></div> : <div className="trial-order"><b>Ready to place an order?</b><Link to={PRODUCT_PATH}>Order Malibu 1L — {gbp(LITRE_PRICE_GBP)} →</Link></div>}
  </div><Form method="post" className="trialform" data-form-id="trade_trial" replace><div className="tf-head"><h3>{isUsJourney ? "Request a U.S. trial review" : "Get the trial box"}</h3><span className="tf-badge">{isUsJourney ? "Review" : "Free"}</span></div><p>{isUsJourney ? "Thirty seconds now. We will confirm whether we can currently serve your location." : "Thirty seconds now. Posted this week."}</p><p className="tf-echo">{isUsJourney ? "Tell us where your business operates. California, Oregon and Washington requests enter the current West Coast availability review; other states are recorded without a dispatch promise." : <>Based on your calculation of <b>{gbp(monthlyProfit)}/month</b>, {calculatorContext ? <>at <b>~{calculatorContext.tansPerWeek} tans/week</b>, plan for <b>about {monthlyLitres} litres</b> in your first month — use the complimentary 100ml trial to test the colour in your own booth first.</> : "the trial is how you check the colour deserves it."}</>}</p><input type="hidden" name="notes" value={calculatorNote} />{attribution ? <><input type="hidden" name={TRIAL_ATTRIBUTION_FIELDS.campaign} value={attribution.campaignId} /><input type="hidden" name={TRIAL_ATTRIBUTION_FIELDS.email} value={attribution.emailStep} /><input type="hidden" name={TRIAL_ATTRIBUTION_FIELDS.market} value={attribution.market} /></> : null}<input type="text" name="salon" autoComplete="organization" aria-label="Salon or business name" placeholder="Salon or business name" required /><input type="text" name="name" autoComplete="name" aria-label="Your name" placeholder="Your name" required /><input type="email" name="email" autoComplete="email" aria-label="Email address" placeholder="Email address" required /><input type="tel" name="phone" autoComplete="tel" aria-label="Phone number (optional)" placeholder="Phone (optional)" />{isUsJourney ? <input type="text" name="service_state" autoComplete="address-level1" aria-label="U.S. state (two-letter abbreviation)" placeholder="U.S. state — e.g. CA" minLength={2} maxLength={2} pattern="[A-Za-z]{2}" required /> : null}<select name="type" aria-label="Business type" defaultValue="Salon"><option>Salon</option><option>Spa</option><option>Mobile professional</option><option>Multi-site group</option></select><input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
    {result && !result.ok ? <p className="form-error" role="alert">{result.message}</p> : null}
    <button className="btn btn-bronze btn-trial-submit" type="submit" disabled={submitting}>{submitting ? "Sending…" : isUsJourney ? "REQUEST U.S. PROFESSIONAL TRIAL REVIEW →" : "CLAIM FREE 100ML TRIAL BOX (POSTED FREE) →"}</button>{isUsJourney ? <ol className="tf-steps"><li><b>1. We review</b> your business and current service-area availability.</li><li><b>2. We confirm</b> shipping and timing before anything is sent.</li><li><b>3. You choose:</b> proceed only if the available route works for you.</li></ol> : <ol className="tf-steps"><li><b>1. We post</b> your complimentary 100 ml trial bottle — no card details needed.</li><li><b>2. You test</b> it on a team member or regular client and judge the 6–8 hour fade.</li><li><b>3. You choose:</b> order online at trade rates if you love it, or keep the shade guide with our compliments.</li></ol>}<small>{isUsJourney ? "Complimentary where currently available • No card required • U.S. fulfilment confirmed individually." : "100% Free • No card required • Dispatched to UK salons within 48 business hours."}</small></Form></div></div></section>;
}
