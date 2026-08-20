import { calculate, DEFAULTS, levers, type Inputs } from "./calculator";
import { renderCalculatorReportPdf } from "./calculator-report-pdf.server";
import { professionalOrderRecommendation } from "./order-pricing";
import { emitResellerEventSafely, INTERNAL_NOTICE_ADDRESS } from "./reseller-events.server";
import { isPlausibleEmail, submitApplication } from "./resellers.server";
import { isSameOriginPost } from "./supabase.server";

export type CalculatorReportActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const REPORT_SOURCE = "pro-site-calculator-report";
const DEFAULT_FROM = "Sunless Partnerships <partnerships@email.jimmycoco.pro>";
const DEFAULT_REPLY_TO = "partnerships@email.jimmycoco.pro";

const inputRanges: Record<keyof Inputs, readonly [number, number]> = {
  pricePerTan: [15, 60],
  tansPerWeek: [1, 60],
  tansPerLitre: [24, 32],
  litrePrice: [40, 90],
  disposablesPerTan: [0, 2],
  sundriesPerTan: [0, 1],
  minutesPerTan: [15, 45],
  hourlyRate: [0, 25],
  roomFixedCostsMonthly: [0, 1500],
  retailUnitsPerWeek: [0, 20],
  retailPrice: [10, 59],
  retailMarginPercent: [40, 60],
  cardRatePercent: [0, 3],
};

function normaliseInputs(value: unknown): Inputs | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<Record<keyof Inputs, unknown>>;
  const output = { ...DEFAULTS };
  for (const key of Object.keys(inputRanges) as Array<keyof Inputs>) {
    const number = Number(source[key]);
    if (!Number.isFinite(number)) return null;
    const [minimum, maximum] = inputRanges[key];
    output[key] = Math.max(minimum, Math.min(maximum, number));
  }
  return output;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeFilename(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54);
  return `${slug || "salon"}-spray-tan-profit-plan.pdf`;
}

function recommendationFor(input: Inputs) {
  const litresPerMonth = calculate(input).litresPerMonth;
  const pricing = professionalOrderRecommendation(litresPerMonth);
  const orderTitle = `Order ${pricing.quantity}L ${pricing.tier.name} ${pricing.quantity === 1 ? "Litre" : "Pack"} - £${pricing.total} (£${pricing.unitPrice}/L)`;
  const orderUrl = `https://www.jimmycoco.pro/products/malibu-professional-spray-1l?qty=${pricing.quantity}#configure-solution`;

  if (input.tansPerWeek >= 15) {
    return {
      quantity: pricing.quantity,
      title: orderTitle,
      detail: `Your volume points to ${litresPerMonth.toFixed(1)} litres a month, rounded up to ${pricing.quantity} whole litres at the ${pricing.tier.name} rate of £${pricing.unitPrice} per litre.`,
      url: orderUrl,
    };
  }
  return {
    quantity: pricing.quantity,
    title: "Claim your complimentary 100ml trial box",
    detail: `Test the colour, application and fade on a real client first. Your current bookings indicate a ${pricing.quantity}L ${pricing.tier.name} order at £${pricing.unitPrice} per litre when you are ready.`,
    url: "https://www.jimmycoco.pro/#trial",
  };
}

function reportEmailHtml(input: {
  firstName: string;
  salonName: string;
  monthlyProfit: string;
  litresPerMonth: string;
  recommendationTitle: string;
  recommendationUrl: string;
}) {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#f4f0eb;color:#1d1815;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px 18px"><section style="background:#fff;padding:34px;border-top:6px solid #a46138"><p style="margin:0 0 24px;color:#0d2c37;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Sunless by Jimmy Coco Professional</p><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px;font-weight:400">Your spray tan profit plan</h1><p style="margin:0;color:#514a45;line-height:1.65">Hello ${escapeHtml(input.firstName)},<br><br>Your personalised breakdown for <strong>${escapeHtml(input.salonName)}</strong> is attached. At the figures you entered, the model estimates <strong>${escapeHtml(input.monthlyProfit)} profit per month</strong> and approximately <strong>${escapeHtml(input.litresPerMonth)} litres of solution per month</strong>.</p><div style="margin:28px 0;padding:22px;background:#f4f0eb"><span style="display:block;margin-bottom:8px;color:#a46138;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Recommended next step</span><strong style="font-size:18px">${escapeHtml(input.recommendationTitle)}</strong><br><a href="${escapeHtml(input.recommendationUrl)}" style="display:inline-block;margin-top:16px;padding:13px 18px;background:#a46138;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Continue with your plan</a></div><p style="margin:0;color:#514a45;line-height:1.65">You can return to the calculator at any time and change every assumption. The report is an illustrative commercial model, not an earnings forecast.</p></section></main></body></html>`;
}

