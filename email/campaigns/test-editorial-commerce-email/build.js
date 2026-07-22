const fs = require('node:fs');
const path = require('node:path');
const { renderScreenshotFidelityEmail } = require('../_shared/screenshot-fidelity-template');

const campaignDir = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(campaignDir, 'email-data.json'), 'utf8'));
const outputDir = path.join(campaignDir, 'emails');

fs.mkdirSync(outputDir, { recursive: true });
for (const message of data.messages) {
  const output = path.join(campaignDir, message.output);
  fs.writeFileSync(output, renderScreenshotFidelityEmail({ ...data.defaults, ...message }));
  console.log(`generated ${path.relative(process.cwd(), output)}`);
}
