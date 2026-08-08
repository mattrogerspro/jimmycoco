# Titling and metadata

## Titles

The title is the query, made grammatical. In this category the queries are
operational and specific, and the winning titles are the plain ones.

**Rules**

- Lead with the question or the noun the reader searched for.
- **No brand name in the H1.** The site appends " | Sunless by Jimmy Coco" via
  `seo_title` where needed; the visible H1 stays clean.
- **Say "UK" or "in 2026" only when it's doing work.** For pricing and
  compliance it is doing a great deal of work — it's our entire differentiator
  against US results. For craft it is noise.
- No colon-subtitle constructions. No "The Ultimate Guide to".
- Numbers in titles only when the number is the answer.

| Good | Why |
|---|---|
| What a spray tan actually costs you to deliver | The word "actually" earns its place — it signals we're going past the litre price |
| Do you need a licence to spray tan in the UK? | Exactly the query, and the honest answer is "it depends where", which the article delivers |
| What to charge for a spray tan in 2026 | Year is load-bearing; costs changed in April |
| How many tans you get from a litre | Plain, high-volume, currently owned by a 2011 forum thread |

| Bad | Why |
|---|---|
| Maximising Your Spray Tan Profitability: A Complete Guide | Nobody searches this |
| Sunless by Jimmy Coco's Guide to Salon Pricing | Brand in the H1, and it's about us |
| 7 Ways to Boost Your Tanning Revenue | Listicle format; the thing that demonstrably doesn't rank here |

## `seo_title`

Max 120 characters, but aim for **under 60** so it doesn't truncate in results.
Set it explicitly whenever the H1 plus " | Sunless by Jimmy Coco" would run
long — `article.tsx` falls back to `${title} | Sunless by Jimmy Coco`, which
is fine for short titles and truncates for anything else.

Include the primary query. Don't stack synonyms.

## `meta_description`

Max 320, aim for **140–160**. This is not a summary — it's the answer, promised.

Include the number if the article has one. "A tan costs £2.14 in solution and
£3.24 in consumables. Here's the full model, and the three levers that actually
move your margin." A description containing a specific figure gets clicked.

Falls back to `excerpt` if empty. Don't rely on that.

## `excerpt`

Shown on the `/articles` cards and used as the meta fallback and the
`BlogPosting.description`. Two sentences, no cliffhanger.

## `keywords`

The `keywords` array feeds `BlogPosting.keywords`. Five to eight, real queries
only — the phrases the piece is genuinely trying to answer. This is not a
ranking factor in Google, but it is a signal to AI retrieval, and a padded list
reads as spam to both. No brand terms.

## `faq_items`

Four to eight per article, and they must be **questions a reader actually
asks**, not restatements of the headings. These generate a real `FAQPage` block
and are the most likely part of the article to be quoted verbatim by an
assistant.

Answer in 40–70 words. Each answer standalone — assume it's read with no article
around it. Same evidence standard as the body: an answer that needs a source
gets its source named inline, because the schema block travels without the
citations list.

## `citations`

`Label | URL`. Label is the source, not the claim: *NHBF, State of the Industry,
March 2026*, not *20% of salons operate at a loss*. Include the year. Where a
source is offline (a PDF, a statute), label it fully and leave the URL blank
rather than linking something approximate.

## `category`

One of the six. Free text, so **spell them exactly** — the editor creates a new
category record for any string it hasn't seen, and two near-identical categories
is a mess to unpick.

```
The Economics of Tanning
Compliance and Legitimacy
The Craft
Filling the Diary
Building the Business
For your clients
```

## `tags`

Three to six. Lower case. Reused across articles — they are how a reader
traverses the hub, so a tag used once is a tag doing nothing.

Established set, extend deliberately:

```
pricing · costs · margin · retail · licensing · insurance · coshh · ventilation
mobile · home-based · no-shows · rebooking · consultation · patch-test
dha · technique · equipment · seasonality · staff · multi-site
```

## `reading_time_minutes`

Words ÷ 220, rounded up. Be honest — it's shown under the byline.

## Cover images

Every article gets one; `/articles` cards fall back to an empty box otherwise
and the section looks unfinished. Real photography or product imagery, on the
brand palette. Alt text describes the image, not the article.

Where AI-generated imagery is used it follows the rules in
`assets/ai-generation/` without exception.
