# Klaviyo Build Sheet — Re-Engagement Flow
### Sunless by Jimmy Coco · **AS-BUILT record, 30 July 2026**

> **Status: BUILT AS DRAFT. Nothing enabled, nothing sent.**
> Segments, the three emails and the flow all exist in Klaviyo account `WneYkr`.
> Email copy is in `reengagement-emails.txt`; strategy and rationale in `re-engagement-flow.md`.

---

## ⚠️ Read this before enabling anything

**The UK offer is currently sent to ALL subscribers, and offers are US/UK-specific.** That means a slice of the list has been receiving £ pricing and UK shipping it can't act on — and those people then look "unengaged" in the data.

Measured inside the 21,628 sleepy segment (the sunset path):

| Slice | Count | Review segment |
|---|---|---|
| Confident US | **1,253** | `ThdK8k` |
| Unroutable (no city data) | **6,231** | `WxyuKJ` |
| **Combined** | **~7,480 = 35% of the sunset path** | |

70% of confident-US subscribers are in the sleepy segment vs 63% for the list overall. Suggestive, not conclusive — but enough that **these people must not be auto-suppressed.** The flow now handles this structurally (see Part 3).

---

## What exists in Klaviyo

### Audience segments
| Object | ID | Size |
|---|---|---|
| A · Engaged (send-first) | `V4mDxv` | 4,771 |
| C · Sleepy (win-back target) | `UtWR7K` | 21,628 — **flow trigger** |
| D · Never-engaged | `Ue565z` | 10,471 |

### Market routing segments
| Object | ID | Size |
|---|---|---|
| GEO – UK (confident) | `VH6bQy` | 21,992 |
| GEO – US (confident) | `SPSHMB` | 1,797 |
| GEO – Unroutable (no city) | `RSkDMq` | 8,238 |
| GEO – Sleepy AND US (review) | `ThdK8k` | 1,253 |
| GEO – Sleepy AND unroutable (review) | `WxyuKJ` | 6,231 |

**"Confident" = country matches AND `location['city']` is set.** The city test is the quality gate — country alone was defaulted to "United Kingdom" on a 2022-era import, so raw US-by-country is 3,329 but only 1,797 survive.

### Templates (library masters)
`VBVVTs` Email 1 · `UvJBeP` Email 2 · `VsFrcE` Email 3

### Flow
`SGGsEB` — **"Re-engagement / Sunset (market-aware)"**, status **draft**, all actions draft.
*(Supersedes and replaces `RpACcX`, which was deleted — it auto-suppressed every market equally.)*

Reference point: "ALL email subscribers" (`WaECXi`) = **34,520**. Segment C is 63% of that.

**Metric IDs:** Clicked Email `ShBFf7` · Opened Email `VfspDs` · Received Email `X3Sh9V` · Active on Site `YhUnpb` · Placed Order `RKdSXS`
> ⚠️ Two "Placed Order" metrics exist: Shopify `RKdSXS` (live — use this) and Wix `UKqp7c` (legacy).

---

## PART 1 — The segments (as built)

All carry an **email-consent condition** (`can receive email marketing`), added beyond the original spec so counts describe a genuinely sendable audience. Without it C read 23,281 and D read 10,644.

### Segment A — `V4mDxv` · 4,771
Match **ANY**: `Clicked Email` ≥1 in last **60d** · OR `Active on Site` ≥1 in last **60d** · OR `Placed Order` ≥1 in last **60d**. AND consent.

### Segment C — `UtWR7K` · 21,628
Match **ALL**: `Received Email` ≥**5** in last **365d** · AND `Clicked Email` **0** in last **90d** · AND `Placed Order` **0** in last **120d** · AND `Active on Site` **0** in last **90d** · AND consent.

### Segment D — `Ue565z` · 10,471
Match **ALL**: `Received Email` ≥**3** all time · AND `Opened Email` **0** all time · AND `Clicked Email` **0** all time · AND profile `Created` **at least 30 days ago** · AND consent.

> **Decision — D is NOT a separate trigger.** Most of D also satisfies C's conditions and already enters via the C trigger. A second trigger would only add the fringe who received 3–4 lifetime emails.

### Market segments — the property syntax that actually works
Built-in location fields are **not** `location.country`, `country` or `city` — all rejected with *"All custom profile properties must be of the form: properties['property name']"*. **The working form is `location['country']` / `location['city']`:**
```json
{"type":"profile-property","property":"location['country']",
 "filter":{"type":"string","operator":"equals","value":"United Kingdom"}}
{"type":"profile-property","property":"location['city']",
 "filter":{"type":"existence","operator":"is-set"}}
```
There is also a native `profile-region` condition, but its enum is only `united_states` / `european_union` — no UK, so UK must use `location['country']`.

---

## PART 2 — Warm up first (≈ 2–3 weeks, BEFORE enabling the flow)
Send the next **2–3 regular campaigns to Segment A only** (4,771). Rebuilds Gmail reputation before anything touches the cold segment. **Do not skip.**

**Also in this window: switch UK campaigns from "ALL email subscribers" to `GEO - UK (confident)`.** One field in campaign setup; stops the mis-routing immediately.

