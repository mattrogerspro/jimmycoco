import { useRef } from "react";
import { Link, useFetcher } from "react-router";
import type { CalculatorReportActionResult } from "../../lib/calculator-report.server";
import { buildTrialHandoffPath, type Inputs, type Totals } from "../../lib/calculator";
import { track } from "../../lib/analytics";
import { useCurrency } from "./CurrencyContext";

const CALCULATOR_REPORT_PATH = "/api/calculator-report";

export function CalculatorReportModal({ input, totals }: { input: Inputs; totals: Totals }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fetcher = useFetcher<CalculatorReportActionResult>();
  const { money } = useCurrency();
  const submitting = fetcher.state !== "idle";
  const roundedLitres = totals.litresPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 1 });
  const trialHandoffPath = buildTrialHandoffPath({
    monthlyProfit: totals.netMonth,
    context: {
      tansPerWeek: input.tansPerWeek,
      tansPerLitre: input.tansPerLitre,
      litresPerMonth: totals.litresPerMonth,
    },
  });

  const open = () => {
    track("calculator_report_open", {
      tans_per_week: input.tansPerWeek,
      litres_per_month: Number(totals.litresPerMonth.toFixed(1)),
      monthly_net: Math.round(totals.netMonth),
    });
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button type="button" className="btn calc-report-trigger" onClick={open}>
        <span aria-hidden="true">✉</span> Email Me My Breakdown &amp; Profit Plan
      </button>
      <dialog
        className="calculator-report-dialog"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="calculator-report-shell">
          <form method="dialog">
            <button className="calculator-report-close" aria-label="Close profit plan form">×</button>
          </form>

          {fetcher.data?.ok ? (
            <div className="calculator-report-success" aria-live="polite">
              <span aria-hidden="true">✓</span>
              <p className="eyebrow">Report sent</p>
              <h2>Your numbers are on their way.</h2>
              <p>{fetcher.data.message}</p>
              <div className="calculator-report-upsell">
                <p>Your PDF is on its way. Would you like us to dispatch your free 100ml trial bottle now?</p>
                <div className="calculator-report-success-actions">
                  <Link
                    className="btn btn-bronze"
                    to={trialHandoffPath}
                    onClick={() => track("calculator_report_trial_upsell_click", {
                      tans_per_week: input.tansPerWeek,
                      litres_per_month: Number(totals.litresPerMonth.toFixed(1)),
                      monthly_net: Math.round(totals.netMonth),
                    })}
                  >
                    Yes — request my free 100ml trial
                  </Link>
                  <form method="dialog">
                    <button type="submit" className="calculator-report-dismiss">Not right now</button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <>
              <header>
                <p className="eyebrow">Save your calculation</p>
                <h2>Email my profit plan.</h2>
                <p>We’ll send a branded PDF with your room costs, margin levers and recommended next step.</p>
              </header>

              <div className="calculator-report-summary" aria-label="Calculation summary">
                <div><span>Estimated monthly profit</span><b>{money(totals.netMonth)}</b></div>
                <div><span>Solution needed</span><b>{roundedLitres}L/month</b></div>
              </div>

              <fetcher.Form
                method="post"
                action={CALCULATOR_REPORT_PATH}
                className="calculator-report-form"
                onSubmit={() => track("calculator_report_submit", {
                  tans_per_week: input.tansPerWeek,
                  litres_per_month: Number(totals.litresPerMonth.toFixed(1)),
                  monthly_net: Math.round(totals.netMonth),
                })}
              >
                <input type="hidden" name="calculation" value={JSON.stringify(input)} />
                <label>
                  <span>First name</span>
                  <input type="text" name="firstName" autoComplete="given-name" required maxLength={80} />
                </label>
                <label>
                  <span>Salon name</span>
                  <input type="text" name="salonName" autoComplete="organization" required maxLength={140} />
                </label>
                <label className="calculator-report-email">
                  <span>Email address</span>
                  <input type="email" name="email" autoComplete="email" required maxLength={254} />
                </label>
                {fetcher.data && !fetcher.data.ok ? <p className="calculator-report-error" role="alert">{fetcher.data.message}</p> : null}
                <button type="submit" className="btn btn-bronze calculator-report-submit" disabled={submitting}>
                  {submitting ? "Creating your PDF…" : "Email My PDF Profit Plan"}
                </button>
                <small>Your calculator remains free and ungated. We’ll only use these details to send this report and help with your professional enquiry.</small>
              </fetcher.Form>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
