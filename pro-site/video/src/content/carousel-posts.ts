import {z} from "zod";
import posts from "./carousel-posts.json";
import {campaignCatalog, getCampaign, type Campaign} from "./catalog";
import {getStoryboard} from "./storyboards";

const platformPostSchema = z.object({
  caption: z.string().min(1).optional(),
  pinnedComment: z.string().min(1).optional(),
  storyReshare: z.string().min(1).optional(),
  hashtags: z.array(z.string().startsWith("#")).min(1),
  documentTitle: z.string().min(1).optional(),
  postText: z.string().min(1).optional(),
  firstComment: z.string().min(1).optional(),
});

const carouselPostSchema = z.object({
  slug: z.string().min(1),
  insightTitle: z.string().min(1),
  insightBody: z.string().min(1),
  decisionTitle: z.string().min(1),
  decisionBody: z.string().min(1),
  instagram: platformPostSchema.extend({
    caption: z.string().min(1),
    pinnedComment: z.string().min(1),
    storyReshare: z.string().min(1),
  }),
  linkedin: platformPostSchema.extend({
    documentTitle: z.string().min(1),
    postText: z.string().min(1),
    firstComment: z.string().min(1),
  }),
});

export type CarouselPlatform = "instagram" | "linkedin";
export type CarouselPost = z.infer<typeof carouselPostSchema>;

export type CarouselSlide = {
  readonly altText: string;
  readonly body?: string;
  readonly bullets?: readonly string[];
  readonly disclosure?: string;
  readonly eyebrow: string;
  readonly image?: string;
  readonly kind:
    | "cover"
    | "insight"
    | "proof"
    | "metric"
    | "decision"
    | "path"
    | "cta";
  readonly metricLabel?: string;
  readonly metricValue?: string;
  readonly title: string;
};

const parsedPosts = z.array(carouselPostSchema).parse(posts);
const postBySlug = new Map(parsedPosts.map((post) => [post.slug, post]));

for (const campaign of campaignCatalog) {
  if (!postBySlug.has(campaign.slug)) {
    throw new Error(`Missing carousel copy for campaign "${campaign.slug}".`);
  }
}

const withCarouselTracking = (
  campaign: Campaign,
  platform: CarouselPlatform,
) => {
  const url = new URL(campaign.ctaUrl);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "organic-carousel");
  url.searchParams.set("utm_campaign", "pro-social");
  url.searchParams.set("utm_content", `${campaign.slug}-carousel`);
  return url.toString();
};

export const getCarouselPost = (slug: string): CarouselPost => {
  const post = postBySlug.get(slug);
  if (!post) throw new Error(`Unknown Jimmy Coco carousel post "${slug}".`);
  return post;
};

export const getCarouselPostCopy = (
  slug: string,
  platform: CarouselPlatform,
) => {
  const campaign = getCampaign(slug);
  const post = getCarouselPost(slug);
  const ctaUrl = withCarouselTracking(campaign, platform);

  if (platform === "instagram") {
    return {
      ...post.instagram,
      ctaUrl,
      captionWithHashtags: `${post.instagram.caption}\n\n${post.instagram.hashtags.join(" ")}`,
    };
  }

  return {
    ...post.linkedin,
    ctaUrl,
    firstComment: post.linkedin.firstComment.replace("{{CTA_URL}}", ctaUrl),
    postWithHashtags: `${post.linkedin.postText}\n\n${post.linkedin.hashtags.join(" ")}`,
  };
};

const pathCopy = (campaign: Campaign) =>
  campaign.destination === "trial"
    ? {
        eyebrow: "The low-risk first step",
        title: "Test one real client before you stock.",
        body: "Request the complimentary 100ml professional trial. Order the litre only if the formula earns its place.",
      }
    : {
        eyebrow: "Ready to move?",
        title: "Start with the professional order.",
        body: "Build the order online. Training and the certification pathway can be added when useful; neither blocks the first order.",
      };

const alt = (campaign: Campaign, detail: string) =>
  `Jimmy Coco Pro carousel for ${campaign.audience === "salon" ? "salons" : "mobile tanning professionals"}: ${detail}`;

export const buildCarouselSlides = (
  slug: string,
  platform: CarouselPlatform,
): readonly CarouselSlide[] => {
  const campaign = getCampaign(slug);
  const storyboard = getStoryboard(slug);
  const post = getCarouselPost(slug);
  const path = pathCopy(campaign);
  const common: readonly CarouselSlide[] = [
    {
      kind: "cover",
      eyebrow: campaign.eyebrow,
      title: campaign.hook,
      body: platform === "instagram" ? "Swipe for the practical version →" : campaign.summary,
      image: campaign.heroImage,
      altText: alt(campaign, `${campaign.hook} ${campaign.summary}`),
    },
    {
      kind: "insight",
      eyebrow: platform === "instagram" ? "The reframe" : "The commercial issue",
      title: post.insightTitle,
      body: post.insightBody,
      image: storyboard.secondaryImage,
      altText: alt(campaign, `${post.insightTitle} ${post.insightBody}`),
    },
    {
      kind: "proof",
      eyebrow: platform === "instagram" ? "The proof to check" : "The working assumptions",
      title: platform === "instagram" ? storyboard.bridgeTitle : "Make every assumption visible.",
      bullets: campaign.proof,
      disclosure: campaign.disclosure,
      altText: alt(campaign, campaign.proof.join("; ")),
    },
    {
      kind: "metric",
      eyebrow: "The number to notice",
      title: storyboard.bridgeTitle,
      body: storyboard.bridgeBody,
      metricValue: storyboard.metric.value,
      metricLabel: storyboard.metric.label,
      image: "assets/pro/bottle.png",
      altText: alt(
        campaign,
        `${storyboard.metric.value}, ${storyboard.metric.label}. ${storyboard.bridgeBody}`,
      ),
    },
    {
      kind: "decision",
      eyebrow: "What to do with it",
      title: post.decisionTitle,
      body: post.decisionBody,
      image: campaign.audience === "salon" ? "assets/site/apply-tan.webp" : "assets/pro/bottle.png",
      altText: alt(campaign, `${post.decisionTitle} ${post.decisionBody}`),
    },
    {
      kind: "path",
      eyebrow: path.eyebrow,
      title: path.title,
      body: path.body,
      bullets: [
        "One-hour online training available",
        "Certification is optional and subject to approval",
        "No certification required to order",
      ],
      altText: alt(campaign, `${path.title} ${path.body}`),
    },
    {
      kind: "cta",
      eyebrow: campaign.audience === "salon" ? "For salons" : "For mobile tanning professionals",
      title: storyboard.ctaLead,
      body: campaign.cta,
      image: "assets/pro/bottle.png",
      disclosure: campaign.disclosure,
      altText: alt(campaign, `${storyboard.ctaLead} ${campaign.cta}. Visit jimmycoco.pro.`),
    },
  ];

  if (platform === "instagram") return common;

  return [
    common[0],
    {
      kind: "insight",
      eyebrow: "The commercial issue",
      title: storyboard.problemTitle,
      body: storyboard.problemBody,
      image: storyboard.secondaryImage,
      altText: alt(campaign, `${storyboard.problemTitle} ${storyboard.problemBody}`),
    },
    common[1],
    common[2],
    common[3],
    common[4],
    common[5],
    common[6],
  ];
};

export const carouselSlideCounts: Record<CarouselPlatform, number> = {
  instagram: 7,
  linkedin: 8,
};
