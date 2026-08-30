import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

const videoDirectory = resolve(import.meta.dirname, "..");
const publicDirectory = resolve(videoDirectory, "../public");
const catalogPath = resolve(videoDirectory, "src/content/campaigns.json");
const storyboardPath = resolve(videoDirectory, "src/content/storyboards.json");
const carouselPath = resolve(videoDirectory, "src/content/carousel-posts.json");
const campaigns = JSON.parse(readFileSync(catalogPath, "utf8"));
const storyboards = JSON.parse(readFileSync(storyboardPath, "utf8"));
const carouselPosts = JSON.parse(readFileSync(carouselPath, "utf8"));
const requiredFields = [
  "slug",
  "label",
  "audience",
  "destination",
  "durationSeconds",
  "eyebrow",
  "hook",
  "summary",
  "proof",
  "disclosure",
  "cta",
  "ctaUrl",
  "heroImage",
];
const slugs = new Set();
const errors = [];
if (!existsSync(resolve(publicDirectory, "assets/logo-top.png"))) {
  errors.push("the persistent Sunless logo is missing: assets/logo-top.png");
}
const forbiddenProBottleAssets = new Set([
  "assets/site/pro-bottle.webp",
  "assets/site/malibu-bottle.webp",
]);

const validateProBottleAsset = (owner, asset) => {
  if (forbiddenProBottleAssets.has(asset)) {
    errors.push(
      `${owner} must use assets/pro/bottle.png; the WebP Pro bottle does not preserve transparency`,
    );
  }
};

for (const [index, campaign] of campaigns.entries()) {
  const location = `campaign[${index}]`;
  for (const field of requiredFields) {
    if (!(field in campaign)) errors.push(`${location} is missing ${field}`);
  }
  if (slugs.has(campaign.slug)) errors.push(`duplicate slug: ${campaign.slug}`);
  slugs.add(campaign.slug);
  if (!Array.isArray(campaign.proof) || campaign.proof.length < 2 || campaign.proof.length > 3) {
    errors.push(`${campaign.slug} must contain two or three proof lines`);
  }
  if (!["salon", "mobile"].includes(campaign.audience)) {
    errors.push(`${campaign.slug} has invalid audience ${campaign.audience}`);
  }
  if (!["trial", "order"].includes(campaign.destination)) {
    errors.push(`${campaign.slug} has invalid destination ${campaign.destination}`);
  }
  if (!existsSync(resolve(publicDirectory, campaign.heroImage))) {
    errors.push(`${campaign.slug} references missing asset ${campaign.heroImage}`);
  }
  validateProBottleAsset(campaign.slug, campaign.heroImage);
}

const storyboardSlugs = new Set();
for (const [index, storyboard] of storyboards.entries()) {
  const location = `storyboard[${index}]`;
  if (!storyboard.slug) errors.push(`${location} is missing slug`);
  if (storyboardSlugs.has(storyboard.slug)) {
    errors.push(`duplicate storyboard slug: ${storyboard.slug}`);
  }
  storyboardSlugs.add(storyboard.slug);
  if (!slugs.has(storyboard.slug)) {
    errors.push(`${storyboard.slug} has a storyboard but no campaign`);
  }
  if (!existsSync(resolve(publicDirectory, storyboard.secondaryImage ?? ""))) {
    errors.push(`${storyboard.slug} references missing secondary asset ${storyboard.secondaryImage}`);
  }
  validateProBottleAsset(storyboard.slug, storyboard.secondaryImage);
  for (const audioField of ["voiceoverAudio", "musicAudio"]) {
    const audioPath = storyboard[audioField];
    if (audioPath && !existsSync(resolve(publicDirectory, audioPath))) {
      errors.push(`${storyboard.slug} references missing ${audioField} ${audioPath}`);
    }
  }
  if (!Array.isArray(storyboard.captions) || storyboard.captions.length === 0) {
    errors.push(`${storyboard.slug} must contain timed captions`);
    continue;
  }
  let previousEndMs = 0;
  for (const [captionIndex, caption] of storyboard.captions.entries()) {
    if (!caption.text || caption.endMs <= caption.startMs) {
      errors.push(`${storyboard.slug} has an invalid caption at index ${captionIndex}`);
    }
    if (caption.startMs < previousEndMs) {
      errors.push(`${storyboard.slug} has overlapping captions at index ${captionIndex}`);
    }
    previousEndMs = caption.endMs;
  }
  const campaign = campaigns.find((candidate) => candidate.slug === storyboard.slug);
  if (campaign && previousEndMs > campaign.durationSeconds * 1000) {
    errors.push(`${storyboard.slug} captions exceed the campaign duration`);
  }
}

for (const campaign of campaigns) {
  if (!storyboardSlugs.has(campaign.slug)) {
    errors.push(`${campaign.slug} is missing its production storyboard`);
  }
}

const carouselSlugs = new Set();
for (const [index, post] of carouselPosts.entries()) {
  const location = `carouselPost[${index}]`;
  if (!post.slug) errors.push(`${location} is missing slug`);
  if (carouselSlugs.has(post.slug)) errors.push(`duplicate carousel slug: ${post.slug}`);
  carouselSlugs.add(post.slug);
  if (!slugs.has(post.slug)) errors.push(`${post.slug} has carousel copy but no campaign`);
  for (const field of ["insightTitle", "insightBody", "decisionTitle", "decisionBody"]) {
    if (!post[field]) errors.push(`${post.slug} is missing carousel ${field}`);
  }
  for (const platform of ["instagram", "linkedin"]) {
    if (!post[platform]) errors.push(`${post.slug} is missing ${platform} post copy`);
    if (!Array.isArray(post[platform]?.hashtags) || post[platform].hashtags.length === 0) {
      errors.push(`${post.slug} must contain ${platform} hashtags`);
    }
  }
}

for (const campaign of campaigns) {
  if (!carouselSlugs.has(campaign.slug)) {
    errors.push(`${campaign.slug} is missing its Instagram and LinkedIn carousel package`);
  }
}

if (errors.length > 0) {
  throw new Error(`Jimmy Coco video catalogue is invalid:\n- ${errors.join("\n- ")}`);
}

const salonCount = campaigns.filter((campaign) => campaign.audience === "salon").length;
const mobileCount = campaigns.filter((campaign) => campaign.audience === "mobile").length;
const trialCount = campaigns.filter((campaign) => campaign.destination === "trial").length;
const orderCount = campaigns.filter((campaign) => campaign.destination === "order").length;

process.stdout.write(
  `Validated ${campaigns.length} campaigns, ${storyboards.length} timed storyboards and ${carouselPosts.length * 2} carousel post packages: ${salonCount} salon, ${mobileCount} mobile, ${trialCount} trial, ${orderCount} order.\n`,
);
