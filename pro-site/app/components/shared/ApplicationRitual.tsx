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
      {image ? <img className="rit-img" src={image} alt={alt} loading="lazy" decoding="async" /> : null}
      <div className="rit-copy"><h3>{title}</h3>{image ? <i aria-hidden="true">{icons[index]}</i> : null}<p>{copy}</p><span className="rit-dash" /></div>
      {image ? null : <div className="rit-clock"><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.2" /><path d="M12 6.6V12l4 2.4" /><path d="M12 2.8v1.4M12 19.8v1.4M21.2 12h-1.4M4.2 12H2.8" /></svg><b>6&ndash;8 <small>hours</small></b><span>Classic development</span></div>}
    </div>)}</div>
    <div className="rit-metrics"><div><b>35<small>ml</small></b><span>Ideal<br />application</span></div><div><b>6–8<small>hours</small></b><span>Classic<br />development</span></div><div><b>3–4<small>hours</small></b><span>Express<br />development</span></div></div>
  </section>;
}
