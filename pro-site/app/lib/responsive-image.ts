import MANIFEST from "../data/responsive-images.json";

/**
 * Build a srcset for an article image, including the full-size master.
 *
 * Ported from above-guide's src/lib/responsiveImage.js, which carries the scars
 * of two bugs worth not repeating:
 *
 *   1. It originally advertised a fixed set of widths for every image. The
 *      generator never upscales, so anything narrower than the largest
 *      advertised width offered a URL that 404s. The browser picks exactly that
 *      candidate on a wide viewport, the <img> fires onerror, and the picture
 *      disappears. Reading the real widths from the manifest is the fix.
 *
 *   2. Fixing that left the largest candidate below the master's true width,
 *      while every hero declares sizes="100vw". So on any viewport wider than
 *      the biggest variant — or any retina screen at half that — the browser
 *      chose a smaller file and upscaled it, while the master sat unrequested.
 *      Heroes looked soft, and it had nothing to do with the quality setting.
 *      The master is therefore offered too, at its true width.
 *
 * Returns undefined when there is nothing useful to offer: no manifest entry (an
 * image uploaded through the admin rather than generated), a non-webp source, or
 * an image too small to have been resized. The browser then just loads `src`,
 * which is always the master — so this degrades to exactly the behaviour we had
 * before, never to a broken image.
 */

type Entry = { w: number[]; s: number | null };

// A variant within this fraction of the master is dropped: offering 2048w
// alongside a 2160w original is a pointless choice for the browser to make.
const TOO_CLOSE = 0.9;

const clean = (src: string) => src.replace(/([?#].*)$/, "");

function entryFor(src: string): Entry | null {
  const raw = (MANIFEST as Record<string, Entry | number[]>)[src];
  if (!raw) return null;
  // Tolerate the older array shape so a stale manifest degrades rather than
  // throwing — it simply loses the master candidate until regenerated.
  if (Array.isArray(raw)) return { w: raw, s: null };
  return { w: Array.isArray(raw.w) ? raw.w : [], s: raw.s ?? null };
}

export function responsiveSrcSet(src?: string | null): string | undefined {
  if (!src || !/\.webp(?:[?#].*)?$/i.test(src)) return undefined;
  const key = clean(src);
  const entry = entryFor(key);
  if (!entry || !entry.w.length) return undefined;

  const candidates = entry.w
    .filter((width) => !entry.s || width < entry.s * TOO_CLOSE)
    .map((width) => `${key.replace(/\.webp$/i, `-${width}.webp`)} ${width}w`);

  if (entry.s) candidates.push(`${key} ${entry.s}w`);
  if (!candidates.length) return undefined;

  return candidates.join(", ");
}

/**
 * `sizes` values, kept here so the layout and the srcset stay in step. Getting
 * these wrong costs more than the srcset itself: a browser picks its candidate
 * from `sizes` before layout, so an over-generous value downloads a file far
 * larger than the slot it lands in.
 */
export const SIZES = {
  /** Full-bleed article lead and the crossfading index hero. */
  lead: "100vw",
  /** Three-up card grid, capped at 1240px, single column below 620px. */
  card: "(max-width: 620px) 92vw, (max-width: 900px) 46vw, 396px",
} as const;
