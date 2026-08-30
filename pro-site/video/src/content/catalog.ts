import {z} from "zod";
import campaigns from "./campaigns.json";

const campaignSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  audience: z.enum(["salon", "mobile"]),
  destination: z.enum(["trial", "order"]),
  durationSeconds: z.number().positive(),
  eyebrow: z.string().min(1),
  hook: z.string().min(1),
  summary: z.string().min(1),
  proof: z.array(z.string().min(1)).min(2).max(3),
  disclosure: z.string(),
  cta: z.string().min(1),
  ctaUrl: z.string().url(),
  heroImage: z.string().min(1),
});

export type Campaign = z.infer<typeof campaignSchema>;

export const campaignCatalog = z.array(campaignSchema).parse(campaigns);

export const campaignSlugs = campaignCatalog.map((campaign) => campaign.slug);

export const getCampaign = (slug: string): Campaign => {
  const campaign = campaignCatalog.find((item) => item.slug === slug);
  if (!campaign) {
    throw new Error(
      `Unknown Jimmy Coco video campaign "${slug}". Choose: ${campaignSlugs.join(", ")}`,
    );
  }
  return campaign;
};
