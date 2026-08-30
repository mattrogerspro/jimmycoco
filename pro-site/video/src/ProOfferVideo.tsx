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
import {z} from "zod";
import {brand, sans, serif} from "./brand";
import {getCampaign} from "./content/catalog";
import {getPlatformSpec, platforms} from "./platforms";

export const proOfferVideoSchema = z.object({
  campaignSlug: z.string(),
  platform: z.enum(platforms),
});

export type ProOfferVideoProps = z.infer<typeof proOfferVideoSchema>;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SceneFade: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({children, durationInFrames}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 6, durationInFrames - 6, durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const Wordmark: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <div
    style={{
      color: dark ? brand.ink : brand.white,
      fontFamily: sans,
      textAlign: "center",
      textTransform: "uppercase",
    }}
  >
    <div style={{fontFamily: serif, fontSize: 50, letterSpacing: ".04em"}}>
      Sunless
    </div>
    <div style={{fontSize: 17, fontWeight: 700, letterSpacing: ".19em"}}>
      By Jimmy Coco
    </div>
    <div
      style={{fontSize: 11, fontWeight: 700, letterSpacing: ".24em", marginTop: 8}}
    >
      Professional
    </div>
  </div>
);

const HookScene: React.FC<ProOfferVideoProps> = ({campaignSlug, platform}) => {
  const campaign = getCampaign(campaignSlug);
  const spec = getPlatformSpec(platform);
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    durationInFrames: Math.round(0.55 * fps),
    config: {damping: 200},
  });
  const scale = interpolate(frame, [0, durationInFrames], [1.12, 1.02], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneFade durationInFrames={durationInFrames}>
      <AbsoluteFill style={{backgroundColor: brand.ink, overflow: "hidden"}}>
        <Img
          src={staticFile(campaign.heroImage)}
          style={{height: "100%", objectFit: "cover", transform: `scale(${scale})`, width: "100%"}}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg,rgba(20,14,11,.12) 0%,rgba(20,14,11,.32) 42%,rgba(20,14,11,.92) 100%)",
          }}
        />
        <div
          style={{
            left: spec.safeLeft,
            opacity: reveal,
            position: "absolute",
            top: spec.safeTop,
            transform: `translateY(${(1 - reveal) * -35}px)`,
          }}
        >
          <Wordmark />
        </div>
        <div
          style={{
            bottom: spec.safeBottom,
            left: spec.safeLeft,
            position: "absolute",
            right: spec.safeRight,
          }}
        >
          <div
            style={{
              color: brand.sand,
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            {campaign.eyebrow}
          </div>
          <div
            style={{
              color: brand.white,
              fontFamily: serif,
              fontSize: 108,
              lineHeight: 0.9,
              marginTop: 28,
              transform: `translateY(${(1 - reveal) * 70}px)`,
            }}
          >
            {campaign.hook}
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const ProofScene: React.FC<ProOfferVideoProps> = ({campaignSlug, platform}) => {
  const campaign = getCampaign(campaignSlug);
  const spec = getPlatformSpec(platform);
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  return (
    <SceneFade durationInFrames={durationInFrames}>
      <AbsoluteFill style={{backgroundColor: brand.cream, overflow: "hidden"}}>
        <div
          style={{
            color: brand.bronze,
            fontFamily: sans,
            fontSize: 23,
            fontWeight: 800,
            left: spec.safeLeft,
            letterSpacing: ".14em",
            position: "absolute",
            right: spec.safeRight,
            textTransform: "uppercase",
            top: spec.safeTop,
          }}
        >
          {campaign.audience === "salon" ? "For salons" : "For mobile professionals"}
        </div>
        <div
          style={{
            color: brand.ink,
            fontFamily: serif,
            fontSize: 78,
            left: spec.safeLeft,
            lineHeight: 0.98,
            position: "absolute",
            right: spec.safeRight,
            top: spec.safeTop + 80,
          }}
        >
          {campaign.summary}
        </div>
        <div
          style={{
            display: "grid",
            gap: 24,
            left: spec.safeLeft,
            position: "absolute",
            right: spec.safeRight,
            top: 690,
          }}
        >
          {campaign.proof.map((proof, index) => {
            const reveal = spring({
              frame: frame - index * Math.round(0.55 * fps),
              fps,
              durationInFrames: Math.round(0.45 * fps),
              config: {damping: 200},
            });
            return (
              <div
                key={proof}
                style={{
                  alignItems: "center",
                  backgroundColor: index === 0 ? brand.navy : brand.white,
                  border: `2px solid ${index === 0 ? brand.navy : brand.sand}`,
                  borderRadius: 24,
                  color: index === 0 ? brand.white : brand.ink,
                  display: "flex",
                  fontFamily: sans,
                  fontSize: 38,
                  fontWeight: 780,
                  gap: 28,
                  minHeight: 150,
                  opacity: reveal,
                  padding: "28px 34px",
                  transform: `translateX(${(1 - reveal) * 120}px)`,
                }}
              >
                <span style={{color: brand.bronze, fontSize: 29}}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{proof}</span>
              </div>
            );
          })}
        </div>
        {campaign.disclosure ? (
          <div
            style={{
              bottom: spec.safeBottom - 35,
              color: "#6f625a",
              fontFamily: sans,
              fontSize: 21,
              left: spec.safeLeft,
              lineHeight: 1.35,
              position: "absolute",
              right: spec.safeRight,
            }}
          >
            {campaign.disclosure}
          </div>
        ) : null}
      </AbsoluteFill>
    </SceneFade>
  );
};

const CtaScene: React.FC<ProOfferVideoProps> = ({campaignSlug, platform}) => {
  const campaign = getCampaign(campaignSlug);
  const spec = getPlatformSpec(platform);
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 200}});
  const button = spring({
    frame: frame - Math.round(0.7 * fps),
    fps,
    config: {damping: 20, stiffness: 200},
  });

  return (
    <SceneFade durationInFrames={durationInFrames}>
      <AbsoluteFill style={{backgroundColor: brand.navy, overflow: "hidden"}}>
        <Img
          src={staticFile(campaign.heroImage)}
          style={{height: "100%", objectFit: "cover", opacity: 0.17, width: "100%"}}
        />
        <AbsoluteFill style={{backgroundColor: "rgba(18,60,77,.72)"}} />
        <div
          style={{
            left: spec.safeLeft,
            opacity: reveal,
            position: "absolute",
            right: spec.safeRight,
            top: spec.safeTop,
          }}
        >
          <Wordmark />
        </div>
        <div
          style={{
            bottom: spec.safeBottom + 230,
            color: brand.white,
            fontFamily: serif,
            fontSize: 104,
            left: spec.safeLeft,
            lineHeight: 0.92,
            position: "absolute",
            right: spec.safeRight,
            transform: `translateY(${(1 - reveal) * 60}px)`,
          }}
        >
          {campaign.destination === "trial"
            ? "Test it on a real client."
            : "Build your professional offer."}
        </div>
        <div
          style={{
            backgroundColor: brand.bronze,
            bottom: spec.safeBottom,
            color: brand.white,
            fontFamily: sans,
            fontSize: 29,
            fontWeight: 850,
            left: spec.safeLeft,
            letterSpacing: ".07em",
            padding: "34px 38px",
            position: "absolute",
            right: spec.safeRight,
            textAlign: "center",
            textTransform: "uppercase",
            transform: `scale(${0.93 + button * 0.07})`,
          }}
        >
          {campaign.cta} →
        </div>
        <div
          style={{
            bottom: spec.safeBottom - 85,
            color: brand.sand,
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            left: spec.safeLeft,
            position: "absolute",
          }}
        >
          jimmycoco.pro
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const ProOfferVideo: React.FC<ProOfferVideoProps> = (props) => {
  const campaign = getCampaign(props.campaignSlug);
  const {fps} = useVideoConfig();
  const hookFrames = 5 * fps;
  const ctaFrames = 7 * fps;
  const totalFrames = Math.round(campaign.durationSeconds * fps);
  const proofFrames = totalFrames - hookFrames - ctaFrames;

  return (
    <AbsoluteFill style={{backgroundColor: brand.ink}}>
      <Sequence durationInFrames={hookFrames} premountFor={fps}>
        <HookScene {...props} />
      </Sequence>
      <Sequence from={hookFrames} durationInFrames={proofFrames} premountFor={fps}>
        <ProofScene {...props} />
      </Sequence>
      <Sequence
        from={hookFrames + proofFrames}
        durationInFrames={ctaFrames}
        premountFor={fps}
      >
        <CtaScene {...props} />
      </Sequence>
    </AbsoluteFill>
  );
};
