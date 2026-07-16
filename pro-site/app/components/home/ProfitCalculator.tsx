import { useEffect, useMemo, useState } from "react";
import { gbp } from "../../lib/site";

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
  return (
    <div className="field">
      <label>{label} <output>{display}</output></label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

export function ProfitCalculator({ onMonthlyChange }: { onMonthlyChange: (value: number) => void }) {
  const [price, setPrice] = useState(25);
  const [tans, setTans] = useState(12);
  const [yieldPerLitre, setYieldPerLitre] = useState(27);
  const [units, setUnits] = useState(3);
  const [retailPrice, setRetailPrice] = useState(15);
  const [marginPercent, setMarginPercent] = useState(50);

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
              <Slider label="Your price per spray tan" value={price} min={15} max={60} display={gbp(price)} onChange={setPrice} />
              <Slider label="Spray tans per week" value={tans} min={1} max={60} display={`${tans}`} onChange={setTans} />
              <Slider label="Tans per litre" value={yieldPerLitre} min={25} max={30} display={`${yieldPerLitre}`} onChange={setYieldPerLitre} />
            </div>
            <div className="calc-group">
              <h3>On the shelf</h3>
              <Slider label="Retail add-ons per week" value={units} min={0} max={20} display={`${units}`} onChange={setUnits} />
              <Slider label="Avg retail price" value={retailPrice} min={10} max={79} display={gbp(retailPrice)} onChange={setRetailPrice} />
              <Slider label="Your retail margin" value={marginPercent} min={20} max={70} step={5} display={`${marginPercent}%`} onChange={setMarginPercent} />
            </div>
            <p className="note">Solution cost uses the standard £60 litre. Retail margin is illustrative — your exact trade terms are confirmed on your setup call.</p>
          </div>
          <div className="calc-out">
            <div className="ocard hero-num"><span>Estimated profit per month</span><b>{gbp(totals.month)}</b><small>{gbp(totals.year)} per year</small></div>
            <div className="ocard"><span>Profit per tan</span><b>{gbp(totals.profitPerTan, 2)}</b><small>solution cost {gbp(totals.costPerTan, 2)} per tan</small></div>
            <div className="ocard"><span>Weekly booth profit</span><b>{gbp(totals.boothWeek)}</b><small>on {gbp(totals.revenueWeek)} weekly revenue</small></div>
            <div className="ocard"><span>Weekly retail profit</span><b>{gbp(totals.retailWeek)}</b><small>the highest-intent moment: in the chair</small></div>
            <div className="ocard"><span>Litres you'll need</span><b>{(Math.round(totals.litresMonth * 10) / 10).toLocaleString("en-GB")}</b><small>per month, at your volume</small></div>
            <div className="calc-cta"><a className="btn btn-bronze" href="#trial">Start with a free trial</a><p>No lock-in, no pressure — the trial is yours to judge on your own clients first.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
