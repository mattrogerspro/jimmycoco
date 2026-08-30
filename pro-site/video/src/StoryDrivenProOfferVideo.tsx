import { Audio } from "@remotion/media";
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
import { z } from "zod";
import { brand, sans, serif } from "./brand";
import { getCampaign, type Campaign } from "./content/catalog";
import { getStoryboard, type Storyboard } from "./content/storyboards";
import { getPlatformSpec, platforms, type PlatformSpec } from "./platforms";
import { TimedCaptions } from "./TimedCaptions";

export const storyDrivenProOfferVideoSchema = z.object({
  campaignSlug: z.string(),
  platform: z.enum(platforms),
  audioMode: z.enum(["off", "mastered"]),
});

export type StoryDrivenProOfferVideoProps = z.infer<
  typeof storyDrivenProOfferVideoSchema
>;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const sceneFrames = {
  hook: 135,
  problem: 135,
  proof: 165,
  bridge: 150,
  cta: 165,
} as const;

const treatmentAccent: Record<Storyboard["visualTreatment"], string> = {
  maths: "#d88a55",
  trial: "#e7a57c",
  authority: "#d7a580",
  training: "#d3a86f",
  retail: "#db8254",
  social: "#e09a83",
  results: "#dca17c",
  "launch-pack": "#d78a56",
  "mobile-maths": "#6d9cac",
  "mobile-trial": "#8db1bd",
  "mobile-social": "#7ea8b7",
  "mobile-premium": "#d2a875",
};

const textSize = (text: string, large: number, small: number) => {
  if (text.length > 86) return small;
  if (text.length > 58) return Math.round((large + small) / 2);
  return large;
};

const SceneFade: React.FC<{
  readonly children: React.ReactNode;
  readonly durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 7, durationInFrames],
    [0, 1, 1],
    clamp,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const PersistentLogo: React.FC<{ readonly platform: PlatformSpec }> = ({
  platform,
}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 10], [0, 1], clamp);

  return (
    <div
      style={{
        backgroundColor: "rgba(255,250,245,.96)",
        border: "1px solid rgba(169,97,53,.34)",
        borderRadius: 14,
        boxShadow: "0 14px 40px rgba(24,16,12,.18)",
        left: platform.safeLeft,
        opacity: reveal,
        padding: "12px 18px 10px",
        position: "absolute",
        top: Math.max(66, platform.safeTop - 94),
        zIndex: 70,
      }}
    >
      <Img
        src={staticFile("assets/logo-top.png")}
        style={{
          display: "block",
          height: 76,
          objectFit: "contain",
          width: 250,
        }}
      />
    </div>
  );
};

