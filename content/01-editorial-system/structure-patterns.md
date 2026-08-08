# Structure patterns

How an article is built, and how it maps onto the fields the `articles` table
actually has.

---

## The four patterns

Pick one per article and say which in `brief.md`.

### A. The costing pillar

For "what does X cost / make me". The most valuable pattern we have and the one
nobody else in the category uses, because it requires actual numbers.

```
H1
Answer box            the headline number, in the first 100 words
The short answer      2–3 sentences, standalone, quotable
What goes into it     the model, component by component, each with its source
                      or its stated assumption
Worked example        one complete, named scenario, arithmetic visible
Assumptions           every assumption in one block, with ranges
What actually moves   which levers matter, ranked — the payoff section
the number
What to do about it   3–5 concrete actions
FAQ                   4–8 questions, → faq_items
Sources               → citations
```

### B. The compliance explainer

For "am I allowed to / do I need". Rules from [decision 2](../00-strategy/decisions.md#2-compliance-depth-full-heavily-sourced) apply in full.

```
H1
Answer box            with the honest hedge if there is one
Where the rule comes  the statute, regulation or standard, named and linked
from
What it actually says quoted or closely paraphrased, not interpreted
Where it varies       local authority / insurer variation, stated as variation
What this means in    practical steps
practice
What nobody can tell  the genuinely unsettled parts. This section is the reason
you                   the article is better than everyone else's.
FAQ
Sources
Standing note         not legal advice
```

### C. The craft explainer

For "why did that happen / how do I do this properly". Jimmy's byline.

```
H1
Answer box
What's happening on   the mechanism, from the literature where it exists
the skin
What causes it in     practice, in a salon
the room
How to prevent it
How to fix it when it has already happened
What's disputed       the honest section
FAQ
Sources
```

### D. The client-facing asset

Per [decision 1](../00-strategy/decisions.md#1-audience-trade-led-with-some-consumer).
Category **"For your clients"**.

```
H1
For the therapist     what this is, when to send it — 2 sentences
Share this with       a copyable plain-language summary block
your client
[client-facing body]
FAQ                   phrased as the client would ask
Sources
```

---

## Rules that apply to all four

**The answer box.** First thing after the H1. Contains the number or the answer,
nothing else. This is what gets pulled into a search snippet and what an AI
assistant quotes. Write it last, when you know what the article concluded.

**Heading levels.** `h2` and `h3` only — the sanitiser allows `h2`–`h4` but the
H1 comes from the `title` field, so starting at `h2` in `content_html` is
correct. Phrase headings as the question the reader is asking.

**Tables beat prose for anything comparative.** `table`/`thead`/`tbody`/`tr`/
`th`/`td` are all allowed by the sanitiser, and `th` takes `scope`. Comparison
tables are one of the formats that demonstrably ranks in this category.

**Arithmetic is visible.** `£60 ÷ 28 = £2.14`, not "roughly £2".

**Length follows the question.** A costing pillar needs 1,800–2,500 words to be
complete. A craft explainer might need 900. There is no target — a padded
article is a worse asset than a short one, and thin content on `/articles` is
already the specific problem we're solving.

**Internal links.** Every article links to at least one other article in its
pillar and at least one tool. Cluster maps live in the pillar files.

---

## Allowed HTML

`content_html` is sanitised on read *and* on save by `cleanArticleHtml()`. The
allow-list:

```
p br h2 h3 h4 strong em u s blockquote ul ol li a img figure figcaption
table thead tbody tr th td hr code pre
```

Attributes: `a[href|title|target|rel]`, `img[src|alt|title|width|height|loading]`,
`th[scope|colspan|rowspan]`, `td[colspan|rowspan]`. Schemes: http, https, mailto.
All `a` get `rel="noopener noreferrer"`; all `img` get `loading="lazy"`.

**Anything else is silently stripped.** No `div`, no `span`, no `class`, no
inline styles, no `section`. Design the article to work inside those tags —
`app/styles/articles.css` is where visual treatment lives, and if a pattern
needs a wrapper element it needs a CSS change, not a hand-inserted `div` that
will vanish on save.

The answer box is currently a `blockquote` at the top of the body. If it needs
its own treatment, style `.article-body > blockquote:first-child`.

---

## Field mapping

Everything in `article-data.json` maps to a form field in
`app/routes/admin.article-editor.tsx`. The mapping, exactly:

| `article-data.json` | Editor field | Notes |
|---|---|---|
| `title` | Article title | required |
| `slug` | URL slug | generated from title if blank |
| `excerpt` | Excerpt | shown on `/articles` cards and used as fallback meta description |
| `content_html` | Article HTML | required; sanitised on save |
| `author` | Author | free text; creates the author record if new |
| `category` | Category | free text; creates the category if new |
| `tags[]` | Tags | comma or newline separated |
| `status` | Status | `draft` · `review` · `published` · `archived`. Editors can only set draft/review. |
| `reading_time_minutes` | Reading time | defaults to 5, min 1 |
| `is_featured` | Featured | checkbox |
| `noindex` | Hide from search engines | checkbox |
| `seo_title` | SEO title | max 120 |
| `meta_description` | Meta description | max 320 |
| `og_title` | Social title | |
| `og_description` | Social description | |
| `keywords[]` | Keywords | comma separated |
| `faq_items[]` | FAQs | one `Question \| Answer` per line |
| `citations[]` | Sources | one `Label \| URL` per line |
| `cover.file` | Cover image | uploaded separately |
| `cover.alt` | Alternative text | |

`published_at` is set automatically when status first becomes `published`; do
not set it by hand. Publishing fires the Vercel deploy hook if
`VERCEL_DEPLOY_HOOK_URL` is set.

`faq_items` drives a real `FAQPage` schema block on the article page, and
`citations` renders the visible *Sources* list. Both are the payoff for the
evidence standard — fill them properly.

---

## Known implementation gaps

Things the pipeline needs that the site doesn't do yet. Fix before the relevant
article publishes.

1. **Brand byline is typed as a Person.** *(blocks the first brand-bylined
   article — i.e. the first economics or compliance piece)*
   `app/routes/article.tsx` emits `{"@type": "Person", name}` for any author
   that isn't exactly `Jimmy Coco`. Needs a third branch returning
   `{"@id": ORG_ID}` when the author is the brand byline, so business content
   resolves to the Organization node rather than inventing a person.

2. **No `Article.about` / topical entity.** Articles emit `BlogPosting` with
   keywords but no `about`. Adding `about` referencing a stable topic entity
   would strengthen the cluster considerably. Not blocking.

3. **No breadcrumb schema** on article pages. Cheap win.

4. **No tool page type.** Calculators have no home in the article store; each
   is a hand-built route. See [`05-tools/README.md`](../05-tools/README.md).

5. **Sitemap truncates silently at 1,000 articles.** `app/routes/sitemap.ts`.
   Irrelevant now; relevant if the hub grows.

6. **`/articles` is live, indexed and empty.** Until the first pieces publish,
   it actively teaches Google the section is thin. Consider `noindex` on the
   index route until three articles are live.