async function sendCalculatorReportEmail(options: {
  applicationId: string;
  firstName: string;
  salonName: string;
  email: string;
  pdf: Uint8Array;
  monthlyProfit: string;
  litresPerMonth: string;
  recommendationTitle: string;
  recommendationUrl: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Calculator report delivery is not configured. Set RESEND_API_KEY.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `calculator-report-${options.applicationId}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [options.email],
      bcc: [INTERNAL_NOTICE_ADDRESS],
      reply_to: process.env.RESEND_REPLY_TO || DEFAULT_REPLY_TO,
      subject: `${options.firstName}, your spray tan profit plan`,
      html: reportEmailHtml(options),
      text: `Hello ${options.firstName},\n\nYour personalised spray tan profit plan for ${options.salonName} is attached.\n\nEstimated monthly profit: ${options.monthlyProfit}\nEstimated litres per month: ${options.litresPerMonth}\n\nRecommended next step: ${options.recommendationTitle}\n${options.recommendationUrl}\n\nThis is an illustrative commercial model, not an earnings forecast.`,
      attachments: [
        {
          filename: safeFilename(options.salonName),
          content: Buffer.from(options.pdf).toString("base64"),
        },
      ],
      tags: [
        { name: "type", value: "calculator_report" },
        { name: "application_id", value: options.applicationId },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!response.ok || !payload.id) {
    throw new Error(`Could not send calculator report: ${payload.message ?? payload.name ?? `Resend returned ${response.status}`}`);
  }
  return payload.id;
}

export async function handleCalculatorReportSubmit(request: Request): Promise<CalculatorReportActionResult> {
  if (!isSameOriginPost(request)) {
    return { ok: false, message: "That request could not be verified. Please try again." };
  }

  const form = await request.formData();
  const firstName = String(form.get("firstName") ?? "").trim().slice(0, 80);
  const salonName = String(form.get("salonName") ?? "").trim().slice(0, 140);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  if (!firstName || !salonName || !email) {
    return { ok: false, message: "Please enter your first name, salon name and email address." };
  }
  if (!isPlausibleEmail(email)) {
    return { ok: false, message: "That email address does not look right - please check it." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(form.get("calculation") ?? ""));
  } catch {
    return { ok: false, message: "Your calculation could not be read. Please close this window and try again." };
  }
  const input = normaliseInputs(parsed);
  if (!input) {
    return { ok: false, message: "Your calculation contains an invalid value. Please adjust a slider and try again." };
  }

  const totals = calculate(input);
  const leverRows = levers(input);
  const recommendation = recommendationFor(input);
  const reportMetadata = {
    calculator_inputs: input,
    calculator_totals: totals,
    calculator_levers: leverRows,
    recommendation,
    report_format: "pdf",
    user_agent: request.headers.get("User-Agent") ?? null,
  };

  let applicationId: string;
  try {
    applicationId = await submitApplication({
      businessName: salonName,
      contactName: firstName,
      email,
      businessType: "Salon",
      wantsTrial: false,
      source: REPORT_SOURCE,
      message: `Calculator report requested. Estimated monthly profit £${Math.round(totals.netMonth).toLocaleString("en-GB")}; ${totals.litresPerMonth.toFixed(1)} litres per month; ${input.tansPerWeek} tans per week.`,
      metadata: reportMetadata,
    });
  } catch (error) {
    console.error("[calculator-report] lead storage failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, message: "We could not save your report request just now. Please try again." };
  }

  console.info("[calculator-report] lead stored", { applicationId });

  const pdf = await renderCalculatorReportPdf({
    firstName,
    salonName,
    input,
    totals,
    levers: leverRows,
    recommendation,
  });
  const monthlyProfit = `£${Math.round(totals.netMonth).toLocaleString("en-GB")}`;
  const litresPerMonth = totals.litresPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 1 });

  let resendEmailId: string;
  try {
    resendEmailId = await sendCalculatorReportEmail({
      applicationId,
      firstName,
      salonName,
      email,
      pdf,
      monthlyProfit,
      litresPerMonth,
      recommendationTitle: recommendation.title,
      recommendationUrl: recommendation.url,
    });
  } catch (error) {
    console.error("[calculator-report] delivery failed", {
      applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      message: "We saved your breakdown, but the email could not be sent just now. Please try again shortly.",
    };
  }

  console.info("[calculator-report] delivered", { applicationId, resendEmailId });

  await emitResellerEventSafely({
    trigger: "reseller_application_internal_notice",
    eventId: `calculator-report-${applicationId}-internal`,
    contact: { email: INTERNAL_NOTICE_ADDRESS, business_name: "Sunless by Jimmy Coco", market: "UK" },
    context: {
      REQUEST_TYPE: "Calculator report",
      APPLICANT_NAME: firstName,
      APPLICANT_EMAIL: email,
      BUSINESS_NAME: salonName,
      SUBMISSION_SUMMARY: `${input.tansPerWeek} tans per week; ${litresPerMonth} litres per month; ${monthlyProfit} estimated monthly profit.`,
      APPLICATION_ID: applicationId,
      RESEND_EMAIL_ID: resendEmailId,
    },
  });

  return { ok: true, message: `Your profit plan has been emailed to ${email}.` };
}
