/**
 * Design reminder — Editorial Currency Layer: USD is a calm, explicitly
 * non-binding trade utility. It must never resemble a market ticker or
 * disguise a GBP reference as a fixed US offer.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { gbp } from "../../lib/site";

export type DisplayCurrency = "GBP" | "USD";
type FxStatus = "idle" | "loading" | "ready" | "stale" | "unavailable";
type FxRate = { rate: number; date: string; fetchedAt: string };

type CurrencyContextValue = {
  currency: DisplayCurrency;
  isUsd: boolean;
  rate: FxRate | null;
  status: FxStatus;
  setCurrency: (currency: DisplayCurrency) => void;
  money: (value: number, decimals?: number) => string;
  baseReference: (value: number, decimals?: number) => string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const FX_ENDPOINT = "/api/fx-rate";
const CURRENCY_KEY = "jimmy-coco-display-currency:v1";
const RATE_KEY = "jimmy-coco-gbp-usd-rate:v1";
const MAX_RATE_AGE_MS = 36 * 60 * 60 * 1000;

function usd(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function storedRate(): FxRate | null {
  try {
    const raw = window.localStorage.getItem(RATE_KEY);
    const parsed = raw ? JSON.parse(raw) as FxRate : null;
    if (!parsed || !Number.isFinite(parsed.rate) || typeof parsed.date !== "string" || typeof parsed.fetchedAt !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("GBP");
  const [rate, setRate] = useState<FxRate | null>(null);
  const [status, setStatus] = useState<FxStatus>("idle");

  const refreshRate = useCallback(async () => {
    const cached = storedRate();
    if (cached) {
      setRate(cached);
      const age = Date.now() - new Date(cached.fetchedAt).getTime();
      setStatus(age > MAX_RATE_AGE_MS ? "stale" : "ready");
    }

    setStatus(cached ? "stale" : "loading");
    try {
      const response = await fetch(FX_ENDPOINT, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`FX source returned ${response.status}`);
      const payload = await response.json() as { rate?: number; date?: string; base?: string; quote?: string };
      const nextRate = payload.rate;
      const nextDate = payload.date;
      if (payload.base !== "GBP" || payload.quote !== "USD" || typeof nextRate !== "number" || !Number.isFinite(nextRate) || typeof nextDate !== "string") throw new Error("FX source returned an invalid GBP/USD rate");
      const fresh: FxRate = { rate: nextRate, date: nextDate, fetchedAt: new Date().toISOString() };
      setRate(fresh);
      setStatus("ready");
      try { window.localStorage.setItem(RATE_KEY, JSON.stringify(fresh)); } catch { /* Storage is optional. */ }
    } catch {
      setStatus(cached ? "stale" : "unavailable");
    }
  }, []);

  useEffect(() => {
    try {
      const savedCurrency = window.localStorage.getItem(CURRENCY_KEY);
      if (savedCurrency === "USD" || savedCurrency === "GBP") setCurrencyState(savedCurrency);
    } catch { /* Use GBP when browser storage is unavailable. */ }
    const cached = storedRate();
    if (cached) {
      setRate(cached);
      setStatus(Date.now() - new Date(cached.fetchedAt).getTime() > MAX_RATE_AGE_MS ? "stale" : "ready");
    }
  }, []);

  useEffect(() => {
    if (currency === "USD") void refreshRate();
  }, [currency, refreshRate]);

  const setCurrency = useCallback((nextCurrency: DisplayCurrency) => {
    setCurrencyState(nextCurrency);
    try { window.localStorage.setItem(CURRENCY_KEY, nextCurrency); } catch { /* Preference persistence is optional. */ }
  }, []);

  const isUsd = currency === "USD" && Boolean(rate);
  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    isUsd,
    rate,
    status,
    setCurrency,
    money: (amount, decimals = 0) => isUsd && rate ? usd(amount * rate.rate, decimals) : gbp(amount, decimals),
    baseReference: (amount, decimals = 0) => isUsd ? `${gbp(amount, decimals)} GBP base reference` : null,
  }), [currency, isUsd, rate, setCurrency, status]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}

export function CurrencyDisclosure({ className = "" }: { className?: string }) {
  const { currency, isUsd, rate, status } = useCurrency();
  if (currency !== "USD") return null;
  if (!isUsd || !rate) return <p className={`currency-disclosure ${className}`.trim()} role="status">USD reference conversion is currently unavailable. GBP references remain in use.</p>;
  return <p className={`currency-disclosure ${className}`.trim()}>
    Indicative USD conversion only. {rate.date} GBP/USD reference from <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a>; final US trade terms, availability, shipping and tax are confirmed before invoicing.{status === "stale" ? " Displaying the last verified rate while we refresh." : ""}
  </p>;
}

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, isUsd, rate, status, setCurrency } = useCurrency();
  const meta = currency === "USD"
    ? isUsd && rate
      ? `Indicative · 1 GBP = ${usd(rate.rate, 4)} · ${rate.date}`
      : status === "loading" ? "Updating FX reference…" : "USD reference unavailable · GBP shown"
    : "UK trade references";
  return <div className={`currency-selector${compact ? " currency-selector-compact" : ""}`} aria-label="Display currency">
    <div className="currency-selector-buttons" role="group" aria-label="Choose display currency">
      <button type="button" className={currency === "GBP" ? "is-active" : ""} aria-pressed={currency === "GBP"} onClick={() => setCurrency("GBP")}>GBP</button>
      <button type="button" className={currency === "USD" ? "is-active" : ""} aria-pressed={currency === "USD"} onClick={() => setCurrency("USD")}>USD</button>
    </div>
    {!compact && <small aria-live="polite">{meta}</small>}
  </div>;
}
