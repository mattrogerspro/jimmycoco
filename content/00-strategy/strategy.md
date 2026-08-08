# Content strategy — the business authority for UK spray tanning

**Owner:** Matt Rogers · **Started:** 8 August 2026 · **Status:** agreed, in build

Full narrative version: the `jimmycoco-content-strategy` artifact. This file is
the working summary the pipeline actually runs against.

---

## The positioning

**Become the source a UK salon owner reaches for when they need a number.**

Not the brand with the best tan tips — every tanning brand has those, and
they're worth nothing. The brand that knows what a tan costs to deliver, whether
you need a licence in your borough, what to charge in 2026, why 71% of your new
clients never came back, and what the shelf is actually worth.

The one-line test for any commissioned piece:

> Would a salon owner screenshot this and send it to another salon owner?

If it's a tip, no. If it's a number, a template, or an answer to something they
were genuinely unsure about, yes.

## Why this works right now

Three things are true at once, and they don't usually line up:

1. **The category is empty.** SalonGeek — a forum whose relevant threads run
   2008–2018 — holds a top-three position on roughly half of all operational
   spray tan queries in the UK. It ranks because nothing else exists. Where it
   doesn't rank, US brands do, in dollars, under US regulation.
2. **The audience is under real pressure and receptive to business help.** 20%
   of UK salons are operating at a loss; average margin is 8.2%; 72.6% expect to
   raise prices within three months. Content that adds a pound to their week is
   worth more to them than content about technique.
3. **The commercial route is honest.** Every pillar ends somewhere real —
   the litre, the trade account, the retail range, the training. We never have
   to bend a fact to reach a CTA, because the facts already favour us. That is
   why the evidence standard is affordable.

## The five pillars

| # | Pillar | Owns the question | Commercial route |
|---|---|---|---|
| 1 | [The Economics of Tanning](../02-pillars/01-economics-of-tanning.md) | "What does this actually make me?" | The litre · the calculator · trade account |
| 2 | [Compliance and Legitimacy](../02-pillars/02-compliance-and-legitimacy.md) | "Am I allowed to do this, and am I covered?" | Template pack · trade account · trust |
| 3 | [The Craft](../02-pillars/03-the-craft.md) | "Why did that tan go wrong?" | Solution quality · training · the mitt |
| 4 | [Filling the Diary](../02-pillars/04-filling-the-diary.md) | "How do I get them back?" | Retail attach · the range · rebooking |
| 5 | [Building the Business](../02-pillars/05-building-the-business.md) | "How do I grow past myself?" | Trade account · volume · multi-site terms |

Pillars 1 and 2 launch first. They are the widest gaps and the clearest
authority plays. Pillar 3 is where our real expertise is and where the
strongest sources sit, but it is also the most crowded, so it follows.

## The moat is the evidence standard

Every competitor in this category writes folklore confidently. "DHA resistance",
"the 15% FDA limit", "hormones stop your tan developing" — none of these are
established, and all of them are stated as fact across the industry, including
by brands much larger than us.

Being the one source that separates *known* from *assumed* is the whole
strategy. It's what makes an article citable by a salon owner, and it's what
makes it quotable by an AI assistant, which increasingly decides what a salon
owner ever sees. Concretely:

- Every factual claim carries a source.
- Where the profession genuinely disagrees, we present the disagreement rather
  than picking a side and sounding confident.
- Where the evidence doesn't exist, we say so — and that sentence is usually the
  most valuable one in the article.

See [`01-editorial-system/evidence-standard.md`](../01-editorial-system/evidence-standard.md)
and [`03-research/claims-register.md`](../03-research/claims-register.md).

## Formats that win here

Established from what actually ranks in this category:

**Works** — free ungated calculators; downloadable templates; long-form pillars
containing real numbers (the single UK page carrying actual £ figures ranks #1
for several queries, which is the proof of concept); comparison tables.

**Doesn't work** — short brand-tied listicles; gated content, which is invisible
to both search and AI; anything that answers a costing question without a
number in it.

## Launch order

Tools first. They are the assets that get linked to, and they give every article
somewhere to send the reader.

1. **£ cost-and-profit calculator** — extract and generalise the existing
   `ProfitCalculator` component onto its own route
2. **Tans-per-litre yield tool**
3. **Consultation & consent template pack**
4. Then the pillar articles, in the order set out in each pillar file, starting
   with **[what a spray tan costs to deliver](../04-pipeline/what-a-spray-tan-costs/)**

## One research effort, three assets

Every commissioned piece produces an article, an email and a tool link. This is
what makes the cadence sustainable at one person's capacity — see
[`06-distribution/`](../06-distribution/README.md).

The recurring email — the **Salon Business Brief** — matters beyond
distribution. The trade programme currently has no reason to email a salon that
hasn't bought yet. A monthly brief with a real number in it is that reason.

## What this is not

- Not a blog. There is no cadence obligation; a thin article is worse than no
  article, because `/articles` being live, indexed and empty is already teaching
  Google the section is thin.
- Not consumer marketing. See decision 1.
- Not a channel for product announcements. Those go to email.
