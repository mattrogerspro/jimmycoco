import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Inputs, Lever, Totals } from "./calculator";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const INK = rgb(0.10, 0.08, 0.07);
const MUTED = rgb(0.39, 0.35, 0.32);
const CREAM = rgb(0.96, 0.94, 0.91);
const BRONZE = rgb(0.64, 0.37, 0.20);
const DEEP = rgb(0.05, 0.17, 0.22);
const WHITE = rgb(1, 1, 1);

const money = (value: number, digits = 0) =>
  `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

function safePdfText(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E£]/g, "");
}

function wrappedLines(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = safePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrapped(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    font: PDFFont;
    size: number;
    lineHeight?: number;
    color?: ReturnType<typeof rgb>;
  },
) {
  const lineHeight = options.lineHeight ?? options.size * 1.35;
  const lines = wrappedLines(text, options.font, options.size, options.width);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: options.x,
      y: options.y - index * lineHeight,
      font: options.font,
      size: options.size,
      color: options.color ?? INK,
    });
  });
  return options.y - lines.length * lineHeight;
}

function addLink(page: PDFPage, url: string, x: number, y: number, width: number, height: number) {
  const context = page.doc.context;
  const annotation = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    }),
  );
  page.node.addAnnot(annotation);
}

function drawHeader(page: PDFPage, fonts: { serif: PDFFont; sans: PDFFont; bold: PDFFont }, pageNumber: number) {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 116, width: PAGE_WIDTH, height: 116, color: DEEP });
  page.drawText("SUNLESS", { x: MARGIN, y: PAGE_HEIGHT - 54, font: fonts.serif, size: 25, color: WHITE });
  page.drawText("B Y  J I M M Y  C O C O", { x: MARGIN + 1, y: PAGE_HEIGHT - 73, font: fonts.bold, size: 7, color: rgb(0.84, 0.69, 0.55) });
  page.drawText("S A L O N  P R O F I T  P L A N", { x: PAGE_WIDTH - MARGIN - 154, y: PAGE_HEIGHT - 61, font: fonts.bold, size: 6.5, color: WHITE });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: PAGE_WIDTH - MARGIN - 12, y: 27, font: fonts.sans, size: 8, color: MUTED });
}

function drawMetricCard(page: PDFPage, x: number, y: number, width: number, label: string, value: string, fonts: { sans: PDFFont; bold: PDFFont }) {
  page.drawRectangle({ x, y, width, height: 72, color: CREAM, borderColor: rgb(0.87, 0.83, 0.78), borderWidth: 0.75 });
  page.drawText(safePdfText(label.toUpperCase()), { x: x + 14, y: y + 50, font: fonts.bold, size: 7.5, color: BRONZE });
  page.drawText(safePdfText(value), { x: x + 14, y: y + 18, font: fonts.bold, size: 22, color: INK });
}

function drawRow(page: PDFPage, y: number, label: string, value: string, fonts: { sans: PDFFont; bold: PDFFont }, emphasize = false) {
  page.drawLine({ start: { x: MARGIN, y: y - 7 }, end: { x: PAGE_WIDTH - MARGIN, y: y - 7 }, thickness: 0.5, color: rgb(0.86, 0.82, 0.78) });
  page.drawText(safePdfText(label), { x: MARGIN, y: y + 5, font: emphasize ? fonts.bold : fonts.sans, size: 10.5, color: emphasize ? INK : MUTED });
  const safeValue = safePdfText(value);
  const font = emphasize ? fonts.bold : fonts.sans;
  const size = emphasize ? 11.5 : 10.5;
  page.drawText(safeValue, { x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(safeValue, size), y: y + 5, font, size, color: emphasize ? BRONZE : INK });
}

export type CalculatorReportPdfInput = {
  firstName: string;
  salonName: string;
  input: Inputs;
  totals: Totals;
  levers: Lever[];
  recommendation: { title: string; detail: string; url: string };
};

export async function renderCalculatorReportPdf(report: CalculatorReportPdfInput) {
  const document = await PDFDocument.create();
  document.setTitle(`${report.salonName} - Spray Tan Profit Plan`);
  document.setAuthor("Sunless by Jimmy Coco");
  document.setSubject("Personal spray tan profitability breakdown");
  document.setCreator("Sunless by Jimmy Coco Professional");
  document.setProducer("Sunless by Jimmy Coco Professional");
  document.setCreationDate(new Date());

  const fonts = {
    sans: await document.embedFont(StandardFonts.Helvetica),
    bold: await document.embedFont(StandardFonts.HelveticaBold),
    serif: await document.embedFont(StandardFonts.TimesRoman),
    italic: await document.embedFont(StandardFonts.TimesRomanItalic),
  };

  const page1 = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page1, fonts, 1);
  page1.drawText("Y O U R  S P R A Y  T A N  P R O F I T  P L A N", { x: MARGIN, y: 684, font: fonts.bold, size: 7, color: BRONZE });
  page1.drawText(safePdfText(report.salonName), { x: MARGIN, y: 641, font: fonts.serif, size: 32, color: INK });
  page1.drawText(`Prepared for ${safePdfText(report.firstName)} · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, { x: MARGIN, y: 617, font: fonts.sans, size: 10, color: MUTED });

  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - 20) / 3;
  drawMetricCard(page1, MARGIN, 513, cardWidth, "Profit per month", money(report.totals.netMonth), fonts);
  drawMetricCard(page1, MARGIN + cardWidth + 10, 513, cardWidth, "Profit per tan", money(report.totals.netPerTan, 2), fonts);
  drawMetricCard(page1, MARGIN + (cardWidth + 10) * 2, 513, cardWidth, "Litres per month", report.totals.litresPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 1 }), fonts);

  page1.drawText("T H E  C O M M E R C I A L  S N A P S H O T", { x: MARGIN, y: 470, font: fonts.bold, size: 7, color: INK });
  drawRow(page1, 437, "Spray tans per week", report.input.tansPerWeek.toLocaleString("en-GB"), fonts);
  drawRow(page1, 405, "Treatment price", money(report.input.pricePerTan), fonts);
  drawRow(page1, 373, "Estimated annual profit", money(report.totals.netYear), fonts);
  drawRow(page1, 341, "Weekly booth profit", money(report.totals.boothNetWeek), fonts);
  drawRow(page1, 309, "Weekly retail profit", money(report.totals.retailProfitWeek), fonts);

  page1.drawRectangle({ x: MARGIN, y: 162, width: PAGE_WIDTH - MARGIN * 2, height: 112, color: DEEP });
  page1.drawText("Y O U R  N E X T  S T E P", { x: MARGIN + 20, y: 245, font: fonts.bold, size: 6.5, color: rgb(0.84, 0.69, 0.55) });
  page1.drawText(safePdfText(report.recommendation.title), { x: MARGIN + 20, y: 216, font: fonts.serif, size: 21, color: WHITE });
  drawWrapped(page1, report.recommendation.detail, { x: MARGIN + 20, y: 193, width: PAGE_WIDTH - MARGIN * 2 - 40, font: fonts.sans, size: 9.5, lineHeight: 13, color: rgb(0.85, 0.87, 0.87) });
  const linkLabel = safePdfText(report.recommendation.url);
  page1.drawText(linkLabel, { x: MARGIN + 20, y: 141, font: fonts.bold, size: 9, color: BRONZE });
  addLink(page1, report.recommendation.url, MARGIN + 18, 136, fonts.bold.widthOfTextAtSize(linkLabel, 9) + 6, 16);

  page1.drawText("Illustrative model, not a forecast. Replace assumptions with actual salon figures and review regularly.", { x: MARGIN, y: 88, font: fonts.sans, size: 7.7, color: MUTED });

  const page2 = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page2, fonts, 2);
  page2.drawText("W H E R E  E A C H  T R E A T M E N T  G O E S", { x: MARGIN, y: 683, font: fonts.bold, size: 7, color: BRONZE });
  page2.drawText("Cost and margin breakdown", { x: MARGIN, y: 642, font: fonts.serif, size: 29, color: INK });
  page2.drawText(`Based on a ${money(report.input.pricePerTan)} treatment and ${report.input.tansPerWeek} bookings each week.`, { x: MARGIN, y: 618, font: fonts.sans, size: 10, color: MUTED });

  drawRow(page2, 570, "Solution per tan", `-${money(report.totals.solutionPerTan, 2)}`, fonts);
  drawRow(page2, 538, "Disposables, filters and laundry", `-${money(report.input.disposablesPerTan + report.input.sundriesPerTan, 2)}`, fonts);
  drawRow(page2, 506, "Card processing", `-${money(report.totals.cardFeePerTan, 2)}`, fonts);
  drawRow(page2, 474, "Chair time, loaded", `-${money(report.totals.labourPerTan, 2)}`, fonts);
  drawRow(page2, 442, "Share of premises", `-${money(report.totals.overheadPerTan, 2)}`, fonts);
  drawRow(page2, 410, "Profit per tan", money(report.totals.netPerTan, 2), fonts, true);

  page2.drawText("W H A T  M O V E S  T H E  N U M B E R", { x: MARGIN, y: 352, font: fonts.bold, size: 7, color: BRONZE });
  page2.drawText("Annual value at your figures", { x: MARGIN, y: 320, font: fonts.serif, size: 23, color: INK });
  report.levers.slice(0, 5).forEach((lever, index) => {
    drawRow(page2, 278 - index * 34, lever.label, `+${money(lever.annual)}`, fonts, index === 0);
  });

  page2.drawRectangle({ x: MARGIN, y: 60, width: PAGE_WIDTH - MARGIN * 2, height: 72, color: CREAM });
  page2.drawText("T E S T  T H E  C O L O U R  O N  A  R E A L  C L I E N T", { x: MARGIN + 16, y: 105, font: fonts.bold, size: 6.3, color: BRONZE });
  page2.drawText("Claim your complimentary 100ml professional sample", { x: MARGIN + 16, y: 82, font: fonts.bold, size: 12, color: INK });
  const trialUrl = "https://www.jimmycoco.pro/#trial";
  page2.drawText(trialUrl, { x: PAGE_WIDTH - MARGIN - fonts.sans.widthOfTextAtSize(trialUrl, 8), y: 82, font: fonts.sans, size: 8, color: BRONZE });
  addLink(page2, trialUrl, PAGE_WIDTH - MARGIN - fonts.sans.widthOfTextAtSize(trialUrl, 8) - 3, 77, fonts.sans.widthOfTextAtSize(trialUrl, 8) + 6, 15);

  return document.save();
}