const Eyebrow: React.FC<{
  readonly children: React.ReactNode;
  readonly color?: string;
}> = ({ children, color = brand.bronze }) => (
  <div
    style={{
      color,
      fontFamily: sans,
      fontSize: 23,
      fontWeight: 820,
      letterSpacing: ".15em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const BackgroundImage: React.FC<{
  readonly asset: string;
  readonly darken?: number;
  readonly objectPosition?: string;
}> = ({ asset, darken = 0.5, objectPosition = "center" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isTransparentProBottle = asset === "assets/pro/bottle.png";
  const scale = interpolate(frame, [0, durationInFrames], [1.09, 1.015], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      <Img
        src={staticFile(asset)}
        style={{
          boxSizing: "border-box",
          height: "100%",
          objectFit: isTransparentProBottle ? "contain" : "cover",
          objectPosition,
          padding: isTransparentProBottle ? "220px 180px 430px" : 0,
          transform: `scale(${scale})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,rgba(17,13,11,${darken * 0.2}) 0%,rgba(17,13,11,${darken * 0.58}) 48%,rgba(17,13,11,${Math.min(0.96, darken + 0.28)}) 100%)`,
        }}
      />
    </>
  );
};

const HookScene: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
  readonly platform: PlatformSpec;
}> = ({ campaign, storyboard, platform }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: 20,
    config: { damping: 200 },
  });
  const accent = treatmentAccent[storyboard.visualTreatment];

  return (
    <SceneFade durationInFrames={sceneFrames.hook}>
      <AbsoluteFill style={{ backgroundColor: brand.ink, overflow: "hidden" }}>
        <BackgroundImage
          asset={campaign.heroImage}
          darken={0.62}
          objectPosition={
            storyboard.visualTreatment === "authority" ? "58% center" : "center"
          }
        />
        <div
          style={{
            bottom: platform.safeBottom + 205,
            left: platform.safeLeft,
            position: "absolute",
            right: platform.safeRight,
          }}
        >
          <Eyebrow color={accent}>{campaign.eyebrow}</Eyebrow>
          <div
            style={{
              color: brand.white,
              fontFamily: serif,
              fontSize: textSize(campaign.hook, 112, 80),
              lineHeight: 0.9,
              marginTop: 26,
              maxWidth: 850,
              transform: `translateY(${(1 - reveal) * 68}px)`,
            }}
          >
            {campaign.hook}
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const VideoProgress: React.FC<{ readonly color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    clamp,
  );

  return (
    <div
      style={{
        backgroundColor: "rgba(255,250,245,.28)",
        bottom: 0,
        height: 16,
        left: 0,
        overflow: "hidden",
        position: "absolute",
        right: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: color,
          height: "100%",
          transform: `scaleX(${progress})`,
          transformOrigin: "left center",
          width: "100%",
        }}
      />
    </div>
  );
};

const TransitionFlash: React.FC<{ readonly color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const boundaries = [
    sceneFrames.hook,
    sceneFrames.hook + sceneFrames.problem,
    sceneFrames.hook + sceneFrames.problem + sceneFrames.proof,
    sceneFrames.hook +
      sceneFrames.problem +
      sceneFrames.proof +
      sceneFrames.bridge,
  ];
  const nearestBoundary = Math.min(
    ...boundaries.map((boundary) => Math.abs(frame - boundary)),
  );
  const opacity = interpolate(nearestBoundary, [0, 4], [0.7, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg,${brand.white} 0%,${color} 100%)`,
        opacity,
        pointerEvents: "none",
        zIndex: 58,
      }}
    />
  );
};

const BrainInterrupts: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
}> = ({ campaign, storyboard }) => {
  const frame = useCurrentFrame();
  const accent = treatmentAccent[storyboard.visualTreatment];
  const interrupts = [
    { from: sceneFrames.hook - 12, text: campaign.proof[0] },
    {
      from: sceneFrames.hook + sceneFrames.problem - 12,
      text: campaign.proof[1] ?? storyboard.metric.value,
    },
    {
      from: sceneFrames.hook + sceneFrames.problem + sceneFrames.proof - 12,
      text: storyboard.metric.value,
    },
    {
      from:
        sceneFrames.hook +
        sceneFrames.problem +
        sceneFrames.proof +
        sceneFrames.bridge -
        12,
      text:
        campaign.destination === "trial" ? "TEST IT FIRST" : "BUILD THE ORDER",
    },
  ];
  const activeIndex = interrupts.findIndex(
    ({ from }) => frame >= from && frame < from + 12,
  );

  if (activeIndex < 0) return null;

  const active = interrupts[activeIndex];
  const localFrame = frame - active.from;
  const opacity = interpolate(localFrame, [0, 2, 9, 12], [0, 1, 1, 0], clamp);
  const scale = interpolate(localFrame, [0, 3, 12], [1.22, 1, 0.96], clamp);
  const rotation = interpolate(
    localFrame,
    [0, 3],
    [activeIndex % 2 ? -3 : 3, 0],
    clamp,
  );
  const dark = activeIndex % 2 === 0;

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: dark ? brand.navy : accent,
        borderBottom: `12px solid ${dark ? accent : brand.navy}`,
        borderTop: `12px solid ${dark ? accent : brand.navy}`,
        color: dark ? brand.white : brand.ink,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        left: -48,
        minHeight: 430,
        opacity,
        padding: "54px 86px",
        position: "absolute",
        right: -48,
        textAlign: "center",
        top: 560,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        zIndex: 60,
      }}
    >
      <div
        style={{
          color: dark ? accent : brand.white,
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 850,
          letterSpacing: ".16em",
          textTransform: "uppercase",
        }}
      >
        {activeIndex === 2 ? "The number that matters" : "Look again"}
      </div>
      <div
        style={{
          fontFamily: active.text.length < 20 ? serif : sans,
          fontSize: textSize(active.text, 108, 62),
          fontWeight: active.text.length < 20 ? 500 : 850,
          lineHeight: 0.92,
          marginTop: 24,
          maxWidth: 870,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};

const EditorialVisual: React.FC<{ readonly storyboard: Storyboard }> = ({
  storyboard,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    config: { damping: 14, mass: 1.35, stiffness: 180 },
  });
  const isTransparentBottle =
    storyboard.secondaryImage === "assets/pro/bottle.png";
  const isProduct = [
    "maths",
    "training",
    "retail",
    "launch-pack",
    "mobile-maths",
    "mobile-premium",
  ].includes(storyboard.visualTreatment);

  if (isTransparentBottle) {
    return (
      <div
        style={{
          bottom: 38,
          pointerEvents: "none",
          position: "absolute",
          right: 34,
          top: 38,
          width: 332,
        }}
      >
        <div
          style={{
            backgroundColor: treatmentAccent[storyboard.visualTreatment],
            borderRadius: "50%",
            bottom: 30,
            filter: "blur(18px)",
            height: 34,
            left: 52,
            opacity: 0.28,
            position: "absolute",
            right: 52,
            transform: `scaleX(${0.65 + reveal * 0.35})`,
          }}
        />
        <Img
          src={staticFile(storyboard.secondaryImage)}
          style={{
            filter: "drop-shadow(0 32px 28px rgba(26,18,13,.28))",
            height: "100%",
            objectFit: "contain",
            padding: "26px 8px 34px",
            transform: `translateY(${(1 - reveal) * -150}px) scale(${0.88 + reveal * 0.12})`,
            width: "100%",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: isProduct
          ? "linear-gradient(165deg,#174d61 0%,#0b2f3c 100%)"
          : "linear-gradient(165deg,#d8c0af 0%,#a76b4d 100%)",
        border: "1px solid rgba(255,250,245,.34)",
        borderRadius: 34,
        bottom: 56,
        boxShadow: "0 30px 70px rgba(36,27,22,.28)",
        overflow: "hidden",
        position: "absolute",
        right: 50,
        top: 56,
        transform: `translateX(${(1 - reveal) * 90}px) rotate(${(1 - reveal) * 1.8 - 1.2}deg)`,
        width: 350,
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,250,245,.26)",
          borderRadius: 24,
          bottom: 18,
          left: 18,
          position: "absolute",
          right: 18,
          top: 18,
        }}
      />
      <Img
        src={staticFile(storyboard.secondaryImage)}
        style={{
          boxSizing: "border-box",
          height: "100%",
          objectFit: isProduct ? "contain" : "cover",
          padding: isProduct ? "64px 44px" : 0,
          position: "relative",
          width: "100%",
        }}
      />
      <div
        style={{
          backgroundColor: treatmentAccent[storyboard.visualTreatment],
          bottom: 0,
          height: 12,
          left: 0,
          position: "absolute",
          right: 0,
        }}
      />
    </div>
  );
};

const ProblemScene: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
  readonly platform: PlatformSpec;
}> = ({ campaign, storyboard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: 20,
    config: { damping: 200 },
  });
  const accent = treatmentAccent[storyboard.visualTreatment];

  return (
    <SceneFade durationInFrames={sceneFrames.problem}>
      <AbsoluteFill style={{ backgroundColor: brand.ink, overflow: "hidden" }}>
        <BackgroundImage asset={campaign.heroImage} darken={0.84} />
        <div
          style={{
            backdropFilter: "blur(18px)",
            backgroundColor: "rgba(255,250,245,.95)",
            border: "1px solid rgba(255,250,245,.66)",
            borderRadius: 44,
            boxShadow: "0 38px 90px rgba(18,10,6,.38)",
            height: 900,
            left: 58,
            overflow: "hidden",
            position: "absolute",
            right: 58,
            top: 320,
          }}
        >
          <div
            style={{
              backgroundColor: accent,
              bottom: 0,
              left: 0,
              position: "absolute",
              top: 0,
              width: 14,
            }}
          />
          <div
            style={{
              color: "rgba(169,97,53,.11)",
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 1,
              position: "absolute",
              right: 390,
              top: -34,
            }}
          >
            01
          </div>
          <div style={{ left: 62, position: "absolute", top: 70, width: 472 }}>
            <Eyebrow>
              {campaign.audience === "salon"
                ? "In the treatment room"
                : "Built for mobile"}
            </Eyebrow>
            <div
              style={{
                color: brand.ink,
                fontFamily: serif,
                fontSize: textSize(storyboard.problemTitle, 62, 50),
                lineHeight: 0.94,
                marginTop: 40,
                transform: `translateY(${(1 - reveal) * 46}px)`,
              }}
            >
              {storyboard.problemTitle}
            </div>
            <div
              style={{
                borderTop: `3px solid ${accent}`,
                color: "#5d514a",
                fontFamily: sans,
                fontSize: 27,
                fontWeight: 560,
                lineHeight: 1.4,
                marginTop: 36,
                opacity: reveal,
                paddingTop: 30,
              }}
            >
              {storyboard.problemBody}
            </div>
          </div>
          <EditorialVisual storyboard={storyboard} />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const ProofScene: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
  readonly platform: PlatformSpec;
}> = ({ campaign, storyboard, platform }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = treatmentAccent[storyboard.visualTreatment];

  return (
    <SceneFade durationInFrames={sceneFrames.proof}>
      <AbsoluteFill style={{ backgroundColor: brand.navy, overflow: "hidden" }}>
        <BackgroundImage asset={campaign.heroImage} darken={0.78} />
        <div
          style={{
            color: "rgba(255,250,245,.065)",
            fontFamily: sans,
            fontSize: 246,
            fontWeight: 900,
            letterSpacing: "-.08em",
            position: "absolute",
            right: -24,
            top: 176,
          }}
        >
          02
        </div>
        <div
          style={{
            left: platform.safeLeft,
            position: "absolute",
            right: platform.safeRight,
            top: 300,
          }}
        >
          <Eyebrow color={accent}>The proof to check</Eyebrow>
          <div
            style={{
              color: brand.white,
              fontFamily: serif,
              fontSize: textSize(storyboard.bridgeTitle, 76, 62),
              lineHeight: 0.96,
              marginTop: 30,
              maxWidth: 760,
            }}
          >
            {storyboard.bridgeTitle}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gap: 20,
            left: platform.safeLeft,
            position: "absolute",
            right: platform.safeRight,
            top: 640,
          }}
        >
          {campaign.proof.map((proof, index) => {
            const isActive = index === storyboard.proofHighlightIndex;
            const reveal = spring({
              frame: frame - index * Math.round(0.18 * fps),
              fps,
              durationInFrames: 11,
              config: { damping: 200 },
            });
            return (
              <div
                key={proof}
                style={{
                  alignItems: "center",
                  backgroundColor: isActive ? accent : "rgba(255,250,245,.94)",
                  border: "1px solid rgba(255,250,245,.42)",
                  borderLeft: `12px solid ${isActive ? brand.white : accent}`,
                  borderRadius: 18,
                  boxShadow: "0 22px 56px rgba(7,23,30,.28)",
                  color: brand.ink,
                  display: "grid",
                  fontFamily: sans,
                  fontSize: 34,
                  fontWeight: 760,
                  gap: 24,
                  gridTemplateColumns: "76px 1fr",
                  minHeight: 126,
                  opacity: reveal,
                  padding: "24px 30px",
                  transform: `translateX(${(1 - reveal) * 100}px) rotate(${index === 1 ? -0.7 : index === 2 ? 0.55 : 0}deg)`,
                }}
              >
                <span style={{ fontSize: 23, letterSpacing: ".08em" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{proof}</span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            bottom: platform.safeBottom - 42,
            color: "rgba(255,250,245,.68)",
            fontFamily: sans,
            fontSize: 20,
            left: platform.safeLeft,
            lineHeight: 1.35,
            position: "absolute",
            right: platform.safeRight,
          }}
        >
          {campaign.disclosure}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const MetricVisual: React.FC<{ readonly storyboard: Storyboard }> = ({
  storyboard,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: 24,
    config: { damping: 18 },
  });
  const accent = treatmentAccent[storyboard.visualTreatment];
  const isSocial = ["social", "mobile-social"].includes(
    storyboard.visualTreatment,
  );
  const isTransparentBottle =
    storyboard.secondaryImage === "assets/pro/bottle.png";
  const isProduct = [
    "maths",
    "training",
    "retail",
    "launch-pack",
    "mobile-maths",
    "mobile-premium",
  ].includes(storyboard.visualTreatment);

  if (isSocial) {
    return (
      <div
        style={{
          backgroundColor: brand.ink,
          border: `8px solid ${brand.ink}`,
          borderRadius: 52,
          boxShadow: "0 34px 90px rgba(36,27,22,.3)",
          bottom: 52,
          height: 790,
          overflow: "hidden",
          position: "absolute",
          right: 44,
          top: 52,
          transform: `rotate(${(1 - reveal) * 5 - 2}deg) translateY(${(1 - reveal) * 80}px)`,
          width: 382,
        }}
      >
        <Img
          src={staticFile(storyboard.secondaryImage)}
          style={{ height: "100%", objectFit: "cover", width: "100%" }}
        />
      </div>
    );
  }

  if (isTransparentBottle) {
    return (
      <div
        style={{
          bottom: 34,
          pointerEvents: "none",
          position: "absolute",
          right: 26,
          top: 34,
          transform: `translateX(${(1 - reveal) * 88}px)`,
          width: 404,
        }}
      >
        <div
          style={{
            backgroundColor: accent,
            borderRadius: "50%",
            filter: "blur(18px)",
            height: 32,
            left: 72,
            opacity: 0.24,
            position: "absolute",
            right: 72,
            top: 512,
            transform: `scaleX(${0.62 + reveal * 0.38})`,
          }}
        />
        <Img
          src={staticFile(storyboard.secondaryImage)}
          style={{
            filter: "drop-shadow(0 30px 26px rgba(36,27,22,.28))",
            height: 560,
            objectFit: "contain",
            position: "absolute",
            top: 0,
            transform: `translateY(${(1 - reveal) * -160}px) scale(${0.84 + reveal * 0.16})`,
            width: "100%",
          }}
        />
        <div
          style={{
            backgroundColor: brand.navy,
            border: `1px solid ${accent}66`,
            borderRadius: 26,
            bottom: 0,
            boxShadow: "0 24px 58px rgba(36,27,22,.22)",
            color: brand.white,
            left: 8,
            padding: "28px 20px 24px",
            position: "absolute",
            right: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: serif, fontSize: 92, lineHeight: 0.9 }}>
            {storyboard.metric.value}
          </div>
          <div
            style={{
              color: accent,
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 820,
              letterSpacing: ".1em",
              lineHeight: 1.25,
              marginTop: 20,
              textTransform: "uppercase",
            }}
          >
            {storyboard.metric.label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(165deg,#174d61 0%,#082c39 100%)",
        border: `1px solid ${accent}88`,
        borderRadius: 32,
        bottom: 52,
        boxShadow: `0 0 0 10px ${accent}22, 0 34px 82px rgba(36,27,22,.3)`,
        color: brand.white,
        overflow: "hidden",
        position: "absolute",
        right: 44,
        textAlign: "center",
        top: 52,
        transform: `translateX(${(1 - reveal) * 72}px) rotate(-1.2deg)`,
        width: 382,
      }}
    >
      <Img
        src={staticFile(storyboard.secondaryImage)}
        style={{
          boxSizing: "border-box",
          height: "62%",
          objectFit: isProduct ? "contain" : "cover",
          opacity: isProduct ? 0.72 : 0.48,
          padding: isProduct ? "34px 44px 10px" : 0,
          width: "100%",
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(180deg,rgba(8,44,57,0) 0%,rgba(8,44,57,.98) 28%)",
          bottom: 0,
          left: 0,
          padding: "104px 28px 48px",
          position: "absolute",
          right: 0,
        }}
      >
        <div style={{ fontFamily: serif, fontSize: 100, lineHeight: 0.9 }}>
          {storyboard.metric.value}
        </div>
        <div
          style={{
            color: accent,
            fontFamily: sans,
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: ".1em",
            lineHeight: 1.25,
            marginTop: 24,
            textTransform: "uppercase",
          }}
        >
          {storyboard.metric.label}
        </div>
      </div>
    </div>
  );
};

const BridgeScene: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
  readonly platform: PlatformSpec;
}> = ({ campaign, storyboard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: 20,
    config: { damping: 200 },
  });

  return (
    <SceneFade durationInFrames={sceneFrames.bridge}>
      <AbsoluteFill style={{ backgroundColor: brand.ink, overflow: "hidden" }}>
        <BackgroundImage asset={campaign.heroImage} darken={0.84} />
        <div
          style={{
            backgroundColor: "rgba(255,250,245,.96)",
            border: "1px solid rgba(255,250,245,.66)",
            borderRadius: 44,
            boxShadow: "0 38px 90px rgba(18,10,6,.38)",
            height: 900,
            left: 58,
            overflow: "hidden",
            position: "absolute",
            right: 58,
            top: 320,
          }}
        >
          <div
            style={{
              color: "rgba(169,97,53,.1)",
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 1,
              position: "absolute",
              right: 390,
              top: -34,
            }}
          >
            03
          </div>
          <div style={{ left: 62, position: "absolute", top: 70, width: 470 }}>
            <Eyebrow>The commercial bridge</Eyebrow>
            <div
              style={{
                color: brand.ink,
                fontFamily: serif,
                fontSize: textSize(storyboard.bridgeTitle, 76, 60),
                lineHeight: 0.96,
                marginTop: 36,
                transform: `translateY(${(1 - reveal) * 45}px)`,
              }}
            >
              {storyboard.bridgeTitle}
            </div>
            <div
              style={{
                borderTop: `3px solid ${treatmentAccent[storyboard.visualTreatment]}`,
                color: "#5d514a",
                fontFamily: sans,
                fontSize: 27,
                fontWeight: 560,
                lineHeight: 1.4,
                marginTop: 36,
                opacity: reveal,
                paddingTop: 30,
              }}
            >
              {storyboard.bridgeBody}
            </div>
          </div>
          <MetricVisual storyboard={storyboard} />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const CtaScene: React.FC<{
  readonly campaign: Campaign;
  readonly storyboard: Storyboard;
  readonly platform: PlatformSpec;
}> = ({ campaign, storyboard, platform }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: 22,
    config: { damping: 200 },
  });
  const button = spring({
    frame: frame - Math.round(0.65 * fps),
    fps,
    config: { damping: 18, stiffness: 190 },
  });

  return (
    <SceneFade durationInFrames={sceneFrames.cta}>
      <AbsoluteFill style={{ backgroundColor: brand.navy, overflow: "hidden" }}>
        <BackgroundImage asset={campaign.heroImage} darken={0.82} />
        <div
          style={{
            color: brand.white,
            fontFamily: serif,
            fontSize: textSize(storyboard.ctaLead, 98, 76),
            left: platform.safeLeft,
            lineHeight: 0.92,
            position: "absolute",
            right: platform.safeRight,
            top: 500,
            transform: `translateY(${(1 - reveal) * 55}px)`,
          }}
        >
          {storyboard.ctaLead}
        </div>
        <div
          style={{
            backgroundColor: brand.bronze,
            bottom: platform.safeBottom,
            boxShadow: "0 24px 56px rgba(18,9,5,.3)",
            color: brand.white,
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 850,
            left: platform.safeLeft,
            letterSpacing: ".065em",
            padding: "34px 32px",
            position: "absolute",
            right: platform.safeRight,
            textAlign: "center",
            textTransform: "uppercase",
            transform: `scale(${0.92 + button * 0.08})`,
          }}
        >
          {campaign.cta} →
        </div>
        <div
          style={{
            bottom: platform.safeBottom - 82,
            color: brand.sand,
            fontFamily: sans,
            fontSize: 27,
            fontWeight: 720,
            left: platform.safeLeft,
            position: "absolute",
          }}
        >
          jimmycoco.pro
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const Soundtrack: React.FC<{
  readonly storyboard: Storyboard;
  readonly enabled: boolean;
}> = ({ storyboard, enabled }) => {
  const { durationInFrames, fps } = useVideoConfig();
  if (!enabled) return null;

  return (
    <>
      {storyboard.musicAudio ? (
        <Audio
          loop
          src={staticFile(storyboard.musicAudio)}
          volume={(frame) =>
            interpolate(
              frame,
              [
                0,
                Math.round(0.5 * fps),
                durationInFrames - fps,
                durationInFrames,
              ],
              [0, storyboard.musicVolume, storyboard.musicVolume, 0],
              clamp,
            )
          }
        />
      ) : null}
      {storyboard.voiceoverAudio ? (
        <Audio src={staticFile(storyboard.voiceoverAudio)} volume={1} />
      ) : null}
    </>
  );
};

export const StoryDrivenProOfferVideo: React.FC<
  StoryDrivenProOfferVideoProps
> = ({ campaignSlug, platform: platformName, audioMode }) => {
  const campaign = getCampaign(campaignSlug);
  const storyboard = getStoryboard(campaignSlug);
  const platform = getPlatformSpec(platformName);
  const { fps } = useVideoConfig();
  const problemStart = sceneFrames.hook;
  const proofStart = problemStart + sceneFrames.problem;
  const bridgeStart = proofStart + sceneFrames.proof;
  const ctaStart = bridgeStart + sceneFrames.bridge;

  return (
    <AbsoluteFill style={{ backgroundColor: brand.ink }}>
      <Sequence durationInFrames={sceneFrames.hook} premountFor={fps}>
        <HookScene
          campaign={campaign}
          storyboard={storyboard}
          platform={platform}
        />
      </Sequence>
      <Sequence
        from={problemStart}
        durationInFrames={sceneFrames.problem}
        premountFor={fps}
      >
        <ProblemScene
          campaign={campaign}
          storyboard={storyboard}
          platform={platform}
        />
      </Sequence>
      <Sequence
        from={proofStart}
        durationInFrames={sceneFrames.proof}
        premountFor={fps}
      >
        <ProofScene
          campaign={campaign}
          storyboard={storyboard}
          platform={platform}
        />
      </Sequence>
      <Sequence
        from={bridgeStart}
        durationInFrames={sceneFrames.bridge}
        premountFor={fps}
      >
        <BridgeScene
          campaign={campaign}
          storyboard={storyboard}
          platform={platform}
        />
      </Sequence>
      <Sequence
        from={ctaStart}
        durationInFrames={sceneFrames.cta}
        premountFor={fps}
      >
        <CtaScene
          campaign={campaign}
          storyboard={storyboard}
          platform={platform}
        />
      </Sequence>
      <TimedCaptions captions={storyboard.captions} platform={platform} />
      <TransitionFlash color={treatmentAccent[storyboard.visualTreatment]} />
      <BrainInterrupts campaign={campaign} storyboard={storyboard} />
      <Soundtrack storyboard={storyboard} enabled={audioMode === "mastered"} />
      <PersistentLogo platform={platform} />
      <VideoProgress color={treatmentAccent[storyboard.visualTreatment]} />
    </AbsoluteFill>
  );
};
