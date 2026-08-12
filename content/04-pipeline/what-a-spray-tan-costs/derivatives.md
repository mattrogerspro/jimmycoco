# Derivatives — What a spray tan actually costs you to deliver

---

## The email

**Which:** issue 1 of the **Salon Business Brief**. This is the piece the Brief
should launch on — it's the clearest demonstration of what the Brief is for.

**The one number:** **£267.** What a solution 20% cheaper is worth to you over a
year. Roughly £5 a week.

**Subject line candidates**

1. The £5-a-week decision you're spending all your time on
2. Your litre price is worth £267 a year
3. What a spray tan actually costs you

**Body angle** — 120–200 words.

Open on the number everyone optimises: the litre price. Show that at 12 tans a
week a 20%-cheaper solution saves £267 a year. Set that against three retail
items a week, which is worth £1,404. One line acknowledging the thing she
already half-knows — that the cheap litre isn't really the decision. Then the
link, framed as the full model with her own numbers in it.

Do not sell the litre in this email. The whole point of the number is that we're
telling her not to worry about it, and that's why she'll believe the next one.

> ⚠ Building the campaign means going through the
> `build-jimmy-coco-email-campaign` skill and the rules in
> `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md`. Campaign voice
> is governed by that document. The Brief needs its own campaign folder and
> registry entry, and stays **disabled** until enablement is explicitly
> approved. Nothing here authorises a send.

## The tool

**Links to:** the **spray tan profit calculator**, `/tools/spray-tan-profit-calculator`

**Needs from the article:** the tool implements this exact model, so the two must
agree or the article undermines itself.

**Tool changes required** — see
[`../../05-tools/cost-and-profit-calculator.md`](../../05-tools/cost-and-profit-calculator.md):

1. The existing `ProfitCalculator` uses a hard-coded `60 / yieldPerLitre` and
   models **no consumables at all** beyond solution. The article says
   consumables are £3.24, not £2.14. **The tool currently disagrees with the
   article by about a pound a tan.** Fix before both are live.
2. No chair-time or labour input. The article's central argument is that chair
   time is the big cost.
3. No overhead apportionment input.
4. Retail price slider maxes at £79 — a stale RRP. Real range is £15–£59.
5. It lives inside the home page rather than on its own route, so it cannot be
   linked to, cited, or found.

## Social cuts

Each carries one number and stands alone.

| # | Format | The number | Copy |
|---|---|---|---|
| 1 | Single-stat card | **£267** | "A litre 20% cheaper saves you £267 a year. That's £5 a week. It's the smallest decision in your business and it gets the most attention." |
| 2 | Comparison table | £1,404 vs £267 | Retail (three items a week) against a cheaper litre. Same table as the article, cut to two rows. |
| 3 | Single-stat card | **£8.65 → £6.00** | "Your overhead per tan at 52 a month vs 75 a month. Filling the room is the same thing as making it cheaper." |
| 4 | Carousel, 5 frames | £30 → £11.30 | The cost stack, one line per frame, ending on the profit. |
| 5 | Text | 3.14% | "Tanning has the highest no-show rate of any treatment category. It peaks in June, July and August." |

Cut 1 is the strongest for the Facebook groups where mobile and home-based
therapists actually share things — it's counter-intuitive, it's specific, and
it's a brand telling people not to worry about the price of the brand's own
product, which is the sort of thing that gets reposted by a member rather than
by us.

## Internal linking to add elsewhere

Nothing yet — this is the first article. As the pillar fills:

- `what-to-charge-for-a-spray-tan` → link back to this from its cost-floor section
- `retail-attach-maths` → link back from its opening; this article's levers
  table is the reason that one exists
- `mobile-spray-tan-profit` → link back from its consumables section
- `spray-tan-no-shows` → link back from its cost-of-a-miss section
- The home page profit calculator section → link forward to this once live

## Follow-ups this piece raised

- **What to charge** — the obvious next question, and the article deliberately
  stops before it. Pillar 1, article 2.
- **Retail attach** is a bigger lever than anything else in the model and
  deserves the full treatment. Pillar 1, article 4, and pillar 4, article 4.
- **The mobile model** — travel, fuel, equipment amortisation, and a no-show
  costing the journey. Pillar 1, article 5.
- **What a therapist's column should produce** — the same model applied to a
  person rather than a treatment. Pillar 5, article 1.
- **Does yield vary enough by equipment to be worth an article of its own?**
  Probably — pillar 1, article 3, but it needs real measurement before it can
  say anything the forums haven't.
