# Entry Trigger, Consent and Suppression

## Entry event

The welcome sequence should begin only after the application records a valid marketing-consent event and determines that the person is eligible for the prospect welcome journey.

Recommended canonical event:

```text
marketing_subscription_confirmed
```

The event should include source, timestamp, consent language version, region, channel and any known customer state.

## Required eligibility checks

Before enrolment, confirm:

- a deliverable email address is present;
- marketing consent is valid for the applicable region;
- the address is not unsubscribed, complained, hard-bounced or suppressed;
- the person is not already active in the same welcome sequence;
- the person is not an existing purchaser who belongs in a post-purchase or retention flow;
- no higher-priority service communication makes the send inappropriate;
- the source event is authentic and idempotent.

## Consent record

Store at minimum:

- `contact_id`
- `email_address`
- `consent_status`
- `consent_source`
- `consent_timestamp`
- `consent_language_version`
- `country_or_region`
- `ip_or_platform_evidence` where legally appropriate
- `double_opt_in_status` where used

Do not infer marketing consent from a transactional relationship.

## Double opt-in

Where double opt-in is required or chosen:

1. Send a confirmation message only.
2. Do not enrol the person in the marketing welcome sequence until confirmation.
3. Treat the confirmation email as operational consent processing, not as Email 01.
4. Expire unconfirmed requests according to the privacy policy.

## Source-specific entry context

### Footer or generic newsletter form
Capture source page, stated interest and any optional preference selection.

### Shade-match completion
Persist recommendation ID, answer-set version, recommended product and selected variant. Do not require email before showing the result on site.

### Account creation
Persist saved products, quiz status and customer-state identifiers.

### Checkout opt-in
If the order completes, route to post-purchase. If checkout is abandoned and marketing consent is valid, use the appropriate abandonment policy rather than stacking welcome and cart messages.

## Deduplication

Use one canonical contact identity where possible. Normalise address casing and whitespace, but do not perform unsafe identity merges based only on similar names.

Every enrolment request must carry an idempotency key such as:

```text
welcome:{contact_id}:{consent_event_id}
```

Repeated events must not restart the sequence.

## Global suppression rules

Suppress marketing sends for:

- unsubscribe;
- spam complaint;
- hard bounce;
- legal or manual suppression;
- invalid or blocked domain;
- account marked as deceased, fraudulent or abusive where applicable;
- unresolved consent state.

## Sequence-level suppression

Exit or skip specific sends when:

- purchase makes the message obsolete;
- shade match has already been completed and the email only asks for completion;
- the recommended product is unavailable with no approved substitute;
- the recipient is already enrolled in a higher-priority campaign or lifecycle flow;
- recent contact frequency exceeds policy.

## Preference centre

Provide an accessible route to:

- unsubscribe from marketing;
- reduce frequency where supported;
- update content preferences;
- correct email address through an authenticated account flow;
- manage regional or channel permissions.

The unsubscribe mechanism must remain easy to find and must not require login.

## Audit requirement

Every enrolment, skip, pause, exit and suppression decision must be explainable from stored state. Avoid opaque automation that cannot answer why a particular email was or was not sent.