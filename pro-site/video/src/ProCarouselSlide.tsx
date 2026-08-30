import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";
import {z} from "zod";
import {brand, sans, serif} from "./brand";
import {getCampaign} from "./content/catalog";
import {
  buildCarouselSlides,
  carouselSlideCounts,
  type CarouselPlatform,
  type CarouselSlide,
} from "./content/carousel-posts";

export const proCarouselSlideSchema = z.object({
  campaignSlug: z.string(),
  platform: z.enum(["instagram", "linkedin"]),
  slideIndex: z.number().int().nonnegative(),
});

export type ProCarouselSlideProps = z.infer<typeof proCarouselSlideSchema>;

const accentByAudience = {
  salon: "#de8e59",
  mobile: "#80adbc",
} as const;

const titleSize = (text: string, hero = false) => {
  if (hero) {
    if (text.length > 62) return 68;
    if (text.length > 42) return 78;
    return 92;
  }
  if (text.length > 70) return 58;
  if (text.length > 48) return 66;
  return 76;
};

const Logo: React.FC = () => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(255,250,245,.96)",
      border: "1px solid rgba(169,97,53,.28)",
      borderRadius: 14,
      display: "flex",
      height: 84,
      justifyContent: "center",
      padding: "8px 16px",
      width: 260,
    }}
  >
    <Img
      src={staticFile("assets/logo-top.png")}
      style={{height: 62, objectFit: "contain", width: 224}}
    />
  </div>
);

const Eyebrow: React.FC<{readonly children: React.ReactNode; readonly color?: string}> = ({
  children,
  color = brand.bronze,
}) => (
  <div
    style={{
      color,
      fontFamily: sans,
      fontSize: 23,
      fontWeight: 820,
      letterSpacing: ".16em",
      lineHeight: 1.15,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Footer: React.FC<{
  readonly current: number;
  readonly platform: CarouselPlatform;
  readonly total: number;
}> = ({current, platform, total}) => (
  <div
    style={{
      alignItems: "center",
      bottom: 38,
      color: "rgba(255,250,245,.72)",
      display: "flex",
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 700,
      justifyContent: "space-between",
      left: 72,
      letterSpacing: ".08em",
      position: "absolute",
      right: 72,
      textTransform: "uppercase",
      zIndex: 30,
    }}
  >
    <span>{platform === "instagram" ? "Swipe →" : "Jimmy Coco Pro · document"}</span>
    <span>{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
  </div>
);

const SafeImage: React.FC<{
  readonly asset: string;
  readonly contain?: boolean;
  readonly objectPosition?: string;
  readonly style?: React.CSSProperties;
}> = ({asset, contain = false, objectPosition = "center", style}) => (
  <Img
    src={staticFile(asset)}
    style={{
      height: "100%",
      objectFit: contain || asset === "assets/pro/bottle.png" ? "contain" : "cover",
      objectPosition,
      width: "100%",
      ...style,
    }}
  />
);

const Cover: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{backgroundColor: brand.ink, overflow: "hidden"}}>
    {slide.image ? <SafeImage asset={slide.image} objectPosition="center" /> : null}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(90deg,rgba(20,14,11,.93) 0%,rgba(20,14,11,.78) 48%,rgba(20,14,11,.12) 100%), linear-gradient(0deg,rgba(20,14,11,.72),transparent 55%)",
      }}
    />
    <div style={{left: 72, position: "absolute", top: 66}}><Logo /></div>
    <div
      style={{
        bottom: 132,
        left: 72,
        maxWidth: 760,
        position: "absolute",
        right: 72,
      }}
    >
      <Eyebrow color={accent}>{slide.eyebrow}</Eyebrow>
      <div
        style={{
          color: brand.white,
          fontFamily: serif,
          fontSize: titleSize(slide.title, true),
          lineHeight: 0.91,
          marginTop: 25,
          maxWidth: 790,
        }}
      >
        {slide.title}
      </div>
      {slide.body ? (
        <div
          style={{
            borderLeft: `6px solid ${accent}`,
            color: "rgba(255,250,245,.88)",
            fontFamily: sans,
            fontSize: 27,
            fontWeight: 650,
            lineHeight: 1.28,
            marginTop: 32,
            maxWidth: 690,
            paddingLeft: 22,
          }}
        >
          {slide.body}
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);

const Insight: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{backgroundColor: brand.cream, color: brand.ink, overflow: "hidden"}}>
    <div style={{left: 72, position: "absolute", top: 60, zIndex: 10}}><Logo /></div>
    <div
      style={{
        bottom: 0,
        left: 0,
        position: "absolute",
        top: 0,
        width: "41%",
      }}
    >
      {slide.image ? (
        <SafeImage
          asset={slide.image}
          contain={slide.image === "assets/pro/bottle.png"}
          objectPosition="center"
          style={{padding: slide.image === "assets/pro/bottle.png" ? "290px 70px 170px" : 0}}
        />
      ) : null}
      <AbsoluteFill style={{background: "linear-gradient(90deg,rgba(18,60,77,.12),transparent)"}} />
    </div>
    <div
      style={{
        backgroundColor: brand.white,
        borderLeft: `10px solid ${accent}`,
        bottom: 112,
        boxShadow: "0 28px 90px rgba(39,25,18,.14)",
        left: "35%",
        padding: "64px 68px 74px",
        position: "absolute",
        right: 54,
        top: 185,
      }}
    >
      <div style={{color: "rgba(169,97,53,.1)", fontFamily: serif, fontSize: 220, lineHeight: 0.7, position: "absolute", right: 36, top: 32}}>“</div>
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title), lineHeight: 0.96, marginTop: 34, position: "relative"}}>
        {slide.title}
      </div>
      {slide.body ? (
        <div style={{color: "#655b55", fontFamily: sans, fontSize: 29, fontWeight: 560, lineHeight: 1.4, marginTop: 40}}>
          {slide.body}
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);

const Proof: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{backgroundColor: brand.navy, color: brand.white, padding: "58px 72px 92px"}}>
    <Logo />
    <div style={{marginTop: 66}}>
      <Eyebrow color={accent}>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title), lineHeight: 0.94, marginTop: 22, maxWidth: 850}}>{slide.title}</div>
    </div>
    <div style={{display: "flex", flexDirection: "column", gap: 18, marginTop: 62}}>
      {slide.bullets?.map((bullet, index) => (
        <div
          key={bullet}
          style={{
            alignItems: "center",
            backgroundColor: index === 0 ? accent : index === 1 ? brand.white : "rgba(255,250,245,.12)",
            border: index === 2 ? "1px solid rgba(255,250,245,.28)" : "none",
            borderRadius: 18,
            color: index < 2 ? brand.ink : brand.white,
            display: "grid",
            fontFamily: sans,
            fontSize: 31,
            fontWeight: 800,
            gridTemplateColumns: "82px 1fr",
            minHeight: 118,
            padding: "20px 32px",
          }}
        >
          <span style={{fontSize: 21, letterSpacing: ".08em"}}>0{index + 1}</span>
          <span>{bullet}</span>
        </div>
      ))}
    </div>
    {slide.disclosure ? (
      <div style={{bottom: 92, color: "rgba(255,250,245,.68)", fontFamily: sans, fontSize: 17, left: 72, lineHeight: 1.35, maxWidth: 860, position: "absolute"}}>{slide.disclosure}</div>
    ) : null}
  </AbsoluteFill>
);

