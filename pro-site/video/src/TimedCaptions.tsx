import type {Caption} from "@remotion/captions";
import React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {brand, sans} from "./brand";
import type {PlatformSpec} from "./platforms";

type TimedCaptionsProps = {
  readonly captions: readonly Caption[];
  readonly platform: PlatformSpec;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const TimedCaptions: React.FC<TimedCaptionsProps> = ({
  captions,
  platform,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const caption = captions.find(
    (candidate) => currentMs >= candidate.startMs && currentMs < candidate.endMs,
  );

  if (!caption) return null;

  const startFrame = Math.round((caption.startMs / 1000) * fps);
  const localFrame = frame - startFrame;
  const words = caption.text.split(/\s+/);
  const activeWord = Math.min(
    words.length - 1,
    Math.floor(
      interpolate(
        currentMs,
        [caption.startMs, caption.endMs],
        [0, words.length],
        clamp,
      ),
    ),
  );
  const reveal = spring({
    frame: localFrame,
    fps,
    durationInFrames: Math.round(0.28 * fps),
    config: {damping: 18, mass: 0.55, stiffness: 230},
  });

  return (
    <div
      style={{
        bottom: platform.safeBottom + 118,
        display: "flex",
        justifyContent: "center",
        left: platform.safeLeft,
        opacity: interpolate(localFrame, [0, 4], [0, 1], clamp),
        pointerEvents: "none",
        position: "absolute",
        right: platform.safeRight,
        textAlign: "center",
        transform: `translateY(${(1 - reveal) * 28}px)`,
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(18,31,37,.88)",
          border: "1px solid rgba(255,250,245,.26)",
          borderRadius: 22,
          boxShadow: "0 18px 48px rgba(14,10,8,.28)",
          color: brand.white,
          fontFamily: sans,
          fontSize: 42,
          fontWeight: 820,
          letterSpacing: "-.015em",
          lineHeight: 1.08,
          maxWidth: 850,
          padding: "18px 24px 20px",
          textShadow: "0 2px 12px rgba(0,0,0,.4)",
        }}
      >
        {words.map((word, index) => (
          <React.Fragment key={`${caption.startMs}-${index}`}>
            {index > 0 ? " " : null}
            <span
              style={{
                color: index === activeWord ? "#f0b184" : brand.white,
                display: "inline-block",
                transform: `scale(${index === activeWord ? 1.045 : 1})`,
              }}
            >
              {word}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

