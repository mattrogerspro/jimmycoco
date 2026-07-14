#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { renderEmail } = require('./master-template');

const campaignsRoot = path.resolve(__dirname, '..');
const manifests = [
  'au-salon-seeding/email-data.json',
  'au-salon-account-flow/email-data.json',
  'uk-salon-stockist/email-data.json',
  'uae-dubai-salon-stockist/email-data.json'
];

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
  if (path.basename(message.output) !== message.output) {
    throw new Error(`${manifestPath}: output must be a filename, not a path`);
  }
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
  const emailsDir = path.join(campaignDir, 'emails');
  fs.mkdirSync(emailsDir, { recursive: true });

  for (const message of campaign.messages) {
    validateMessage(message, relativeManifest);
    const outputPath = path.join(emailsDir, message.output);
    fs.writeFileSync(outputPath, renderEmail({ ...campaign.defaults, ...message }), 'utf8');
    generated += 1;
    console.log(`generated ${path.relative(campaignsRoot, outputPath)}`);
  }
}

console.log(`\nGenerated ${generated} campaign emails from the shared master template.`);
