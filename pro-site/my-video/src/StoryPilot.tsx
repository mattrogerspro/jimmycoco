import {loadFont} from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
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
  red: "#e84736",
  rose: "#c7aaa0",
  white: "#fffaf5",
};

const sans: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  textTransform: "uppercase",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const appear = (frame: number, start: number, end: number, outStart: number, outEnd: number) => {
  const inValue = interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outValue = interpolate(frame, [outStart, outEnd], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return inValue * outValue;
};

const cut = (frame: number, start: number, end: number) => (frame >= start && frame < end ? 1 : 0);

const BrandMark: React.FC<{dark?: boolean; scale?: number}> = ({dark = false, scale = 1}) => (
  <div
    style={{
      ...sans,
      color: dark ? COLORS.ink : COLORS.white,
      fontSize: 25 * scale,
      fontWeight: 650,
      letterSpacing: "0.22em",
      lineHeight: 1.25,
      textAlign: "center",
    }}
  >
    Sunless
    <div style={{fontSize: 12 * scale, fontWeight: 500, letterSpacing: "0.27em"}}>
      By Jimmy Coco®
    </div>
  </div>
);

const FullImage: React.FC<{
  src: string;
  opacity: number;
  scale: number;
  x?: number;
  y?: number;
  objectPosition?: string;
}> = ({src, opacity, scale, x = 0, y = 0, objectPosition = "center center"}) => (
  <AbsoluteFill style={{opacity}}>
    <Img
      src={staticFile(src)}
      style={{
        height: "100%",
        objectFit: "cover",
        objectPosition,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        width: "100%",
      }}
    />
  </AbsoluteFill>
);

const JimmyLayer: React.FC<{opacity: number; scale: number; x: number; y: number}> = ({
  opacity,
  scale,
  x,
  y,
}) => (
  <AbsoluteFill style={{opacity}}>
    <Img
      src={staticFile("assets/jimmy-coco-story-background-1080.webp")}
      style={{
        height: "106%",
        inset: "-3% -5%",
        objectFit: "cover",
        position: "absolute",
        transform: `translate(${x * 0.4}px, ${y}px) scale(${scale})`,
        width: "110%",
      }}
    />
    <Img
      src={staticFile("assets/jimmy-coco-story-cutout-1080.webp")}
      style={{
        height: "100%",
        inset: 0,
        objectFit: "cover",
        objectPosition: "42% bottom",
        position: "absolute",
        transform: `translate(${x}px, ${y * 0.35}px) scale(${scale})`,
        transformOrigin: "center bottom",
        width: "100%",
      }}
    />
  </AbsoluteFill>
);

const PunchText: React.FC<{
  children: React.ReactNode;
  opacity: number;
  size?: number;
  top?: number;
  bottom?: number;
  color?: string;
  align?: React.CSSProperties["textAlign"];
  maxWidth?: number;
  lift?: number;
}> = ({children, opacity, size = 86, top, bottom, color = COLORS.white, align = "left", maxWidth = 840, lift = 32}) => (
  <div
    style={{
      color,
      left: 84,
      maxWidth,
      opacity,
      position: "absolute",
      right: 150,
      textAlign: align,
      top,
      bottom,
      transform: `translateY(${(1 - opacity) * lift}px) scale(${0.96 + opacity * 0.04})`,
      transformOrigin: align === "center" ? "center center" : "left center",
    }}
  >
    <div
      style={{
        ...sans,
        fontSize: size,
        fontWeight: 820,
        letterSpacing: 0,
        lineHeight: 0.92,
      }}
    >
      {children}
    </div>
  </div>
);

const Tag: React.FC<{children: React.ReactNode; opacity: number; top: number; tone?: "light" | "danger" | "dark"}> = ({
  children,
  opacity,
  top,
  tone = "light",
}) => {
  const background =
    tone === "danger" ? COLORS.red : tone === "dark" ? "rgba(33,25,20,.92)" : "rgba(255,250,245,.92)";
  const color = tone === "light" ? COLORS.ink : COLORS.white;

  return (
    <div
      style={{
        ...sans,
        background,
        borderRadius: 4,
        color,
        fontSize: 24,
        fontWeight: 760,
        left: 84,
        letterSpacing: "0.06em",
        opacity,
        padding: "18px 22px",
        position: "absolute",
        top,
        transform: `translateX(${(1 - opacity) * -46}px) rotate(${(1 - opacity) * -2}deg)`,
      }}
    >
      {children}
    </div>
  );
};

const SplitProof: React.FC<{opacity: number; frame: number}> = ({opacity, frame}) => {
  const flicker = frame % 8 < 2 ? 1 : 0;

  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          background: "rgba(33,25,20,.9)",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "50%",
        }}
      />
      <div
        style={{
          background: COLORS.cream,
          height: "100%",
          position: "absolute",
          right: 0,
          top: 0,
          width: "50%",
        }}
      />
      <Img
        src={staticFile("assets/jimmy-coco-story-cutout-1080.webp")}
        style={{
          bottom: 0,
          height: "84%",
          left: -260,
          objectFit: "contain",
          position: "absolute",
          transform: `scale(${1 + flicker * 0.018})`,
          transformOrigin: "left bottom",
        }}
      />
      <Img
        src={staticFile("assets/heidi-1650.webp")}
        style={{
          height: "100%",
          objectFit: "cover",
          objectPosition: "52% top",
          position: "absolute",
          right: -170,
          top: 0,
          width: "68%",
        }}
      />
      <div
        style={{
          ...sans,
          color: COLORS.white,
          fontSize: 26,
          fontWeight: 760,
          left: 70,
          letterSpacing: "0.08em",
          lineHeight: 1.1,
          position: "absolute",
          top: 210,
          width: 390,
        }}
      >
        The artist
      </div>
      <div
        style={{
          ...sans,
          color: COLORS.ink,
          fontSize: 26,
          fontWeight: 760,
          letterSpacing: "0.08em",
          lineHeight: 1.1,
          position: "absolute",
          right: 110,
          textAlign: "right",
          top: 210,
          width: 390,
        }}
      >
        The proof
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC<{progress: number; dark?: boolean}> = ({progress, dark = false}) => (
  <div
    style={{
      backgroundColor: dark ? "rgba(33,25,20,.2)" : "rgba(255,255,255,.28)",
      bottom: 84,
      height: 5,
      left: 84,
      position: "absolute",
      width: 846,
    }}
  >
    <div
      style={{
        backgroundColor: dark ? COLORS.bronze : COLORS.white,
        height: "100%",
        width: `${progress * 100}%`,
      }}
    />
  </div>
);

