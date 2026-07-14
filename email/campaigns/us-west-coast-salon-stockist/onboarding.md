# US West Coast Salon Stockist — Onboarding copy

Triggered stage for positive respondents. **Never runs concurrently with cold outreach** — entry into onboarding requires the contact to have already exited the cold sequence. American English. Plain-text below is the sendable alternative and matches `email-data.json` / `emails/`.

**Message classification:** O1 and O3 are lifecycle; **O2 and O5 are transactional** (kept separate from marketing, no promotional modules); O4 is a commercial summary built entirely from approved tokens.

**Hard rules:**
- **O2** — do **not** generate or send unless a real dispatch is confirmed and `{{tracking_link}}` / `{{lead_time}}` / `{{approved_product_range}}` resolve to approved values.
- **O4** — do **not** send until a human commercial conversation has produced an approved trade record; every value is a token, none estimated.
- **O5** — send only on a valid, placed order; all fields from the order system.

---

## O1 — Interest confirmed · Trigger: qualified positive reply / trial request / booked call · `emails/onboarding-1-interest-confirmed.html`

**Subject A:** Thanks — let’s set up your trial
**Subject B:** Great to hear from you, {{first_name}} — next steps
**Preview:** You’re out of the introduction sequence. A couple of details and we’ll begin.
**Primary CTA:** Book your consultation → {{calendar_link}}
**Tokens:** {{first_name}}, {{business_name}}, {{calendar_link}}, {{sender_name}}, {{sender_title}}, {{sender_email}}, {{business_address}}, {{unsubscribe_link}}
**Effect:** Confirms cold-sequence stop; collects minimum details; no promises on stock/delivery/terms.

Hi {{first_name}},

Thanks for getting back to me. I’ve taken {{business_name}} out of the introduction sequence — you won’t receive any more of those notes.

To set up a professional trial or a consultation, could you confirm a few basics: your business address, your best contact and timing, and who’ll be assessing the result?

- What you’d like to evaluate — service, retail, or both
- Your preferred timing for a trial or call
- Any current tanning products you’re comparing against

Once I have that, I’ll walk you through the trial or book a short consultation — whichever you prefer. I won’t confirm stock, delivery, or terms until they’re approved for your area.

Book your consultation: {{calendar_link}}
Or just reply here and we’ll sort it out by email.

{{sender_name}}
{{sender_title}}, Sunless by Jimmy Coco · {{sender_email}}
Sunless by Jimmy Coco · {{business_address}} · Unsubscribe: {{unsubscribe_link}}

---

## O2 — Trial dispatched · Trigger: dispatch CONFIRMED · `emails/onboarding-2-trial-dispatched.html` · **TRANSACTIONAL**

**Subject A:** Your professional trial is on its way
**Preview:** Dispatch confirmation and what to assess during your professional trial.
**Primary CTA:** Open the professional shade guide → {{shade_guide_link}}
**Tokens:** {{first_name}}, {{business_name}}, {{tracking_link}}, {{lead_time}}, {{approved_product_range}}, {{shade_guide_link}}, {{support_email}}, {{business_address}}, {{unsubscribe_link}}
**Stop-send:** No confirmed dispatch → do not send. No `{{tracking_link}}` → do not send.

Hi {{first_name}},

Good news — your professional trial for {{business_name}} has been dispatched.

- Tracking: {{tracking_link}}
- Estimated delivery: {{lead_time}}
- What’s included: {{approved_product_range}}

When it arrives, try it on a real client and assess the result the way your clients will — in daylight and in photos, not only under treatment-room lighting.

- How the color develops over the first several hours
- Undertone and depth against your client’s skin
- How evenly it wears and fades

The professional shade guide walks through shade selection and expected development: {{shade_guide_link}}
Questions during the trial? Reach me directly at {{support_email}}.

{{sender_name}}
{{sender_title}}, Sunless by Jimmy Coco
Sunless by Jimmy Coco · {{business_address}} · Unsubscribe: {{unsubscribe_link}}

---

## O3 — Post-trial check-in · Trigger: confirmed delivery + waiting period · `emails/onboarding-3-post-trial-check-in.html`

