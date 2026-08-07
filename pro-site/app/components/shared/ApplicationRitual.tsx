type RitualCard = {
  title: string;
  background: string;
  image?: string;
  alt?: string;
  copy: string;
};

const cards: RitualCard[] = [
  {
    title: "Apply",
    background: "/img/apply_backgroud.webp",
    image: "/assets/site/apply-tan.webp",
    alt: "Even, streak-free full body application",
    copy: "One light application. Maximum value from every drop.",
  },
  {
    title: "Develop",
    background: "/img/develope_backgroud.webp",
    copy: "Colour develops naturally while your client continues their day.",
  },
  {
    title: "Glow",
    background: "/img/glow_backgroud.webp",
    image: "/assets/site/glow-tan.webp",
    alt: "The finished Jimmy Coco glow on skin",
    copy: "Need it sooner? Add a second light pass after five minutes.",
  },
];

const icons = [
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3.5 4.8 6.5 8.2 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.2 8.5 7.8 12 3z" /></svg>,
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3.5 2" /></svg>,
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>,
];

export function ApplicationRitual() {
  return <section className="ritual" id="ritual">
    <div className="wrap rit-head"><p className="eyebrow">Application ritual · Your team trained</p><h2 className="rit-h">Simple for<br /><em>every therapist.</em></h2></div>
    <div className="rit-grid">{cards.map(({ title, background, image, alt, copy }, index) => <div className={`rit-panel${image ? "" : " rit-panel-plain"}`} key={title} style={image ? { backgroundColor: "#BD9375" } : { backgroundImage: `url('${background}')` }}>
      {image ? <img className="rit-img" src={image} alt={alt} width="1000" height="1781" loading="lazy" decoding="async" /> : null}
      <div className="rit-copy"><h3>{title}</h3>{image ? <i aria-hidden="true">{icons[index]}</i> : null}<p>{copy}</p><span className="rit-dash" /></div>
      {image ? null : <div className="rit-clock"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="21" strokeWidth="1" />
        <circle cx="24" cy="24" r="18.4" strokeWidth="0.5" opacity="0.55" />
        <g strokeWidth="1.4" strokeLinecap="round">
          <path d="M24 6.2v3.4M24 38.4v3.4M41.8 24h-3.4M9.6 24H6.2" />
        </g>
        <g strokeWidth="0.9" strokeLinecap="round" opacity="0.65">
          <path d="M33 8.6l-1.1 1.9M16.1 37.5L15 39.4M39.4 33l-1.9-1.1M10.5 16.1L8.6 15M39.4 15l-1.9 1.1M10.5 31.9L8.6 33M33 39.4l-1.1-1.9M16.1 10.5L15 8.6" />
        </g>
        <path d="M24 13.4V24l7.4 4.3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="1.7" fill="currentColor" stroke="none" />
      </svg></div>}
    </div>)}</div>
    <div className="rit-metrics"><div><b>35<small>ml</small></b><span>Ideal<br />application</span></div><div><b>6–8<small>hours</small></b><span>Classic<br />development</span></div><div><b>3–4<small>hours</small></b><span>Express<br />development</span></div></div>
  </section>;
}
