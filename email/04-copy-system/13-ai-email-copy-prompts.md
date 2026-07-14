# AI Email Copy Prompts

## Purpose

Provide controlled prompt templates for drafting, adapting and reviewing Sunless email copy while preserving brand voice, lifecycle logic, factual accuracy and operational safeguards.

AI output is always a draft. It must be reviewed against the full copy system, source data, sequence specification, legal requirements and production QA before use.

## Mandatory source context

Every prompt must supply or reference:

- message purpose;
- lifecycle or service state;
- eligible audience;
- trigger;
- customer need;
- commercial objective;
- approved product and offer data;
- required personalisation fields;
- suppressions and conflicts;
- claim evidence;
- primary CTA and destination;
- applicable market, currency and policy;
- required legal or service wording;
- desired length and module structure.

Never ask the model to invent missing product, price, stock, shade, delivery, review, celebrity, ingredient or performance facts.

## System prompt

Use this as the stable instruction layer:

> You are writing email copy for Sunless by Jimmy Coco, a premium self-tanning brand. Write with calm expert authority, warmth and restraint. Be specific, useful and commercially clear without hype, false urgency, invented scarcity or exaggerated intimacy. Preserve customer choice. Use short, readable paragraphs and one dominant message. Never invent facts, claims, prices, stock, dates, reviews, celebrity associations, product benefits or personalisation data. Mark any missing required information as `[SOURCE REQUIRED]`. Follow the supplied lifecycle state, audience, CTA hierarchy, legal requirements and approved terminology exactly.

## Master drafting prompt

```text
Create one complete Sunless by Jimmy Coco email draft.

MESSAGE CONTEXT
- Message ID:
- Sequence or campaign:
- Lifecycle/service state:
- Trigger:
- Eligible audience:
- Exclusions and suppressions:
- Primary customer need:
- Primary commercial objective:
- One main message:

APPROVED SOURCE DATA
- Products and variants:
- Shade or routine data:
- Prices and currency:
- Stock or availability:
- Offer and terms:
- Delivery/returns/service facts:
- Claims and evidence:
- Personalisation fields and fallbacks:
- Market and language:

COPY REQUIREMENTS
- Subject-line approach:
- Preview-text role:
- Headline:
- Opening purpose:
- Required body modules:
- Primary CTA label and destination:
- Secondary CTA, only if necessary:
- Required legal or operational wording:
- Maximum approximate length:

OUTPUT
1. Three subject-line options, each using a distinct approved angle
2. Matching preview text for each subject line
3. One recommended subject/preview pair with a short rationale
4. Full email copy in final reading order
5. Primary and secondary CTA labels
6. Plain-text version
7. Dynamic-field fallback table
8. List of any unresolved source requirements

Do not add content that is not supported by the supplied source data.
```

## Subject-line generation prompt

```text
Generate 12 subject lines for the supplied Sunless email.

Group them into:
- customer-value led;
- guidance led;
- product or result led;
- service or status led, only when applicable.

For each subject line provide:
- matching preview text;
- intended customer motivation;
- truncation risk;
- any claim or data dependency.

Rules:
- accurately represent the email;
- no false urgency, scarcity or exclusivity;
- no clickbait, reply imitation or misleading account language;
- no unsupported claims;
- restrained punctuation;
- personalisation only when a verified fallback exists.
```

## Lifecycle-email prompt

```text
Draft a lifecycle email for this customer state: [STATE].

The customer has reached this state because: [TRIGGER].
The most important uncertainty or need is: [NEED].
The action Sunless should help them take is: [ACTION].
The active higher-priority messages and suppressions are: [RULES].

Use the tone rules for this lifecycle state.
Explain why the email is relevant within the first two short paragraphs.
Keep one dominant CTA.
Do not introduce a discount unless it is explicitly supplied and approved.
Return subject, preview, headline, body, CTA, plain text and fallback notes.
```

## Shade-match recommendation prompt

```text
Write a shade-match result email using only the structured result below.

RESULT DATA
- Starting skin tone:
- Undertone:
- Desired depth:
- Product format preference:
- Application confidence:
- Primary recommendation:
- Selected variant:
- Why it matches:
- Alternative recommendation:
- Routine support products:
- Application guidance:
- Uncertainty or confidence state:
- Product availability:

The email must:
- lead with one primary recommendation;
- explain the recommendation in plain language;
- distinguish verified inputs from inference;
- avoid claiming perfect precision;
- preserve the selected variant in the CTA destination;
- provide a safe fallback when the recommendation is unavailable;
- avoid overwhelming the customer with alternatives.
```

## Product and routine prompt

```text
Draft product-led email copy using the approved catalogue data below.

For each product mentioned, use only:
- approved product name;
- approved variant name;
- approved one-sentence result description;
- approved suitability statement;
- approved application role;
- verified price and currency;
- current stock state;
- approved product URL.

Structure the message around the customer outcome or routine step, not a generic product grid.
Use one hero product or one coherent routine.
Explain how the products work together without inventing ingredient or performance claims.
```

## Promotional email prompt

```text
Create promotional copy for this approved offer.

OFFER DATA
- Offer:
- Eligibility:
- Start date and timezone:
- End date and timezone:
- Products or exclusions:
- Market and currency:
- Redemption method:
- Stock limitations:
- Approved terms:

Rules:
- state the genuine value clearly;
- express dates and eligibility plainly;
- use urgency only when the deadline is real;
- do not imply scarcity unless verified stock data supports it;
- do not hide exclusions;
- do not allow the discount to replace product guidance;
- include a complete non-image explanation of the offer.
```

