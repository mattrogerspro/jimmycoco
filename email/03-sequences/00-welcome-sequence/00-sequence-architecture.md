# Welcome Sequence Architecture

## Purpose

Move a new subscriber from curiosity to confident first purchase while establishing Sunless as a professional guidance brand rather than a discount-led cosmetics retailer.

## Primary commercial objective

Generate a first purchase from the most suitable product or routine without increasing returns, shade dissatisfaction or application anxiety.

## Secondary objectives

- Complete or revisit the shade match.
- Build trust in Jimmy Coco’s expertise.
- Explain why undertone, depth, format and application method matter.
- Show credible results on relevant skin tones.
- Establish a useful long-term email relationship.
- Capture preference and engagement signals for future segmentation.

## Default cadence

| Email | Timing from eligible entry | Purpose | Primary CTA |
|---|---:|---|---|
| 01 | Immediately | Welcome and define the promise | Find My Match / View My Match |
| 02 | +1 day | Explain Jimmy’s method | Discover the Method |
| 03 | +3 days | Help choose result, format and depth | Find My Right Result |
| 04 | +5 days | Provide verified proof | Explore Real Results |
| 05 | +7 days | Present a personal or contextual recommendation | Shop My Recommendation |
| 06 | +10 days | Build a complete, successful routine | Build My Routine |

Send-time optimisation may adjust clock time but must not change the intended spacing without an approved test.

## Entry routes

### General newsletter subscriber
Receives the full six-email sequence, beginning with the shade-match path.

### Completed shade match
Email 01 uses the saved recommendation. Email 03 becomes product-fit reassurance rather than another generic quiz invitation.

### Account created without purchase
Receives the full sequence with account continuity and saved-progress messaging where available.

### Checkout marketing opt-in after purchase
Does not enter the prospect welcome path. Route to the post-purchase sequence and optionally send a reduced brand-welcome module within that flow.

### Existing customer subscribing again
Do not restart the prospect welcome sequence. Route according to lifecycle state, product ownership and engagement.

## Sequence state model

- `eligible`
- `enrolled`
- `active`
- `paused_transactional_priority`
- `converted`
- `completed`
- `suppressed`
- `unsubscribed`

Every transition must be stored with a timestamp and reason.

## Stop conditions

Stop or exit the sequence immediately when:

- the recipient unsubscribes;
- consent becomes invalid;
- the address hard-bounces or is suppressed;
- a first purchase occurs;
- the person enters a higher-priority service or post-purchase journey;
- fraud, abuse or deliverability controls suppress the address.

A purchase should move the recipient into post-purchase education, not merely stop all communication.

## Pause conditions

Temporarily pause welcome sends when:

- an order confirmation, dispatch or service issue requires priority;
- the recipient has received the maximum allowed marketing pressure;
- a customer-support conversation is active and promotional messaging could feel inappropriate;
- a major site or stock issue makes the planned CTA invalid.

## Message hierarchy

Each email must contain:

1. One clear reader benefit.
2. One primary CTA.
3. One concise proof or reassurance layer.
4. Optional secondary navigation that does not compete with the primary action.

## Offer policy

The sequence must work without a discount. A welcome incentive may be used only when commercially approved and legally clear. It must not replace guidance, should not appear in every email and must never imply false urgency.

## Tone progression

- Email 01: warm and immediately useful.
- Email 02: expert but human.
- Email 03: reassuring and diagnostic.
- Email 04: credible and evidence-led.
- Email 05: specific and commercially direct.
- Email 06: practical, confidence-building and retention-oriented.

## Success definition

The sequence succeeds when it creates qualified first purchases, high shade confidence, low complaint and unsubscribe rates, and strong downstream engagement—not merely high opens.