# Measurement

What we track, and what good looks like.

The programme's return is slow and mostly indirect — authority, citations,
and a reason to email people who haven't bought yet. Measuring it like a
performance channel would produce the wrong decisions, so the metrics below are
deliberately weighted towards leading indicators.

---

## What good looks like

Honest expectations for a section starting from nothing.

| Horizon | What success is |
|---|---|
| **3 months** | 3–4 articles and 1–2 tools live. Ranking on page 1 for at least two long-tail operational queries. The Brief has a list, however small, that opens it. |
| **6 months** | Top three for at least one query where SalonGeek currently ranks. The calculator earning inbound links we didn't ask for. First evidence of an assistant citing us. |
| **12 months** | The default answer for UK spray tan economics. Compliance pillar established. The Brief is a genuine reason for a prospect to stay in contact. |

**Displacing a 2011 forum thread and a 2017 blog post is not a twelve-month
problem** — the incumbents are weak. But a new section on a small domain still
needs time and internal linking depth before it ranks for anything competitive.

---

## Leading indicators — check monthly

These move first and tell you whether it's working before the revenue does.

**Search Console, per article**

- Impressions — the first thing to move; it means Google has understood the topic
- Average position for the article's target query, from `brief.md`
- Queries we're appearing for that we didn't target — the most useful signal in
  the whole set, because it tells you what the piece is *actually* about

**Tool engagement** — the events already exist in `app/lib/analytics.ts`

- `calculator_start` — reached and touched
- `calculator_result` — settled on an outcome, with the inputs attached
- `calculator_lever_view` — the levers panel seen, once built

The distribution of inputs on `calculator_result` is genuinely valuable market
research. It tells us what real salons charge, what volume they run, and what
yield they believe they get — data nobody in this market has.

**The Brief**

- List growth from article pages specifically
- Open rate — a monthly one-number email should sustain a high one, and a
  falling rate means the numbers have stopped being worth knowing

---

## Lagging indicators — check quarterly

- Organic sessions to `/articles/*` and `/tools/*`
- Assisted conversions: trade applications and orders where an article or tool
  appeared in the path
- Referring domains earned by the tools
- Rankings against the named incumbents: SalonGeek, Sienna X, the US calculators

---

## AI citation — check manually, quarterly

Increasingly this decides what a salon owner ever sees, and there's no dashboard
for it. Do it by hand: run the target queries from the article briefs through the
major assistants and record whether we're cited, quoted or absent.

**Log it in a dated file in this folder** — `ai-citation-<yyyy-mm>.md` — with the
query, the assistant, and whether we appeared. Over four quarters that becomes
the only longitudinal record of this that exists for our category.

The site is already set up for this: the `robots.txt` AI crawler policy
deliberately allows both retrieval agents and training crawlers, `llms.txt` is
live, and the entity graph gives an assistant something stable to resolve to.

---

## What we deliberately don't optimise for

- **Publishing cadence.** There is no article quota. A thin article is worse
  than no article — `/articles` being live, indexed and empty is exactly the
  problem the programme exists to fix, and filling it with weak pieces recreates
  it at greater cost.
- **Word count.** Length follows the question.
- **Direct attribution.** Most of this programme's value shows up as somebody
  arriving already trusting us, which no attribution model will show you.
- **Bounce rate on tool pages.** Someone who lands on the calculator, gets her
  number and leaves has been served perfectly.

---

## Review cadence

- **Monthly** — leading indicators; anything unexpected in Search Console queries
- **Quarterly** — lagging indicators, the AI citation sweep, and whether the
  pillar priorities still look right
- **Annually, each April** — every figure in
  [`../03-research/uk-market-data.md`](../03-research/uk-market-data.md) and
  every model in pillar 1. Wage, NIC and business rates all change in April, and
  a costing article with last year's numbers in it is worse than none.
