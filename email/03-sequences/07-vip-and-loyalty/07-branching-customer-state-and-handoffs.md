# VIP and Loyalty — Branching, Customer State and Handoffs

## Purpose

Define how VIP status, benefits, lifecycle behaviour and service risk interact without allowing loyalty messaging to override more important customer needs.

## Core programme state

Each VIP record should preserve:

- contact ID;
- customer ID;
- current tier;
- previous tier;
- qualification date;
- review date;
- qualification reason codes;
- programme version;
- market and currency;
- consent and suppression state;
- available, reserved, used and expired benefits;
- current service-risk state;
- most recent purchase, return, refund, complaint and support events;
- active lifecycle-flow owner;
- milestone history;
- tier-review history;
- current contact-pressure score.

Do not infer VIP status from email engagement alone.

## Qualification branches

### Newly qualified

Enter the VIP welcome state only after qualification is final, benefits are active and the contact has not already received the welcome for the same programme version.

### Existing VIP renewed

Do not repeat the full welcome. Send a renewal or milestone message only when it adds useful information.

### Upgraded tier

Communicate the change once, confirm the effective date and activate only benefits that are genuinely available.

### Grace period

Preserve existing benefits according to programme policy. Do not use the grace period as a disguised spend-pressure campaign.

### Transitioned out of tier

Record the reason code, preserve any legally or contractually valid outstanding benefit and communicate the change respectfully.

## Customer-type branches

### High-frequency product customer

Prioritise convenience, replenishment coordination, early access and relevant routine support.

### High-value but low-frequency customer

Avoid excessive replenishment assumptions. Use access, expert service and milestone recognition rather than message volume.

### Professional customer

Use only benefits and product guidance approved for the professional channel. Do not mix consumer and professional offers when pricing, products or terms differ.

### Gift-led customer

Do not assume purchased shades or routines describe the buyer personally. Personalisation must distinguish gift purchases where known.

### Customer with multiple markets or currencies

Use the active market context and validate benefit availability locally. Never display a reward that cannot be redeemed in the destination market.

## Service-risk branches

### Open complaint or safety concern

Pause promotional VIP messaging immediately. Service ownership takes precedence until resolution and any required cooling-off period are complete.

### Active return, refund or replacement

Suppress promotional recognition that could conflict with the current service experience. Necessary programme or benefit notices may still be sent if accurately classified and reviewed.

### Benefit failure

If an advertised benefit cannot be honoured:

- create a support case;
- preserve the original benefit record;
- stop related automation;
- provide a human-reviewed remedy;
- do not substitute a lower-value benefit silently.

## Behavioural handoffs

### Product viewed

VIP status may enrich the destination experience, but should not automatically create a browse-abandonment flow when another lifecycle flow owns the contact.

### Shade match completed

Transfer to shade-match follow-up when the recommendation is more specific. Preserve VIP service options as secondary context.

### Item added to cart

Transfer to cart abandonment when eligible. Any VIP benefit applied to the cart must remain accurate and consistent with checkout.

### Checkout started

Transfer to checkout recovery or transactional checkout logic.

### Purchase completed

Transfer to post-purchase education. Recalculate qualification and milestones only after the order reaches the programme’s approved qualifying state.

### Replenishment becomes due

Replenishment may take ownership when its timing model is more specific than a general VIP message.

### Inactivity becomes material

Win-back may take ownership, but the VIP branch should use higher-touch service rather than automatically deeper discounts.

### Reply received

Route by intent:

- product or shade guidance → expert support;
- order problem → service queue;
- benefit question → loyalty support;
- status dispute → manual programme review;
- unsubscribe → immediate marketing suppression;
- complaint → complaint handling and promotional pause.

## Flow ownership hierarchy

Default priority:

1. Transactional and service communication
2. Safety, complaint, return, refund and replacement handling
3. Checkout recovery
4. Cart abandonment
5. Post-purchase education
6. Shade-match follow-up
7. Replenishment
8. VIP event or benefit message
9. Win-back
10. Browse abandonment
11. Welcome and general campaigns

VIP status can modify service and content but does not automatically own every message.

## Benefit state model

Use explicit benefit states:

- scheduled;
- active;
- reserved;
- redeemed;
- partially redeemed;
- expired;
- revoked because of programme error;
- replaced through support;
- unavailable;
- cancelled.

Every redemption should be idempotent and auditable.

## Sequence completion reasons

Record:

- welcome completed;
- benefit used;
- milestone completed;
- tier renewed;
- tier upgraded;
- grace period entered;
- transitioned tier;
- support handoff;
- consent withdrawn;
- provider suppressed;
- data invalidated;
- programme changed;
- message expired.

## Re-entry rules

Do not repeatedly send the same VIP lifecycle message. Re-entry requires a new event, new programme version, new milestone or materially changed tier state.

Repeated non-response should reduce contact pressure rather than increase status-themed messaging.