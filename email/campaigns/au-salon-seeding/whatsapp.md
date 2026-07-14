# Sunless by Jimmy Coco — WhatsApp Sequence (companion to the email track)

**Purpose:** A lighter, mobile-native track that *interleaves* with the 5-email sequence — not a duplicate. WhatsApp gets read and replied to far more than email, so it works as the accelerator between email touches.

**Voice:** Same Sunless character — warm, specific, quietly confident — but shorter and more conversational than email. Keep each message to 2–4 short lines. Emoji: leave them out to stay on-brand (add at most one warm one only if a salon is clearly casual).

---

## ⚠️ Read first — WhatsApp is not email

WhatsApp actively polices business messaging. Use this track **only** where you can legitimately reach a business number — a salon's publicly listed WhatsApp Business number, or someone who's opted in. Do not import a cold list and blast it: unsolicited bulk messaging breaches WhatsApp's Business Messaging Policy and gets numbers banned fast.

**Two ways to run it:**

- **WhatsApp Business app (manual, low volume):** send personally, one at a time, personalised. Best for a curated shortlist of high-value salons. Never use broadcast lists for cold contacts.
- **WhatsApp Business Platform / API (via a BSP — Twilio, 360dialog, etc.):** the first business-initiated message **must be a pre-approved template** (Marketing category) and include an opt-out line. Message 1 below has a template-formatted version for this.

**The 24-hour window:** once a salon replies, you have 24 hours of free-form conversation. After that, you're back to approved templates until they message again.

**AU compliance (Spam Act 2003):** identify yourself, only contact where you have consent or clear business relevance, and always offer an opt-out ("Reply STOP"). Practical guidance, not legal advice.

---

## Combined multichannel cadence (~3 weeks)

| Day | Channel | Touch |
|---|---|---|
| 0 | ✉️ Email | 1 · Opener + free sample |
| 1 | 💬 WhatsApp | 1 · Warm intro + sample offer |
| 5 | ✉️ Email | 2 · Nudge |
| 6 | 💬 WhatsApp | 2 · "Want me to post that sample?" |
| 8 | ✉️ Email | 3 · Two revenue lines (branded HTML) |
| 9 | 💬 WhatsApp | 3 · Two ways to earn + call/voice-note ask |
| 13 | ✉️ Email | 4 · Season readiness (branded HTML) |
| 15 | 💬 WhatsApp | 4 · Season urgency |
| 20 | ✉️ Email | 5 · Last call |
| 22 | 💬 WhatsApp | 5 · Warm sign-off + shade guide |

> **Lighter option:** if 10 touches feels heavy for your list, drop Email 2 (Day 3) and lead the nudge on WhatsApp instead. **Stop both tracks the instant a salon replies on either channel** and move to a real conversation.

---

## Personalisation tokens

`{{first_name}}` · `{{salon_name}}` · `{{sender_first}}` (your first name) · `{{calendar_link}}` · `{{shade_guide_link}}`

---

## WhatsApp 1 — Warm intro (Day 1)

> Hi {{first_name}}, it's {{sender_first}} from Sunless by Jimmy Coco. I dropped {{salon_name}} an email earlier — we make the professional tanning line behind a lot of Jimmy's red-carpet work.
>
> Before the summer rush kicks in, I'd love to post you a free sample of our Sunset professional solution and Jimmy's shade guide — no cost, no commitment. Happy for me to send it over?

**Template-formatted version (for the WhatsApp API first touch):**

> Hi {{first_name}}, it's {{sender_first}} from Sunless by Jimmy Coco — the professional tanning line from artist Jimmy Coco. We'd love to post {{salon_name}} a complimentary sample of our Sunset solution and shade guide before summer. Would you like us to send it?
>
> Reply STOP to opt out.

*Tip: attach one product photo (the Sunset 1 Ltr bottle) or a clean before/after image with this message — WhatsApp renders it inline and lifts reply rates.*

---

## WhatsApp 2 — Sample nudge (Day 6)

> Hi {{first_name}} — just making sure this didn't slip past you. Still happy to post {{salon_name}} a free sample of the Sunset solution + Jimmy's shade guide so you can trial it on a client before summer.
>
> Want me to pop one in the post this week? A quick "yes" is all I need.

---

## WhatsApp 3 — Two ways to earn (Day 9)

> Quick thought {{first_name}} — the reason salons like Jimmy Coco is it earns two ways: a premium tan clients pay more for in the booth, plus a take-home range they buy on the way out. Same brand, no discounting.
>
> Easier to show than type — got 15 mins this week for a quick call? {{calendar_link}}
> (Or say the word and I'll send a 30-sec voice note instead.)

**Optional voice-note script (~25 sec):**

> "Hey {{first_name}}, {{sender_first}} here from Sunless by Jimmy Coco — just a quick one. The thing that makes Jimmy Coco work for a salon is it pays off twice: you can charge a premium for the tan itself because the result and the name carry weight, and then there's the take-home range clients grab on the way out, which is margin you're probably leaving on the table right now. I'd genuinely love to send you a free sample so you can see the colour for yourself before the summer rush. Just reply here and I'll sort it. Cheers!"

---

## WhatsApp 4 — Season urgency (Day 15)

> Hi {{first_name}} — mad as it sounds in mid-winter, now's the moment. Tan bookings take off from the Melbourne Cup (3 Nov) and run right through summer, and getting a booth stocked + staff trained on the shade method takes a few weeks.
>
> Want me to map a ready-for-summer setup for {{salon_name}}? A free sample's the easiest place to start.

---

## WhatsApp 5 — Warm sign-off (Day 22)

> All good if the timing's not right, {{first_name}} — I'll leave it there so I'm not clogging your phone.
>
> Here's Jimmy's shade guide to keep either way — genuinely handy for any solution you're using: {{shade_guide_link}}
>
> Give me a shout when summer prep kicks off. Wishing {{salon_name}} a big season.

---

## Sending notes (summary)

- **Timing:** business hours, salon-local. Tue–Thu, late morning or early afternoon. Never evenings/weekends.
- **One-to-one only** for cold — no broadcast lists.
- **Media:** a single product shot or before/after with Message 1 or 3 boosts replies; don't attach more than one.
- **Voice notes** convert well once there's a flicker of interest — use the script above.
- **Metric that matters:** replies and sample requests. WhatsApp read/reply rates run far higher than email, so protect number health by keeping volume low and messages personal.