## Service and operational prompt

```text
Draft a service email for this confirmed operational event: [EVENT].

Include:
- what happened;
- what it means for the customer;
- what happens next;
- any action required;
- timing, destination and support route;
- required reference information.

Use explicit, neutral subject and preview text.
Keep promotional content out unless it is essential to resolving the service need and is legally permitted.
Do not soften or obscure bad news.
Do not promise a resolution date that is not confirmed.
```

## VIP and loyalty prompt

```text
Draft a VIP or loyalty email for this verified programme state: [STATE].

PROGRAMME DATA
- Current tier:
- Qualification basis:
- Active benefits:
- Benefit terms:
- Milestone or transition:
- Review or expiry date:
- Grace state:
- Support route:

Recognise the customer without flattery, spend-shaming or pressure.
Describe benefits as services that can genuinely be honoured.
Do not imply exclusivity beyond the approved programme definition.
For transitions or downgrades, use factual, respectful language and explain the review route.
```

## Win-back prompt

```text
Draft a win-back email for this verified lapse segment: [SEGMENT].

Use:
- previous product or routine only when accurate and still suitable;
- elapsed time only when calculated from verified order data;
- one useful reason to return;
- a calm opt-out from irrelevant reminders.

Do not shame inactivity, imply surveillance or manufacture concern.
Do not lead automatically with a discount.
Do not claim the customer is running out unless the replenishment model supports it.
```

## Rewrite prompt

```text
Rewrite the supplied email to comply with the Sunless email copy system.

Preserve:
- verified facts;
- approved offer terms;
- required legal and service wording;
- lifecycle purpose;
- CTA destination.

Improve:
- specificity;
- clarity;
- hierarchy;
- readability;
- calm expert tone;
- consistency between subject, preview, headline and CTA.

Remove:
- generic luxury language;
- hype;
- false urgency;
- repeated ideas;
- unsupported claims;
- unnecessary familiarity;
- competing CTAs.

Return:
1. revised copy;
2. concise change log;
3. unresolved factual or policy questions.
```

## Compression prompt

```text
Reduce this email by approximately [PERCENT] without removing:
- the main proposition;
- required explanation;
- verified terms;
- service information;
- legal content;
- primary CTA context.

Remove repetition, decorative language and low-priority modules first.
Do not make the shorter version more abrupt, vague or coercive.
```

## Plain-text prompt

```text
Convert the approved HTML reading order into a complete plain-text email.

Requirements:
- preserve all essential information;
- use descriptive URLs or linked-action labels;
- keep headings and spacing useful;
- do not include image-dependent references such as “see below”;
- preserve legal, preference and support content;
- make the primary action obvious without visual styling.
```

## Personalisation fallback prompt

```text
Audit every dynamic field in this email.

For each field return:
- field name;
- source system;
- required confidence or freshness;
- grammatical context;
- safe fallback;
- suppression rule if no safe fallback exists;
- potential privacy or trust concern.

Then render the complete email for:
1. full valid data;
2. missing first name;
3. no shade result;
4. unavailable recommended product;
5. unknown market;
6. stale lifecycle state.
```

## Copy QA prompt

```text
Audit the supplied email against the Sunless email copy system.

Score each area from 0 to 10:
- message necessity and lifecycle fit;
- factual and data accuracy;
- proposition clarity;
- subject and preview alignment;
- opening relevance;
- body hierarchy;
- CTA clarity;
- personalisation safety;
- claim compliance;
- legal and operational clarity;
- accessibility and plain-text completeness;
- brand voice.

For every issue provide:
- severity: blocker, high, medium or low;
- exact affected copy;
- reason;
- corrected version;
- source or approval needed.

End with a release decision: approved, approved with changes, or blocked.
Do not approve any unsupported claim or unresolved dynamic state.
```

## Variant-testing prompt

```text
Create one controlled copy test for this email.

Define:
- one hypothesis;
- control;
- one treatment;
- unchanged elements;
- eligible audience;
- primary outcome;
- guardrails;
- implementation risks;
- decision rule.

Change only the element required to test the hypothesis.
Do not create variants that differ simultaneously in offer, audience, timing and wording.
```

## Prohibited prompt patterns

Do not use prompts such as:

- “Make this go viral.”
- “Write irresistible clickbait.”
- “Invent a compelling reason to buy now.”
- “Add urgency and scarcity.”
- “Make it sound like we know the customer personally.”
- “Create believable statistics or reviews.”
- “Use celebrity names to increase conversion.”
- “Guess the most likely product, shade, price or delivery date.”

These invite unsupported, misleading or off-brand output.

## Required human review

Before production, a human reviewer must confirm:

- the customer should receive the message;
- source data is current;
- claims are traceable;
- dynamic states and fallbacks render correctly;
- legal and policy wording is approved;
- links and destinations are valid;
- the CTA accurately describes the action;
- the plain-text version is complete;
- the copy passes `12-copy-testing-and-qa.md`;
- no AI-invented facts remain.

AI can accelerate drafting and structured review. It cannot approve truth, policy, programme eligibility or production release.