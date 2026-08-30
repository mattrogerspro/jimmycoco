import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";

const videoDirectory = resolve(import.meta.dirname, "..");
const storyboards = JSON.parse(
  readFileSync(resolve(videoDirectory, "src/content/storyboards.json"), "utf8"),
);
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const requestedCampaign = option("--campaign");
const selected = requestedCampaign
  ? storyboards.filter((storyboard) => storyboard.slug === requestedCampaign)
  : storyboards;

if (selected.length === 0) {
  throw new Error(`Unknown campaign "${requestedCampaign}".`);
}

const plans = selected.map((storyboard) => ({
  slug: storyboard.slug,
  script: storyboard.voiceoverScript,
  targetFile: `assets/video/audio/voiceover/${storyboard.slug}.mp3`,
  captions: storyboard.captions,
}));
const output = resolve(videoDirectory, "out/production/voiceover-plans.json");
mkdirSync(resolve(output, ".."), {recursive: true});
writeFileSync(output, `${JSON.stringify(plans, null, 2)}\n`);
process.stdout.write(`Wrote ${plans.length} voiceover plan(s) to ${output}\n`);

