/**
 * GA4 event helper.
 *
 * Consent Mode v2 is already configured in the document head, so gtag decides
 * whether an event may use storage. We still guard on gtag existing (it will not
 * during SSR or if the tag is blocked) and keep every event name and parameter
 * inside GA4's limits: snake_case, <=40 chars for names, <=100 for values.
 */

export type EventParams = Record<string, string | number | boolean | undefined>;

type Gtag = (command: string, ...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof candidate === "function" ? candidate : null;
}

function clean(params: EventParams) {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key.slice(0, 40)] = typeof value === "string" ? value.slice(0, 100) : value;
  }
  return out;
}

export function track(event: string, params: EventParams = {}) {
  const send = gtag();
  if (!send) return;
  send("event", event.slice(0, 40), clean(params));
}

const fired = new Set<string>();

/** Sends an event at most once per page load — for "first interaction" signals. */
export function trackOnce(key: string, event: string, params: EventParams = {}) {
  if (fired.has(key)) return;
  fired.add(key);
  track(event, params);
}

export function resetTrackOnce() {
  fired.clear();
}

/** Trailing debounce, so dragging a slider reports the value they settled on. */
export function debounceTrack(delay = 700) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (event: string, params: EventParams = {}) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => track(event, params), delay);
  };
}
