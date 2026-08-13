import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outputDir = path.join(publicDir, "social");
const run = promisify(execFile);
const walbaumFont = path.join(root, "scripts/social-fonts/walbaum.ttf");
const montserratFont = path.join(root, "scripts/social-fonts/montserrat-regular.ttf");
const montserratSemiboldFont = path.join(root, "scripts/social-fonts/montserrat-semibold.ttf");

const formats = {
  og: { width: 1200, height: 630 },
  square: { width: 1200, height: 1200 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const cards = [
  {
    id: "home",
    eyebrow: "PROFESSIONAL SPRAY TAN SYSTEM",
    title: ["The tan your clients ask for.", "Now in your booth."],
    subtitle: "Hollywood colour. Professional performance. Clients who come back.",
    image: path.join(publicDir, "img/hero-kk-996.webp"),
    mode: "portrait",
    position: "north",
  },
  {
    id: "calculator",
    eyebrow: "THE SALON MATHS",
    title: ["Calculate your", "tanning profit."],
    subtitle: "Your prices. Your bookings. Your retail. See what the booth and shelf earn together.",
    image: path.join(publicDir, "assets/site/calculator-background-light-2560.webp"),
    mode: "background",
    position: "east",
  },
  {
    id: "product",
    eyebrow: "MALIBU PROFESSIONAL SPRAY · 1L",
    title: ["One universal bronze glow.", "Every client covered."],
    subtitle: "Approximately 28 full-body tans. Salon-size value. Hollywood colour.",
    image: path.join(publicDir, "assets/site/product-01-0003c7706e6e.jpg"),
    mode: "product",
    position: "centre",
  },
  {
    id: "articles",
    eyebrow: "THE PROFESSIONAL JOURNAL",
    title: ["Advice for better tans", "and stronger salons."],
    subtitle: "Practical guidance for pricing, profit, technique and retail.",
    image: path.join(publicDir, "img/articles/journal-hero-3-2048.webp"),
    mode: "background",
    position: "centre",
  },
];

function layout(format, width, height) {
  if (format === "og") return { x: 64, y: 138, titleSize: 54, titleGap: 61, eyebrowSize: 15, subSize: 20, subGap: 28, maxChars: 49, photoX: 630, photoY: 0, photoW: 570, photoH: 630, topBar: 104 };
  if (format === "square") return { x: 64, y: 745, titleSize: 62, titleGap: 70, eyebrowSize: 16, subSize: 21, subGap: 30, maxChars: 70, photoX: 0, photoY: 0, photoW: 1200, photoH: 650, topBar: 116 };
  if (format === "portrait") return { x: 58, y: 800, titleSize: 62, titleGap: 70, eyebrowSize: 16, subSize: 21, subGap: 30, maxChars: 61, photoX: 0, photoY: 0, photoW: 1080, photoH: 710, topBar: 116 };
  return { x: 60, y: 1160, titleSize: 74, titleGap: 84, eyebrowSize: 18, subSize: 25, subGap: 36, maxChars: 52, photoX: 0, photoY: 0, photoW: 1080, photoH: 1030, topBar: 124 };
}

function wrapWords(value, maxChars) {
  const lines = [];
  for (const word of value.split(/\s+/)) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > maxChars) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines;
}

function overlaySvg(card, format, width, height, l) {
  const landscape = format === "og";
  const gradient = landscape
    ? `<linearGradient id="scrim" x1="0" x2="1"><stop offset="0" stop-color="#102734" stop-opacity=".98"/><stop offset=".53" stop-color="#102734" stop-opacity=".92"/><stop offset=".75" stop-color="#102734" stop-opacity=".28"/><stop offset="1" stop-color="#102734" stop-opacity=".08"/></linearGradient>`
    : `<linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102734" stop-opacity=".05"/><stop offset=".46" stop-color="#102734" stop-opacity=".34"/><stop offset=".58" stop-color="#102734" stop-opacity=".97"/><stop offset="1" stop-color="#102734" stop-opacity="1"/></linearGradient>`;

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>${gradient}</defs>
      <rect width="100%" height="100%" fill="url(#scrim)"/>
      <rect width="100%" height="${l.topBar}" fill="#102734" fill-opacity=".96"/>
      <rect y="${l.topBar - 3}" width="100%" height="3" fill="#4E7C91"/>
      <rect x="${l.x}" y="${l.y + 34}" width="72" height="3" rx="2" fill="#4E7C91"/>
    </svg>`);
}

async function addTypography(base, output, card, format, l) {
  const landscape = format === "og";
  const logoSize = landscape ? 42 : 46;
  const logoX = l.x;
  const professionalX = landscape ? 372 : 450;
  const professionalY = landscape ? 37 : 43;
  const titleY = l.y + 63;
  const subtitleY = titleY + card.title.length * l.titleGap + 25;
  const subtitleLines = wrapWords(card.subtitle, l.maxChars);
  const args = [
    base,
    "-gravity", "NorthWest",
    "-font", walbaumFont,
    "-pointsize", String(logoSize),
    "-kerning", "7",
    "-fill", "#E7C79F",
    "-annotate", `+${logoX}+${landscape ? 7 : 10}`, "SUNLESS",
    "-font", montserratFont,
    "-pointsize", String(landscape ? 10 : 11),
    "-kerning", "5",
    "-fill", "#D8E8EE",
    "-annotate", `+${logoX + 2}+${landscape ? 60 : 68}`, "BY JIMMY COCO®",
    "-font", montserratSemiboldFont,
    "-pointsize", String(landscape ? 16 : 17),
    "-kerning", "2",
    "-fill", "#FFFDF9",
    "-annotate", `+${professionalX}+${professionalY}`, "PROFESSIONAL TANNING SOLUTION",
    "-pointsize", String(l.eyebrowSize),
    "-kerning", "3",
    "-fill", "#E7C79F",
    "-annotate", `+${l.x}+${l.y}`, card.eyebrow,
    "-font", walbaumFont,
    "-pointsize", String(l.titleSize),
    "-kerning", "0",
    "-fill", "#FFFDF9",
  ];

  card.title.forEach((line, index) => {
    args.push("-annotate", `+${l.x}+${titleY + index * l.titleGap}`, line);
  });

  args.push(
    "-font", montserratFont,
    "-pointsize", String(l.subSize),
    "-kerning", "0",
    "-fill", "#D8E8EE",
  );
  subtitleLines.forEach((line, index) => {
    args.push("-annotate", `+${l.x}+${subtitleY + index * l.subGap}`, line);
  });

  args.push("-quality", "90", output);
  await run("magick", args, { maxBuffer: 1024 * 1024 * 8 });
}

async function photoLayer(card, l) {
  if (card.mode === "background") {
    return sharp(card.image).resize(l.photoW, l.photoH, { fit: "cover", position: card.position }).toBuffer();
  }

  if (card.mode === "product") {
    const product = await sharp(card.image)
      .resize(Math.round(l.photoW * .72), Math.round(l.photoH * .9), { fit: "contain", background: { r: 246, g: 241, b: 234, alpha: 1 } })
      .toBuffer();
    return sharp({ create: { width: l.photoW, height: l.photoH, channels: 3, background: "#F6F1EA" } })
      .composite([{ input: product, gravity: "center" }])
      .png()
      .toBuffer();
  }

  return sharp(card.image).resize(l.photoW, l.photoH, { fit: "cover", position: card.position }).toBuffer();
}

async function renderCard(card, format, size) {
  const { width, height } = size;
  const l = layout(format, width, height);
  const texture = await sharp(path.join(outputDir, "brand-texture-v1.png"))
    .resize(width, height, { fit: "cover", position: "centre" })
    .toBuffer();
  const photo = await photoLayer(card, l);
  const output = path.join(outputDir, `${card.id}-${format}-${width}x${height}.jpg`);
  const base = path.join("/tmp", `jimmycoco-${card.id}-${format}-base.png`);

  await sharp(texture)
    .composite([
      { input: photo, left: l.photoX, top: l.photoY },
      { input: overlaySvg(card, format, width, height, l), left: 0, top: 0 },
    ])
    .png()
    .toFile(base);
  await addTypography(base, output, card, format, l);
}

await Promise.all(cards.flatMap((card) => Object.entries(formats).map(([format, size]) => renderCard(card, format, size))));
console.log(`Generated ${cards.length * Object.keys(formats).length} social images in ${outputDir}`);
