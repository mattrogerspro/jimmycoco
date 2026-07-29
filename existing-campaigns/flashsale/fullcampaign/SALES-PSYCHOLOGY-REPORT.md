# Flash Sale Email — Sales Psychology & Conversion Report

**Subject of review:** `existing-campaigns/flashsale/fullcampaign/index.html`
**Date:** 29 July 2026
**Audience:** existing consumer list (footer states recipients purchased from or gave their email to jimmycoco.co.uk)

---

## 1. Executive summary

The email is visually strong and the asset quality is high. The weaknesses are almost entirely
**structural and commercial**, not creative — which is good news, because they are cheap to fix.

Ranked by expected impact on revenue:

| # | Finding | Severity | Effort |
|---|---|---|---|
| 1 | The headline **understates the best discount by 11 percentage points** | Critical | 10 min |
| 2 | **No deadline** anywhere in a "flash" sale | Critical | 30 min |
| 3 | Four identical `SHOP NOW` buttons all landing on the **homepage** | Critical | 1 hour |
| 4 | No **£ savings**, no **best-value signal**, no **ratings** on the bundles | High | 2 hours |
| 5 | Strongest proof asset (Kylie) sits **60% down the page** | High | 1 hour |
| 6 | No **reason-why** for the sale | Medium | 15 min |
| 7 | No **risk reversal** or delivery information | Medium | 30 min |
| 8 | Single send to the whole list, **no segmentation, no resend** | High | 2 hours |
| 9 | **No UTM parameters** — this send cannot be attributed | High | 30 min |

Items 1–3 alone are, in my judgement, worth more than everything else combined, and can be
done in an afternoon.

---

## 2. The single biggest problem: your headline is selling you short

The hero says **UP TO 25% OFF**. The actual discounts are:

| Bundle | Was | Now | Save | Discount |
|---|---:|---:|---:|---:|
| Malibu Beach Duo | £35 | £28 | £7 | 20.0% |
| **A-List Glow Kit** | **£75** | **£48** | **£27** | **36.0%** |
| A-List Essentials | £49 | £37 | £12 | 24.5% |
| The Glow Edit | £40 | £32 | £8 | 20.0% |

**The deepest discount is 36%, not 25%.** The 25% figure is almost exactly the *average*
(25.1%) — which suggests someone put the mean where the maximum belongs. "Up to" is a
maximum claim by definition.

Two things are going wrong at once:

**You are voluntarily shrinking your own headline number.** 36 is a materially more arresting
number than 25 in an inbox. This is free.

**"Up to" is a weak construction.** Readers discount it automatically — the well-documented
reading is "I'll probably get the smallest one." If the sitewide discount is genuinely a flat
25%, then say so, because a flat claim always outperforms a hedged one.

### Recommended fix

Split the two claims rather than averaging them into one weak statement:

> **25% OFF EVERYTHING**
> *Bundles up to 36% off*

This is stronger, more accurate, and lets the bundles do what they should be doing — acting as
the reason to spend more than the shopper intended.

⚠️ Confirm which is true before changing anything: is it 25% off sitewide *plus* deeper bundle
pricing, or is "up to 25%" meant to describe the whole promotion? If the latter, the Glow Kit
at 36% contradicts the headline and that is a claims-accuracy problem, not just a missed
opportunity.

---

## 3. The flow, read as a psychological sequence

Here is what the email currently asks the reader to feel, in order:

| Section | Intended job | What it actually does |
|---|---|---|
| Hero — FLASH SALE | Stop the scroll | ✅ Works. Strong, confident, unmistakably a sale |
| Three bundles | Convert | ⚠️ Presents choice before establishing desire or urgency |
| `SHOP NOW` | Act | ⚠️ Generic label, generic destination |
| Model band | — | ❌ Does no persuasive work. Pure scroll cost |
| Kylie Jenner | Justify | ⚠️ Right content, arrives far too late |
| The Glow Edit | Downsell | ✅ Good. Cheapest entry point as a last chance |
| Let's Connect / footer | Retain | ✅ Fine |

### The core structural issue

The email **asks for the sale before it earns it.** The reader meets three price tags roughly
400px in, before they have been given any reason to want the products beyond the discount
itself. For a list of existing customers this is defensible — they already know the brand — but
it means the entire persuasive burden falls on price.

Then the strongest asset you own, **Kylie Jenner**, appears at roughly 60% depth. On mobile
that is about 2,800px of scrolling. Most readers who were going to bounce have already gone.

### The model band is the weakest element

It is a beautiful image doing no commercial work: no caption, no claim, no CTA, no product. It
sits between the offer and the proof and costs roughly 330px of desktop scroll (and a full
screen on mobile) to say nothing.

Either give it a job — overlay a line like *"Two shades. One formula."* or a customer
quote — or cut it and shorten the path to Kylie.

### Recommended running order

