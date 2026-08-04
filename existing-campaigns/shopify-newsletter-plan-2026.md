# Shopify × Klaviyo — Final Newsletter Plan & Site Actions
### Sunless by Jimmy Coco · prepared 4 August 2026 · **revision 2**
**Sources:** Shopify Admin API + ShopifyQL (`jimmy-coco-international.myshopify.com`, GBP), the live storefront, and Klaviyo account `WneYkr`. Every figure pulled today.
**Coverage:** all **10,101** orders placed 1 Jan – 4 Aug 2026, plus 13,384 orders back to 1 Aug 2025 for repeat-purchase measurement. Basket analysis was recomputed from raw order records, not taken on trust — the order count reconciles exactly to Shopify's own `ordersCount`.

> **Changes in revision 2:** the two Soufflé listings turned out to share a SKU, which corrects §4 and invalidates part of the old stock table (§3). A new §5 sets out exactly what to change on the site and what each change is worth.

---

## 0. Fix before any email goes out

**Every bundle the flash-sale v2 draft is built around has sold zero units — across all 10,101 orders this year.**

| Product in the v2 email | Price | Live since | Units 2026 | Revenue |
|---|---:|---|---:|---:|
| The Glow Edit *(leads the email)* | £32 | 14 Jul | **0** | **£0** |
| A-List Glow Kit | £59 | 3 Jul | **0** | **£0** |
| A-List Essentials | £36 | 3 Jul | **0** | **£0** |
| Malibu Beach Duo | £28 | — | 313 | £7,423 |

Confirmed three ways: ShopifyQL units, ShopifyQL sales-by-product, and a direct scan of every 2026 line item.

The Glow Edit was v1's **top click magnet — 41 unique clicks, double any other product — and converted none of them.** Live and in stock for three weeks; never sold once.

**The likely cause isn't the copy.** All three are Shopify component bundles, and all three contain `NEW - The A-List Face Tanning Mist`, which is at **zero inventory**. The one bundle without it (The Glow Bundle, a plain product) sells normally — 49 orders. The storefront still renders "Add to bag", so any failure happens at checkout, not on the page.

> **Do not send flash-sale v2 as built.** It leads with a product that has never sold and links to two more in the same state.

---

## 1. Product URLs — the `&item=` workaround can be retired

| Product | URL | Stock |
|---|---|---|
| The Glow Edit | `/products/the-glow-edit` | 2,616 |
| A-List Glow Kit (Medium) | `/products/the-a-list-glow-kit-medium` | 78 |
| A-List Essentials (Medium) | `/products/the-a-list-essentials` | **0** |
| A-List Essentials (Dark) | `/products/new-the-a-list-essentials-dark` | **0** |
| A-List Face Tanning Mist | `/products/face-mist` | **0** |

Both A-List Essentials variants are on `inventoryPolicy: CONTINUE` — they keep accepting orders at zero stock.

---

## 2. Attribution — Klaviyo's number is real

| | Klaviyo `Placed Order` | Shopify |
|---|---:|---:|
| Orders, 2026 YTD | 10,108 | 10,101 |
| Revenue | £257,830.94 | £255,596.07 |

A 0.07% gap. Klaviyo sees essentially every order, so the attribution share is trustworthy:

- **5.9%** of orders · **6.9%** of revenue (£17,621.76)
- Email AOV **£29.67** vs store-wide **£25.30** — email orders run **17% larger**

Shopify's own referrer data records exactly **one** email order all year, because UTMs were off until the v2 draft. Klaviyo attributes by profile, not link. Keep UTMs on and the two will converge.

---

## 3. What actually sells

Net sales, 2026 YTD:

| Product | Net sales | Share | Units | Orders |
|---|---:|---:|---:|---:|
| Soufflé Malibu — *choose from two shades* (£22) | £101,355 | 46.3% | 5,912 | 5,454 |
| Soufflé Malibu — Medium (£18) | £41,232 | 18.8% | 3,102 | 2,787 |
| Soufflé Malibu — Dark (£18) | £23,003 | 10.5% | 1,682 | 1,446 |
| The Body Brush | £10,008 | 4.6% | 1,117 | 1,091 |
| The Face Brush | £8,944 | 4.1% | 1,001 | 1,112 |
| Buff & Glow Mitt — Navy | £8,910 | 4.1% | 1,197 | 1,139 |
| Essential Glow Mitt — Black *(incl. legacy title)* | £8,165 | 3.7% | 1,365 | 1,342 |
| Malibu Beach Duo | £7,423 | 3.4% | 313 | 276 |
| A-List Face Tanning Mist | £5,702 | 2.6% | 356 | 350 |
| Tinted Lip Balm | £1,349 | 0.6% | 208 | 222 |

