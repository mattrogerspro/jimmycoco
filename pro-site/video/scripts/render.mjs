import {mkdirSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {spawnSync} from "node:child_process";

const videoDirectory = resolve(import.meta.dirname, "..");
const catalogPath = resolve(videoDirectory, "src/content/campaigns.json");
const storyboardPath = resolve(videoDirectory, "src/content/storyboards.json");
const campaigns = JSON.parse(readFileSync(catalogPath, "utf8"));
const storyboards = JSON.parse(readFileSync(storyboardPath, "utf8"));
const storyboardBySlug = new Map(storyboards.map((storyboard) => [storyboard.slug, storyboard]));
const platforms = ["instagram-reels", "facebook-reels", "youtube-shorts"];
const args = process.argv.slice(2);

const getOption = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const hasFlag = (name) => args.includes(name);

const printCatalogue = () => {
  for (const campaign of campaigns) {
    process.stdout.write(
      `${campaign.slug.padEnd(36)} ${campaign.audience.padEnd(6)} · ${campaign.destination.padEnd(5)} · ${campaign.label}\n`,
    );
  }
};

if (hasFlag("--list")) {
  printCatalogue();
  process.exit(0);
}

const requestedCampaign = getOption("--campaign");
const requestedPlatform = getOption("--platform");
if (requestedPlatform && !platforms.includes(requestedPlatform)) {
  throw new Error(`Unknown platform "${requestedPlatform}". Choose: ${platforms.join(", ")}`);
}

const selectedCampaigns = hasFlag("--all")
  ? campaigns
  : campaigns.filter((campaign) => campaign.slug === requestedCampaign);
if (selectedCampaigns.length === 0) {
  process.stderr.write(
    "Choose a campaign with --campaign <slug>, or use --all.\n\n",
  );
  printCatalogue();
  process.exit(1);
}

const selectedPlatforms = requestedPlatform ? [requestedPlatform] : platforms;
const dryRun = hasFlag("--dry-run");
const audioMode = getOption("--audio") ?? "off";
if (!["off", "mastered"].includes(audioMode)) {
  throw new Error('--audio must be either "off" or "mastered"');
}

for (const campaign of selectedCampaigns) {
  const storyboard = storyboardBySlug.get(campaign.slug);
  if (audioMode === "mastered" && (!storyboard?.voiceoverAudio || !storyboard?.musicAudio)) {
    throw new Error(
      `${campaign.slug} is not mastered: add both voiceoverAudio and musicAudio to its storyboard before using --audio mastered`,
    );
  }
  for (const platform of selectedPlatforms) {
    const output = resolve(videoDirectory, "out", platform, `${campaign.slug}.mp4`);
    process.stdout.write(
      `${dryRun ? "Would render" : "Rendering"} ${platform}/${campaign.slug}.mp4\n`,
    );
    if (dryRun) continue;
    mkdirSync(resolve(output, ".."), {recursive: true});
    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "remotion",
        "render",
        "Jimmy-Coco-Pro-Offer",
        output,
        "--codec=h264",
        "--audio-codec=aac",
        "--audio-bitrate=192k",
        "--crf=18",
        "--props",
        JSON.stringify({campaignSlug: campaign.slug, platform, audioMode}),
      ],
      {cwd: videoDirectory, stdio: "inherit"},
    );
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
