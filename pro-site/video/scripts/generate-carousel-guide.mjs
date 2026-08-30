import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";

const videoDirectory = resolve(import.meta.dirname, "..");
const campaigns = JSON.parse(
  readFileSync(resolve(videoDirectory, "src/content/campaigns.json"), "utf8"),
);
const storyboards = JSON.parse(
  readFileSync(resolve(videoDirectory, "src/content/storyboards.json"), "utf8"),
);
const posts = JSON.parse(
  readFileSync(resolve(videoDirectory, "src/content/carousel-posts.json"), "utf8"),
);
const storyboardsBySlug = new Map(storyboards.map((item) => [item.slug, item]));
const postsBySlug = new Map(posts.map((item) => [item.slug, item]));

const trackedUrl = (campaign, platform) => {
  const url = new URL(campaign.ctaUrl);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "organic-carousel");
  url.searchParams.set("utm_campaign", "pro-social");
  url.searchParams.set("utm_content", `${campaign.slug}-carousel`);
  return url.toString();
};

const slideRows = (campaign, storyboard, post, platform) => {
  const audience =
    campaign.audience === "salon" ? "salons" : "mobile tanning professionals";
  const row = (eyebrow, title, body) => [
    eyebrow,
    title,
    body,
    `Jimmy Coco Pro carousel for ${audience}: ${title}. ${body}`,
  ];
  const pathTitle =
    campaign.destination === "trial"
      ? "Test one real client before you stock."
      : "Start with the professional order.";
  const common = [
    row(campaign.eyebrow, campaign.hook, platform === "instagram" ? "Swipe for the practical version →" : campaign.summary),
    row(platform === "instagram" ? "The reframe" : "The commercial issue", post.insightTitle, post.insightBody),
    row(platform === "instagram" ? "The proof to check" : "The working assumptions", storyboard.bridgeTitle, campaign.proof.join(" · ")),
    row("The number to notice", storyboard.metric.value, `${storyboard.metric.label}. ${storyboard.bridgeBody}`),
    row("What to do with it", post.decisionTitle, post.decisionBody),
    row(campaign.destination === "trial" ? "The low-risk first step" : "Ready to move?", pathTitle, "Training is available. Certification is optional and is not required to order."),
    row(campaign.audience === "salon" ? "For salons" : "For mobile tanning professionals", storyboard.ctaLead, `${campaign.cta} · jimmycoco.pro`),
  ];
  if (platform === "instagram") return common;
  return [
    common[0],
    row("The commercial issue", storyboard.problemTitle, storyboard.problemBody),
    ...common.slice(1),
  ];
};

const lines = [
  "# Jimmy Coco Pro carousel posting guide",
  "",
  "This guide contains the slide order and paste-ready publishing copy for all 12 Instagram and LinkedIn carousel posts. Instagram outputs are seven 1080×1350 PNGs. LinkedIn outputs are eight same-size pages combined into a PDF document.",
  "",
  "## Publishing rules",
  "",
  "- Keep the slide order intact: hook → reframe → proof → number → decision → low-friction path → CTA.",
  "- Upload Instagram PNGs in filename order. Paste the caption and add the pinned comment immediately after publishing.",
  "- Upload the LinkedIn PDF as a document post, use the supplied document title and place the tracked URL in the first comment.",
  "- Check every price, survey claim, eligibility statement and fulfilment term again on the day of publication.",
  "- Never imply that certification is required before a trial or order.",
  "",
];

for (const campaign of campaigns) {
  const storyboard = storyboardsBySlug.get(campaign.slug);
  const post = postsBySlug.get(campaign.slug);
  lines.push(`# ${campaign.label}`, "", `Campaign slug: \`${campaign.slug}\` · Audience: ${campaign.audience} · Primary destination: ${campaign.destination}`, "");

  for (const platform of ["instagram", "linkedin"]) {
    const platformLabel = platform === "instagram" ? "Instagram" : "LinkedIn";
    const slides = slideRows(campaign, storyboard, post, platform);
    const url = trackedUrl(campaign, platform);
    lines.push(`## ${platformLabel}`, "", "### Slide plan", "");
    slides.forEach(([eyebrow, title, body, altText], index) => {
      lines.push(
        `${index + 1}. **${eyebrow} — ${title}**`,
        `   ${body}`,
        `   Alt text: ${altText}`,
        "",
      );
    });

    if (platform === "instagram") {
      lines.push(
        "### Caption",
        "",
        post.instagram.caption,
        "",
        post.instagram.hashtags.join(" "),
        "",
        "### Pinned comment",
        "",
        post.instagram.pinnedComment,
        "",
        "### Story reshare line",
        "",
        post.instagram.storyReshare,
        "",
        "### Tracked destination",
        "",
        url,
        "",
      );
    } else {
      lines.push(
        "### Document title",
        "",
        post.linkedin.documentTitle,
        "",
        "### Post text",
        "",
        post.linkedin.postText,
        "",
        post.linkedin.hashtags.join(" "),
        "",
        "### First comment",
        "",
        post.linkedin.firstComment.replace("{{CTA_URL}}", url),
        "",
      );
    }
  }
}

const outputDirectory = resolve(videoDirectory, "social");
mkdirSync(outputDirectory, {recursive: true});
const output = resolve(outputDirectory, "CAROUSEL-POSTING-GUIDE.md");
writeFileSync(output, `${lines.join("\n").trim()}\n`);
process.stdout.write(`${output}\n`);
