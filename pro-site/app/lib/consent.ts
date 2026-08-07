/**
 * Cookie consent state, stored in a first-party cookie so the inline bootstrap
 * in the document head can read it synchronously — before Google Analytics
 * loads — and apply Consent Mode v2 without a flash of unconsented tracking.
 */

export const GA_MEASUREMENT_ID = "G-15N14ECLZG";
export const CONSENT_COOKIE = "jc_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 180;

export type ConsentChoice = {
  v: number;
  analytics: boolean;
  marketing: boolean;
  at: string;
};

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as ConsentChoice;
    if (parsed?.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(choice: Omit<ConsentChoice, "v" | "at">) {
  if (typeof document === "undefined") return;
  const value: ConsentChoice = {
    v: CONSENT_VERSION,
    analytics: choice.analytics,
    marketing: choice.marketing,
    at: new Date().toISOString(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax${secure}`;

  applyConsent(value);
  return value;
}

/** Pushes the choice into Google Consent Mode. */
export function applyConsent(choice: Pick<ConsentChoice, "analytics" | "marketing">) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;

  w.gtag("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
  });
}

export const OPEN_CONSENT_EVENT = "jc:open-consent";

/** Lets the footer link re-open the preferences panel from anywhere. */
export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
}

/**
 * Runs in the document head before gtag.js. Denies everything by default, then
 * immediately re-grants whatever the visitor previously agreed to.
 */
export const CONSENT_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
try {
  var m = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
  if (m) {
    var c = JSON.parse(decodeURIComponent(m[1]));
    if (c && c.v === ${CONSENT_VERSION}) {
      gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      });
    }
  }
} catch (e) {}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
`.trim();