**The Soufflé line is 75.6% of net sales. Accessories 16.4%. Every bundle and kit combined 3.9%.**

The newsletter is built around the 0% and pointed away from the 76%.

### Stock — corrected

The Soufflé is listed twice under the same SKUs (§4), so it has **two separate inventory records for one physical product**. Treat per-listing counts with suspicion:

| SKU | Listing | Recorded stock |
|---|---|---:|
| IM4 (Medium) | choose from two shades | 1,117 |
| IM4 (Medium) | Soufflé Medium | 63 |
| IM5 (Dark) | choose from two shades | 1,499 |
| IM5 (Dark) | Soufflé Dark | 77 |

My earlier "Soufflé Medium has ~4 days of cover" alarm was a bookkeeping artefact of this split, not a real stockout. **The split itself is the problem** — two records for one product means neither is trustworthy and overselling is possible.

Genuinely at zero, and worth restocking: **Malibu Beach Duo** (£7,423/yr) and **A-List Face Tanning Mist** (£5,702/yr, and it blocks three bundles). The Body Brush at 39 units is worth a look — that record isn't duplicated.

---

## 4. The duplicate listing — corrected, and bigger than first described

The same product is listed twice, at two prices. **Same SKU on both:**

| Listing | SKU | Price | Displayed as | Orders | Sold alone | Attach rate |
|---|---|---:|---|---:|---:|---:|
| choose from two shades | IM4 / IM5 | **£22.00** | full price | 5,454 | **86.6%** | **13.4%** |
| Soufflé Medium | IM4 | **£18.00** | ~~£22~~ £18 | 2,787 | 38.7% | **61.3%** |
| Soufflé Dark | IM5 | **£18.00** | ~~£22~~ £18 | 1,446 | 45.5% | 54.5% |

Identical descriptions, word for word. It is one product with two pages, two prices and two stock records.

**Why the attach rates differ — it is not the page.** I checked both storefront pages: neither has any cross-sell, upsell, "frequently bought together" or recommended-products section. They are structurally the same page. The difference is *who arrives*:

| Listing | No referrer (direct/untracked) | Social | Search |
|---|---:|---:|---:|
| choose from two shades | **5,242 (96.1%)** | 129 | 84 |
| Soufflé Medium | 1,251 (45%) | 947 | 587 |
| Soufflé Dark | 612 (42%) | 473 | 361 |

The £22 listing is fed almost entirely by an untracked direct funnel — the signature of a paid ad or link-in-bio dropping people straight onto a buy button. The £18 listings receive social and search traffic: people who arrived by browsing, and browsing is what produces a second item.

**So the 61.3% figure is partly selection, not a target you can simply copy.** Those customers were already more likely to add something. The gap is real and large, but part of it is customer mix. Treat 61.3% as a ceiling, not a forecast.

The heavier discounting also sits on the £22 listing: **£27,161 of the £40,315 given away this year — 67% of all discounting — at a 21.1% rate, versus 9.1% on the Medium listing.**

---

## 5. What to change on the site, and what it's worth

Sized against the whole email programme's £17,622 for the year, for scale.

### Change 1 — Add an accessory cross-sell. *(Nothing like this exists anywhere on the site.)*

**Where:** both Soufflé product pages and the cart. Primary target is the £22 listing — 5,454 orders a year with no second item 86.6% of the time.

**What:** a "Complete your tan" block offering **The Body Brush (£16), The Face Brush (£12), Essential Glow Mitt (£9.99)** with one-tap add. Those three are the highest-frequency real pairings in the data — Soufflé Medium + Body Brush alone co-occurs in 844 orders at 2.80 lift.

