# The evidence standard

This is the moat. It is also the only rule in this folder that has no
discretion in it.

> **Every factual claim in a published article carries a source, or is
> explicitly labelled as an assumption, or does not appear.**

The article schema already supports this: `citations` is a first-class array on
the `articles` table, rendered as a numbered *Sources* list at the foot of every
article. Use it.

---

## The four categories

Every claim you write is one of these. Decide which before you write the
sentence.

### 1. Sourced fact

Traceable to a named primary source: a regulator, a statute, a peer-reviewed
paper, a named industry dataset with its sample size, or an official statistic.

State it plainly. Add it to `citations`. Name the source and the year inline
where the number is load-bearing.

> Tanning has the highest no-show rate of any UK treatment category, at 3.14%
> (Treatwell, 2025).

**Sample sizes and bases go inline where they change the reading.** "20% of UK
salons are operating at a loss (NHBF, March 2026, n=423)" is honest. Without the
n it's a statistic pretending to be a census.

### 2. Stated assumption

A figure we've chosen for a worked example that a reader's own business will
differ from. Perfectly legitimate — most useful business content is built from
these — but it must be visibly labelled as a choice, with a range.

> Disposables — hairnet, sticky feet, disposable briefs, barrier cream, wipes —
> are taken here at **£0.75 a tan**. This is an assumption, not a survey; the
> realistic range is £0.40 to £1.50 depending on what you provide.

Every article containing a model carries an **Assumptions** block listing all of
them together, so a reader can substitute her own.

### 3. Genuine disagreement

Two credible sources contradict each other and no evidence settles it. Present
both, attribute both, and say it's unsettled. Do not pick a side to sound
authoritative — the disagreement *is* the information.

Currently live disagreements are listed in the
[claims register](../03-research/claims-register.md#genuine-industry-disagreements).

### 4. Unverified — does not publish

Widely repeated, no evidence found. These are on the
[claims register](../03-research/claims-register.md) and they do not appear as
fact under any framing, including hedged framing.

Writing "some therapists find that DHA resistance..." is still publishing it.
The only acceptable treatment is to address it directly as an unevidenced
belief, which is often worth doing:

> "DHA resistance" is widely discussed in the profession. We could find no
> published evidence that it exists as a physiological phenomenon. What is
> documented is that colour depth is proportional to stratum corneum thickness
> (Draelos) — which produces the same observation, with a different cause and a
> different fix.

---

## The `[VERIFY]` marker

Draft freely. Mark anything you haven't sourced yet:

```
The employer NIC rate on earnings above the secondary threshold is [VERIFY: rate]%.
```

**No article publishes with a `[VERIFY]` marker in it.** Each one is either
resolved into a citation, converted to a stated assumption, or the sentence is
cut. `research.md` in the article's pipeline folder tracks the open ones.

Grep before publishing:

```bash
grep -rn "\[VERIFY" content/04-pipeline/<slug>/
```

## Sources we use, in order of preference

1. **Regulators and statute** — legislation.gov.uk, HSE, the UK SAG-CS opinion,
   local authority licensing pages, 21 CFR for the US position when relevant.
2. **Peer-reviewed literature** — for anything about how DHA actually works. The
   strong ones are in the [source library](../03-research/source-library.md).
3. **Named industry datasets with a stated sample** — NHBF, Phorest, Treatwell,
   Booksy, IBISWorld, Circana, SalonIQ.
4. **Trade bodies** — BABTAC, NHBF, insurers' own policy documentation.
5. **Our own operational data** — clearly labelled as ours.

**Not sources:** other brands' blogs, salon marketing sites, Etsy listings,
forum posts, or any figure whose only provenance is that everyone repeats it.
If a claim's trail ends at another blog, it is category 4.

## The standing notes

Every compliance article ends with:

> This is general information, current at the date of publication, and not legal
> advice. Requirements vary between local authorities and insurers — check with
> your own council and your own broker before acting on it.

Every article containing a financial model ends with:

> These figures are a model, not a forecast. Substitute your own numbers — the
> assumptions are listed above so you can.

Both are also the reason we can publish depth on compliance at all.

## Corrections

If a published figure turns out to be wrong: correct the article, correct the
`article.md` in the pipeline folder, and add a dated line at the foot of the
article saying what changed. We do not silently edit numbers. A visible
correction history is worth more to a reader than the appearance of never having
been wrong.
