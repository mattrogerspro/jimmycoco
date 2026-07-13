# Sunless by Jimmy Coco — Post-Sample Account Flow

The partner lifecycle that picks up **after** a salon says yes and the sample ships. It carries them from "sample in hand" → "terms agreed" → "first order placed." Three touches, each firing on a real event, not a timer.

Bridge from the cold campaign: `../au-salon-seeding/onboarding.md` is the handoff. This flow begins once the sample is on its way.

**Tokens:** `{{first_name}}` · `{{salon_name}}` · `{{sender_name}}` · `{{sender_first}}` · `{{sender_title}}` · `{{calendar_link}}` · `{{order_link}}` · `{{shade_guide_link}}`
**Commercial tokens (fill with your real numbers before sending):** `{{wholesale_margin}}` · `{{trade_discount}}` · `{{min_opening_order}}` · `{{reorder_minimum}}` · `{{lead_time}}` · `{{order_number}}` · `{{order_summary}}` · `{{order_total}}` · `{{dispatch_date}}` · `{{tracking_link}}`

> ⚠️ No prices or terms are invented here — the commercial specifics are tokens. Drop in your real trade terms before these go out.

---

## 1 · SAMPLE-RECEIVED CHECK-IN
**Trigger:** ~3–5 days after the sample is dispatched (or on delivery confirmation). · **Goal:** get them to actually trial it, and book the setup call.

### Email — plain text
**Subject A:** How did the Sunset tan turn out?
**Subject B:** Your Sunset sample — first impressions?
**Preview:** Two quick questions, and the next step if you like it.

Hi {{first_name}},

Your Sunset sample should have landed at {{salon_name}} by now — I hope you've had a chance to put it on a client.

Two quick things:

1. How did the colour develop for you? Genuinely keen to hear, even if it's not a fit — honest feedback helps.
2. If you liked it, let's grab 15 minutes to sort your ranges and trade terms so you're set for summer: {{calendar_link}}

No rush and no pressure — just reply whenever suits.

{{sender_name}}
{{sender_title}}

### WhatsApp
> Hi {{first_name}} — did the Sunset sample land ok? Keen to hear how the colour turned out on your client. If you liked it, happy to grab 15 mins to sort your ranges + trade terms: {{calendar_link}} — no pressure either way.

---

## 2 · POST-CALL TRADE-TERMS SUMMARY
**Trigger:** straight after the 15-min setup call. · **Goal:** put everything agreed in writing and make the opening order easy.

### Email — plain text
**Subject A:** Your Jimmy Coco partner terms — as promised
**Subject B:** Everything from our call, in one place
**Preview:** Your ranges, terms and the one step to get stocked.

Hi {{first_name}},

Great chatting today. Here's everything we covered, in one place.

YOUR RANGES
- In the booth: the Sunset professional solution
- On the shelf: the take-home retail range (Tinted Tan Soufflé, the Face Brush, extend-your-tan products)

YOUR TRADE TERMS
- Wholesale margin: {{wholesale_margin}}
- Opening order: {{min_opening_order}}
- Reorders: from {{reorder_minimum}}
- Dispatch: {{lead_time}}

WHAT'S INCLUDED
- Jimmy's shade guide + method training for your team
- Marketing assets to launch the service
- A direct line to me for anything you need

The one next step is your opening order — I've made it easy here: {{order_link}}
Want me to walk it through instead? Just reply.

{{sender_name}}
{{sender_title}}

### WhatsApp
> Thanks for the chat {{first_name}}! Sent the full terms to your email — your ranges, margin ({{wholesale_margin}}), opening order ({{min_opening_order}}) and what's included. Whenever you're ready, your opening order's here: {{order_link}}. Happy to walk it through if easier.

---

## 3 · FIRST-ORDER CONFIRMATION
**Trigger:** opening order placed. · **Goal:** confirm, set expectations, kick off onboarding.

### Email — plain text
**Subject A:** Order confirmed — welcome to Jimmy Coco
**Subject B:** Your opening order is confirmed, {{first_name}}
**Preview:** What's coming, when — and how we get your team ready.

Hi {{first_name}},

Order confirmed — welcome aboard properly. Really pleased to have {{salon_name}} on board.

YOUR ORDER
- Order: {{order_number}}
- Items: {{order_summary}}
- Total: {{order_total}}
- Dispatch: {{dispatch_date}} ({{lead_time}}) · tracking: {{tracking_link}}

WHAT HAPPENS NEXT
1. Your stock ships — you'll get tracking as soon as it's on the way.
2. I'll send your shade guide, method training and launch assets so your team's confident from day one.
3. We check in after your first week of tans to make sure it's all landing well.

Reordering is always a couple of clicks: {{order_link}}. Anything at all, just reply — you've got a direct line to me.

Here's to a big summer,

{{sender_name}}
{{sender_title}}

### WhatsApp
> Order confirmed, {{first_name}} — welcome aboard! {{order_summary}} is being packed now, dispatch {{dispatch_date}} and I'll send tracking the moment it ships. I'll also send your training + launch assets so the team's ready. Anything at all, just message me here. Here's to a big summer for {{salon_name}}.

---

## Notes
- **Event-triggered, not scheduled** — each message fires on the real step (delivered / call done / order placed), so timing always feels right.
- **Fill the commercial tokens** before sending message 2 and 3.
- Messages 2 and 3 are transactional in nature — natural fits for **Resend** (see the seeding README's Resend note).
- Beyond this: replenishment reminders, a reorder nudge, and a first-week-of-tans check-in extend the flow into an ongoing account relationship — easy to add when you're ready.
