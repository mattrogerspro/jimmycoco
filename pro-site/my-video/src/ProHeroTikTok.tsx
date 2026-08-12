import {loadFont} from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

await Promise.all([
  loadFont({family: "Walbaum", url: staticFile("fonts/walbaum.woff2"), weight: "400"}),
  loadFont({family: "Montserrat", url: staticFile("fonts/montserrat-var.woff2"), weight: "100 900"}),
]);

const C = {
  bronze: "#a96135",
  cream: "#f4ede4",
  ink: "#241b16",
  navy: "#123c4d",
  sand: "#ddc8b5",
  white: "#fffaf5",
};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const sans: React.CSSProperties = {fontFamily: "Montserrat, Arial, sans-serif"};
const serif: React.CSSProperties = {fontFamily: "Walbaum, Georgia, serif"};

const money = (value: number) => `£${Math.round(value).toLocaleString("en-GB")}`;

const calculateNetMonth = (pricePerTan: number, tansPerWeek: number, retailUnits: number) => {
  const solutionPerTan = 60 / 28;
  const consumablesPerTan = solutionPerTan + 0.75 + 0.35;
  const cardFeePerTan = pricePerTan * 0.015;
  const labourPerTan = 12.71 * (25 / 60) * 1.2;
  const tansPerMonth = tansPerWeek * (52 / 12);
  const overheadPerTan = 450 / tansPerMonth;
  const netPerTan = pricePerTan - consumablesPerTan - cardFeePerTan - labourPerTan - overheadPerTan;
  const retailProfitWeek = retailUnits * 18 * 0.5;
  return (netPerTan * tansPerWeek + retailProfitWeek) * (52 / 12);
};

const enter = (frame: number, fps: number, delay = 0, duration = 0.42) =>
  spring({frame: frame - delay * fps, fps, durationInFrames: duration * fps, config: {damping: 18, stiffness: 220}});

