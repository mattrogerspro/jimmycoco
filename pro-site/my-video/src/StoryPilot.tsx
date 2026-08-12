import {loadFont} from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

await Promise.all([
  loadFont({
    family: "Walbaum",
    url: staticFile("fonts/walbaum.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Montserrat",
    url: staticFile("fonts/montserrat-var.woff2"),
    weight: "100 900",
  }),
]);

const COLORS = {
  bronze: "#98603a",
  cream: "#f5eee6",
  ink: "#211914",
  rose: "#c7aaa0",
  white: "#fffaf5",
};

const sans: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  textTransform: "uppercase",
};

const fade = (
  frame: number,
  start: number,
  end: number,
  outStart?: number,
  outEnd?: number,
) => {
  const fadeIn = interpolate(frame, [start, end], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (outStart === undefined || outEnd === undefined) return fadeIn;

  const fadeOut = interpolate(frame, [outStart, outEnd], [1, 0], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return fadeIn * fadeOut;
};

const BrandMark: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <div
    style={{
      ...sans,
      color: dark ? COLORS.ink : COLORS.white,
      fontSize: 27,
      fontWeight: 650,
      letterSpacing: "0.23em",
      lineHeight: 1.3,
      textAlign: "center",
    }}
  >
    Sunless
    <div style={{fontSize: 13, fontWeight: 500, letterSpacing: "0.28em"}}>
      By Jimmy Coco®
    </div>
  </div>
);

const Rule: React.FC<{color?: string}> = ({color = "rgba(255,255,255,.72)"}) => (
  <div style={{height: 1, width: "100%", background: color}} />
);

export const StoryPilot: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const jimmyOpacity = fade(frame, 0, 18, 154, 184);
  const jimmyScale = interpolate(frame, [0, 184], [1.09, 1.015], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jimmyShift = interpolate(frame, [0, 184], [0, -28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heidiOpacity = fade(frame, 150, 184, 282, 312);
  const heidiScale = interpolate(frame, [150, 312], [1.07, 1.01], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hookOpacity = fade(frame, 10, 28, 92, 116);
  const quoteOpacity = fade(frame, 74, 98, 146, 170);
  const proofOpacity = fade(frame, 174, 194, 276, 300);
  const endOpacity = fade(frame, 294, 324);
  const endRise = interpolate(frame, [294, 330], [44, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.rose, overflow: "hidden"}}>
      <AbsoluteFill style={{opacity: jimmyOpacity}}>
        <Img
          src={staticFile("assets/jimmy-coco-story-background-1080.webp")}
          style={{
            position: "absolute",
            inset: "-3% -5%",
            width: "110%",
            height: "106%",
            objectFit: "cover",
            transform: `translateY(${jimmyShift}px) scale(${jimmyScale})`,
          }}
        />
        <Img
          src={staticFile("assets/jimmy-coco-story-cutout-1080.webp")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "42% bottom",
            transform: `translateY(${jimmyShift * 0.32}px) scale(${jimmyScale})`,
            transformOrigin: "center bottom",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: heidiOpacity}}>
        <Img
          src={staticFile("assets/heidi-1650.webp")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            transform: `scale(${heidiScale})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(17,10,7,.48) 0%, rgba(17,10,7,.04) 34%, rgba(17,10,7,.08) 52%, rgba(17,10,7,.84) 100%)",
          opacity: Math.max(jimmyOpacity, heidiOpacity),
        }}
      />

      <div style={{position: "absolute", top: 112, left: 90, right: 150}}>
        <BrandMark />
      </div>

      <div
        style={{
          position: "absolute",
          top: 300,
          left: 90,
          right: 150,
          color: COLORS.white,
          opacity: hookOpacity,
          transform: `translateY(${(1 - hookOpacity) * 28}px)`,
        }}
      >
        <p style={{...sans, margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "0.18em"}}>
          Why leading salons choose
        </p>
        <h1
          style={{
            margin: "20px 0 0",
            maxWidth: 760,
            fontFamily: "Walbaum, serif",
            fontSize: 104,
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: 0.93,
          }}
        >
          Jimmy Coco.
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          bottom: 350,
          color: COLORS.white,
          opacity: quoteOpacity,
          transform: `translateY(${(1 - quoteOpacity) * 34}px)`,
        }}
      >
        <Rule />
        <p
          style={{
            margin: "30px 0 0",
            maxWidth: 780,
            fontFamily: "Walbaum, serif",
            fontSize: 66,
            fontWeight: 400,
            lineHeight: 1.02,
          }}
        >
          “I wanted to bring my <i>Hollywood Glow</i> to the world’s best salons.”
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          bottom: 350,
          color: COLORS.white,
          opacity: proofOpacity,
          transform: `translateY(${(1 - proofOpacity) * 38}px)`,
        }}
      >
        <Rule />
        <p
          style={{
            ...sans,
            margin: "32px 0 8px",
            fontSize: 31,
            fontWeight: 550,
            letterSpacing: "0.13em",
            lineHeight: 1.35,
          }}
        >
          Tanning Kim and Heidi
        </p>
        <p
          style={{
            ...sans,
            margin: 0,
            fontSize: 70,
            fontWeight: 650,
            letterSpacing: "0.018em",
            lineHeight: 1.04,
          }}
        >
          For over<br />15 years
        </p>
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          backgroundColor: COLORS.cream,
          color: COLORS.ink,
          justifyContent: "center",
          opacity: endOpacity,
          padding: "120px 150px 250px 90px",
          textAlign: "center",
        }}
      >
        <div style={{opacity: endOpacity, transform: `translateY(${endRise}px)`}}>
          <BrandMark dark />
          <div style={{height: 76}} />
          <p style={{...sans, margin: 0, color: COLORS.bronze, fontSize: 23, fontWeight: 650, letterSpacing: "0.18em"}}>
            Hollywood’s professional tan system
          </p>
          <h2
            style={{
              margin: "30px auto 40px",
              maxWidth: 750,
              fontFamily: "Walbaum, serif",
              fontSize: 94,
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: 0.96,
            }}
          >
            The glow clients ask for. <i>Now in your booth.</i>
          </h2>
          <div style={{margin: "0 auto", maxWidth: 620}}>
            <Rule color="rgba(33,25,20,.32)" />
          </div>
          <p style={{...sans, margin: "34px 0 0", fontSize: 25, fontWeight: 600, letterSpacing: "0.14em"}}>
            Request your complimentary salon trial
          </p>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 96,
          left: 90,
          width: 840,
          height: 3,
          backgroundColor: "rgba(255,255,255,.28)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: frame >= 294 ? COLORS.bronze : COLORS.white,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
