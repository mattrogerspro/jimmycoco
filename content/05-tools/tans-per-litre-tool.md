# Tool 2 — Tans-per-litre yield tool

**Route:** `/tools/tans-per-litre`
**Status:** not started
**Pairs with:** `tans-per-litre` (pillar 1, article 3)

---

## Why this is worth its own tool

"How many tans do you get from a litre" is one of the highest-volume operational
queries in the category, and the top six results currently include **four
SalonGeek threads**. Nobody has built anything.

It's also the number every other calculation depends on — the profit calculator
is only as good as the yield figure a reader puts into it — so a tool that helps
her establish her *actual* yield improves everything downstream.

## What it does — two modes

### Mode 1: Measure yours

The primary mode, and the honest one. A short guided calculation:

- Starting volume (ml) — or "a full litre"
- Ending volume (ml)
- Number of tans done
- → **Your actual yield**, plus your real cost per tan at your litre price

Then the comparison that makes it useful: how her number compares with the 28
the litre is rated for, and what the difference is worth per year at her volume.

Include a "how to measure this properly" note — mark the bottle, count over a
full week rather than a day, don't count practice or touch-ups.

### Mode 2: Estimate yours

For someone who hasn't measured yet. Inputs that genuinely affect yield:

| Input | Options |
|---|---|
| Equipment | HVLP turbine · compressor · airbrush |
| Coverage | Full body · full body plus face detail · partial |
| Passes | One · two |
| Typical client frame | Small · medium · large |

⚠ **This mode needs real data before it ships.** Right now we do not have
evidenced yield deltas by equipment type or technique, and inventing a lookup
table would be exactly the fabrication the evidence standard exists to prevent.

Options, in order of preference:

1. Measure it ourselves across equipment types and publish the method
2. Collect it from stockists, with n stated
3. **Ship mode 1 only** and add mode 2 when the data exists

Option 3 is the default. A tool that does one thing honestly beats a tool that
guesses at two.

## Outputs

- Your yield, in tans per litre
- Your solution cost per tan at your litre price
- How your number compares with the rated 28
- What a 4-tan improvement is worth per year at your volume
- A link through to the full profit calculator with the figure carried over

## Hard constraints

**No PSI figures. No CFM figures.** No published standard exists for either —
see the [claims register](../03-research/claims-register.md). Equipment appears
as a category, never as a specification.

**No yield claim presented as a specification.** 28 is our working figure, and
the tool's entire purpose is to help her replace it with her own. Framing
matters: this tool exists because we don't think our number should be the one she
uses.

## Crawlable content

Same rule as tool 1 — the method, the range, the worked example and 4–6 FAQ
items as server-rendered prose beneath the interactive part, with `FAQPage`
schema. This is the part that ranks against four forum threads.

## Also required

Route registration, sitemap entry, prerender, meta with canonical and hreflang,
`SoftwareApplication` schema. Same checklist as tool 1.
