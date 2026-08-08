# Distribution

**One research effort, three assets: article → email → tool.**

This folder is the article → campaign map. The rules governing it live in the
email playbook, as **Strategy › Content-Triggered Campaigns**
(`email/00-strategy/07-content-triggered-campaigns.md`) — read that first. This
file is the specification; that chapter is the contract.

The research is the expensive part. Once it exists, the email and the social cuts
should cost almost nothing, and each article's
[`derivatives.md`](../04-pipeline/_TEMPLATE/derivatives.md) is where they get
written down while the material is still fresh.

---

## The four mechanisms

Educational content slots into the existing **Campaign** journey (journey 9 in
`email/00-strategy/03-email-journey-architecture.md`). No new journey is needed.

| # | Mechanism | Lives in | Status |
|---|---|---|---|
| 1 | **Salon Business Brief** — monthly, one number worth knowing | New campaign folder, `email/campaigns/uk-salon-business-brief/` | Not built |
| 2 | **Lifecycle inserts** — pricing guide and compliance pack into month one of a new account | Extra steps in `uk-salon-onboarding/` and `uk-reseller-lifecycle/` | Not built |
| 3 | **Seasonal triggers** — the UK tanning year | New campaign folders, one per trigger | Not built |
| 4 | **Tool-triggered follow-ups** — ran the calculator, gets the pricing article | Entry trigger on the **Business-tool user** state | Not built |

Every one of those is an existing campaign folder pattern. Nothing new is built
in the email system.

---

## 1. The Salon Business Brief

**Suggested folder:** `email/campaigns/uk-salon-business-brief/`
**Audience:** the trade list, including prospects who have never ordered
**Cadence:** monthly. Not weekly — we do not have a number worth knowing every
week, and a thin issue costs more trust than a skipped month.
**Shape:** one number, one interpretation, one link. 120–200 words. Plain text or
very lightly branded.
**Never carries a promotion.** The Brief's value is that it does not sell.

**Issue 1** — `what-a-spray-tan-costs`, built on **£267**: what a 20%-cheaper
litre is worth over a year, against £1,404 for three retail sales a week. Full
brief in
[`../04-pipeline/what-a-spray-tan-costs/derivatives.md`](../04-pipeline/what-a-spray-tan-costs/derivatives.md#the-email).

**Open question:** Resend or Klaviyo. Trade infrastructure is Resend — the AU,
UAE and UK onboarding campaigns are Resend templates and the trade contact data
is there. Consumer runs on Klaviyo via `send.jimmycoco.co.uk`. Resend is the
default answer; confirm before the first issue, because moving a list later is
unpleasant.

## 2. Lifecycle inserts

A new trade account should receive the pricing guide and the compliance pack
within its first month. These are **additional steps in campaigns that already
exist**, not new campaigns:

| Sequence | Insert | From |
|---|---|---|
| `uk-salon-onboarding/` | The pricing guide | `what-to-charge-for-a-spray-tan` |
| `uk-salon-onboarding/` | The compliance pack | `spray-tan-licence-uk` + the template pack |
| `uk-reseller-lifecycle/` | Cost model, early | `what-a-spray-tan-costs` |

Editing a live sequence is a heavier change than adding a campaign — it alters
what existing accounts receive. Each insert needs its own approval, and the
onboarding sequence is live in Resend (`uk-onboarding-1..7`).

## 3. Seasonal triggers

Driven by the UK tanning year, mapped in
[`../02-pillars/04-filling-the-diary.md`](../02-pillars/04-filling-the-diary.md).

| Window | Trigger | Article |
|---|---|---|
| First week of January | January survival | `surviving-january` |
| April | Prom and event pricing | `bridal-tanning` |
| October | Party-season capacity | `uk-spray-tan-year` |

Calendar-driven sends are the exception in this programme. They are justified
here because the trade year has a real shape — not because a month has passed.

**Blocked:** `uk-spray-tan-year` needs genuine data before drafting — search
seasonality, our own order data, therapist input. None of it exists in written
form anywhere, which is why it is the highest-share-potential piece in the
programme and the most research-hungry.

## 4. Tool-triggered follow-ups

Running a business tool is a real intent signal. It is defined as the
**Business-tool user** lifecycle state in
`email/00-strategy/02-audience-and-lifecycle-states.md`.

| Tool | Follow-up |
|---|---|
| Cost and profit calculator | `what-to-charge-for-a-spray-tan` |
| Tans-per-litre yield tool | `what-a-spray-tan-costs` |
| Consultation & consent pack | `spray-tan-insurance` |

Per [decision 3](../00-strategy/decisions.md#3-tools-and-templates-ungated-all-of-them)
the tools are ungated, so this trigger fires only where an address is offered
voluntarily — a "send me my results" option, never a wall in front of the result.

---

## Trigger governance

Each of the four defines everything required of any automation in
`email/00-strategy/03-email-journey-architecture.md`: entry trigger, eligibility
rules, suppressions, delay logic, exit conditions, priority against other flows,
personalisation fallback and measurement plan.

Educational content sits at **lifecycle education** in the cross-flow priority
order — below transactional, post-purchase and recovery messaging. A content
send never displaces a service message or an abandonment flow.

## Building any of these

1. Use the `build-jimmy-coco-email-campaign` skill.
2. Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely.
3. Campaign voice is governed by that document, **not** by
   [`../01-editorial-system/voice.md`](../01-editorial-system/voice.md).
4. Evidence carries across: the content evidence standard applies to the email.
   A number too uncertain to publish in an article is too uncertain for a
   subject line.
5. Register in `email/campaigns/README.md` and, where the outreach worker sends
   it, `shared/campaign-registry.js`.
6. **Everything stays disabled until enablement is explicitly approved.** Nothing
   in this folder authorises a send, a broadcast, a publish or a contact import.

---

## Social

Three to five cuts per article, specified in the article's `derivatives.md`.

**Every cut carries one number and stands alone.** Nobody should have to click to
get the point. A cut that only makes sense if you read the article is an
advertisement for the article; a cut that delivers a fact is a thing people
repost.

Facebook groups for mobile and home-based therapists are where this audience
actually shares things, and a cut designed to be **reposted by a member** beats
one designed to be posted by the brand. That means no dominant logo lock-up, no
CTA, no hashtag stack. Instagram and TikTok carry the craft pillar better than
the business pillars — technique is visual, margin is not.

## What we don't do

- No gated lead magnets.
- No syndication to sites that will not link back.
- No repurposing an article as a paid ad — different job, different copy.
- **No dropping article links into existing sequences ad hoc.** Inserts are
  specified above and approved individually; the live sequences are tuned.
