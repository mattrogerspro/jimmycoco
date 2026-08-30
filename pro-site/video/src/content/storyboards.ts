import type {Caption} from "@remotion/captions";
import {z} from "zod";
import storyboards from "./storyboards.json";
import {campaignSlugs} from "./catalog";

const captionSchema = z.object({
  text: z.string().min(1),
  startMs: z.number().nonnegative(),
  endMs: z.number().positive(),
  timestampMs: z.number().nonnegative().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
});

const storyboardSchema = z.object({
  slug: z.string().min(1),
  visualTreatment: z.enum([
    "maths",
    "trial",
    "authority",
    "training",
    "retail",
    "social",
    "results",
    "launch-pack",
    "mobile-maths",
    "mobile-trial",
    "mobile-social",
    "mobile-premium",
  ]),
  proofHighlightIndex: z.number().int().min(0).max(2),
  secondaryImage: z.string().min(1),
  problemTitle: z.string().min(1),
  problemBody: z.string().min(1),
  bridgeTitle: z.string().min(1),
  bridgeBody: z.string().min(1),
  metric: z.object({
    value: z.string().min(1),
    label: z.string().min(1),
  }),
  ctaLead: z.string().min(1),
  voiceoverScript: z.string().min(1),
  voiceoverAudio: z.string().min(1).nullable(),
  musicAudio: z.string().min(1).nullable(),
  musicVolume: z.number().min(0).max(1),
  captions: z.array(captionSchema).min(1),
});

type ParsedStoryboard = z.infer<typeof storyboardSchema>;

export type Storyboard = Omit<ParsedStoryboard, "captions"> & {
  readonly captions: readonly Caption[];
};

const parsedStoryboards = z.array(storyboardSchema).parse(storyboards);

const storyboardBySlug = new Map(
  parsedStoryboards.map((storyboard) => [storyboard.slug, storyboard]),
);

for (const campaignSlug of campaignSlugs) {
  if (!storyboardBySlug.has(campaignSlug)) {
    throw new Error(`Missing video storyboard for campaign "${campaignSlug}".`);
  }
}

export const getStoryboard = (slug: string): Storyboard => {
  const storyboard = storyboardBySlug.get(slug);
  if (!storyboard) {
    throw new Error(`Unknown Jimmy Coco storyboard "${slug}".`);
  }
  return storyboard;
};
