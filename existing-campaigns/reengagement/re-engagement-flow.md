# Re-Engagement Flow — Sunless by Jimmy Coco

**Goal:** lift click rates and improve Gmail inbox placement (Promotions → Primary) by rebuilding sender reputation with *engaged* subscribers first, then running a targeted plain-text win-back to the "sleepy" part of the list — and cleanly retiring the ones who never respond.

**Prepared:** 30 July 2026 · **Built as Klaviyo drafts:** 30 July 2026

> **Status: BUILT, NOT ENABLED.** Flow `SGGsEB` "Re-engagement / Sunset (market-aware)" and all supporting segments exist in account `WneYkr`. Nothing has been sent. Object IDs and click-by-click detail are in `klaviyo-build-sheet.md`.

---

## The principle (why this order matters)

Gmail decides where your email lands largely on **how *your* subscribers engage with *you*.** Every email sent to someone who ignores it is a small negative signal; every click and purchase is a positive one. So the fastest way to improve placement is to *stop sending to dead weight* and *concentrate sends on people who react* — then reputation lifts for everyone.

The sequence is always: **clean → warm up on the engaged → win back the sleepy → sunset the silent.** Out of order (e.g. blast the whole list to "boost numbers") and placement gets worse.

> **Caveat before setting thresholds:** Apple Mail auto-opens every email, so *opens are unreliable.* Define "engaged" on **clicks, site activity and purchases** — things a machine can't fake — and treat opens as a soft signal only.

---

## What the numbers turned out to be

| Segment | Size | Share of sendable list |
|---|---|---|
| **A · Engaged** | 4,771 | 14% |
| **C · Sleepy** (target) | 21,628 | **63%** |
| **D · Never-engaged** | 10,471 | 30% |
| *ALL email subscribers* | *34,520* | *100%* |

**Segment C being 63% of the list is the first headline.** This isn't a tidy-up at the margins — it's most of the database. So: batching is not optional, and the warm-up matters more, not less, because only 4,771 genuinely engaged profiles have to carry the reputation load.

---

## The second headline: some of "sleepy" is mis-served, not cold

**The UK offer is currently sent to ALL subscribers, and offers are US/UK-specific.** So an entire slice of the list has been receiving £ pricing and UK shipping it cannot act on — and then shows up in the data as unengaged.

By market:

| | Size |
|---|---|
| GEO – UK (confident) | 21,992 |
| GEO – US (confident) | 1,797 |
| GEO – Unroutable (no location data) | 8,238 |

**"Confident" = country matches AND city is populated.** Country alone can't be trusted: it was defaulted to "United Kingdom" on a 2022-era import, so profiles with US ISP IPs (Comcast, Verizon) sit in the UK bucket. Raw US-by-country is 3,329; only 1,797 survive the city test. Newer Shopify/TikTok profiles carry proper location — the rot is confined to legacy imports.

Inside the sunset path:

| Slice of the 21,628 | Count |
|---|---|
| Confident US | **1,253** |
| Unroutable | **6,231** |
| **Combined** | **~7,480 — 35%** |

**70% of confident-US subscribers are in the sleepy segment, against 63% for the list overall.** Suggestive rather than conclusive — US subscribers may be disproportionately sleepy for other reasons, e.g. TikTok impulse buyers who were never going to repeat — but it points the same way common sense does.

**Consequence: roughly a third of the people the sunset flow would eventually retire may never have been properly served.** Retiring them would be discarding an audience, not cleaning a list. The flow now handles this structurally rather than relying on anyone remembering.

---

## Step 0 — Clean & prepare (before any send)

1. **Confirm suppressions are working.** A recent campaign correctly skipped 843 suppressed contacts, so this is in good shape.
2. **Build the segments** (done).
3. **Switch UK campaigns from "ALL email subscribers" to `GEO - UK (confident)`.** This is the single highest-value change and takes one field in campaign setup.
4. **Do not touch the sleepy segment yet.** Warm up first.

---

## Step 1 — The segments

| Segment | Definition (reliable signals first) | Use |
|---|---|---|
| **A · Engaged** | Clicked **or** visited **or** purchased in last **60 days** | Send-first during warm-up |
| **B · Passive** | Opened/clicked 61–90 days ago, nothing since | Not built — keep in normal sends, watch |
| **C · Sleepy** | Received ≥**5** in 365d, **no click or visit in 90d**, **no purchase in 120d** | Re-engagement series target |
| **D · Never-engaged** | Received ≥**3** all-time, **never** opened or clicked, created >**30d** ago | Covered by C |

All built segments also require **can receive email marketing** — added beyond the original spec so counts describe a real sendable audience. Reporting accuracy only; Klaviyo would never have emailed non-consenting profiles.

**Decision — D does not get its own trigger.** Most of D also satisfies C's conditions and already enters via C. A second trigger adds only the fringe with 3–4 lifetime emails. Suppressing D outright was considered and rejected: they've never engaged, but the third email is a fair last chance and costs little.

**Threshold notes.** If deliverability really struggles, tighten "Engaged" to clicks/purchases only and warm up on a smaller, hotter core. The "≥5 received" floor stops brand-new subscribers being wrongly flagged as sleepy.

---

## Step 2 — Warm up on the engaged (≈ 2–3 weeks)

1. Send the next **2–3 regular campaigns to Segment A only** (4,771).
2. This concentrates clicks and tells Gmail "people who get this mail *want* it".
3. Keep a healthy image-to-text balance (the trust-fix flash sale is a good template).

