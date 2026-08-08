# Tool 3 — Consultation & consent template pack

**Route:** `/tools/consultation-consent-pack`
**Status:** not started — **blocked on research**
**Pairs with:** pillar 2, articles 1, 2, 3 and 7

---

## Why this is the most valuable asset in the programme

**No free, GDPR-aware, UK-compliant spray tan forms library exists anywhere.**
Not from a brand, not from a trade body, not from an insurer. The market is
owned by Etsy sellers charging a few pounds for documents of unknown provenance.

A salon owner needs these documents to be insured. She currently either buys one
off Etsy, copies one from a forum, or works without one. That is an
extraordinary gap for something this consequential.

It is also the single strongest link magnet we could build, and the natural CTA
for four of the seven compliance articles.

## What's in the pack

| Document | Purpose |
|---|---|
| Client consultation record | Skin type, medical questions, contraindications, prior reactions |
| Patch test record | Test performed, timing, result, client signature |
| Informed consent | What the treatment involves, what it doesn't do (it isn't sun protection), what the client agrees to |
| Aftercare card | Client-facing, brandable |
| Deposit and cancellation policy | Template wording — pairs with the no-shows article |
| Privacy notice | Lawful basis, retention, client rights — the part nobody has |
| Contraindications reference | For the therapist, not the client |

Each in **editable (.docx) and print-ready (.pdf)**, unbranded and brandable.

## Blocked on

This cannot be built responsibly until the research behind pillar 2 exists.
Specifically:

1. **What insurers actually require.** Half of what goes in these forms is there
   because an insurer's policy wording demands it. We need the wording from 3+
   UK treatment liability providers before we can say a form is sufficient.
2. **Lawful basis and retention under UK GDPR.** A consultation form containing
   health questions is collecting **special category data**, which most salons
   don't realise and which changes what the privacy notice has to say. Getting
   this wrong in a template that hundreds of salons then use is the worst
   outcome available to this programme.
3. **Patch test timing.** 24h vs 48h is a live disagreement — see the
   [claims register](../03-research/claims-register.md#genuine-industry-disagreements).
   The form should record what was done and when, rather than assert a standard.

**Recommendation: a named human review before publication** — a broker, or
someone competent on UK GDPR. This is the one asset in the programme where the
downside of being wrong lands on the reader rather than on us.

## Rules

- **Ungated**, per [decision 3](../00-strategy/decisions.md#3-tools-and-templates-ungated-all-of-them).
  No email for the download. This is the asset people will most want to gate and
  the one where gating would cost the most.
- **Unbranded documents.** A form with our logo on it is a form a salon won't
  use. Our name appears on the page, not on the paperwork.
- **The standing note on the page**, prominently: general information, current
  at the date of publication, not legal advice; requirements vary between local
  authorities and insurers; check with your own broker.
- **Version and date every document**, in the footer. A compliance template with
  no date on it is worse than no template.
- **No product placement anywhere in the documents.**

## The page itself

The download page is also an article. Crawlable prose explaining what each
document is for, why it's there, and what the insurer or the regulation actually
requires — that's what ranks, and it's what makes the pack trustworthy rather
than just free.

Include the review date and a plain statement of what we did and didn't verify.

## Also required

Route registration, sitemap entry, prerender, meta with canonical and hreflang.
Files served from `public/`, with stable URLs so links don't rot when the pack is
revised — version inside the document, not in the filename.