const SceneIn: React.FC<{children: React.ReactNode; frame: number; duration: number}> = ({children, frame, duration}) => {
  const opacity = interpolate(frame, [0, 5, duration - 5, duration], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const Brand: React.FC<{dark?: boolean; compact?: boolean}> = ({dark = false, compact = false}) => (
  <div style={{...sans, color: dark ? C.ink : C.white, textAlign: "center", textTransform: "uppercase"}}>
    <div style={{...serif, fontSize: compact ? 38 : 48, letterSpacing: ".04em", lineHeight: 0.9}}>Sunless</div>
    <div style={{fontSize: compact ? 14 : 17, fontWeight: 650, letterSpacing: ".19em", marginTop: 8}}>By Jimmy Coco</div>
    <div style={{fontSize: compact ? 9 : 11, fontWeight: 650, letterSpacing: ".24em", marginTop: 7}}>Professional</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const hit = enter(frame, fps, 0.05, 0.3);
  const flash = frame < 6 ? (frame % 2 ? C.white : C.bronze) : C.ink;
  const word = frame < 20 ? "PRETTY" : frame < 45 ? "PROFITABLE" : "BOTH.";
  const accent = word === "PRETTY" ? C.white : C.bronze;

  return <SceneIn frame={frame} duration={durationInFrames}>
    <AbsoluteFill style={{background: flash, color: C.white, overflow: "hidden"}}>
      <div style={{...sans, fontSize: 24, fontWeight: 750, left: 72, letterSpacing: ".17em", position: "absolute", top: 130, textTransform: "uppercase"}}>Stop scrolling, salon owners.</div>
      <div style={{left: 66, position: "absolute", right: 66, top: 330, transform: `scale(${0.78 + hit * 0.22}) rotate(${(1 - hit) * -3}deg)`}}>
        <div style={{...sans, fontSize: 108, fontWeight: 900, lineHeight: .82, textTransform: "uppercase"}}>Your tan<br/>should be</div>
        <div style={{...sans, color: accent, fontSize: word === "PROFITABLE" ? 114 : 166, fontWeight: 950, lineHeight: .9, marginTop: 34, textTransform: "uppercase"}}>{word}</div>
      </div>
      <div style={{background: C.bronze, height: 18, left: 0, position: "absolute", right: 0, top: 1010, transform: `translateX(${interpolate(frame, [0, 60], [-1080, 1080], clamp)}px) rotate(-4deg)`}} />
      <div style={{...sans, bottom: 150, color: C.sand, fontSize: 31, fontWeight: 650, left: 70, lineHeight: 1.25, position: "absolute", right: 70}}>Jimmy Coco PRO turns premium colour into salon maths you can actually see.</div>
    </AbsoluteFill>
  </SceneIn>;
};

const WebsiteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = enter(frame, fps, 0, 0.55);
  const bottle = enter(frame, fps, 0.55, 0.6);
  const imageScale = interpolate(frame, [0, durationInFrames], [1.14, 1.03], {...clamp, easing: Easing.out(Easing.cubic)});

  return <SceneIn frame={frame} duration={durationInFrames}>
    <AbsoluteFill style={{background: C.cream, overflow: "hidden"}}>
      <Img src={staticFile("assets/pro-hero.webp")} style={{height: "100%", objectFit: "cover", objectPosition: "59% center", opacity: .92, transform: `scale(${imageScale})`, width: "100%"}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg,rgba(18,60,77,.15) 0%,rgba(18,60,77,.2) 40%,rgba(18,60,77,.95) 100%)"}} />
      <div style={{left: 60, opacity: reveal, position: "absolute", top: 82, transform: `translateY(${(1 - reveal) * -30}px)`}}><Brand /></div>
      <div style={{bottom: 240, left: 65, position: "absolute", right: 65}}>
        <div style={{...sans, color: C.sand, fontSize: 22, fontWeight: 750, letterSpacing: ".15em", textTransform: "uppercase"}}>The professional website</div>
        <div style={{...serif, color: C.white, fontSize: 92, lineHeight: .92, marginTop: 22}}>The tan your<br/>clients ask for.</div>
        <div style={{...sans, color: C.white, fontSize: 31, fontWeight: 650, lineHeight: 1.25, marginTop: 28}}>Product. Training. Trade. Profit tools.</div>
      </div>
      <Img src={staticFile("assets/pro-bottle.webp")} style={{bottom: -110, height: 910, opacity: bottle, position: "absolute", right: -35, transform: `translateY(${(1 - bottle) * 230}px) rotate(${(1 - bottle) * 7}deg)`, transformOrigin: "center bottom"}} />
    </AbsoluteFill>
  </SceneIn>;
};

const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const bottle = enter(frame, fps, 0.1, 0.65);
  const stat1 = enter(frame, fps, 0.65, 0.38);
  const stat2 = enter(frame, fps, 1.05, 0.38);
  const stat3 = enter(frame, fps, 1.45, 0.38);

  return <SceneIn frame={frame} duration={durationInFrames}>
    <AbsoluteFill style={{background: C.cream, overflow: "hidden"}}>
      <div style={{...sans, color: C.bronze, fontSize: 22, fontWeight: 800, left: 66, letterSpacing: ".13em", position: "absolute", top: 100, textTransform: "uppercase"}}>Meet the Malibu professional litre</div>
      <div style={{...serif, color: C.ink, fontSize: 84, left: 66, lineHeight: .95, position: "absolute", right: 66, top: 165}}>One bottle.<br/>A business case.</div>
      <div style={{background: "linear-gradient(180deg,#eadfd3,#d9c6b2)", borderRadius: 42, bottom: 90, left: 58, position: "absolute", top: 420, width: 500}} />
      <Img src={staticFile("assets/pro-bottle.webp")} style={{bottom: 50, height: 1120, left: 105, opacity: bottle, position: "absolute", transform: `translateY(${(1 - bottle) * 280}px) scale(${.86 + bottle * .14})`, transformOrigin: "center bottom"}} />
      <div style={{display: "grid", gap: 24, position: "absolute", right: 52, top: 620, width: 420}}>
        {[
          ["£60", "professional litre", stat1],
          ["≈28", "full-body tans", stat2],
          ["£2.14", "solution per tan", stat3],
        ].map(([value, label, progress]) => <div key={String(value)} style={{background: C.navy, borderRadius: 18, color: C.white, opacity: Number(progress), padding: "30px 30px 27px", transform: `translateX(${(1 - Number(progress)) * 120}px)`}}>
          <div style={{...sans, color: C.sand, fontSize: 68, fontWeight: 900, lineHeight: 1}}>{value}</div>
          <div style={{...sans, fontSize: 19, fontWeight: 700, letterSpacing: ".08em", marginTop: 12, textTransform: "uppercase"}}>{label}</div>
        </div>)}
      </div>
      <div style={{...sans, bottom: 120, color: C.ink, fontSize: 25, fontWeight: 750, letterSpacing: ".08em", position: "absolute", right: 60, textTransform: "uppercase"}}>Maximum value<br/>from every drop.</div>
    </AbsoluteFill>
  </SceneIn>;
};

