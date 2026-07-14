# Production Readiness Checklist

## Purpose

Provide the final cross-system release gate for the Sunless by Jimmy Coco website, email, data, assets, Resend and analytics implementation.

## Governance and ownership

- [ ] Named implementation owner exists
- [ ] Named website, email, data, asset and infrastructure owners exist
- [ ] Final approvers are recorded
- [ ] Current source documents and versions are identified
- [ ] Known exceptions are documented and accepted
- [ ] Emergency and incident contacts are current

## Repository and release

- [ ] Release commit or tag is fixed
- [ ] Build and automated checks pass
- [ ] Environment configuration is validated
- [ ] Secrets are not present in client code, logs or repository files
- [ ] Database migrations are reviewed and rehearsed
- [ ] Rollback targets and procedures are recorded
- [ ] Production feature flags and pause controls are tested
- [ ] Root and section documentation reflects current status

## Brand and design system

- [ ] Shared tokens match approved brand rules
- [ ] Typography and licensing are valid
- [ ] Logo usage is correct
- [ ] Website and email components use approved variants
- [ ] No material one-off styling conflicts remain
- [ ] Motion and reduced-motion behaviour are approved
- [ ] Desktop and mobile implementations match the intended hierarchy

## Website

- [ ] Global navigation, footer and shell work correctly
- [ ] Homepage is complete and responsive
- [ ] Collection and product paths are complete
- [ ] Product, price, variant and availability data are accurate
- [ ] Cart and checkout surfaces work end to end
- [ ] Shade-match journey and fallbacks work
- [ ] Primary CTAs reach the correct destination
- [ ] Error, empty, loading and unavailable states are implemented
- [ ] Structured metadata, canonical URLs and indexing controls are correct
- [ ] Core journeys pass current priority browser testing

## Email templates and sequences

- [ ] Email shell and core modules render in priority clients
- [ ] HTML and plain text are generated
- [ ] Transactional templates are approved
- [ ] Active lifecycle messages use immutable releases
- [ ] Subject, preview, copy, CTA and legal text are approved
- [ ] Every sequence has entry, exclusion, exit and precedence rules
- [ ] Personalisation has safe fallbacks
- [ ] Product, offer and asset data are revalidated before send
- [ ] Marketing and transactional purposes remain distinct
- [ ] Emergency sequence and global pause controls work

## Consent, preferences and suppression

- [ ] Consent state is purpose-specific and traceable
- [ ] Preference centre changes update canonical state
- [ ] Unsubscribe works immediately as required
- [ ] Existing suppression data is imported and reconciled
- [ ] Hard bounce and complaint consequences are implemented
- [ ] Scheduled messages recheck eligibility before submission
- [ ] Account deletion and privacy workflows propagate correctly
- [ ] No provider-side list is treated as the sole source of truth

## Data model and events

- [ ] Customer, product, variant, cart, order and lifecycle schemas are stable
- [ ] Canonical IDs are used across systems
- [ ] Event names and schemas are versioned
- [ ] Producers emit events after successful state changes
- [ ] Consumers are idempotent
- [ ] Duplicate and out-of-order events are handled
- [ ] Message and provider event histories are append-only
- [ ] Backfills and migrations preserve provenance
- [ ] Data-quality reports show no unexplained material gaps

## Assets

- [ ] Every production asset has a canonical asset ID
- [ ] Product and variant imagery is current
- [ ] Celebrity and customer-result assets remain faithful to source
- [ ] Rights, consent, market and channel permissions are valid
- [ ] Desktop and mobile derivatives exist
- [ ] Alt text and decorative treatment are defined
- [ ] Expired and deprecated assets cannot be selected
- [ ] Hosted URLs, dimensions, format and caching are valid
- [ ] No temporary or review asset is referenced in production

## Resend and delivery

- [ ] Production API key is server-side and correctly scoped
- [ ] Sender domains and identities are verified
- [ ] SPF, DKIM and DMARC are configured deliberately
- [ ] Provider adapter is isolated and tested
- [ ] Durable message record exists before submission
- [ ] Idempotency keys prevent duplicate sends
- [ ] Queue retries distinguish temporary and permanent failures
- [ ] Webhook signatures are verified
- [ ] Duplicate and out-of-order provider events are safe
- [ ] Provider message IDs reconcile to internal records
- [ ] Inbound email is treated as untrusted input where enabled
- [ ] Queue, webhook and deliverability monitoring is active

## Analytics and measurement

- [ ] Website and email events use canonical definitions
- [ ] Funnel stages are defined in code and documentation
- [ ] Message, order and provider events reconcile
- [ ] Attribution assumptions and windows are documented
- [ ] Refunds and cancellations adjust outcome reporting
- [ ] Experiments preserve assignment and version
- [ ] Dashboards distinguish observed, derived and attributed metrics
- [ ] Data-quality alerts are enabled
- [ ] Privacy and retention rules are enforced

## Accessibility

- [ ] Semantic structure and heading order are correct
- [ ] Keyboard and focus behaviour pass
- [ ] Contrast is acceptable
- [ ] Forms, errors and instructions are accessible
- [ ] Images have correct alt treatment
- [ ] Essential information is not image-only
- [ ] Zoom, reflow and text enlargement work
- [ ] Reduced-motion preference is respected
- [ ] Priority journeys have screen-reader review
- [ ] Email remains understandable with images blocked

## Performance and reliability

- [ ] Website image dimensions and formats are optimised
- [ ] Font loading is controlled
- [ ] Layout stability is acceptable
- [ ] Third-party scripts are justified and monitored
- [ ] Priority pages meet approved performance budgets
- [ ] Email HTML and asset weights are within limits
- [ ] Storage and CDN behaviour are validated
- [ ] Error monitoring and alerts are operational
- [ ] Backups and recovery procedures are tested

## Security and privacy

- [ ] Authentication and authorisation boundaries are tested
- [ ] Supabase policies or equivalent controls are reviewed
- [ ] Webhooks reject invalid signatures
- [ ] Logs redact secrets and unnecessary personal data
- [ ] Credentials are least-privileged and environment-scoped
- [ ] Administrative and MCP actions require explicit authority
- [ ] Inbound content and attachments are constrained
- [ ] Data deletion and retention are tested
- [ ] No sensitive-trait inference is used for personalisation

## QA evidence

- [ ] Automated tests pass
- [ ] End-to-end commerce journeys pass
- [ ] Email rendering evidence is retained
- [ ] Visual comparison against approved references is complete
- [ ] Accessibility review is recorded
- [ ] Performance report is recorded
- [ ] Security and privacy checks are recorded
- [ ] Staging and canary results are approved
- [ ] Rollback and emergency pause have been rehearsed

## Release decision

Use one status:

- `READY FOR STAGED RELEASE`
- `READY WITH RECORDED EXCEPTIONS`
- `CHANGES REQUIRED`
- `BLOCKED`

The decision must identify the release version, scope, approver, date, rollout stage and rollback target.

## Final rule

Production readiness is not established by the existence of documentation alone. Every checked item must be supported by current implementation evidence, tests, configuration, rendered output or an explicit approval record.