const Metric: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{background: `linear-gradient(145deg,${brand.cream} 0%,#fffaf5 68%,${accent}33 100%)`, color: brand.ink, overflow: "hidden", padding: "58px 72px 94px"}}>
    <Logo />
    <div style={{marginTop: 54, maxWidth: 690}}>
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title), lineHeight: 0.95, marginTop: 24}}>{slide.title}</div>
      {slide.body ? <div style={{color: "#615750", fontFamily: sans, fontSize: 27, fontWeight: 580, lineHeight: 1.36, marginTop: 28}}>{slide.body}</div> : null}
    </div>
    <div
      style={{
        alignItems: "center",
        backgroundColor: brand.navy,
        border: `15px solid ${accent}33`,
        borderRadius: 999,
        bottom: 176,
        boxShadow: "0 36px 80px rgba(18,60,77,.22)",
        color: brand.white,
        display: "flex",
        flexDirection: "column",
        height: 470,
        justifyContent: "center",
        position: "absolute",
        right: 66,
        textAlign: "center",
        width: 470,
      }}
    >
      <div style={{fontFamily: serif, fontSize: 112, lineHeight: 0.9}}>{slide.metricValue}</div>
      <div style={{color: accent, fontFamily: sans, fontSize: 20, fontWeight: 850, letterSpacing: ".1em", lineHeight: 1.2, marginTop: 25, maxWidth: 290, textTransform: "uppercase"}}>{slide.metricLabel}</div>
    </div>
    {slide.image ? (
      <SafeImage
        asset="assets/pro/bottle.png"
        contain
        style={{bottom: 76, height: 510, left: 34, objectFit: "contain", position: "absolute", width: 350}}
      />
    ) : null}
  </AbsoluteFill>
);

const Decision: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{backgroundColor: brand.cream, color: brand.ink, overflow: "hidden"}}>
    <div style={{height: "48%", left: 0, position: "absolute", right: 0, top: 0}}>
      {slide.image ? <SafeImage asset={slide.image} objectPosition="center 42%" /> : null}
      <AbsoluteFill style={{background: "linear-gradient(0deg,#f4ede4 0%,transparent 55%)"}} />
    </div>
    <div style={{left: 72, position: "absolute", top: 58}}><Logo /></div>
    <div style={{backgroundColor: brand.white, borderTop: `10px solid ${accent}`, bottom: 105, boxShadow: "0 28px 80px rgba(35,23,17,.14)", left: 64, padding: "54px 62px 64px", position: "absolute", right: 64}}>
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title), lineHeight: 0.96, marginTop: 24}}>{slide.title}</div>
      {slide.body ? <div style={{color: "#625950", fontFamily: sans, fontSize: 28, fontWeight: 580, lineHeight: 1.4, marginTop: 30}}>{slide.body}</div> : null}
    </div>
  </AbsoluteFill>
);

