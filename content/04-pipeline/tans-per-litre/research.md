# Research — How many spray tans do you get from a litre?

Short, because almost everything in this piece is arithmetic derived from one
confirmed product fact.

---

## Verified — goes into `citations`

| Claim | Source | Note |
|---|---|---|
| Approximately 28 full-body tans per litre | Product figure, confirmed by Matt, 8 Aug 2026 | Matches `pro-site/app/lib/specs.ts`: "Approximately 28 full-body tans per litre" |
| 10% DHA | Product figure, confirmed 8 Aug 2026 | Matches `specs.ts`. Not stated in the article body — held for the craft and compliance pillars |
| £60 per litre | Current list price | |
| Spray tan £20–£40 nationally | UK sector data, 2025–26 | Used only to justify the £30 worked example |

## Derived — arithmetic, shown in the article

| Figure | Working |
|---|---|
| 35.7ml per tan | 1,000 ÷ 28 |
| £2.14 solution per tan | £60 ÷ 28 |
| 7.1% of ticket | £2.14 ÷ £30 |
| ~£46/year per extra tan per litre | (£60÷28 − £60÷29) × 624 |
| ~£223/year across the 26–30 spread | (£60÷26 − £60÷30) × 624 |
| 1.9 litres/month | (12 × 52 ÷ 12) ÷ 28 |
| 22.3 litres/year | 624 ÷ 28 |

All verified against a script, 8 Aug 2026.

## Open — `[VERIFY]` markers

**None.** The only outstanding item is the product-naming question in
[`brief.md`](brief.md#open-question--product-naming), which affects the citation
and the product link, not a figure.

## Checked and rejected

| Claim | What we found | Action |
|---|---|---|
| **"24–32 tans per litre"** | Written into an earlier draft of `what-a-spray-tan-costs` as a "realistic range". It had no source — it was the range the site calculator's slider happened to expose. | **Removed everywhere.** 28 is the product figure; no spread is published because none is evidenced. |
| **"25–30 tans per litre"** | Stated in `website/11-content-hub/articles/11-how-many-spray-tans-in-one-litre.md`, attributed to the live product pages, fact-checked 17 Jul 2026. | Superseded by Matt's confirmation of 28 on 8 Aug 2026. **The consumer-hub article needs correcting** — flagged, not yet done. |
| "Less than 35ml per service" as a published instruction | Appears in the consumer-hub article citing the product pages. Consistent with 28/litre (35.7ml), but we have not re-verified the product pages ourselves. | Article states 36ml as **derived from the 28 rating**, not as a quoted instruction. Safer and needs no re-verification. |
| Yield deltas by equipment type | No published study found anywhere. | Article lists the variables qualitatively and refuses to quantify them. This is the honest position and it is also the differentiator. |
| Any PSI or CFM figure | On the claims register — no published standard exists. | Not mentioned. Equipment discussed as pattern width, distance and passes. |

## Disagreements to present as disagreements

None material. The one adjacent dispute — whether higher DHA means darker or
faster — is on the claims register and is sidestepped: the article says depth
comes from solution choice and development rather than volume on the skin, which
holds either way.

## Feeds

- The **tans-per-litre yield tool** implements exactly the measurement method in
  this article — see [`../../05-tools/tans-per-litre-tool.md`](../../05-tools/tans-per-litre-tool.md).
- The reorder formula is reusable in `solution-stock-control` (pillar 5).