const Slider: React.FC<{label: string; value: string; progress: number; accent?: boolean}> = ({label, value, progress, accent = false}) => (
  <div style={{marginBottom: 32}}>
    <div style={{...sans, alignItems: "baseline", color: C.ink, display: "flex", fontSize: 20, fontWeight: 650, justifyContent: "space-between"}}>
      <span>{label}</span><strong style={{color: accent ? C.bronze : C.ink, fontSize: 27}}>{value}</strong>
    </div>
    <div style={{background: "#d8cdc3", borderRadius: 8, height: 12, marginTop: 14, position: "relative"}}>
      <div style={{background: accent ? C.bronze : C.navy, borderRadius: 8, height: "100%", width: `${progress * 100}%`}} />
      <div style={{background: C.white, border: `7px solid ${accent ? C.bronze : C.navy}`, borderRadius: "50%", boxShadow: "0 4px 16px rgba(36,27,22,.24)", height: 30, left: `calc(${progress * 100}% - 22px)`, position: "absolute", top: -16, width: 30}} />
    </div>
  </div>
);

const CalculatorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const phase = interpolate(frame, [0, 2.2 * fps, 4.5 * fps, 6.8 * fps, 9.1 * fps], [0, .24, .5, .75, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const price = interpolate(phase, [0, 1], [26, 38]);
  const tans = interpolate(phase, [0, 1], [10, 28]);
  const retail = interpolate(phase, [0, 1], [1, 8]);
  const profit = calculateNetMonth(price, tans, retail);
  const pulse = spring({frame: frame % Math.round(2.3 * fps), fps, durationInFrames: .42 * fps, config: {damping: 13, stiffness: 250}});
  const intro = enter(frame, fps, 0, 0.45);

  return <SceneIn frame={frame} duration={durationInFrames}>
    <AbsoluteFill style={{background: C.navy, overflow: "hidden"}}>
      <div style={{...sans, color: C.sand, fontSize: 21, fontWeight: 800, left: 58, letterSpacing: ".14em", position: "absolute", top: 72, textTransform: "uppercase"}}>Live salon profit calculator</div>
      <div style={{...serif, color: C.white, fontSize: 68, left: 58, lineHeight: .95, opacity: intro, position: "absolute", right: 58, top: 125}}>Change the inputs.<br/><span style={{color: C.sand}}>Watch profit move.</span></div>
      <div style={{background: C.cream, borderRadius: 30, boxShadow: "0 34px 70px rgba(0,0,0,.28)", left: 48, padding: "42px 38px 34px", position: "absolute", right: 48, top: 350}}>
        <Slider label="Your price per spray tan" value={money(price)} progress={(price - 15) / 45} accent />
        <Slider label="Spray tans per week" value={`${Math.round(tans)}`} progress={(tans - 1) / 59} />
        <Slider label="Retail add-ons per week" value={`${Math.round(retail)}`} progress={retail / 20} accent />
        <div style={{...sans, color: "#756a61", fontSize: 16, lineHeight: 1.4, marginTop: 8}}>Based on the PRO site model: £60 litre, 28 tans, labour, consumables, card fees and room costs included.</div>
      </div>
      <div style={{bottom: 165, left: 45, position: "absolute", right: 45, textAlign: "center", transform: `scale(${.97 + pulse * .03})`}}>
        <div style={{...sans, color: C.sand, fontSize: 22, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase"}}>Estimated profit per month</div>
        <div style={{...sans, color: C.white, fontSize: profit >= 3000 ? 148 : 160, fontWeight: 950, letterSpacing: "-.065em", lineHeight: 1, marginTop: 16, textShadow: "0 8px 34px rgba(0,0,0,.25)"}}>{money(profit)}</div>
        <div style={{...sans, color: C.white, fontSize: 23, fontWeight: 600, marginTop: 18}}>after labour and premises</div>
      </div>
      <div style={{background: C.bronze, bottom: 0, height: 18, left: 0, position: "absolute", width: `${phase * 100}%`}} />
    </AbsoluteFill>
  </SceneIn>;
};

const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const hit = enter(frame, fps, 0.05, 0.5);
  const button = enter(frame, fps, 1.1, 0.45);

  return <SceneIn frame={frame} duration={durationInFrames}>
    <AbsoluteFill style={{background: C.cream, color: C.ink, overflow: "hidden"}}>
      <Img src={staticFile("assets/signature-glow.webp")} style={{height: "100%", objectFit: "cover", opacity: .24, position: "absolute", right: -250, width: "78%"}} />
      <div style={{left: 70, position: "absolute", top: 100}}><Brand dark /></div>
      <div style={{left: 62, opacity: hit, position: "absolute", right: 62, top: 410, transform: `translateY(${(1 - hit) * 70}px)`}}>
        <div style={{...sans, color: C.bronze, fontSize: 24, fontWeight: 850, letterSpacing: ".13em", textTransform: "uppercase"}}>Your next revenue line</div>
        <div style={{...serif, fontSize: 100, lineHeight: .88, marginTop: 28}}>See the glow.<br/>Run the maths.<br/><span style={{color: C.bronze}}>Build the profit.</span></div>
      </div>
      <div style={{background: C.bronze, bottom: 260, color: C.white, left: 62, opacity: button, padding: "30px 42px", position: "absolute", transform: `translateY(${(1 - button) * 80}px)`}}>
        <div style={{...sans, fontSize: 26, fontWeight: 850, letterSpacing: ".07em", textTransform: "uppercase"}}>Explore Jimmy Coco PRO →</div>
      </div>
      <div style={{...sans, bottom: 155, color: C.ink, fontSize: 26, fontWeight: 700, left: 62, position: "absolute"}}>jimmycoco.pro</div>
    </AbsoluteFill>
  </SceneIn>;
};

export const ProHeroTikTok: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: C.ink}}>
    <Sequence durationInFrames={3 * fps} premountFor={fps}><HookScene /></Sequence>
    <Sequence from={3 * fps} durationInFrames={5 * fps} premountFor={fps}><WebsiteScene /></Sequence>
    <Sequence from={8 * fps} durationInFrames={6 * fps} premountFor={fps}><ProductScene /></Sequence>
    <Sequence from={14 * fps} durationInFrames={11 * fps} premountFor={fps}><CalculatorScene /></Sequence>
    <Sequence from={25 * fps} durationInFrames={5 * fps} premountFor={fps}><CloseScene /></Sequence>
  </AbsoluteFill>;
};