**Subject A:** How did the color develop?
**Subject B:** Your honest read on the trial, {{first_name}}?
**Preview:** A quick, honest read on the trial — then a short consultation if it’s a fit.
**Primary CTA:** Book a follow-up consultation → {{calendar_link}}
**Tokens:** {{first_name}}, {{calendar_link}}, {{sender_name}}, {{sender_title}}, {{business_address}}, {{unsubscribe_link}}
**Effect:** Collects feedback (approved claim language only); no pressure.

Hi {{first_name}},

Now that you’ve had a chance to use the trial, I’d value your honest read on it.

- How the color developed, and how believable it looked in daylight
- How the application felt for your team
- How evenly it wore and faded over the following days

Whatever you found — positive or not — is useful. If it’s a fit, I’m happy to set up a short consultation to talk through range, terms, and a first professional order for your area.

Book a follow-up consultation: {{calendar_link}}
No pressure at all — even a one-line reply helps.

{{sender_name}}
{{sender_title}}, Sunless by Jimmy Coco
Sunless by Jimmy Coco · {{business_address}} · Unsubscribe: {{unsubscribe_link}}

---

## O4 — Approved trade summary · Trigger: human commercial conversation done + approved terms exist · `emails/onboarding-4-trade-summary.html`

**Subject A:** Your partnership terms, in writing
**Preview:** A written summary of the terms approved for your account — nothing estimated.
**Primary CTA:** Place your opening order → {{order_link}}
**Tokens:** {{first_name}}, {{business_name}}, {{us_trade_price}}, {{opening_order}}, {{reorder_minimum}}, {{shipping_terms}}, {{lead_time}}, {{approved_product_range}}, {{training_support}}, {{order_link}}, {{business_address}}, {{unsubscribe_link}}
**Stop-send:** Any commercial token unresolved → do not send. No value is ever estimated or defaulted.

Hi {{first_name}},

As discussed, here’s a written summary of the terms we agreed for {{business_name}}. Everything below reflects what’s been approved for your account — nothing is estimated.

- Trade price: {{us_trade_price}}
- Opening order: {{opening_order}}
- Reorder minimum: {{reorder_minimum}}
- Shipping: {{shipping_terms}}
- Lead time: {{lead_time}}
- Approved range: {{approved_product_range}}
- Training & support: {{training_support}}

If everything matches our conversation, you can place your opening order here: {{order_link}}
If anything doesn’t match what we discussed, reply and I’ll correct it before you order.

{{sender_name}}
{{sender_title}}, Sunless by Jimmy Coco
Sunless by Jimmy Coco · {{business_address}} · Unsubscribe: {{unsubscribe_link}}

---

## O5 — First order confirmation · Trigger: valid order placed · `emails/onboarding-5-first-order-confirmation.html` · **TRANSACTIONAL**

**Subject A:** Your first order is confirmed
**Preview:** Order confirmation and where your team can get started.
**Primary CTA:** Open your training resources → {{training_link}}
**Tokens:** {{first_name}}, {{business_name}}, {{order_number}}, {{order_summary}}, {{order_total}}, {{dispatch_date}}, {{tracking_link}}, {{training_link}}, {{support_email}}, {{reorder_link}}, {{business_address}}, {{unsubscribe_link}}
**Stop-send:** No valid order record → do not send. Transactional: no marketing modules added.

Hi {{first_name}},

Thank you — your first professional order for {{business_name}} is confirmed. Here are the details:

- Order number: {{order_number}}
- Summary: {{order_summary}}
- Total: {{order_total}}
- Dispatch date: {{dispatch_date}}
- Tracking: {{tracking_link}}

When the order arrives, your team can start here — shade selection, application, and getting the most from the professional solution: {{training_link}}
Anything you need, reach us at {{support_email}}. When you’re ready to reorder: {{reorder_link}}.

{{sender_name}}
{{sender_title}}, Sunless by Jimmy Coco
Sunless by Jimmy Coco · {{business_address}} · Unsubscribe: {{unsubscribe_link}}
