# VIP and Loyalty — Programme Architecture

## Purpose

Create a durable recognition system for customers who demonstrate sustained value, repeat engagement or strategic importance.

The programme must feel like access to a better relationship with Sunless, not a coupon club.

## Core lifecycle

1. **Qualification** — customer meets approved criteria.
2. **Validation** — service, consent and data checks confirm eligibility.
3. **Welcome** — status and benefits are explained clearly.
4. **Active membership** — access, guidance and recognition are delivered selectively.
5. **Milestone recognition** — meaningful behaviour is acknowledged.
6. **Review** — status is reassessed on a defined cycle.
7. **Renewal or transition** — benefits continue, change or pause respectfully.

## Programme objectives

- improve retention among genuinely valuable customers;
- increase repeat purchase through relevance and convenience;
- strengthen trust through better support and recognition;
- reward loyalty without uncontrolled discounting;
- identify advocates and high-potential customers responsibly;
- create a premium service layer consistent with the brand.

## What the programme is not

- an automatic discount ladder;
- a substitute for customer service;
- permission to send more frequently;
- a public status competition;
- a reason to overlook complaints or returns;
- a promise of concierge service that the business cannot fulfil.

## Event model

The system should respond to events rather than run as one continuous sequence.

Core events:

- `vip.qualified`
- `vip.welcome_due`
- `vip.benefit_available`
- `vip.early_access_available`
- `vip.milestone_reached`
- `vip.review_due`
- `vip.renewed`
- `vip.transitioned`
- `vip.paused`
- `vip.removed_for_service_risk`

## Communication rhythm

VIP messages should be fewer and more meaningful than standard campaigns.

Recommended safeguards:

- qualification welcome sent once per new status period;
- benefit messages only when a real benefit exists;
- milestone recognition limited to genuinely meaningful events;
- no duplicate VIP message on the same day as a behavioural recovery email;
- all sends count toward global contact pressure;
- service communications always take priority.

## Flow ownership

VIP status is a customer attribute, not always the active messaging owner.

A VIP customer may still enter:

- transactional flows;
- post-purchase education;
- replenishment;
- shade-match follow-up;
- cart or checkout recovery;
- service and support journeys.

VIP content may adapt those experiences, but it should not create conflicting simultaneous sequences.

## Operational dependencies

Before launch, the business must define:

- qualification rules;
- review period;
- available benefits;
- benefit inventory or capacity;
- support ownership;
- escalation rules;
- legal and consent requirements;
- margin and offer governance;
- customer-facing terms where required.

## Immediate suspension conditions

Pause VIP marketing when:

- an unresolved complaint exists;
- a safety concern is active;
- a chargeback or fraud review is open;
- consent is withdrawn;
- the address is suppressed;
- the account is under investigation;
- the promised benefit cannot be fulfilled.

Status may remain internally recorded while communications are paused.

## Success definition

The programme succeeds when it increases retained contribution, satisfaction, repeat behaviour and advocacy without increasing complaints, incentive dependency or operational failure.