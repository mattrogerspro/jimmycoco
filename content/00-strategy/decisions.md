# Decisions log

Programme-level decisions, with the reasoning, so nobody relitigates them by
accident. Add to the bottom; do not rewrite history.

---

## 8 August 2026 — the five founding decisions

### 1. Audience: trade-led, with some consumer

**Decided:** the programme is primarily trade — salon owners, mobile and
home-based therapists, employed therapists, multi-site operators. A small number
of high-volume consumer topics are published as well.

**How consumer content is handled — this is the important part.** Consumer
pieces on the pro site are written as **assets a salon can hand to its clients**,
not as consumer marketing. "Why tans go orange" is written so a therapist can
send the link to a client who asked, with a shareable summary block at the top.
That framing does three things: it keeps the pro site coherently trade-facing,
it stops the pro site competing with jimmycoco.co.uk for consumer search, and it
makes the article useful to the trade reader rather than merely present.

Consumer-facing pieces carry the category **"For your clients"** and must
include a *Share this with your client* block. Anything that cannot be justified
as a therapist-to-client asset does not belong here — it belongs on
jimmycoco.co.uk.

Cap: no more than roughly one in five published pieces.

### 2. Compliance depth: full, heavily sourced

**Decided:** licensing, insurance, COSHH and ventilation are covered properly,
not signposted.

This is the largest gap in the category and the one where authority compounds
fastest. It is also where being wrong has consequences, so it comes with
conditions:

- Every compliance claim is cited to a regulator, statute, statutory instrument
  or the relevant trade body — not to another blog.
- **Local authority variation is stated as variation.** Special treatments
  licensing genuinely differs by council. We explain the mechanism and tell the
  reader to check their own authority; we never say "you need a licence" or "you
  don't" as a national fact.
- Every compliance article carries the standing note in
  [`01-editorial-system/evidence-standard.md`](../01-editorial-system/evidence-standard.md#the-standing-notes)
  — general information, current at date of publication, not legal advice.
- Nothing on the claims register is asserted. The "15% FDA limit" does not
  exist; there is no published ventilation ACH standard; there is no published
  PSI figure. Saying so plainly *is* the content.

### 3. Tools and templates: ungated, all of them

**Decided:** calculators and template packs are free, open, and require no email.

Gated assets are invisible to Google and to AI assistants, which is the entire
reason to build them. The only free, ungated, sterling-denominated spray tan
calculator in the UK is an asset that gets linked to and cited. The same asset
behind an email wall is an asset nobody can find.

Email capture happens through a soft newsletter CTA (the *Salon Business Brief*)
and through the trade account route, not by holding a tool hostage.

### 4. Authorship: split byline

**Decided:**

| Pillar | Author |
|---|---|
| The Craft | **Jimmy Coco** — Person entity, `PERSON_ID` |
| The Economics of Tanning | Sunless by Jimmy Coco Trade Team |
| Compliance and Legitimacy | Sunless by Jimmy Coco Trade Team |
| Filling the Diary | Sunless by Jimmy Coco Trade Team |
| Building the Business | Sunless by Jimmy Coco Trade Team |

Craft content carries real practitioner authority and should resolve to the
Person node in the entity graph. Business, legal and financial analysis should
not be attributed to a tan artist — it is a claim of expertise the author cannot
make, and E-E-A-T assessment notices.

**Required code change before the first brand-bylined article publishes.**
`app/routes/article.tsx` currently emits an inline `{"@type": "Person", name}`
for any author whose name is not exactly `Jimmy Coco`. A brand byline would
therefore be typed as a Person, which is wrong and pollutes the entity graph. It
needs a third branch that emits `{"@id": ORG_ID}` when the author is the brand.
Tracked in [`01-editorial-system/structure-patterns.md`](../01-editorial-system/structure-patterns.md#known-implementation-gaps).

### 5. Retail pricing: the lower prices are correct

**Decided:** £59 A-List Glow Kit, £18 Soufflé, £15 mitt are the real prices.
The pro site's £79 / "from £28" / £15 figures are wrong and get corrected in
`app/components/home/HomeSections.tsx` and
`app/components/product/ProductSections.tsx`.

Consequence for content: **£15 and £18 are the retail figures used in every
worked example**, and the retail-attach maths in the calculator and the
economics pillar uses them. Using the site's old numbers would have overstated
therapist retail earnings by 20–56%, in a programme whose entire premise is that
our numbers are the ones you can trust.

---

## Open questions — not yet decided

- **Where the tools live.** `/tools/<slug>` as standalone routes is assumed
  throughout `05-tools/`, but the article store has no concept of a tool page,
  so each is a hand-built route. Confirm before building the second one.
- **Whether the *Salon Business Brief* goes out via Resend or Klaviyo.** The
  trade list infrastructure is Resend; consumer is Klaviyo. See
  [`06-distribution/README.md`](../06-distribution/README.md).
- **Professional 18% DHA rapid solutions vs published regulator figures.**
  Commercially significant and unresolved. See the claims register. Nothing
  about DHA percentage compliance publishes until this is settled.
