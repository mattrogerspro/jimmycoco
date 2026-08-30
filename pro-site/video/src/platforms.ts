export const platforms = [
  "instagram-reels",
  "facebook-reels",
  "youtube-shorts",
] as const;

export type Platform = (typeof platforms)[number];

export type PlatformSpec = {
  width: number;
  height: number;
  label: string;
  safeTop: number;
  safeRight: number;
  safeBottom: number;
  safeLeft: number;
};

const platformSpecs: Record<Platform, PlatformSpec> = {
  "instagram-reels": {
    width: 1080,
    height: 1920,
    label: "Instagram Reels",
    safeTop: 180,
    safeRight: 150,
    safeBottom: 320,
    safeLeft: 90,
  },
  "facebook-reels": {
    width: 1080,
    height: 1920,
    label: "Facebook Reels",
    safeTop: 160,
    safeRight: 140,
    safeBottom: 300,
    safeLeft: 90,
  },
  "youtube-shorts": {
    width: 1080,
    height: 1920,
    label: "YouTube Shorts",
    safeTop: 170,
    safeRight: 170,
    safeBottom: 300,
    safeLeft: 90,
  },
};

export const getPlatformSpec = (platform: Platform): PlatformSpec =>
  platformSpecs[platform];