const Path: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{backgroundColor: brand.ink, color: brand.white, padding: "58px 72px 98px"}}>
    <Logo />
    <div style={{marginTop: 58}}>
      <Eyebrow color={accent}>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title), lineHeight: 0.94, marginTop: 23, maxWidth: 900}}>{slide.title}</div>
      {slide.body ? <div style={{color: "rgba(255,250,245,.78)", fontFamily: sans, fontSize: 28, fontWeight: 560, lineHeight: 1.38, marginTop: 27, maxWidth: 860}}>{slide.body}</div> : null}
    </div>
    <div style={{borderTop: "1px solid rgba(255,250,245,.2)", display: "grid", gap: 0, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 54}}>
      {slide.bullets?.map((bullet, index) => (
        <div key={bullet} style={{borderRight: index < 2 ? "1px solid rgba(255,250,245,.2)" : "none", minHeight: 260, padding: "34px 30px 28px 0"}}>
          <div style={{alignItems: "center", backgroundColor: index === 0 ? accent : brand.white, borderRadius: 999, color: brand.ink, display: "flex", fontFamily: sans, fontSize: 20, fontWeight: 850, height: 56, justifyContent: "center", width: 56}}>0{index + 1}</div>
          <div style={{fontFamily: sans, fontSize: 25, fontWeight: 750, lineHeight: 1.25, marginTop: 24, paddingRight: 22}}>{bullet}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

const Cta: React.FC<{readonly slide: CarouselSlide; readonly accent: string}> = ({
  slide,
  accent,
}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 68% 42%,${accent}55 0%,transparent 38%), ${brand.navy}`, color: brand.white, overflow: "hidden", padding: "58px 72px 100px"}}>
    <Logo />
    <SafeImage asset="assets/pro/bottle.png" contain style={{height: 770, objectFit: "contain", position: "absolute", right: -54, top: 245, width: 570}} />
    <div style={{left: 72, maxWidth: 610, position: "absolute", top: 270}}>
      <Eyebrow color={accent}>{slide.eyebrow}</Eyebrow>
      <div style={{fontFamily: serif, fontSize: titleSize(slide.title, true), lineHeight: 0.91, marginTop: 24}}>{slide.title}</div>
      {slide.body ? (
        <div style={{backgroundColor: accent, borderRadius: 8, color: brand.ink, display: "inline-block", fontFamily: sans, fontSize: 25, fontWeight: 850, letterSpacing: ".08em", marginTop: 48, padding: "24px 31px", textTransform: "uppercase"}}>{slide.body} →</div>
      ) : null}
      <div style={{fontFamily: sans, fontSize: 29, fontWeight: 800, marginTop: 32}}>jimmycoco.pro</div>
    </div>
    {slide.disclosure ? <div style={{bottom: 92, color: "rgba(255,250,245,.58)", fontFamily: sans, fontSize: 16, left: 72, lineHeight: 1.35, maxWidth: 850, position: "absolute"}}>{slide.disclosure}</div> : null}
  </AbsoluteFill>
);

export const ProCarouselSlide: React.FC<ProCarouselSlideProps> = ({
  campaignSlug,
  platform,
  slideIndex,
}) => {
  const campaign = getCampaign(campaignSlug);
  const slides = buildCarouselSlides(campaignSlug, platform);
  const slide = slides[slideIndex];
  if (!slide) {
    throw new Error(
      `Slide ${slideIndex + 1} does not exist for ${platform}/${campaignSlug}.`,
    );
  }
  const accent = accentByAudience[campaign.audience];

  const content = (() => {
    if (slide.kind === "cover") return <Cover slide={slide} accent={accent} />;
    if (slide.kind === "insight") return <Insight slide={slide} accent={accent} />;
    if (slide.kind === "proof") return <Proof slide={slide} accent={accent} />;
    if (slide.kind === "metric") return <Metric slide={slide} accent={accent} />;
    if (slide.kind === "decision") return <Decision slide={slide} accent={accent} />;
    if (slide.kind === "path") return <Path slide={slide} accent={accent} />;
    return <Cta slide={slide} accent={accent} />;
  })();

  return (
    <AbsoluteFill style={{backgroundColor: brand.cream}}>
      {content}
      <Footer
        current={slideIndex}
        platform={platform}
        total={carouselSlideCounts[platform]}
      />
    </AbsoluteFill>
  );
};