Skipping this is the most common mistake — reputation should be trending *up* before you send to a cold segment, because the win-back will inevitably underperform.

---

## Step 3 — The re-engagement series (Segment C, 3 emails over ~2 weeks)

Klaviyo flow **`SGGsEB`**, triggered on entering Segment C. All three emails are **plain-text, personal, from Jimmy** — no banner, no buttons, one link. The point is to *not* look like a broadcast.

**Exit condition:** a flow filter — `Clicked Email` = 0 **since starting this flow** — evaluated before every message, so the moment someone clicks they stop receiving the rest.

| # | Timing | Subject | Purpose |
|---|---|---|---|
| **1 — "Still there?"** | Day 0 | `can I ask you something?` | Warm, human check-in. One soft question, one link. |
| **2 — "Here's what you're missing"** | Day 5 | `in case you forgot what we do` | Remind them of the value. No incentive. |
| **3 — "Last one from us"** | Day 12 | `should I stop emailing you?` | Honest permission-pass: click to stay, or we stop. |

Email #3 is the important one for list health: whichever way they respond is a win — they re-engage, or they self-select out and you can suppress guilt-free.

### The emails are deliberately market-neutral
None of the three carries a price, a discount or a shipping claim. That's why a US or unknown-market subscriber can safely receive all three — the ask is "do you still want to hear from us?", which is true in every market. *(The one link points at jimmycoco.co.uk, which will show GBP. Minor, but worth knowing.)*

### The market-aware ending
What is **not** safe is the outcome. So the flow ends on a conditional split:

- **`location['country']` = "United Kingdom" → `sunset = true`.** They've had relevant offers all along, so silence is a genuine signal.
- **Anything else → `sunset_review = true`.** Held for human judgement instead of auto-suppressed. These are the ~7,480 who may simply have been sent the wrong country's offer.

This replaces the original single "tag everyone sunset" ending. The earlier flow (`RpACcX`) was deleted rather than left in place, so nobody can enable the version that retires all markets equally.

### Decision — no discount code
The original plan left an optional `[CODE] for [X]% off` in Email 2. Dropped, because:

- A discount makes Email 2 read as promotional, working against the Primary-inbox goal that motivates the whole project.
- It risks buying back discount-only customers.
- The series works without it — the incentive was always framed as a response-rate lift, not a requirement.

The subject changed from "a little something to tempt you back" to "in case you forgot what we do" at the same time, because the original promised an offer the email no longer contains.

If reactivation lands below ~3%, adding a modest code to Email 2 is the obvious first test.

---

## Step 4 — Sunset the silent

Two buckets now, and they are not the same:

- **`sunset = true`** (UK non-responders) → suppress from campaigns. Do **not** delete: you keep the record, and can still run a quarterly win-back or reach them by SMS.
- **`sunset_review = true`** (US, other markets, unknown) → **do not suppress yet.** Give them a correctly-routed offer first. If they ignore *that*, they're genuinely cold.

Klaviyo cannot auto-suppress from a flow by design, so both steps are manual — which is useful here, because it forces the review.

Expect the list to shrink substantially. That's the point: a smaller, engaged list outperforms a big, sleepy one on both revenue and deliverability.

---

## Deliverability guardrails

- **Send engaged-first for the whole warm-up.**
- **Batch the sleepy sends** — a few thousand per day. Non-negotiable at 21.6k.
- **Watch the spam-complaint rate.** Above ~0.1%, pause and reassess (currently 0.00%).
- **Keep #1 genuinely plain** — real text, minimal HTML, personal from-name.
- **Consistent from-name/address** — `orders@jimmycoco.co.uk`, the one engaged subscribers already trust.

---

## How you'll know it's working

- **Reactivation rate** — % of Segment C who click, visit or buy during the series (~3–8% is solid).
- **Aggregate click rate** on the *next* campaigns to the cleaned list.
- **Inbox placement** — send yourself and colleagues a test; check Primary vs Promotions before/after.
- **Spam complaints & unsubscribes** staying low.
- **US reactivation specifically**, once offers are routed correctly — this tells you whether the 1,253 were cold or just mis-served.

---

## The emails

Full copy is in `reengagement-emails.txt`, which is the source of truth and matches the live drafts. Compliance footer (unsubscribe + physical address) on all three. Use the `{% unsubscribe %}` tag — `{{unsubscribe_url}}` renders a dead `href=""`.

---

## Quick-start checklist

- [x] Verify suppression list is clean (Step 0)
- [x] Build Segments A, C, D (Step 1)
- [x] Build market routing segments + review segments
- [x] Decide Segment D routing — covered by C
- [x] Draft the three plain-text emails with `{% unsubscribe %}` + address
- [x] Decide the Email 2 incentive — no code
- [x] Build the flow with market-aware ending (Step 3) — `SGGsEB`
- [ ] **Switch UK campaigns to `GEO - UK (confident)`**
- [ ] Decide what the ~6,200 unroutable sleepy profiles receive
- [ ] Send next 2–3 campaigns to Engaged only (Step 2)
- [ ] Real test to 360precision@gmail.com
- [ ] Enable the flow *(requires explicit approval)*
- [ ] Post-series: suppress `sunset = true`, review `sunset_review = true` (Step 4)
- [ ] Confirm whether US offers are USD-priced — Shopify Markets question, not Klaviyo
