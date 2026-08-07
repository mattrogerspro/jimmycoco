/** Shared URL helpers for the admin list views. Client-safe. */

/**
 * Rebuilds a querystring with one or more values replaced. Passing null or an
 * empty string removes the parameter entirely.
 */
export function withParams(params: URLSearchParams, changes: Record<string, string | number | null>) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  // Any change to the filters puts you back on the first page.
  if (!("page" in changes)) next.delete("page");
  const query = next.toString();
  return query ? `?${query}` : "";
}

/** Replaces every value of a repeated parameter (status, tier, …) at once. */
export function withRepeated(params: URLSearchParams, key: string, values: readonly string[]) {
  const next = new URLSearchParams(params);
  next.delete(key);
  next.delete("page");
  for (const value of values) next.append(key, value);
  const query = next.toString();
  return query ? `?${query}` : "";
}

/** Reads a repeated parameter, also accepting a single comma-joined value. */
export function readRepeated<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] {
  const values = params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value): value is T => (allowed as readonly string[]).includes(value));
  return [...new Set(values)];
}

/**
 * PostgREST's `or=(...)` grammar is comma and bracket delimited, so a search
 * term containing those characters would change the meaning of the filter
 * rather than being matched literally. Strip them, and cap the length.
 */
export function sanitiseSearch(value: string) {
  return value
    .replace(/[,()*%\\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function positiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const PER_PAGE_OPTIONS = [25, 50, 100, 200] as const;
export const DEFAULT_PER_PAGE = 25;

export function readPerPage(params: URLSearchParams) {
  const value = positiveInt(params.get("perPage"), DEFAULT_PER_PAGE);
  return (PER_PAGE_OPTIONS as readonly number[]).includes(value) ? value : DEFAULT_PER_PAGE;
}