---

## PART 3 — The flow (as built) · `SGGsEB`

Trigger: **Segment C** (`UtWR7K`). Re-entry: **never**.
Flow filter (the auto-exit): `Clicked Email` **equals 0 since starting this flow** — evaluated before every message, so anyone who clicks is dropped before the next send.

| # | Action ID | Step |
|---|---|---|
| 1 | `113259338` | **Email 1** — "can I ask you something?" |
| 2 | `113259339` | Time delay — **5 days** |
| 3 | `113259340` | **Email 2** — "in case you forgot what we do" |
| 4 | `113259342` | Time delay — **7 days** |
| 5 | `113259343` | **Email 3** — "should I stop emailing you?" |
| 6 | `113259344` | Time delay — **3 days** |
| 7 | `113259345` | **Conditional split** — `location['country']` equals "United Kingdom"? |
| 8a | `113259346` | **TRUE** → update profile `sunset = true` |
| 8b | `113259347` | **FALSE** → update profile `sunset_review = true` |

Flow-message IDs: `WhydFz` (1) · `XsX4zr` (2) · `Uqv5PG` (3).

### Why the split at the end
All three emails are **market-neutral** — no prices, no shipping claims, one text link. So a US or unknown-market subscriber can safely receive them. What is *not* safe is the outcome: retiring someone for ignoring offers that never applied to them.

- **UK non-responders → `sunset = true`.** They received relevant offers all along, so silence is a real signal.
- **Everyone else → `sunset_review = true`.** Held for human judgement rather than auto-suppressed.

### Why there are no mid-series conditional splits
The original plan had a "clicked since flow start?" split after each delay. The Klaviyo API requires a conditional split to wire **both** `next_if_true` and `next_if_false` to real actions — there is no "exit" node. Since the flow filter produces identical behaviour, the mid-series splits were collapsed into it. Nothing is lost. Add them in Flow Builder if you want them visible.

---

## PART 4 — Sunset (manual, by design)
Klaviyo will not auto-suppress from a flow. After the series has run:
1. Build a segment: `sunset` **is** `true` → exclude from campaigns, **or** select and **Actions → Suppress**.
2. Separately review `sunset_review` **is** `true` — these are the mis-served markets. Give them a correctly-routed offer *before* deciding.

Suppress, don't delete — you keep the record and can still run a quarterly win-back or reach them by SMS.

---

## API gotchas worth remembering
- **Flow messages clone their template.** Editing library template `UvJBeP` does **not** change what the flow sends. PATCH the flow action's `message.template_id` back to the library ID to force a re-clone (mints a new flow-side ID each time). Flow-owned template IDs 404 on the templates API.
- `update_flow` only changes **status** — it cannot restructure a definition. Structural changes mean create-new + delete-old.
- `update-profile` keys must be `properties['sunset']`, and boolean ops need `operator: "create"` when the property doesn't exist yet.
- **`profile-group-membership.group_ids` accepts LISTS ONLY, not segments.** Passing a segment ID returns *"Group X does not exist for company"*. To intersect segments, duplicate the conditions.
- Segment condition groups are **AND**ed; conditions **within** a group are **OR**ed.
- `get_flows` rejects `equals(id,…)` — only `any`. Use `get_flow` for one flow.

---

## Guardrails while it runs
- Keep sending **engaged-first** through the warm-up window.
- **Batch the sleepy sends** — 21.6k is far too many for one blast. A few thousand a day.
- Watch **spam-complaint rate**; pause above ~0.1% (currently 0.00%).
- Keep Email 1 genuinely plain — the more hand-typed it looks, the better it lands in Primary.

## Success metrics (not opens)
- **Reactivation rate** of Segment C (a solid win-back ≈ 3–8%).
- **Click rate** on the next campaigns to the cleaned list.
- Spam-complaint & unsubscribe rates staying low.

Apple Mail auto-opens make open rate near-useless. Judge on clicks and orders. *(Klaviyo does expose `machine_open` on open events and `Bot Click` on clicks — so machine opens can be filtered rather than ignored. Untested; worth a look.)*

---

## ✅ Checklist
- [x] Segments A / C / D built, with consent condition
- [x] Market segments built (UK / US / unroutable + two review segments)
- [x] D routing decided — covered by C
- [x] Emails 1–3 drafted plain-text style, `{% unsubscribe %}` + address present
- [x] Email 2 incentive decided — **no code**, subject corrected to match
- [x] Flow built with market-aware final split — `SGGsEB` (draft)
- [x] Superseded flow `RpACcX` deleted
- [ ] **Switch UK campaigns to `GEO - UK (confident)` audience**
- [ ] Decide what the ~6,200 unroutable sleepy profiles receive
- [ ] 2–3 warm-up campaigns to Engaged only
- [ ] Real test email to 360precision@gmail.com (never an in-panel preview)
- [ ] Flow + its three message actions enabled *(requires explicit approval)*
- [ ] Post-series: suppress `sunset = true`; review `sunset_review = true` separately
- [ ] **Open question:** all sampled orders are GBP with no evidence of USD — if US offers are USD-priced, that's a Shopify Markets question
