# Sunless by Jimmy Coco — Gold Coast Salon Stockist Recruitment

Seven-email, reply-led sequence for qualified Gold Coast salon and studio owners. Send days: 0, 3, 7, 11, 16, 22 and 30. Stop immediately after any reply or suppression event.

## Tokens

`{{first_name}}`, `{{salon_name}}`, `{{suburb}}`, `{{sender_name}}`, `{{sender_title}}`, `{{sender_email}}`, `{{business_address}}`, `{{unsubscribe_link}}`, `{{approved_range_summary}}`, `{{approved_partner_support}}`, `{{approved_trade_terms}}`, `{{approved_opening_requirements}}`, `{{approved_delivery_statement}}`, `{{approved_stockist_pathway}}`.

All personalisation requires a verified value and natural send-time fallback. All `approved_*` values require current human approval before release.

## Email 1 — Relevant introduction

**Day:** 0  
**HTML:** `emails/1-introduction.html`  
**Subject A:** A stockist conversation for {{salon_name}}  
**Subject B:** Sunless by Jimmy Coco on the Gold Coast  
**Preview:** A brief introduction to Sunless by Jimmy Coco for relevant Gold Coast salon partners.  
**Primary CTA:** Request stockist information by replying to `{{sender_email}}`.  
**Exit effect:** Any reply stops the sequence and creates a human follow-up.

Hi {{first_name}},

I'm reaching out from Sunless by Jimmy Coco because {{salon_name}} appears relevant to a professional stockist conversation on the Gold Coast.

We approach professional colour through clear consultation, considered product choice and practical support for the people delivering the service. The aim is simple: help a salon decide whether the range and partnership model genuinely fit its clients and team.

If becoming a stockist is on your radar, I can send the approved professional range overview and explain the next step without assuming a commitment.

Reply to request the stockist information. This inbox is monitored by a real person.

{{sender_name}}  
{{sender_title}}

## Email 2 — Professional method

**Day:** 3  
**HTML:** `emails/2-professional-method.html`  
**Subject A:** What matters in a professional tan range?  
**Subject B:** Beyond the formula: the professional method  
**Preview:** A good partnership should support confident consultation as well as the finished service.  
**Primary CTA:** Reply with the salon's current service priority.  
**Exit effect:** Any reply stops the sequence and creates a human follow-up.

Hi {{first_name}},

When a salon reviews a professional tanning range, the formula is only one part of the decision. The consultation, shade choice, application method and aftercare guidance all shape the client experience.

Jimmy Coco's professional approach is built around making those decisions deliberate rather than automatic. For a potential stockist, that means evaluating how the method fits the way your team already works — and where better guidance could make the service easier to deliver consistently.

What matters most in your current service: consultation, shade choice, application support or retail aftercare?

Reply with one line and I'll respond with the most relevant approved information.

{{sender_name}}

## Email 3 — Client experience

**Day:** 7  
**HTML:** `emails/3-client-experience.html`  
**Subject A:** A tanning service clients can understand  
**Subject B:** Clearer guidance at every appointment  
**Preview:** Clear choices and practical guidance can make a professional service feel more considered.  
**Primary CTA:** Request the approved range overview.  
**Exit effect:** A reply stops prospecting and routes the range request to the campaign owner.

Hi {{first_name}},

Clients do not need a complicated tanning menu. They need to understand the colour direction, why it suits the result they want and what to do before and after the appointment.

That clarity is useful for the salon too. It gives the team a stronger consultation structure and a natural way to explain any appropriate take-home support without turning the conversation into a hard sell.

The approved stockist overview sets out the current range and its role in the professional journey: {{approved_range_summary}}

Reply and I'll send the current approved overview rather than quoting unapproved details.

{{sender_name}}

## Email 4 — Partner support

**Day:** 11  
**HTML:** `emails/4-partner-support.html`  
**Subject A:** What support should a stockist expect?  
**Subject B:** The support behind a professional range  
**Preview:** The useful question is not only what you stock, but how your team is supported afterwards.  
**Primary CTA:** Ask about approved partner support.  
**Exit effect:** A reply stops prospecting and creates a support-needs follow-up.

Hi {{first_name}},

A new range should not arrive with a product list and leave the salon to work everything else out. The more useful discussion is what your team needs to introduce it confidently and answer client questions clearly.

Current approved partner support: {{approved_partner_support}}

If you tell me how many people deliver or recommend tanning services at {{salon_name}}, I can route the conversation to the right level of support.

There is no commitment implied by asking the question.

{{sender_name}}

## Email 5 — Commercial fit

**Day:** 16  
**HTML:** `emails/5-commercial-fit.html`  
**Subject A:** The practical stockist questions  
**Subject B:** Before you assess a new tanning partner  
**Preview:** Trade terms, opening requirements and delivery should be verified before any decision.  
**Primary CTA:** Request the approved commercial details.  
**Exit effect:** A reply stops prospecting and routes the request to a human owner.

Hi {{first_name}},

Before considering a new stockist relationship, you should be able to review the practical details without vague promises:

- The current approved trade terms
- Any opening requirements
- The current delivery statement for the Gold Coast
- What partner support is included
- What happens after an initial conversation

Those details remain subject to approval and current availability: {{approved_trade_terms}} · {{approved_opening_requirements}} · {{approved_delivery_statement}}

Reply to request the approved details. We will not substitute estimates for current commercial facts.

{{sender_name}}

## Email 6 — Stockist pathway

**Day:** 22  
**HTML:** `emails/6-stockist-pathway.html`  
**Subject A:** A simple route to explore stockist fit  
**Subject B:** The next step for {{salon_name}}  
**Preview:** Start with a short conversation, review the approved details and decide whether to continue.  
**Primary CTA:** Start a stockist conversation.  
**Exit effect:** A positive reply exits prospecting; an approved account milestone hands off to `au-salon-account-flow`.

Hi {{first_name}},

If the professional range sounds relevant, the next step does not need to be complicated. We can begin with a short conversation about {{salon_name}}, the services you offer and the questions your team needs answered.

The approved pathway from there is: {{approved_stockist_pathway}}

You can review the facts, ask what you need and decide whether there is a genuine fit. There is no value in forcing a partnership that is not right for the salon.

Reply with a suitable time or simply ask for the information first.

{{sender_name}}

## Email 7 — Close the loop

**Day:** 30  
**HTML:** `emails/7-close-the-loop.html`  
**Subject A:** I'll leave the stockist conversation here  
**Subject B:** Closing the loop with {{salon_name}}  
**Preview:** No pressure and no manufactured deadline — reply later if the timing becomes relevant.  
**Primary CTA:** Reply later if the opportunity becomes relevant.  
**Exit effect:** The prospecting sequence closes after this message whether or not the recipient acts.

Hi {{first_name}},

I've sent a few notes about a possible Sunless by Jimmy Coco stockist conversation for {{salon_name}} and have not heard back. I do not want to keep filling your inbox, so this is the final message in the sequence.

If the timing changes, you are welcome to reply and restart the conversation. There is no artificial deadline attached to this note.

Otherwise, no action is needed and the prospecting sequence will stop here.

{{sender_name}}
