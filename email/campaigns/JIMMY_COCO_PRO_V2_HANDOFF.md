# Jimmy Coco Pro V2 — Repository Handoff

## Completed local repository synchronisation

The marketing/playbook repository now contains the same V2 email structure that was created as drafts in Resend. The local source is the new system of record for the UK and US West Coast recruitment sequences, while the corresponding Resend IDs and aliases are recorded alongside the source.

| Area | Repository location | What changed |
|---|---|---|
| UK recruitment | `email/campaigns/uk-salon-stockist/` | Five-email V2 source, generated HTML, sequence documentation, Studio metadata and Resend mapping. |
| US West Coast recruitment | `email/campaigns/us-west-coast-salon-stockist/` | Five-email V2 source, generated HTML, sequence documentation, Studio metadata and Resend mapping. |
| UK transactional lifecycle | `email/campaigns/uk-reseller-lifecycle/` | Updated trial/approval terms, generated transactional HTML and direct Resend template mapping. |
| Campaign registry | `shared/campaign-registry.js` | UK V2 and US West Coast V2 cadence, actual Resend IDs, required variables and stop conditions. |

## Resend template mapping

| Market | Email count | Template prefix | State |
|---|---:|---|---|
| UK recruitment | 5 | `jc-uk-prospect-*-v2` | Draft in Resend; not published. |
| US West Coast recruitment | 5 | `jc-us-wc-prospect-*-v2` | Draft in Resend; not published. |
| Transactional trade lifecycle | 2 | `jc-transactional-trade-*-v2` | Draft in Resend; backend not yet wired. |

## Validated local checks

The following checks passed after the update:

```text
node email/campaigns/_shared/build-all.js --check uk-salon-stockist us-west-coast-salon-stockist uk-reseller-lifecycle
npm run templates:check
npm test
git diff --check
```

The Resend template source validation completed locally. Remote drift checking was skipped because the repository environment does not contain a `RESEND_API_KEY`; this did not change or publish any remote template.

## Safe next steps

1. Review the uncommitted changes on `main` and commit/push them to the shared repository.
2. Open the marketing/playbook system and confirm the two V2 campaigns display with the intended day cadences: UK 0/3/7/12/18 and US West Coast 0/4/8/13/19.
3. Map the two lifecycle V2 template IDs into the website/backend event handler for application receipt and approval. The local mapping file is `email/campaigns/uk-reseller-lifecycle/resend.json`.
4. Create eligible contact segments and disabled UK/US V2 automations. Do not enable either automation until seed testing and audience eligibility checks are complete.
5. Publish or activate only after a separate explicit approval. No Resend template was published, no automation was enabled and no email was sent during this work.