export const StoryPilot: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const shake = frame % 6 < 3 ? -8 : 8;
  const impact = spring({
    frame,
    fps,
    config: {damping: 12, stiffness: 260},
    durationInFrames: 18,
  });
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);

  const jimmyBase = cut(frame, 0, 115) + appear(frame, 118, 124, 168, 178);
  const jimmyScale = interpolate(frame, [0, 115], [1.32, 1.08], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  const jimmyX = interpolate(frame, [0, 115], [90, -24], clamp) + (frame < 20 ? shake : 0);
  const heidiHero = appear(frame, 84, 90, 154, 166);
  const heidiPunch = interpolate(frame, [84, 166], [1.28, 1.05], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  const splitProof = appear(frame, 170, 176, 214, 222);
  const endOpacity = appear(frame, 222, 232, 300, 300);
  const redFlash = cut(frame, 0, 5) + cut(frame, 80, 84) + cut(frame, 166, 170);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink, overflow: "hidden"}}>
      <JimmyLayer opacity={Math.min(jimmyBase, 1)} scale={jimmyScale} x={jimmyX} y={0} />
      <FullImage
        src="assets/heidi-1650.webp"
        opacity={heidiHero}
        scale={heidiPunch}
        x={interpolate(frame, [84, 166], [-80, 60], clamp)}
        objectPosition="center top"
      />
      <SplitProof opacity={splitProof} frame={frame} />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(17,10,7,.68) 0%, rgba(17,10,7,.04) 35%, rgba(17,10,7,.92) 100%)",
          opacity: Math.max(Math.min(jimmyBase, 1), heidiHero),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.red,
          mixBlendMode: "screen",
          opacity: redFlash * 0.45,
        }}
      />

      <div
        style={{
          left: 84,
          opacity: appear(frame, 8, 15, 72, 80),
          position: "absolute",
          right: 150,
          top: 94,
        }}
      >
        <BrandMark />
      </div>

      <Tag opacity={appear(frame, 0, 5, 31, 37)} top={185} tone="danger">
        Stop scrolling
      </Tag>
      <PunchText opacity={appear(frame, 3, 10, 37, 43)} size={104} top={300}>
        Your salon<br />is selling<br />
        <span style={{fontFamily: "Walbaum, serif", fontSize: 132, fontWeight: 400}}>
          confidence.
        </span>
      </PunchText>
      <PunchText opacity={appear(frame, 43, 49, 77, 84)} size={86} bottom={360}>
        Not just<br />a spray tan.
      </PunchText>

      <Tag opacity={appear(frame, 82, 88, 112, 118)} top={176} tone="light">
        Instant authority cue
      </Tag>
      <PunchText opacity={appear(frame, 88, 94, 123, 132)} size={90} bottom={350}>
        Kim. Heidi.<br />
        <span style={{color: COLORS.cream}}>That glow.</span>
      </PunchText>
      <Tag opacity={appear(frame, 126, 132, 158, 166)} top={180} tone="dark">
        15+ years behind it
      </Tag>
      <PunchText opacity={appear(frame, 132, 138, 160, 170)} size={76} bottom={345}>
        Your clients<br />already want<br />the result.
      </PunchText>

      <PunchText opacity={appear(frame, 174, 180, 196, 204)} size={82} top={390} color={COLORS.white}>
        Borrow the<br />Hollywood proof.
      </PunchText>
      <PunchText opacity={appear(frame, 196, 202, 218, 224)} size={72} bottom={340} color={COLORS.cream}>
        Put it in<br />your booth.
      </PunchText>

      <AbsoluteFill
        style={{
          alignItems: "center",
          backgroundColor: COLORS.cream,
          color: COLORS.ink,
          justifyContent: "center",
          opacity: endOpacity,
          padding: "120px 150px 250px 84px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: endOpacity,
            transform: `translateY(${(1 - endOpacity) * 42}px) scale(${0.96 + endOpacity * 0.04})`,
          }}
        >
          <BrandMark dark scale={0.95} />
          <div style={{height: 64}} />
          <p
            style={{
              ...sans,
              color: COLORS.bronze,
              fontSize: 25,
              fontWeight: 780,
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Complimentary salon trial
          </p>
          <h2
            style={{
              fontFamily: "Walbaum, serif",
              fontSize: 112,
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: 0.9,
              margin: "28px auto 42px",
              maxWidth: 820,
            }}
          >
            Let them ask for you by name.
          </h2>
          <div
            style={{
              ...sans,
              backgroundColor: COLORS.ink,
              borderRadius: 5,
              color: COLORS.white,
              display: "inline-block",
              fontSize: 28,
              fontWeight: 760,
              letterSpacing: "0.08em",
              padding: "24px 34px",
              transform: `scale(${1 + impact * 0.025})`,
            }}
          >
            Request your trial
          </div>
        </div>
      </AbsoluteFill>

      <Progress progress={progress} dark={frame >= 222} />
    </AbsoluteFill>
  );
};