```
Hero (offer + deadline + Kylie proof line)
  ↓
Kylie section  ← moved up: earn the desire before naming a price
  ↓
Three bundles + specific CTAs   ← the money block
  ↓
Model band, now captioned
  ↓
The Glow Edit  ← downsell / lower entry point
  ↓
Risk reversal + delivery
  ↓
Footer
```

One line in the hero — *"Kylie Jenner's go-to glow"* — would carry most of the proof benefit
without moving anything, and is the cheapest version of this change to test.

---

## 4. Urgency: a flash sale with no deadline is not a flash sale

The email uses the word **FLASH** and the phrase *"SITEWIDE FLASH SALE"* and never once says
when it ends.

This is the most consequential omission in the email. A deadline is the mechanism that
converts intent into action. Without one, the reader's honest internal response is *"I'll come
back to this"* — and the overwhelming majority never do. Urgency is not a decoration on a
promotion; for a discount-led email it is the primary conversion driver.

Industry data puts **countdown timers at a 10–25% lift in click-through rate and up to a 20%
improvement in conversion** compared with the same email without one ([Omnisend, citing 2024
Zigpoll campaign data](https://www.omnisend.com/blog/countdown-in-email/)). Those are among the
largest single-change uplifts available in email.

### Recommended fix

1. Put an explicit end in the **subject line**, the **hero**, and immediately above **each CTA**:
   *"Ends Sunday 11:59pm"*.
2. Add a **live countdown image** below the hero. These are served as animated GIFs generated
   per-open by the ESP — Klaviyo, Omnisend and Sendtric all provide them.
3. Send a **final-hours email** on the last day. It routinely outperforms the launch email.

⚠️ Only do this if the deadline is real. A "flash sale" that quietly runs on trains your list to
ignore every future one, and in the UK a time-limited claim that isn't time-limited is a
CAP Code problem, not just a credibility one.

---

## 5. Call-to-action architecture

Currently: **four buttons, all reading `SHOP NOW`, all pointing at `jimmycoco.co.uk`.**

Three separate problems:

**Every click costs the shopper a navigation step.** Someone who wants the A-List Glow Kit
lands on the homepage and has to go and find it. Every additional step between intent and
basket loses buyers. The click was the hard part — you have it, and then you spend it.

**You cannot tell what people wanted.** Four identical links to one destination means click
data tells you *that* someone was interested but not *in what*. That kills your ability to
follow up intelligently — no "you looked at the Glow Kit" retargeting, no interest-based
segmentation for the next send.

**Repetition without new information causes habituation.** The second, third and fourth
`SHOP NOW` add no new reason to click. A CTA that restates the specific offer re-persuades each
time it appears.

### Recommended fix

| Location | Current | Recommended |
|---|---|---|
| Hero | *(image link only)* | **SHOP THE SALE — UP TO 36% OFF** |
| Bundles | SHOP NOW | **SHOP ALL BUNDLES** |
| Each card image + price | homepage | its own product page |
| Kylie | SHOP NOW | **SHOP KYLIE'S GLOW** |
| Glow Edit | SHOP NOW | **GET THE GLOW EDIT — £32** |

Add a visible button **in or immediately below the hero**. At present the first tappable thing
is the hero image itself, which is linked but doesn't look it — readers do not reliably tap
images they don't know are buttons.

Tag every link with UTMs (`?utm_source=email&utm_medium=campaign&utm_campaign=flash_sale_jul26&utm_content=glow_kit_card`). Without them this send is unattributable in analytics.

---

## 6. Price presentation and the bundle block

What is already right: WAS/NOW pairing with a struck-through anchor is textbook and correctly
executed. Three options is the right number — with three, the middle is chosen most often, and
your best-value item is already in the middle. That is a good instinct, whether deliberate or not.

What is missing:

**No £ savings shown.** "NOW £48" states a price; "SAVE £27" states a *gain*. For anything
above roughly £50, an absolute saving lands harder than a percentage. Show both on the Glow
Kit: **Save £27 — 36% off**.

**No best-value signal.** The Glow Kit is your standout deal and the highest-value basket, yet
it has exactly the same visual weight as the £28 duo. Give it a bronze **BEST VALUE** ribbon and
let it be slightly larger. You want the mid-price option to feel like the obvious choice — this
is the compromise effect, and it is the single easiest way to lift average order value.

**No ratings.** Star ratings beside each bundle are among the highest-return additions available
to an ecommerce email. If you have review data on the store, surface it.

**No stock or allocation signal.** *"Limited stock"* or *"While stocks last"* — only if true —
compounds with the deadline.

---

## 7. Subject line and preheader

**Current subject:** *Sitewide Flash Sale — up to 25% off*
**Current preheader:** *Up to 25% off sitewide. Malibu Beach Duo £28, A-List Glow Kit £48, A-List Essentials £37, The Glow Edit £32.*

The preheader is genuinely good — specific prices in the inbox are more compelling than
adjectives, and it earns the open.

The subject is weaker. It leads with a category word ("Sitewide Flash Sale"), hedges with "up
to", and names your smallest headline number. Test against:

- *36% off the A-List Glow Kit — 48 hours only*
- *Your flash sale is live: 25% off everything, ends Sunday*
- *Kylie's go-to glow, now £48*
- *{{first_name}}, 25% off everything (ends Sunday)*

Each leads with either the biggest number, the deadline, or the strongest name.

Health & beauty campaigns average a **30.5% open rate and 1.24% click rate**
([Klaviyo, 2026 benchmarks](https://www.klaviyo.com/uk/blog/email-marketing-benchmarks-open-click-and-conversion-rates)).
That click rate is the number to beat — and it is low enough that the CTA and urgency fixes
above should move it materially.

---

## 8. What the email doesn't say (and should)

**No reason-why.** Sales without a stated reason read as arbitrary and quietly teach your list
that prices are negotiable if they wait. One line fixes it — *"Summer's here and we've over-ordered"*,
*"Celebrating 10 years"*, *"Making room for the new shade"*. A reason makes the discount feel
like an event rather than a policy.

**No risk reversal.** No returns policy, no guarantee, no "wrong shade? we'll swap it." Self-tan
has a high perceived risk of getting it wrong — that fear is a real purchase blocker for exactly
the hesitant buyer a discount is meant to convert.

**No delivery information.** Free-shipping thresholds are one of the most reliable AOV levers
in ecommerce. If you have one, state it next to the bundles: *"Free UK delivery over £40"* pushes
the £28 duo buyer toward the £48 kit.

**No shade guidance.** Medium vs Dark appears on the packaging but is never explained. A
one-line "not sure? take the shade quiz" gives the undecided reader a low-commitment action
instead of leaving them to close the email.

---

## 9. Send strategy — where the volume actually is

Everything above concerns one email. The larger multiplier is how you send it.

**Segment the list.** At minimum three groups, each getting a different hero product:

| Segment | Lead with | Why |
|---|---|---|
| Bought a souffle before | The Glow Edit / Duo | replenishment, known preference |
| Bought once, never a tool | A-List Glow Kit | upsell into the full routine |
| Never purchased | Kylie proof first, then price | still needs convincing |

**Resend to non-openers after 48 hours** with a different subject line. This routinely adds
20–30% incremental opens for the cost of a few minutes' work, and is the highest
effort-to-return action in this entire report.

**Send a final-hours email** on the last day to openers who didn't buy. Deadline-driven sends
typically outperform the launch.

**Suppress recent purchasers** — nothing sours a good customer faster than a discount on
something they paid full price for last week.

---

## 10. Prioritised action list

### Do before this sends

1. **Fix the headline number** — 36%, or split into flat 25% sitewide + up to 36% on bundles
2. **Add a real deadline** — subject, hero, and above every CTA
3. **Point CTAs at product pages** and make the labels specific
4. **Add UTM parameters** to every link
5. **Add a visible button in the hero**

### High value, half a day

6. **BEST VALUE ribbon** on the Glow Kit, plus £ savings on all four
7. **Move Kylie up**, or add a proof line to the hero
8. **Add a countdown timer** below the hero
9. **Reason-why line** and **free-delivery threshold**
10. **Segment into three** and schedule the 48-hour resend

### Next campaign

11. Star ratings on product cards
12. Caption or cut the model band
13. Shade quiz link for undecided readers
14. Post-purchase flow for buyers from this sale

---

## 11. How to measure whether any of this worked

Against the health & beauty campaign baseline of **30.5% open / 1.24% click**:

| Metric | Watch for | Tells you |
|---|---|---|
| Open rate | subject variant performance | whether the deadline or the number pulls harder |
| Click rate | overall vs 1.24% | whether the CTA fixes worked |
| Clicks *by CTA* | which button wins | which product to lead with next time — only possible once destinations differ |
| Click → purchase | drop-off | whether the landing page is the leak |
| AOV | vs non-sale baseline | whether the BEST VALUE ribbon shifted people up |
| Revenue per recipient | the number that actually matters | everything above, combined |

Test **one variable at a time**. If you change the subject, the CTAs and the layout in one go
and revenue moves, you have learned nothing transferable.

---

## Sources

- [Klaviyo — Email marketing benchmarks 2026: open rates, click rates and conversion rates](https://www.klaviyo.com/uk/blog/email-marketing-benchmarks-open-click-and-conversion-rates)
- [Klaviyo — 2026 Email Marketing Benchmarks by Industry](https://www.klaviyo.com/products/email-marketing/benchmarks)
- [Omnisend — Email countdown timers: how to create and use them (2026)](https://www.omnisend.com/blog/countdown-in-email/)
- [WiserNotify — 10 flash sale examples analysed (2026)](https://wisernotify.com/blog/best-flash-sale-examples/)

Discount percentages calculated directly from the price pairs in `index.html`.
