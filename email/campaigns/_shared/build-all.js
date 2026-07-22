#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { renderEmail } = require('./master-template');

const campaignsRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');
const assetManifestPath = path.join(repoRoot, 'email/06-assets/asset-manifest.json');
const assetManifest = JSON.parse(fs.readFileSync(assetManifestPath, 'utf8'));
const assetsById = new Map((assetManifest.assets || []).map((asset) => [asset.assetId, asset]));
const imageTypes = new Set(['image', 'heroImage', 'productFeature', 'imageText', 'productGrid', 'proofStrip']);

const allManifests = [
  'au-salon-seeding/email-data.json',
  'au-salon-account-flow/email-data.json',
  'uk-salon-stockist/email-data.json',
  'uae-dubai-salon-stockist/email-data.json',
  'us-west-coast-salon-stockist/email-data.json',
  'au-sydney-salon-stockist/email-data.json',
  'au-gold-coast-salon-stockist/email-data.json',
  'au-new-salon-outreach-test/email-data.json'
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

const includesValue = (values = [], value) => values.includes('global') || values.includes(value);

function approvedEmailAsset(assetId, campaign, manifestPath) {
  const asset = assetsById.get(assetId);
  if (!asset) throw new Error(`${manifestPath}: unknown assetId "${assetId}"`);
  if (asset.status !== 'APPROVED') throw new Error(`${manifestPath}: asset "${assetId}" is ${asset.status}, not APPROVED`);
  if (!(asset.allowedChannels || []).includes('email')) throw new Error(`${manifestPath}: asset "${assetId}" is not approved for email`);
  if (!campaign.market) throw new Error(`${manifestPath}: campaign.market is required when images are used`);
  if (!campaign.purpose) throw new Error(`${manifestPath}: campaign.purpose is required when images are used`);
  if (!includesValue(asset.allowedMarkets, campaign.market)) throw new Error(`${manifestPath}: asset "${assetId}" is not approved for market ${campaign.market}`);
  if (!includesValue(asset.allowedPurposes, campaign.purpose)) throw new Error(`${manifestPath}: asset "${assetId}" is not approved for purpose ${campaign.purpose}`);
  if (!asset.email || !asset.email.desktop) throw new Error(`${manifestPath}: asset "${assetId}" has no approved desktop email derivative`);
  const derivative = asset.email.desktop;
  if (!/^https:\/\//.test(derivative.publicUrl || '')) throw new Error(`${manifestPath}: asset "${assetId}" requires a stable public HTTPS URL`);
  if (!asset.altText || asset.altText === '[SOURCE REQUIRED]') throw new Error(`${manifestPath}: asset "${assetId}" requires approved alt text`);
  if (!derivative.width || !derivative.height) throw new Error(`${manifestPath}: asset "${assetId}" requires derivative dimensions`);
  if (!asset.approvedBy || !asset.approvedAt) throw new Error(`${manifestPath}: asset "${assetId}" requires approval provenance`);
  return asset;
}

function hydrateImageItem(item, campaign, manifestPath) {
  if (!item.assetId) throw new Error(`${manifestPath}: every image item requires assetId`);
  const asset = approvedEmailAsset(item.assetId, campaign, manifestPath);
  const desktop = asset.email.desktop;
  const mobile = asset.email.mobile || null;
  if (item.src && item.src !== desktop.publicUrl) throw new Error(`${manifestPath}: ${item.assetId} src must match the asset manifest`);
  if (item.alt && item.alt !== asset.altText) throw new Error(`${manifestPath}: ${item.assetId} alt text must match the asset manifest`);
  return {
    ...item,
    src: desktop.publicUrl,
    mobileSrc: mobile ? mobile.publicUrl : undefined,
    width: desktop.width,
    height: desktop.height,
    alt: asset.altText
  };
}

function hydrateBlock(block, campaign, manifestPath) {
  if (!imageTypes.has(block.type)) return block;
  if (block.type === 'productGrid' || block.type === 'proofStrip') {
    if (!Array.isArray(block.items) || !block.items.length) throw new Error(`${manifestPath}: ${block.type} requires items`);
    return { ...block, items: block.items.map((item) => hydrateImageItem(item, campaign, manifestPath)) };
  }
  return hydrateImageItem(block, campaign, manifestPath);
}

function validateMessage(message, manifestPath) {
  const required = ['output', 'title', 'preview', 'headline', 'blocks'];
  for (const field of required) {
    if (message[field] === undefined || message[field] === null) {
      throw new Error(`${manifestPath}: message is missing required field "${field}"`);
    }
  }
  if (!Array.isArray(message.blocks)) throw new Error(`${manifestPath}: blocks must be an array`);
}

function resolveOutputPath(campaignDir, output, manifestPath) {
  const normalised = output.replace(/^\.\//, '').replaceAll('\\', '/');
  const relativeOutput = path.basename(normalised) === normalised ? path.join('emails', normalised) : normalised;
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
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing campaign manifest: ${relativeManifest}`);
  const campaign = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(campaign.messages)) throw new Error(`${relativeManifest}: messages must be an array`);

  const campaignDir = path.dirname(manifestPath);
  const emailsDir = path.resolve(campaignDir, 'emails');
  if (!checkOnly) fs.mkdirSync(emailsDir, { recursive: true });

  for (const message of campaign.messages) {
    validateMessage(message, relativeManifest);
    const outputPath = resolveOutputPath(campaignDir, message.output, relativeManifest);
    const hydratedMessage = { ...message, blocks: message.blocks.map((block) => hydrateBlock(block, campaign, relativeManifest)) };
    const html = renderEmail({ ...campaign.defaults, ...hydratedMessage });
    if (!checkOnly) fs.writeFileSync(outputPath, html, 'utf8');
    generated += 1;
    console.log(`${checkOnly ? 'validated' : 'generated'} ${path.relative(campaignsRoot, outputPath)}`);
  }
}

console.log(`\n${checkOnly ? 'Validated' : 'Generated'} ${generated} campaign emails with the shared master template and asset governance.`);
