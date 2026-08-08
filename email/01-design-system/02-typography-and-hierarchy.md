# Email Typography and Hierarchy

## Objective

Create an editorial hierarchy that remains readable and robust across email clients.

## Font strategy

Use a refined serif for major headlines where supported, with a carefully chosen web-safe or system fallback. Use a neutral sans-serif for body copy, labels, prices and buttons.

Suggested fallback stacks:

- Editorial serif: Georgia, 'Times New Roman', serif
- Sans-serif: Arial, Helvetica, sans-serif

Do not depend on a custom webfont to preserve meaning or layout.

## Never set numbers or data in a serif

**This is a hard rule and it applies everywhere the brand appears — email, the professional site, the admin, articles, tools and decks. There is no exception for a figure that "looks nicer" in the display face.**

Serif faces are drawn for running prose. Their figures carry varying widths, and in several of the faces we use they are old-style — different heights, some dropping below the baseline. In a paragraph that is invisible. In a column of money it is a mess: the decimal points stop lining up, digits are harder to tell apart at a glance, and a reader comparing two rows has to work for it.

**Set in the sans, with tabular lining figures:**

- Prices, totals, subtotals and any currency
- Every cell of every table, and its header row
- Statistics, KPI figures and dashboard cards
- Calculator inputs and outputs
- Percentages, quantities, measurements and dates
- Order numbers, invoice numbers, SKUs and reference codes
- Formulas and worked arithmetic (monospace is also acceptable here)

**The serif is for:**

- Headlines and section headings
- Pull quotes and standfirsts
- Running prose — including numbers that appear *inside* a sentence, which stay in the reading face because breaking mid-sentence into another typeface is worse than the problem it solves

The distinction is display versus prose. A number a reader is meant to *compare, scan or check* is data and takes the sans. A number they simply read past in a line of text is prose.

### How to implement it

Always pair the sans with tabular figures — a sans alone does not fix alignment, because most sans faces still default to proportional digits.

```css
font-family: 'Jost', 'Helvetica Neue', Arial, sans-serif;
font-variant-numeric: tabular-nums lining-nums;
```

In email, where `font-variant-numeric` is unreliable across clients, use the sans stack and align numeric columns right so the decimals stack regardless.

### Where this is already wired in

- `pro-site/app/styles/articles.css` — the `--data` custom property; all article tables and formulas use it
- `pro-site/app/styles/admin.css` — order totals, invoice figures and every stat card
- Anything new: take the sans from `--data` rather than restating the stack

## Type scale

### Desktop
- Hero headline: 36–46px
- Section headline: 26–34px
- Product title: 18–22px
- Body: 16–18px
- Supporting copy: 14–16px
- Utility/legal: 12–14px
- CTA: 14–16px

### Mobile
- Hero headline: 30–38px
- Section headline: 24–30px
- Product title: 18–20px
- Body: minimum 16px
- Utility/legal: minimum 12px

## Line height

- Headlines: 1.05–1.2
- Body: 1.45–1.65
- Labels and buttons: 1.2–1.4

## Hierarchy rules

- One dominant headline per email.
- Keep hero headlines to approximately 2–4 lines on mobile.
- Use sentence case for editorial copy.
- Reserve uppercase for short labels, navigation and buttons.
- Avoid long centred paragraphs.
- Keep body measure concise and scannable.

## Emphasis

Use size, spacing and placement before bold weight. Avoid multiple font weights, excessive italics or letter spacing that reduces readability.

## Image text

Do not place essential propositions, prices, offer terms or CTA labels only inside imagery. Generated concepts may show approximate type placement, but production text must be rebuilt as live HTML.

## Accessibility

- Minimum 16px body copy where practical
- Strong contrast against backgrounds
- No ultra-light body weights
- Never use colour alone to indicate links or status
- Underline text links where ambiguity is possible

## Success criteria

Typography succeeds when the proposition is understandable in three seconds, body copy is comfortable on mobile and fallback fonts do not break the composition.