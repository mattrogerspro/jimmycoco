# Sunless by Jimmy Coco — Dubai / UAE Salon Stockist Sequence

**Campaign:** recruit premium salons, hotel spas, beauty destinations and professional tanning artists in Dubai first, then the wider UAE.

**Primary outcome:** qualified reply, professional trial request or booked partnership conversation.

**Sequence:** five emails across 18 days. Stop immediately on reply, unsubscribe, complaint, ineligibility or manual suppression.

## Personalisation and commercial tokens

| Token | Meaning |
|---|---|
| `{{first_name}}` | Recipient first name |
| `{{business_name}}` | Salon, spa, hotel or studio name |
| `{{business_type}}` | Salon / spa / hotel spa / tanning studio |
| `{{area}}` | Dubai area or emirate |
| `{{sender_name}}` | Named sender |
| `{{sender_title}}` | Sender role |
| `{{sender_email}}` | Monitored reply address |
| `{{calendar_link}}` | Partnership call booking link |
| `{{trial_link}}` | Approved professional trial request route |
| `{{trade_link}}` | Approved UAE trade or application route |
| `{{shade_guide_link}}` | Approved shade guide |
| `{{uae_delivery_statement}}` | Approved fulfilment wording |
| `{{uae_partner_terms}}` | Approved trade terms or summary |
| `{{business_address}}` | Sender business address |
| `{{unsubscribe_link}}` | Immediate unsubscribe route |

> No UAE pricing, delivery times, exclusivity, stock availability, minimum order, import status, product registration or trade terms may be inferred. Replace every commercial token with approved current information before release.

---

## Email 1 — A professional introduction · Day 0 · `emails/1-dubai-introduction.html`

**Subject A:** A Jimmy Coco introduction for {{business_name}}

**Subject B:** Dubai, meet the tan behind the red carpet

**Subject C:** {{first_name}}, a professional tanning idea for {{business_name}}

**Preview:** A professional trial conversation for one of Dubai’s premium beauty destinations.

Hi {{first_name}},

I’m reaching out because {{business_name}} looks aligned with the kind of partner we want to build with in Dubai: premium service, strong presentation and clients who care about how colour looks beyond the treatment room.

**Sunless by Jimmy Coco** is the professional tanning line created by celebrity tanning artist Jimmy Coco. His work is built around believable, undertone-aware colour — the kind that looks polished in daylight, photography and evening light rather than turning flat or orange.

We’re opening conversations with selected UAE salons, spas and tanning professionals about the professional solution and a tightly edited take-home range.

Would it be useful to arrange a professional trial or a short introduction call for {{business_name}}?

**Primary CTA:** Request a professional trial → `{{trial_link}}`

Or reply directly and I’ll keep it simple.

{{sender_name}}
{{sender_title}}

---

## Email 2 — Why Dubai clients notice the difference · Day 4 · `emails/2-colour-in-dubai-light.html`

**Subject A:** Colour that still looks right in Dubai light

**Subject B:** The difference clients see outside the treatment room

**Preview:** Undertone-aware colour designed to remain believable in daylight, photography and evening light.

Hi {{first_name}},

The real test of a professional tan is not how it looks under treatment-room lighting. It is how it reads afterwards: in strong daylight, photographs, hotel interiors, restaurants and events.

That is the principle behind Jimmy Coco’s shade method. The objective is not simply “darker”. It is controlled depth, undertone awareness and a finish that looks considered rather than obvious.

For a premium {{business_type}}, that matters commercially as well as creatively:

- a more confident consultation;
- a result clients can wear to high-visibility occasions;
- a premium service story that does not rely on discounting;
- a recognisable expert name behind the treatment.

I can send the professional information and approved UAE trial route here: {{trial_link}}

{{sender_name}}
{{sender_title}}

---

## Email 3 — Two revenue lines, one client journey · Day 8 · `emails/3-service-and-retail.html`

**Subject A:** One tan client, two considered revenue lines

**Subject B:** The treatment room and the retail shelf

**Preview:** A professional service supported by a curated at-home continuation range.

Hi {{first_name}},

The strongest salon partnerships do more than place a product in the treatment room. They create one coherent client journey.

**In the treatment room**

The professional solution gives the team a premium service proposition built around shade selection, controlled depth and believable colour.

**After the appointment**

A focused take-home edit gives clients a way to maintain, extend or complement the result without turning the reception area into an overstocked retail wall.

That creates two useful commercial lines from one client relationship:

1. the professional treatment;
2. relevant take-home retail at the moment intent is highest.

The exact UAE range, terms and availability must be confirmed through the approved trade route: {{trade_link}}

Would a 15-minute partnership conversation be useful? {{calendar_link}}

{{sender_name}}
{{sender_title}}

---

## Email 4 — Partnership, training and launch support · Day 13 · `emails/4-partner-support.html`

**Subject A:** What a Jimmy Coco partnership includes

**Subject B:** More than a professional solution

**Preview:** Shade guidance, team confidence and a considered route to launch.

Hi {{first_name}},

A premium product only works when the team knows how to present it, recommend it and deliver the result consistently.

The intended partner pathway for {{business_name}} is therefore built around more than supply:

- professional shade and consultation guidance;
- a clear treatment and retail story for the team;
- approved brand and launch assets;
- a direct commercial contact;
- a trial-first route before a wider commitment;
- UAE-specific fulfilment and trade information once approved.

The current approved UAE delivery and partner position is:

**{{uae_delivery_statement}}**

**{{uae_partner_terms}}**

I’d be happy to walk through the model and identify whether it suits {{business_name}}: {{calendar_link}}

{{sender_name}}
{{sender_title}}

---

## Email 5 — Close the conversation respectfully · Day 18 · `emails/5-close-the-loop.html`

**Subject A:** Shall I close this for now?

**Subject B:** Last note from me, {{first_name}}

**Preview:** I’ll close the conversation unless a professional trial is useful later.

Hi {{first_name}},

I’ve sent a few notes about a possible Sunless by Jimmy Coco partnership for {{business_name}} and do not want to keep filling your inbox.

I’ll close the conversation for now.

Should the timing change, reply at any point and I can reopen it with the current UAE range, trial route and trade information.

You can also keep Jimmy’s shade guide here: {{shade_guide_link}}

Thank you for reading,

{{sender_name}}
{{sender_title}}

---

## Branching and exit rules

- Stop all scheduled touches immediately after any reply.
- Positive interest routes to a human-owned trial or partnership workflow.
- Trial requested routes to fulfilment validation before any promise is made.
- Call booked suppresses all remaining cold touches.
- Unsubscribe, complaint, hard bounce or invalid address suppresses immediately.
- Existing customer, active partner or current negotiation must be excluded from cold acquisition.
- Do not continue the sequence when the contact’s role is not relevant.

## Sending guidance

- Use a named, monitored sender rather than a no-reply identity.
- Send in the recipient’s local UAE time zone.
- Prioritise a carefully qualified list over volume.
- Do not use scraped personal addresses or generic mass lists.
- Treat opens as directional only; replies, trial requests and booked conversations are the primary measures.
- Revalidate current UAE law, consent basis, suppression, sender identification and unsubscribe behaviour before launch.
