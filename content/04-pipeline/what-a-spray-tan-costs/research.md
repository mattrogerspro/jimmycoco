# Research — What a spray tan actually costs you to deliver

---

## Verified — goes into `citations`

| Claim as it appears in the article | Source | Year | Sample | URL |
|---|---|---|---|---|
| National Living Wage £12.71 from April 2026 | Low Pay Commission / gov.uk | 2026 | — | https://www.gov.uk/national-minimum-wage-rates |
| Employer NIC secondary threshold cut to £5,000, frozen to 2031 | HM Treasury | 2025 | — | — |
| 20% of UK salons operating at a loss | NHBF, State of the Industry | Mar 2026 | **n=423** | — |
| Average UK salon profit margin 8.2% | sector data | 2026 | — | — |
| Spray tan £20–£40 nationally; London £25–£40; Manchester £20–£25 | sector pricing data | 2025–26 | — | — |
| Typical UK professional retail margin at RRP 40–60% | sector data | 2026 | — | — |
| Tanning has the highest no-show rate of any treatment category, 3.14%, peaking June–August | Treatwell | 2025 | — | — |
| UK no-shows cost £1.6bn/yr, ~£39 per miss; pre-payment halves them; 17% of salons use it | Treatwell | 2025 | — | — |
| Retail is 4% of UK salon revenue against a 15–25% benchmark | SalonIQ | 2026 | — | — |
| 70% of clients who don't buy retail say they would like to | Phorest | 2025 | n=716 | — |
| Sunset 1 Ltr Professional Spray, £60 | Our own price list | 2026 | — | https://www.jimmycoco.pro/products/malibu-professional-spray-1l |
| Tinted Tan Soufflé £18; mitt £15 | Our own price list, confirmed 8 Aug 2026 | 2026 | — | — |

⚠ Several rows have no URL. Before publish, each needs either a public link or a
fully-specified offline citation (publication, title, date). A citation a reader
can't follow is weaker than one we describe precisely — see
[`../../01-editorial-system/titling-and-metadata.md`](../../01-editorial-system/titling-and-metadata.md#citations).

## Stated assumptions — goes into the Assumptions block

| Assumption | Value used | Range | Why this value |
|---|---|---|---|
| Yield per litre | 28 tans | product figure | Confirmed by Matt 8 Aug 2026: approx 28 tans per bottle, 10% DHA. Not an assumption — this is the product figure. No published spread exists, so none is quoted. |
| Disposables per tan | £0.75 | £0.40–£1.50 | Hairnet, sticky feet, disposable briefs, barrier cream, wipes. Varies enormously with what you provide. |
| Extraction filter + tent liner, amortised | £0.15 | £0.05–£0.30 | Depends on booth type and volume. |
| Laundry — towels, gown | £0.20 | £0.10–£0.40 | Zero if the client brings her own and you don't gown. |
| Chair time, door to door | 25 min | 20–35 min | Includes prep, treatment, clean-down and reset. |
| Employer on-cost multiplier | 1.20× | 1.15–1.25× | Employer NIC plus holiday pay accrual on top of gross wage. **Depends on `[VERIFY 1]`.** |
| Room-attributable fixed costs | £450/month | £250–£900 | Rent share, rates share, utilities, insurance, booking software share. The single most business-specific number in the model. |
| Retail margin at RRP | 50% | 40–60% | Mid-point of the sourced professional band. Our own trade terms are not published. |
| Ticket price | £30 | £20–£40 | Mid-point of the national range. |
| Volume | 12 tans/week = 624/year | — | The calculator's default, so the article and the tool agree. |

## Open — `[VERIFY]` markers still in the draft

**The article does not leave draft until this table is empty.**

| # | What needs verifying | Where it appears | Who / how |
|---|---|---|---|
| 1 | **Employer NIC rate** on earnings above the £5,000 secondary threshold, tax year 2026/27. We have the threshold, not the rate. Drives the on-cost multiplier. | "The loaded cost of chair time" | gov.uk NIC rates and thresholds |
| 2 | **Typical UK card processing rate** for a small salon, 2026. Used at 1.5%. | "The bits that don't feel like costs" | Published rates from 2–3 UK acquirers |
| 3 | **Our 28 tans/litre figure** needs to be substantiated as a measurement rather than a working number — how it was arrived at, under what conditions. | Throughout | Internal — production / training |
| 4 | **Disposables basket price.** £0.75 is an estimate, not a priced basket. | Assumptions block | Price a real basket from 2 UK trade suppliers |
| 5 | **Treatwell's 3.14% "tanning" category** — confirm it means spray tanning and not sunbed, or that it aggregates both. Materially changes how we can quote it. | Levers table | Treatwell 2025 methodology |
| 6 | **8.2% average salon profit margin** — needs its primary source and year pinned. Currently attributed to "sector data". | "Is that a good margin?" | Trace to origin |
| 7 | **£450/month room-attributable fixed cost** — needs at least one real salon example behind it rather than a plausible figure. | Assumptions block; overhead section | Ask 2–3 stockists |
| 8 | **Regional pricing figures** are 2025–26 and due a refresh before the pricing article. Used here only as context, but they're quoted. | "What that means against what you charge" | 2026 sweep of published salon prices |

## Checked and rejected

| Claim | What we looked for | What we found | Added to register? |
|---|---|---|---|
| "X% of UK salons offer spray tanning" | A penetration figure to size the audience | No such figure exists. Several sources appear to give one; none survive checking. | Already on the do-not-use list |
| "£1,000/month average client spend" (Whito) | A retail benchmark | Implausible — contradicted by ~£40/visit × ~5 visits/year | Already on the do-not-use list |
| A published cost-per-treatment benchmark for UK spray tanning | Anything to sanity-check our model against | Nothing exists in sterling. This is why the article is worth writing. | n/a |

## Disagreements to present as disagreements

None material to this piece. The costing model is arithmetic; the contested
territory in this pillar is what you should *charge*, which is article 2.

## Notes for the next article in the pillar

- The levers table is the spine of `what-to-charge-for-a-spray-tan` — that piece
  starts where this one stops, at the cost floor.
- The retail lever (£1,404/year from three units a week) is large enough to
  carry `retail-attach-maths` on its own.
- The overhead-apportionment method is reusable in `tanning-room-economics` and
  `therapist-column-economics` without change.
