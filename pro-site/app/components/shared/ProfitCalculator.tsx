import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { PRODUCT_PATH, gbp } from "../../lib/site";
import { debounceTrack, track, trackOnce } from "../../lib/analytics";
import { DEFAULTS, type Inputs, calculate, levers } from "../../lib/calculator";

export const CALCULATOR_PATH = "/tools/spray-tan-profit-calculator";
const CALCULATOR_BACKGROUND_SRCSET = [480, 768, 1080, 1440, 1920, 2560]
  .map((width) => `/assets/site/calculator-background-${width}.webp ${width}w`)
  .join(", ");

type Mode = "compact" | "full";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  hint?: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step = 1, display, hint, onChange }: SliderProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <output>{display}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

type Props = {
  mode?: Mode;
  /** Reports the headline figure for the mode — gross when compact, net when full. */
  onMonthlyChange?: (value: number) => void;
};

export function ProfitCalculator({ mode = "compact", onMonthlyChange }: Props) {
  const full = mode === "full";
  const [input, setInput] = useState<Inputs>(DEFAULTS);

  // One debounced reporter per control, so dragging sends the settled value only.
  const reportChange = useRef(debounceTrack(700)).current;
  const reportResult = useRef(debounceTrack(1200)).current;
  // Stays false until they touch a control, so the default numbers never report as a result.
  const engaged = useRef(false);
  const leversRef = useRef<HTMLDivElement | null>(null);

  const set = useCallback(
    (key: keyof Inputs, control: string) => (next: number) => {
      setInput((current) => ({ ...current, [key]: next }));
      engaged.current = true;
      trackOnce("calculator_start", "calculator_start", { section: "calculator", mode });
      reportChange("calculator_adjust", { control, control_value: next, mode });
    },
    [mode, reportChange],
  );

  const totals = useMemo(() => calculate(input), [input]);
  const leverRows = useMemo(() => (full ? levers(input) : []), [full, input]);

  const headline = full ? totals.netMonth : totals.grossMonth;
  useEffect(() => onMonthlyChange?.(headline), [headline, onMonthlyChange]);

  // The outcome the visitor actually saw, once they stop moving things.
  useEffect(() => {
    if (!engaged.current) return;
    reportResult("calculator_result", {
      mode,
      monthly_gross: Math.round(totals.grossMonth),
      monthly_net: Math.round(totals.netMonth),
      yearly_net: Math.round(totals.netYear),
      price_per_tan: input.pricePerTan,
      tans_per_week: input.tansPerWeek,
      tans_per_bottle: input.tansPerLitre,
      retail_units: input.retailUnitsPerWeek,
      minutes_per_tan: input.minutesPerTan,
      room_fixed_costs: input.roomFixedCostsMonthly,
    });
  }, [input, mode, reportResult, totals]);

  // Fires once when the levers panel is actually seen — the feature we most
  // want to know is being used.
  useEffect(() => {
    const node = leversRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackOnce("calculator_lever_view", "calculator_lever_view", { section: "calculator" });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`calc calc-${mode}`} id="calculator">
      {!full && (
        <picture className="calc-background" aria-hidden="true">
          <img
            src="/assets/site/calculator-background-2560.webp"
            srcSet={CALCULATOR_BACKGROUND_SRCSET}
            sizes="100vw"
            alt=""
            width="2560"
            height="1100"
            loading="lazy"
            decoding="async"
          />
        </picture>
      )}
      <div className="wrap">
        <div className="calc-head">
          <div>
            <p className="eyebrow">The salon maths</p>
            <h2>{full ? "Spray tan profit calculator." : "Calculate your tanning profit."}</h2>
          </div>
          <p className="sub">
            {full
              ? "Your prices, your volume, your premises. In pounds, with every assumption showing — change any of them."
              : "Set your treatment price, weekly bookings and likely retail add-ons. We’ll do the rest using standard salon assumptions."}
          </p>
        </div>

        <div className="calc-grid">
          <div className="calc-in">
            <div className="calc-group">
              <h3>In the booth</h3>
              <Slider label="Your price per spray tan" value={input.pricePerTan} min={15} max={60} display={gbp(input.pricePerTan)} onChange={set("pricePerTan", "price_per_tan")} />
              <Slider label="Spray tans per week" value={input.tansPerWeek} min={1} max={60} display={`${input.tansPerWeek}`} onChange={set("tansPerWeek", "tans_per_week")} />
              {full && <Slider label="Tans per litre" value={input.tansPerLitre} min={24} max={32} display={`${input.tansPerLitre}`} hint="Measure your own — mark the bottle, count the tans, divide." onChange={set("tansPerLitre", "tans_per_bottle")} />}
              {full && <Slider label="Price per litre" value={input.litrePrice} min={40} max={90} display={gbp(input.litrePrice)} onChange={set("litrePrice", "litre_price")} />}
            </div>

            {full && (
              <div className="calc-group">
                <h3>Consumables</h3>
                <Slider label="Disposables per tan" value={input.disposablesPerTan} min={0} max={2} step={0.05} display={gbp(input.disposablesPerTan, 2)} hint="Hairnet, sticky feet, briefs, barrier cream, wipes." onChange={set("disposablesPerTan", "disposables")} />
                <Slider label="Filters, liners and laundry per tan" value={input.sundriesPerTan} min={0} max={1} step={0.05} display={gbp(input.sundriesPerTan, 2)} onChange={set("sundriesPerTan", "sundries")} />
              </div>
            )}

            {full && (
              <div className="calc-group">
                <h3>Chair time</h3>
                <Slider label="Minutes per tan, door to door" value={input.minutesPerTan} min={15} max={45} display={`${input.minutesPerTan} min`} hint="Consultation, prep, treatment, clean-down and reset." onChange={set("minutesPerTan", "minutes_per_tan")} />
                <Slider label="Therapist hourly rate" value={input.hourlyRate} min={0} max={25} step={0.01} display={gbp(input.hourlyRate, 2)} hint="Set to £0 if you do the tans yourself. Employer costs are added on top." onChange={set("hourlyRate", "hourly_rate")} />
              </div>
            )}

            {full && (
              <div className="calc-group">
                <h3>Premises</h3>
                <Slider label="Room fixed costs per month" value={input.roomFixedCostsMonthly} min={0} max={1500} step={25} display={gbp(input.roomFixedCostsMonthly)} hint="The share of rent, rates, utilities, insurance and software that belongs to tanning." onChange={set("roomFixedCostsMonthly", "room_fixed_costs")} />
              </div>
            )}

            <div className="calc-group">
              <h3>On the shelf</h3>
              <Slider label="Retail add-ons per week" value={input.retailUnitsPerWeek} min={0} max={20} display={`${input.retailUnitsPerWeek}`} onChange={set("retailUnitsPerWeek", "retail_units_per_week")} />
              {full && <Slider label="Avg retail price" value={input.retailPrice} min={10} max={59} display={gbp(input.retailPrice)} onChange={set("retailPrice", "retail_price")} />}
              {full && <Slider label="Your retail margin" value={input.retailMarginPercent} min={40} max={60} step={5} display={`${input.retailMarginPercent}%`} onChange={set("retailMarginPercent", "retail_margin")} />}
              {full && <Slider label="Card processing rate" value={input.cardRatePercent} min={0} max={3} step={0.1} display={`${input.cardRatePercent.toFixed(1)}%`} onChange={set("cardRatePercent", "card_rate")} />}
            </div>

            <p className="note">
              {full
                ? "Retail margin is illustrative — your exact trade terms are confirmed on your setup call. Every assumption is listed below the calculator."
                : "Quick estimate: £60 per litre, 28 tans per litre, £18 average retail item and 50% illustrative retail margin. Open the full calculator to change every cost."}
            </p>
          </div>

          <div className="calc-out">
            {full ? (
              <>
                <div className="ocard hero-num">
                  <span>Estimated profit per month</span>
                  <b>{gbp(totals.netMonth)}</b>
                  <small>{gbp(totals.netYear)} per year, after labour and premises</small>
                </div>
                <div className="ocard">
                  <span>Before labour and premises</span>
                  <b>{gbp(totals.grossMonth)}</b>
                  <small>what the booth and shelf contribute</small>
                </div>
                <div className="ocard">
                  <span>Profit per tan</span>
                  <b>{gbp(totals.netPerTan, 2)}</b>
                  <small>
                    consumables {gbp(totals.consumablesPerTan, 2)} · chair time {gbp(totals.labourPerTan, 2)} · premises {gbp(totals.overheadPerTan, 2)}
                  </small>
                </div>
                <div className="ocard">
                  <span>Weekly booth profit</span>
                  <b>{gbp(totals.boothNetWeek)}</b>
                  <small>on {gbp(input.pricePerTan * input.tansPerWeek)} weekly revenue</small>
                </div>
                <div className="ocard">
                  <span>Weekly retail profit</span>
                  <b>{gbp(totals.retailProfitWeek)}</b>
                  <small>the highest-intent moment: in the chair</small>
                </div>
                <div className="ocard">
                  <span>Litres you'll need</span>
                  <b>{(Math.round(totals.litresPerMonth * 10) / 10).toLocaleString("en-GB")}</b>
                  <small>per month, at your volume</small>
                </div>
              </>
            ) : (
              <>
                <div className="ocard hero-num">
                  <span>Estimated monthly gross profit</span>
                  <b>{gbp(totals.grossMonth)}</b>
                  <small>from the booth and shelf · before labour and premises</small>
                </div>
                <div className="ocard">
                  <span>Contribution per tan</span>
                  <b>{gbp(totals.grossPerTan, 2)}</b>
                  <small>after solution, consumables and card fees</small>
                </div>
                <div className="ocard">
                  <span>Estimated weekly gross profit</span>
                  <b>{gbp(totals.boothGrossWeek + totals.retailProfitWeek)}</b>
                  <small>booth and retail combined</small>
                </div>
                <div className="ocard">
                  <span>Retail profit per week</span>
                  <b>{gbp(totals.retailProfitWeek)}</b>
                  <small>based on £18 items at 50% margin</small>
                </div>
                <div className="ocard">
                  <span>Litres needed per month</span>
                  <b>{(Math.round(totals.litresPerMonth * 10) / 10).toLocaleString("en-GB")}</b>
                  <small>at 28 full-body tans per litre</small>
                </div>
              </>
            )}

            <div className="calc-cta">
              {full ? (
                <>
                  <Link className="btn btn-bronze" to={PRODUCT_PATH}>
                    Order the litre — £60
                  </Link>
                  <Link className="btn btn-outline-light" to="/#trial">
                    Start with a free trial
                  </Link>
                  <p>Ready now or trial first—the next step is yours.</p>
                </>
              ) : (
                <>
                  <Link className="btn btn-bronze" to={CALCULATOR_PATH}>
                    Open the full calculator
                  </Link>
                  <a className="btn btn-outline-light" href="#trial">
                    Start with a free trial
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {full && (
          <div className="calc-levers" ref={leversRef}>
            <div className="calc-levers-head">
              <h3>What actually moves the number</h3>
              <p>At your figures, one change at a time, over a year.</p>
            </div>
            <table className="levers-table">
              <thead>
                <tr>
                  <th scope="col">Change</th>
                  <th scope="col">Extra profit per year</th>
                </tr>
              </thead>
              <tbody>
                {leverRows.map((lever) => (
                  <tr key={lever.id}>
                    <th scope="row">
                      {lever.label}
                      <small>{lever.note}</small>
                    </th>
                    <td>{gbp(lever.annual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Read it from the bottom. For most realistic figures, the price you pay per litre is the
              smallest lever available to you — and one client lost to a poor result costs more than a
              year of the saving.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
