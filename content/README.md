# Content

Home for the **salon-owner education programme** — the articles, tools and
templates published on [www.jimmycoco.pro](https://www.jimmycoco.pro), and the
research, editorial rules and distribution plan behind them.

This folder is to content what `email/campaigns/` is to email: the repository
owns the truth, and the published artefact is generated from it.

## Why this exists

The UK spray tanning category has no business authority. Across ~50 operational
searches a salon owner would actually run — tans per litre, what to charge, do I
need a licence, how do I stop no-shows — the top results are a forum whose
threads run 2008–2018, US brands quoting dollars under US regulation, and one UK
brand's 2017 blog post. Nobody is answering these questions properly in sterling,
under UK law, with sources.

That is the gap. See [`03-research/competitive-landscape.md`](03-research/competitive-landscape.md).

## What's in here

| Folder | Holds |
|---|---|
| [`00-strategy/`](00-strategy/) | Positioning, pillars, audiences, and the decisions log |
| [`01-editorial-system/`](01-editorial-system/) | Voice, the evidence standard, structure patterns, titling, CTA policy |
| [`02-pillars/`](02-pillars/) | One file per pillar: scope, cluster map, internal linking, commercial routes |
| [`03-research/`](03-research/) | Market data, competitive landscape, the claims register, source library |
| [`04-pipeline/`](04-pipeline/) | Per-article production folders — the unit of work |
| [`05-tools/`](05-tools/) | Calculator and template-pack specifications |
| [`06-distribution/`](06-distribution/) | Article → email → social mapping — governed by the email playbook chapter below |
| [`07-measurement/`](07-measurement/) | What we track and what good looks like |

## How this connects to email

The point of the system is that one research effort produces three assets:
article, email and tool. That connection is not optional and not improvised — it
is specified in the email playbook as **Strategy › Content-Triggered Campaigns**
(`email/00-strategy/07-content-triggered-campaigns.md`), which appears in the
Studio's Playbooks screen alongside the other strategy chapters.

Four mechanisms: the monthly **Salon Business Brief**, **lifecycle inserts** into
the existing onboarding and reseller sequences, **seasonal triggers** from the UK
tanning year, and **tool-triggered follow-ups** off the Business-tool user
lifecycle state. [`06-distribution/`](06-distribution/README.md) says which
article becomes which campaign.

## The production unit

One folder per article in `04-pipeline/`, mirroring the campaign folder shape:

```text
04-pipeline/<slug>/
  brief.md           audience, query intent, commercial route, claims to make
  research.md        sources verified for THIS piece, and what still needs verifying
  article.md         the copy
  article-data.json  title, slug, meta, FAQ items, citations, cover, tags
  derivatives.md     the email, the social cuts, the tool it links to
```

Copy [`04-pipeline/_TEMPLATE/`](04-pipeline/_TEMPLATE/) to start a new one.

## Non-negotiables

1. **Every factual claim carries a source.** No exceptions. See
   [`01-editorial-system/evidence-standard.md`](01-editorial-system/evidence-standard.md).
2. **Nothing on the claims register is published as fact.** See
   [`03-research/claims-register.md`](03-research/claims-register.md).
3. **No article publishes with an unresolved `[VERIFY]` marker in it.**
4. **The repository is the source of truth.** Articles are drafted here and
   entered into the Supabase-backed article store via the admin editor. If the
   two diverge, this folder wins and the live article gets corrected.
5. **Publishing is a human step.** Nothing here authorises publishing an
   article, sending an email or enabling a campaign.

## Status

Programme started 8 August 2026. Strategy agreed, system built, first article
(`what-a-spray-tan-costs`) drafted and awaiting verification of the items in its
`research.md`. Nothing published yet.
