const cards = [
  ["Apply", "/img/apply_backgroud.webp", "/img/apply_model.webp", "Therapist applying with the Jimmy Coco mitt", "One light application. Maximum value from every drop."],
  ["Develop", "/img/develope_backgroud.webp", "/img/develope_model.webp", "Colour developing naturally", "Colour develops naturally while your client continues their day."],
  ["Glow", "/img/glow_backgroud.webp", "/img/glow_model.webp", "The finished Jimmy Coco glow", "Need it sooner? Add a second light pass after five minutes."],
];

export function ApplicationRitual() {
  return <section className="ritual" id="ritual">
    <div className="wrap rit-head"><p className="eyebrow">Application ritual · Your team trained</p><h2 className="rit-h">Simple for<br /><em>every therapist.</em></h2></div>
    <div className="rit-grid">{cards.map(([title, background, image, alt, copy], index) => <div className="rit-panel" key={title} style={{ backgroundImage: `url('${background}')`, backgroundPosition: index === 2 ? "right top" : undefined }}>
      <img className="rit-img" src={image} alt={alt} loading="lazy" decoding="async" />
      <div className="rit-copy"><h3>{title}</h3><i>{index === 0 ? <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3.5 4.8 6.5 8.2 6.5 12a6.5 6.5 0 0 1-13 0C5.5 11.2 8.5 7.8 12 3z" /></svg> : index === 1 ? <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3.5 2" /></svg> : <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>}</i><p>{copy}</p><span className="rit-dash" /></div>
    </div>)}</div>
    <div className="rit-metrics"><div><b>35<small>ml</small></b><span>Ideal<br />application</span></div><div><b>6–8<small>hours</small></b><span>Classic<br />development</span></div><div><b>3–4<small>hours</small></b><span>Express<br />development</span></div></div>
  </section>;
}
