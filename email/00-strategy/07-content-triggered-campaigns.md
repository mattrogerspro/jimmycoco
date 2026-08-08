# Content-Triggered Campaigns

## Principle

One piece of research produces three assets: an article, an email and a tool. The content system is the upstream source for the Campaign journey, not a separate programme that happens to link to email.

## Where content lives

The content programme is a root system alongside `email/` and `website/`, using the same conventions so it reads as native rather than bolted on.

- `content/00-strategy/` — positioning, pillars, audiences and the decisions log
- `content/01-editorial-system/` — voice, evidence standard, structure patterns, CTA policy
- `content/02-pillars/` — one file per pillar, with its cluster map and commercial routes
- `content/03-research/` — verified market data, source library and the claims register
- `content/04-pipeline/<slug>/` — the production unit, mirroring `email/campaigns/<campaign>/`
- `content/05-tools/` — calculator and template-pack specifications
- `content/06-distribution/` — **the article → campaign map this chapter governs**
- `content/07-measurement/` — what we track

Each article folder carries a `derivatives.md` naming the campaign it feeds. That file and `content/06-distribution/` are the two places the two systems meet.

## What content adds to the programme

The email programme currently has no reason to contact a salon that has not bought anything. Every existing sequence — acquisition, onboarding, reseller lifecycle — assumes a relationship already going somewhere specific. Educational content is the material that makes a standing relationship possible before the first order.

## The four mechanisms

Educational content slots into the existing **Campaign** journey — launches, seasonal education, editorial stories. It does not require a new journey.

### 1. The Salon Business Brief

Monthly, to the trade list, built from that month's articles. One number worth knowing, one interpretation, one link. No promotions: the Brief's value is that it never sells, which is why it gets opened.

This is the recurring reason to email people who have not yet bought.

### 2. Lifecycle inserts

Article-derived nurture inserted into the existing salon onboarding and reseller lifecycle sequences, so a new account receives the pricing guide and the compliance pack within its first month. These are additional steps in campaigns that already exist, not new campaigns.

### 3. Seasonal triggers

Driven by the UK tanning year, which is mapped in `content/02-pillars/04-filling-the-diary.md`. The January survival piece lands in the first week of January; prom pricing in April; party-season capacity in October.

Calendar-driven sends are the exception in this programme, and they are justified here because the trade year genuinely has a shape — not because a month has passed.

### 4. Tool-triggered follow-ups

Running a business tool is a real signal of intent and a genuine lifecycle state. Someone who runs the cost calculator receives the pricing article next. See the **Business-tool user** state in `02-audience-and-lifecycle-states.md`.

## Trigger governance

Each of the four defines everything required of any automation in `03-email-journey-architecture.md`: entry trigger, eligibility rules, suppressions, delay logic, exit conditions, priority against other flows, personalisation fallback and measurement plan.

Educational content sits at **lifecycle education** in the cross-flow priority order — below transactional, post-purchase and recovery messaging. A content send never displaces a service message or an abandonment flow.

## Nothing new is built in the email system

Every mechanism above is an existing campaign folder pattern. `content/06-distribution/` specifies which article becomes which campaign; the campaign itself is authored with the existing campaign skill and follows `_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` in full.

Concretely, for each content-derived campaign:

| Artefact | Holds |
|---|---|
| `content/04-pipeline/<slug>/derivatives.md` | The email angle, its single number, subject-line candidates and the campaign it becomes |
| `email/campaigns/<campaign>/` | The campaign itself — `README.md`, `sequence.md`, `email-data.json`, `studio.json`, `emails/` |
| `email/campaigns/README.md` | The registry table entry |
| `shared/campaign-registry.js` | Send timing, step definitions and Resend template ids, when sent by the outreach worker |

## Evidence carries across

An educational email inherits the content evidence standard in
`content/01-editorial-system/evidence-standard.md` as well as the claims protocol in the copy system. Every factual claim carries a source, disagreements are presented as disagreements, and nothing on `content/03-research/claims-register.md` is stated as fact in an email any more than in an article.

A number that is too uncertain to publish in an article is too uncertain to put in a subject line.

## Release boundary

Content-derived campaigns are drafts. Creating one authorises no send, no broadcast, no Resend publication, no contact import and no automation enablement. Each stays disabled until enablement is explicitly approved, exactly as any other campaign.

## The loop back

Email tells us which subjects the trade list actually opens. Search tells us which questions get asked. Both feed the next quarter's queue, held in `content/02-pillars/`. The programme should get better at choosing topics over time rather than working through a fixed list.
