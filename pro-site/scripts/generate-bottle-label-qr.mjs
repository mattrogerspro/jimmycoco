import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const trackedUrl = new URL('https://jimmycoco.pro');
trackedUrl.search = new URLSearchParams({
  utm_source: 'pro_bottle',
}).toString();

const outputBase = path.join(
  scriptDirectory,
  '..',
  'public',
  'img',
  'jimmycoco-bottle-label-qr',
);

const commonOptions = {
  errorCorrectionLevel: 'M',
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

await Promise.all([
  QRCode.toFile(`${outputBase}.svg`, trackedUrl.href, {
    ...commonOptions,
    type: 'svg',
    width: 2048,
  }),
  QRCode.toFile(`${outputBase}.png`, trackedUrl.href, {
    ...commonOptions,
    type: 'png',
    width: 2048,
  }),
]);

console.log(`Created SVG and PNG QR codes for: ${trackedUrl.href}`);
