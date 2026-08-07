import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { gbp } from "../../lib/site";
import { debounceTrack, track, trackOnce } from "../../lib/analytics";
import { PRODUCT_PATH } from "../../lib/site";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step = 1, display, onChange }: SliderProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label} <output>{display}</output></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={display} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

export function ProfitCalculator({ onMonthlyChange }: { onMonthlyChange: (value: number) => void }) {
  const [price, setPrice] = useState(25);
  const [tans, setTans] = useState(12);
  const [yieldPerLitre, setYieldPerLitre] = useState(28);
  const [units, setUnits] = useState(3);
  const [retailPrice, setRetailPrice] = useState(15);
  const [marginPercent, setMarginPercent] = useState(50);

  // One debounced reporter per control, so dragging sends the settled value only.
  const reportChange = useRef(debounceTrack(700)).current;
  const reportResult = useRef(debounceTrack(1200)).current;

  const trackControl = useCallback(
    (control: string, value: number, setter: (next: number) => void) => (next: number) => {
      setter(next);
      trackOnce("calculator_start", "calculator_start", { section: "calculator" });
      reportChange("calculator_adjust", { control, control_value: next });
    },
    [reportChange],
  );

  const totals = useMemo(() => {
    const costPerTan = 60 / yieldPerLitre;
    const profitPerTan = price - costPerTan;
    const boothWeek = profitPerTan * tans;
    const revenueWeek = price * tans;
    const retailWeek = units * retailPrice * (marginPercent / 100);
    const weekTotal = boothWeek + retailWeek;
    return {
      costPerTan,
      profitPerTan,
      boothWeek,
      revenueWeek,
      retailWeek,
      month: weekTotal * 52 / 12,
      year: weekTotal * 52,
      litresMonth: (tans * 52 / 12) / yieldPerLitre,
    };
  }, [marginPercent, price, retailPrice, tans, units, yieldPerLitre]);

  useEffect(() => onMonthlyChange(totals.month), [onMonthlyChange, totals.month]);

  // The outcome the visitor actually saw, once they stop moving things.
  useEffect(() => {
    reportResult("calculator_result", {
      monthly_profit: Math.round(totals.month),
      yearly_profit: Math.round(totals.year),
      price_per_tan: price,
      tans_per_week: tans,
      tans_per_bottle: yieldPerLitre,
      retail_units: units,
    });
  }, [price, reportResult, retailPrice, tans, totals.month, totals.year, units, yieldPerLitre]);

  return (
    <section className="calc" id="calculator">
      <div className="wrap">
        <div className="calc-head">
          <div><p className="eyebrow">The salon maths</p><h2>Calculate your tanning profit.</h2></div>
          <p className="sub">Your prices, your volume — see what the booth and the shelf earn together. Adjust everything to match your salon.</p>
        </div>
        <div className="calc-grid">
          <div className="calc-in">
            <div className="calc-group">
              <h3>In the booth</h3>
              <Slider label="Your price per spray tan" value={price} min={15} max={60} display={gbp(price)} onChange={trackControl("price_per_tan", price, setPrice)} />
              <Slider label="Spray tans per week" value={tans} min={1} max={60} display={`${tans}`} onChange={trackControl("tans_per_week", tans, setTans)} />
              <Slider label="Tans per bottle" value={yieldPerLitre} min={24} max={32} display={`${yieldPerLitre}`} onChange={trackControl("tans_per_bottle", yieldPerLitre, setYieldPerLitre)} />
            </div>
            <div className="calc-group">
              <h3>On the shelf</h3>
              <Slider label="Retail add-ons per week" value={units} min={0} max={20} display={`${units}`} onChange={trackControl("retail_units_per_week", units, setUnits)} />
              <Slider label="Avg retail price" value={retailPrice} min={10} max={79} display={gbp(retailPrice)} onChange={trackControl("retail_price", retailPrice, setRetailPrice)} />
              <Slider label="Your retail margin" value={marginPercent} min={20} max={70} step={5} display={`${marginPercent}%`} onChange={trackControl("retail_margin", marginPercent, setMarginPercent)} />
            </div>
            <p className="note">Solution cost uses the standard £60 litre. Retail margin is illustrative — your exact trade terms are confirmed on your setup call.</p>
          </div>
          <div className="calc-out">
            <div className="ocard hero-num"><span>Estimated profit per month</span><b>{gbp(totals.month)}</b><small>{gbp(totals.year)} per year</small></div>
            <div className="ocard"><span>Profit per tan</span><b>{gbp(totals.profitPerTan, 2)}</b><small>solution cost {gbp(totals.costPerTan, 2)} per tan</small></div>
            <div className="ocard"><span>Weekly booth profit</span><b>{gbp(totals.boothWeek)}</b><small>on {gbp(totals.revenueWeek)} weekly revenue</small></div>
            <div className="ocard"><span>Weekly retail profit</span><b>{gbp(totals.retailWeek)}</b><small>the highest-intent moment: in the chair</small></div>
            <div className="ocard"><span>Litres you'll need</span><b>{(Math.round(totals.litresMonth * 10) / 10).toLocaleString("en-GB")}</b><small>per month, at your volume</small></div>
            <div className="calc-cta"><Link className="btn btn-bronze" to={PRODUCT_PATH}>Order the litre — £60</Link><a className="btn btn-outline-light" href="#trial">Start with a free trial</a><p>Ready now or trial first—the next step is yours.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