**Framing — this is the part that does the work.** Free UK delivery starts at £30. The Soufflé is £22. **Every single-item buyer is exactly £8.00 short.** The cheapest accessory (£9.99) takes them to £31.99. Show it as progress: *"You're £8.00 from free UK delivery."*

**Impact.** Each attach event is worth **~£11 net** (1.46 accessories per attaching order × £7.70 average net per accessory):

| Attach rate on the £22 listing | Extra attach events/yr | Accessory revenue | Net of forgone delivery charges |
|---|---:|---:|---:|
| 13.4% → **25%** (conservative) | +633 | £7.0k | **≈ £5.1k** |
| 13.4% → **40%** (mid) | +1,451 | £16.0k | **≈ £11.6k** |
| 13.4% → **61.3%** (ceiling) | +2,612 | £28.7k | **≈ £20.9k** |

Even the conservative case is real money at zero acquisition cost. The mid case is comparable to two-thirds of everything email produced this year.

**Effort:** a theme section or an off-the-shelf cross-sell app. **Risk:** low. **Do this first.**

---

### Change 2 — Resolve the duplicate listing

**The problem:** SKU IM4/IM5 sit on two products at £22 and £18, the £18 shown as a markdown from £22. A customer who finds both sees your full-price page undercut by 22%. Stock is tracked in two places for one product.

**What to change:** consolidate to **one product page with Medium/Dark as variants** — the "choose from two shades" listing — and 301-redirect the two standalone listings to it. That also consolidates reviews, SEO authority and inventory onto one record.

**Impact.** 4,784 units sold this year through the £18 pages, £4 below the price of the identical product elsewhere — **£19,136 of price gap given away without a decision being taken.** Realised prices ran lower still (£14.69 average per unit on the Medium listing against £21.75 on the £22 one), so the true gap is larger.

**Risk: medium, and this is the one to be careful with.** Those pages carry your social and search traffic, and £18-with-a-strikethrough may be doing real conversion work. Consolidating at £22 could cost volume. **Don't jump the price.** Redirect first and hold £18 as a visible promotional price on the single page, then test moving it.

---

### Change 3 — Restock the A-List Face Tanning Mist, then test a real checkout

**Impact:** unblocks three products at once, including the email's strongest click magnet. Can't be sized — they have no sales baseline — but The Glow Edit currently converts 41 clicks into nothing, and the flash sale is built on it.

**Do this before scheduling v2.** Place a real order end-to-end to confirm the bundles can actually be bought.

---

### Change 4 — Put the free-shipping threshold to work everywhere

Store AOV is **£25.30** against a **£30** threshold. **The average order is £4.70 short of free delivery** — the most exploitable gap on the site, and it currently appears only as static text.

**What to change:** a cart progress bar, and the same message on the product page.

**Impact:** you collected **£14,401** in delivery charges this year. Converting a sub-£30 order into a £30+ order trades roughly £3 of shipping revenue for roughly £10 of product. That trade is already priced into the table in Change 1 — this is the mechanism that makes Change 1 work, not a separate win.

---

### Change 5 — Fix the subscription cadence

"Subscribe and save — deliver every month, 15% off" is offered on both Soufflé pages. **The measured median re-order gap is 51 days.** Monthly is roughly 40% too frequent, which drives cancellations and stockpiling.

**What to change:** offer 6-week and 8-week intervals, and default to 8 weeks.

**Impact:** not sizeable from here — I don't have subscription uptake data. Low effort, and the cadence is demonstrably wrong. Worth pulling the subscription numbers before committing.

---

### Priority

