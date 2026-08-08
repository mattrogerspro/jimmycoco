# Distribution

**One research effort, three assets: article → email → social.**

This is what makes the programme sustainable at one person's capacity. The
research is the expensive part. Once it exists, the email and the social cuts
should cost almost nothing — and every article's
[`derivatives.md`](../04-pipeline/_TEMPLATE/derivatives.md) is where they get
written down while the material is still fresh.

---

## The Salon Business Brief

The recurring email. **One email a month, one number worth knowing.**

### Why it matters beyond distribution

The trade programme currently has no reason to email a salon that hasn't bought
yet. Every existing campaign is an acquisition sequence, an onboarding sequence
or a lifecycle sequence — all of them assume a relationship that's going
somewhere specific. A prospect who read an article and isn't ready to open an
account has nowhere to go.

A monthly brief with a real number in it is that reason. It's also the only
list-building mechanism the programme has, given that
[decision 3](../00-strategy/decisions.md#3-tools-and-templates-ungated-all-of-them)
rules out gating anything.

### Shape

- **Monthly.** Not weekly — we don't have a real number worth knowing every week,
  and a thin issue costs more trust than a skipped month.
- **One number**, one interpretation, one link. 120–200 words.
- **No promotions.** If a promotion needs to go out, it goes out as its own
  campaign to its own audience. The Brief's value is that it never sells, and
  that is the whole reason it gets opened.
- Plain text or very lightly branded. It should read like a supplier who knows
  something useful, not a newsletter.

### Issue 1

`what-a-spray-tan-costs`, built on **£267** — what a 20%-cheaper litre is worth
over a year. See
[`../04-pipeline/what-a-spray-tan-costs/derivatives.md`](../04-pipeline/what-a-spray-tan-costs/derivatives.md#the-email).

### Building it

The Brief is a campaign like any other and follows the repository's campaign
rules without exception:

- Use the `build-jimmy-coco-email-campaign` skill.
- Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely
  first.
- New folder under `email/campaigns/` — suggested `uk-salon-business-brief` —
  with the standard shape: `README.md`, `sequence.md`, `email-data.json`,
  `studio.json`, `emails/`.
- Add it to the campaign registry table in `email/campaigns/README.md`.
- **Stays disabled until enablement is explicitly approved.** Nothing in this
  content folder authorises a send, a publish, a broadcast or a contact import.

Campaign voice is governed by the generator prompt, not by
[`../01-editorial-system/voice.md`](../01-editorial-system/voice.md).

### Open question: Resend or Klaviyo?

The trade infrastructure is **Resend** — the AU, UAE and UK onboarding campaigns
are Resend templates, and the trade contact data is there. The consumer side
runs on **Klaviyo** via `send.jimmycoco.co.uk`.

The Brief is trade, so **Resend is the default answer**. Worth confirming before
the first issue, because moving a list later is unpleasant.

---

## Social

Three to five cuts per article, specified in the article's `derivatives.md`.

**The rule: every cut carries one number and stands alone.** Nobody should have
to click to get the point. A cut that only makes sense if you read the article is
an advertisement for the article; a cut that delivers a fact is a thing people
repost.

**Where this audience actually shares.** Facebook groups for mobile and
home-based therapists — often several thousand members, highly active, and the
place operational questions get asked. A cut designed to be **reposted by a
member** beats one designed to be posted by the brand, by a wide margin. That
means: no logo lock-up dominating the image, no CTA, no hashtag stack. Just the
number and the sentence.

Instagram and TikTok carry the craft pillar better than the business pillars —
technique is visual, margin isn't.

---

## The mapping

| Asset | Made from | Cost once the article exists |
|---|---|---|
| Article | The research | The expensive part |
| Brief issue | The article's single strongest number | ~30 minutes |
| 3–5 social cuts | The article's tables and stats | ~1 hour |
| Tool linkage | The article's model | Zero, if the tool already implements it |

The one that goes wrong is tool linkage — see the calculator spec, where the
existing tool currently produces a different number from the article that will
link to it. **Check that the tool and the article agree before either ships.**

---

## What we don't do

- **No gated lead magnets.** Decision 3.
- **No syndication to sites that won't link back.**
- **No repurposing an article as a paid ad.** Different job, different copy.
- **No pushing articles into existing campaign sequences.** The onboarding and
  acquisition flows are tuned; dropping an article link into them because it's
  new is how a good sequence stops working.
