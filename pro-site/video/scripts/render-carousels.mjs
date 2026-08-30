import {mkdirSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {spawnSync} from "node:child_process";

const videoDirectory = resolve(import.meta.dirname, "..");
const campaigns = JSON.parse(
  readFileSync(resolve(videoDirectory, "src/content/campaigns.json"), "utf8"),
);
const args = process.argv.slice(2);
const platforms = ["instagram", "linkedin"];
const slideCounts = {instagram: 7, linkedin: 8};

const getOption = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const hasFlag = (name) => args.includes(name);

const requestedCampaign = getOption("--campaign");
const requestedPlatform = getOption("--platform");
if (requestedPlatform && !platforms.includes(requestedPlatform)) {
  throw new Error(
    `Unknown platform "${requestedPlatform}". Choose: ${platforms.join(", ")}`,
  );
}

const selectedCampaigns = hasFlag("--all")
  ? campaigns
  : campaigns.filter((campaign) => campaign.slug === requestedCampaign);
if (selectedCampaigns.length === 0) {
  process.stderr.write(
    "Choose --campaign <slug>, or use --all. Add --dry-run to inspect outputs.\n",
  );
  process.exit(1);
}

const selectedPlatforms = requestedPlatform ? [requestedPlatform] : platforms;
const dryRun = hasFlag("--dry-run");

for (const campaign of selectedCampaigns) {
  for (const platform of selectedPlatforms) {
    const outputDirectory = resolve(
      videoDirectory,
      "out",
      "carousels",
      platform,
      campaign.slug,
    );
    const pageFiles = Array.from(
      {length: slideCounts[platform]},
      (_, slideIndex) =>
        resolve(
          outputDirectory,
          `${String(slideIndex + 1).padStart(2, "0")}.png`,
        ),
    );

    process.stdout.write(
      `${dryRun ? "Would render" : "Rendering"} ${platform}/${campaign.slug} (${pageFiles.length} slides)\n`,
    );
    if (dryRun) continue;

    mkdirSync(outputDirectory, {recursive: true});
    for (const [slideIndex, output] of pageFiles.entries()) {
      const result = spawnSync(
        "pnpm",
        [
          "exec",
          "remotion",
          "still",
          "Jimmy-Coco-Carousel-Slide",
          output,
          "--image-format=png",
          "--props",
          JSON.stringify({campaignSlug: campaign.slug, platform, slideIndex}),
        ],
        {cwd: videoDirectory, stdio: "inherit"},
      );
      if (result.status !== 0) process.exit(result.status ?? 1);
    }

    if (platform === "linkedin") {
      const pdfOutput = resolve(outputDirectory, `${campaign.slug}.pdf`);
      const result = spawnSync(
        "magick",
        [...pageFiles, "-density", "144", "-quality", "96", pdfOutput],
        {cwd: videoDirectory, stdio: "inherit"},
      );
      if (result.error?.code === "ENOENT") {
        throw new Error(
          "ImageMagick is required to combine the LinkedIn PNG pages into a PDF. Install it with `brew install imagemagick`, then rerun this command.",
        );
      }
      if (result.status !== 0) process.exit(result.status ?? 1);
    }
  }
}
