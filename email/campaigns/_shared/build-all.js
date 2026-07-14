#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { renderEmail } = require('./master-template');

const campaignsRoot = path.resolve(__dirname, '..');
const allManifests = [
  'au-salon-seeding/email-data.json',
  'au-salon-account-flow/email-data.json',
  'uk-salon-stockist/email-data.json',
  'uae-dubai-salon-stockist/email-data.json',
  'us-west-coast-salon-stockist/email-data.json'
];

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const requestedCampaigns = args.filter((arg) => arg !== '--check');
const manifests = requestedCampaigns.length
  ? allManifests.filter((manifest) => requestedCampaigns.includes(manifest.split('/')[0]))
  : allManifests;

for (const campaignId of requestedCampaigns) {
  if (!allManifests.some((manifest) => manifest.startsWith(`${campaignId}/`))) {
    throw new Error(`Unknown campaign: ${campaignId}`);
  }
}

function validateMessage(message, manifestPath) {
  const required = ['output', 'title', 'preview', 'headline', 'blocks'];
  for (const field of required) {
    if (message[field] === undefined || message[field] === null) {
      throw new Error(`${manifestPath}: message is missing required field "${field}"`);
    }
  }
  if (!Array.isArray(message.blocks)) {
    throw new Error(`${manifestPath}: blocks must be an array`);
  }
}

function resolveOutputPath(campaignDir, output, manifestPath) {
  const normalised = output.replace(/^\.\//, '').replaceAll('\\', '/');
  const relativeOutput = path.basename(normalised) === normalised
    ? path.join('emails', normalised)
    : normalised;
  const outputPath = path.resolve(campaignDir, relativeOutput);
  const emailsDir = path.resolve(campaignDir, 'emails');

  if (outputPath !== emailsDir && !outputPath.startsWith(`${emailsDir}${path.sep}`)) {
    throw new Error(`${manifestPath}: output must resolve inside the campaign emails directory`);
  }

  return outputPath;
}

let generated = 0;
for (const relativeManifest of manifests) {
  const manifestPath = path.join(campaignsRoot, relativeManifest);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing campaign manifest: ${relativeManifest}`);
  }

  const campaign = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(campaign.messages)) {
    throw new Error(`${relativeManifest}: messages must be an array`);
  }

  const campaignDir = path.dirname(manifestPath);
  const emailsDir = path.resolve(campaignDir, 'emails');
  if (!checkOnly) fs.mkdirSync(emailsDir, { recursive: true });

  for (const message of campaign.messages) {
    validateMessage(message, relativeManifest);
    const outputPath = resolveOutputPath(campaignDir, message.output, relativeManifest);
    const html = renderEmail({ ...campaign.defaults, ...message });
    if (!checkOnly) fs.writeFileSync(outputPath, html, 'utf8');
    generated += 1;
    console.log(`${checkOnly ? 'validated' : 'generated'} ${path.relative(campaignsRoot, outputPath)}`);
  }
}

console.log(`\n${checkOnly ? 'Validated' : 'Generated'} ${generated} campaign emails with the shared master template.`);
