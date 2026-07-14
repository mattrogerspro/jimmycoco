# Preview Text System

## Purpose

Define preview text as the second half of the inbox proposition rather than a technical afterthought.

## Core rule

Preview text must add useful information that the subject line cannot carry alone.

It should complete, clarify or qualify the promise without repeating the same words.

## Primary functions

Preview text should do one of the following:

- explain what the customer will find inside;
- clarify a benefit or next step;
- add a relevant detail such as timing, shade, product or service state;
- reduce uncertainty;
- disclose an important condition;
- support the subject with a practical reason to open.

## Pairing examples

Subject: “Your shade recommendation is ready”
Preview: “See the depth, undertone and routine selected from your answers.”

Subject: “Before your first application”
Preview: “A simple preparation guide for smoother, more even colour.”

Subject: “Your Sunless selection is still saved”
Preview: “Return to your basket and review your shade before checkout.”

Subject: “Your order is on its way”
Preview: “Track delivery and prepare for your first application.”

Subject: “Welcome to Sunless VIP”
Preview: “Your status, benefits and expert support are now available.”

## Length and truncation

Write the most important phrase first.

Aim for enough copy to support common inbox widths, usually one concise sentence. Do not pad text merely to fill the preview area.

Because clients truncate differently, the first 35–60 characters should remain meaningful on their own.

## Avoid repetition

Weak:

Subject: “Your shade match is ready”
Preview: “Your shade match is ready to view.”

Better:

Subject: “Your shade match is ready”
Preview: “See why this depth and undertone were selected for you.”

## Operational preview text

Transactional messages must expose the useful state quickly.

Examples:

- “Order JC-1042 has been confirmed. We’ll email again when it ships.”
- “Your refund has been issued to the original payment method.”
- “Please confirm your address before 3pm to avoid a delivery delay.”

## Promotional preview text

State the actual value or relevant terms.

Examples:

- “Selected routines only. Offer ends Sunday at 11:59pm.”
- “VIP access opens 24 hours before the public release.”
- “Explore the summer edit and choose the finish that suits you.”

Do not use preview text to hide exclusions that materially change the proposition.

## Dynamic preview text

Dynamic fields may include:

- recommended shade;
- product name;
- order number;
- delivery state;
- benefit name;
- expiry date;
- market-specific conditions.

Every dynamic field requires:

- a validated source;
- a natural fallback;
- length handling;
- suppression when the value is stale or missing.

Example:

Preferred: “Your recommended shade: Malibu Beach Medium.”
Fallback: “Your personalised Sunless recommendation is ready.”

## Hidden preheader implementation

Where the email template uses hidden preheader text:

- ensure the meaningful text appears first;
- prevent body copy, image alt text or navigation from becoming the accidental preview;
- use approved rendering patterns across Gmail, Apple Mail and Outlook;
- do not rely on excessive invisible filler to manipulate every client;
- test dark mode and accessibility impact.

## Tone

Preview text should be slightly more explanatory than the subject line, while preserving the same calm and restrained voice.

Avoid:

- clickbait;
- vague suspense;
- repeated exclamation marks;
- fake urgency;
- “Open now to find out”;
- unrelated promotional additions in service emails.

## QA checklist

Confirm:

- it adds information rather than repeating the subject;
- its opening remains useful when truncated;
- it accurately describes the email;
- dynamic values have fallbacks;
- terms or timing are current;
- no accidental template text appears first;
- the pair reads naturally as one inbox proposition;
- it remains clear without imagery.