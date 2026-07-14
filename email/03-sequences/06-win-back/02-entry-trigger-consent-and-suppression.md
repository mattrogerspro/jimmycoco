# Win-Back — Entry Trigger, Consent and Suppression

## Eligibility

A contact may enter only when:

- a documented lapse threshold has been crossed;
- lapse confidence meets the approved minimum;
- valid marketing consent exists;
- the address is deliverable and not suppressed;
- no higher-priority lifecycle or service flow owns the customer;
- no recent order, cart, checkout or meaningful re-engagement resets the state;
- relevant products, routes and content remain valid;
- global frequency and quiet-hour rules allow contact.

## Entry event

Recommended internal event:

`customer.win_back_eligible`

Minimum payload:

- `contact_id`
- `lapse_state`
- `lapse_confidence`
- `last_completed_order_at`
- `historical_order_count`
- `dominant_product_id` when valid
- `segment`
- `consent_snapshot`
- `eligibility_version`
- `occurred_at`

## Do not enter

Exclude contacts with:

- active complaint, return, refund, replacement or safety cases;
- unresolved delivery or fulfilment issues;
- recent purchase or active subscription;
- active cart or checkout recovery;
- invalid or missing consent provenance;
- hard bounce, complaint or provider suppression;
- explicit pause or reduced-frequency state that blocks the sequence;
- professional or wholesale status governed elsewhere;
- no useful, current destination or product route.

## Pre-send revalidation

Before every email, confirm:

- current consent and suppression;
- latest order, cart and checkout state;
- no active support issue;
- current contact-pressure allowance;
- valid customer segment and lapse state;
- product name, variant, price, currency, stock and URL;
- incentive validity where applicable;
- asset rights and claim approval;
- unused idempotency key.

## Immediate exit

Exit upon:

- purchase;
- cart or checkout creation when recovery takes ownership;
- support escalation;
- consent withdrawal;
- hard bounce or complaint;
- preference pause;
- meaningful reactivation that makes the remaining messages irrelevant;
- sequence completion.

## Preference handling

Every message must include a clear unsubscribe route. The final message should additionally support:

- reduced frequency;
- topic or product preferences;
- temporary pause;
- full unsubscribe.

Preference updates must take effect before any later scheduled send.