| # | Change | Effort | Annual impact | Risk |
|---|---|---|---|---|
| 1 | Accessory cross-sell + free-delivery nudge | Low | **£5k–£21k** | Low |
| 3 | Restock face mist, verify bundle checkout | Low | Unblocks 3 products | Low |
| 2 | Consolidate the duplicate listing | Medium | Up to **£19k** price recovery | Medium |
| 4 | Free-shipping progress bar | Low | *(mechanism for #1)* | Low |
| 5 | Subscription cadence 4wk → 8wk | Low | Unknown | Low |

---

## 6. Repeat purchase — the timing answer

13,384 orders across 12 months; every order has a customer ID, so coverage is complete.

**First → second order: median 50.9 days** (55.2 excluding sub-2-day split checkouts), p25 18.6d, p75 102.6d, p90 184.6d. Broad and flat — no tight cycle. Genuine re-order mass sits **day 25 to day 110, centred on ~55 days**.

**Cumulative second order** (first order 120+ days ago, n=5,807): 4.1% by 30d · 6.7% by 60d · 9.0% by 90d · 10.6% by 120d.

**Repeat rate 25.6%** for cohorts observed 9+ months. The 11.6% within-window figure understates badly — ~40% of customers are under 90 days old.

**AOV is flat across order sequence** — £25.54 → £26.14 → £27.30, median £22 every time. **Repeat value comes from frequency, not bigger baskets.** Growing repeat AOV is pushing on a rope; growing repeat *rate* is where the return is.

**Repeat rate by first product:** Face & Body Dark 26.0% · Face & Body Medium 20.9% · Malibu Dark 15.3% · Malibu Medium 11.6% · choose-shades **10.6%**. Darker shades repeat ~2× better, and the heavily-discounted express-lane SKU produces the worst repeat customers.

**For the calendar:** the 60→120 day band adds almost as many repeats (3.9pp) as the whole 0→60 band (6.7pp). A monthly blanket newsletter misses both peaks. Replace it with **two triggered replenishment sends at day 35 and day 75**, and keep the campaign calendar for editorial and offers.

---

## 7. Margin — still unanswerable

**`unitCost` is null on every variant.** No cost-per-item has ever been entered, so there is no COGS and no gross-profit reporting.

**£40,315 was given away in discounts this year — 15.4% of gross sales — with no visibility of what any of it cost.** Populate cost per item on the ten SKUs that make up 99% of revenue; it is one field per variant and it unlocks margin-aware discounting. Until then every discount decision is a guess.

---

## 8. The plan, ranked

**Before anything sends**

1. Restock the A-List Face Tanning Mist and prove bundle checkout works with a real order.
2. Pull the dead products out of flash-sale v2, or hold it. Re-point at the Soufflé line — 76% of actual revenue.
3. Enter cost per item on the top ten SKUs.

**Site — highest return per hour of work**

4. Accessory cross-sell with the £8-to-free-delivery nudge (§5.1). **£5k–£21k/yr.**
5. Consolidate the duplicate Soufflé listing; redirect, hold the price, then test (§5.2).
6. Restock the Malibu Beach Duo.

**Email**

7. Replace the monthly newsletter with day-35 and day-75 replenishment triggers.
8. Stop sending to `Spa / Salons Reachout` (10.84% bounce, £0) and `JULY NEW PRO UK BUSINESS` (6.84% bounce, £0).
9. Retire or merge the `Monthly Newsletter` list (£0.017/recipient).
10. Send engaged-first: Repeat Buyers → Buyers Club → Lapsing 60–90d (~25,400 profiles at £0.10–0.20/recipient).
11. Reinstate the payday campaign monthly — £0.171/recipient, best of the year, not repeated since January.
12. Give Pro/salon its own track with trade pricing and an account-application CTA — 7.06% CTOR, £56–68 AOV, nine orders all year.
13. Alternate editorial and discount; never two discounts back to back.
14. Keep UTMs on every send.
15. Report on **£/recipient**.

---

## Caveats

- **Margin is unanswerable** until cost per item is entered — the biggest remaining gap.
- The zero-sales root cause in §0 is a **strong hypothesis, not proof**. The correlation is perfect and the mechanism plausible, but the storefront renders "Add to bag", so it needs a live checkout test.
- The 61.3% attach rate in §4 is **partly a selection effect**. Browsing customers were always likelier to add a second item. The impact table in §5.1 is deliberately anchored on 25% and 40%, not the ceiling.
- Impact figures are **revenue, not profit**. With no COGS in the system, none of them can be converted to margin.
- Basket analysis merges near-duplicate product titles (products were renamed mid-year); merged counts carry ~±9 orders on the black mitt.
- Repeat analysis is left-censored at 1 Aug 2025 — a customer's "first order" may predate the window, slightly inflating short-interval buckets.
- `Tissue Paper` and `Gift Bag`/`Wash bag` are £0 packaging lines on ~16% of orders, excluded from all basket figures.
