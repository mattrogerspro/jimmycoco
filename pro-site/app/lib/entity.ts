import { CONTENT_UPDATED, SITE_URL, absoluteUrl } from "./site";

/**
 * Canonical entity definitions for structured data.
 *
 * Every schema block across the site references these two @id values instead of
 * redeclaring the person or the organisation inline. That is what lets a search
 * engine or an AI assistant collapse "Jimmy Coco" the author, "Jimmy Coco" the
 * founder and "Sunless by Jimmy Coco" the brand into one resolved entity rather
 * than three unrelated strings that happen to share a name.
 *
 * Rules if you edit this file:
 *  - sameAs is for URLs that ARE the entity: official profiles it controls.
 *    Press coverage about the entity belongs in subjectOf, not sameAs.
 *  - Every URL here must be live. A 404 in sameAs actively weakens the graph.
 */

export const PERSON_ID = `${SITE_URL}/#jimmy-coco`;
export const ORG_ID = `${SITE_URL}/#organization`;

/** Press coverage about Jimmy Coco, used as subjectOf on the Person. */
const PRESS: Array<{ url: string; headline: string; publisher: string }> = [
  {
    url: "https://www.vogue.com/article/fake-tannings-big-glow-up",
    headline: "Fake Tanning's Big Glow Up",
    publisher: "Vogue",
  },
  {
    url: "https://www.thetimes.com/life-style/celebrity/article/kim-kardashian-spray-tan-jimmy-coco-q3tmb9q92",
    headline: "I got a spray tan from the man who gives Kim Kardashian her glow",
    publisher: "The Times",
  },
  {
    url: "https://www.bloomberg.com/news/articles/2011-06-16/spray-tannings-golden-moment",
    headline: "Spray Tanning's Golden Moment",
    publisher: "Bloomberg",
  },
  {
    url: "https://www.nbcnews.com/id/wbna43443455",
    headline: "Spray tanning's golden moment",
    publisher: "NBC News",
  },
  {
    url: "https://www.refinery29.com/en-us/2018/03/193292/jimmy-coco-self-tanning-mitt",
    headline: "Kim K.'s Spray Tanner Just Launched A Game-Changing Product",
    publisher: "Refinery29",
  },
  {
    url: "https://www.newbeauty.com/view/fix-self-tanning-mistakes-with-victorias-secret-tanner-jimmy-coco",
    headline: "Fix Self-Tanning Mistakes With Victoria's Secret Tanner Jimmy Coco",
    publisher: "NewBeauty",
  },
  {
    url: "https://www.cosmopolitan.com/uk/beauty-hair/bodycare/a26043/how-to-avoid-fake-tan-mistakes/",
    headline: "How to avoid fake tan mistakes, according to Kim Kardashian's tan artist",
    publisher: "Cosmopolitan UK",
  },
  {
    url: "https://www.goodhousekeeping.com/uk/beauty/skincare/a60727199/kylie-kendall-jenner-met-gala-tan/",
    headline: "This is the exact self-tan that wowed the Met Gala",
    publisher: "Good Housekeeping UK",
  },
  {
    url: "https://www.image.ie/style/jimmy-coco-on-his-life-in-beauty-797120",
    headline: "Jimmy Coco on his life in beauty",
    publisher: "IMAGE",
  },
  {
    url: "https://www.vogue.com.au/beauty/skin/how-to-get-the-perfect-tan/news-story/386200c65f8b79b608db694945b88904",
    headline: "Jimmy Coco celebrity spray-tan how to",
    publisher: "Vogue Australia",
  },
  {
    url: "https://www.hellomagazine.com/healthandbeauty/885266/i-got-a-spray-tan-from-the-kardashians-therapist-heres-the-tanning-secrets/",
    headline: "I got a spray tan from a celebrity therapist",
    publisher: "HELLO!",
  },
  {
    url: "https://www.prnewswire.com/news-releases/minetan-taps-jimmy-coco-spray-tanner-to-the-stars-as-brand-ambassador-300505508.html",
    headline: "MineTan Taps Jimmy Coco, Spray Tanner to the Stars, as Brand Ambassador",
    publisher: "PR Newswire",
  },
];

/** The person. Referenced by @id from the organisation and from article authors. */
export const jimmyCocoPerson = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Jimmy Coco",
  alternateName: "Jimmy Jimmy Coco",
  jobTitle: "Celebrity tan artist and founder",
  description:
    "Jimmy Coco is a Hollywood celebrity tan artist and a pioneer of the mobile spray tanning industry, having launched the first mobile spray tanning business in 2003. He is the founder of Sunless by Jimmy Coco and his work has been documented by Vogue, The Times, Bloomberg and NBC News.",
  url: SITE_URL,
  image: absoluteUrl("/assets/site/jimmy-coco-story-580.webp"),
  knowsAbout: [
    "Spray tanning",
    "Sunless tanning",
    "Professional salon tanning technique",
    "DHA tanning formulation",
    "Skin tone matching",
    "Body contouring with tan",
  ],
  sameAs: [
    "https://www.instagram.com/jimmyjimmycoco/",
    "https://www.linkedin.com/in/jimmy-coco-4b00b51b5",
  ],
  subjectOf: PRESS.map((item) => ({
    "@type": "NewsArticle",
    headline: item.headline,
    url: item.url,
    publisher: { "@type": "Organization", name: item.publisher },
  })),
} as const;

/** The organisation. Referenced by @id from Product.brand and article publishers. */
export const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Sunless by Jimmy Coco",
  alternateName: "Sunless by Jimmy Coco Professional",
  url: SITE_URL,
  logo: absoluteUrl("/img/favicon.svg"),
  image: absoluteUrl("/img/hero.webp"),
  description:
    "Professional spray tan solutions, salon training and retail support for salons, spas and mobile tanning professionals, from Hollywood celebrity tan artist Jimmy Coco.",
  founder: { "@id": PERSON_ID },
  areaServed: ["GB", "IE"],
  sameAs: [
    "https://jimmycoco.co.uk",
    "https://www.facebook.com/jimmycocointernational/",
    "https://www.linkedin.com/company/jimmy-coco/",
    "https://www.tiktok.com/@sunlessbyjimmycocouk",
  ],
} as const;

/**
 * Organisation + person together. Any page that references either @id must emit
 * BOTH, or the reference dangles and a parser resolves founder/author to nothing.
 */
export const brandEntities = [
  { "@context": "https://schema.org", ...organization },
  { "@context": "https://schema.org", ...jimmyCocoPerson },
];

/** Both entities plus the WebSite node. Emitted once, on the home page. */
export const siteEntityGraph = [
  ...brandEntities,
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Sunless by Jimmy Coco Professional",
    url: SITE_URL,
    inLanguage: "en-GB",
    dateModified: CONTENT_UPDATED,
    publisher: { "@id": ORG_ID },
  },
];
