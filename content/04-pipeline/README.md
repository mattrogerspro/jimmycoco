# Pipeline

One folder per article. This is the unit of work, and it mirrors the shape of a
campaign folder in `email/campaigns/` deliberately — same instinct, same
discipline: structured source in the repo, generated artefact downstream.

```text
04-pipeline/<slug>/
  brief.md           audience, query intent, commercial route, claims to make
  research.md        sources verified for THIS piece, and what's still open
  article.md         the copy
  article-data.json  title, slug, meta, FAQ items, citations, cover, tags
  derivatives.md     the email, the social cuts, the tool it links to
```

`<slug>` is the article's URL slug. It matches `article-data.json.slug` and the
live URL `/articles/<slug>`.

## Starting an article

1. Copy [`_TEMPLATE/`](_TEMPLATE/) to `04-pipeline/<slug>/`.
2. Fill `brief.md` first, completely. If you can't state the primary reader, the
   query intent and the commercial route, the piece isn't ready to write.
3. Do the research into `research.md` before drafting. Check every claim against
   [`../03-research/claims-register.md`](../03-research/claims-register.md).
4. Draft `article.md`, marking anything unsourced with `[VERIFY]`.
5. Resolve every `[VERIFY]`. Each one becomes a citation, becomes a stated
   assumption, or the sentence is cut.
6. Fill `article-data.json`.
7. Write `derivatives.md`.
8. Run the checks below.
9. Enter it into the admin article editor as a **draft**. Publishing is a
   separate, human, deliberate step.

## Checks before an article leaves draft

```bash
# No unresolved verification markers anywhere in the folder
grep -rn "\[VERIFY" content/04-pipeline/<slug>/

# Every claims-register term, checked by eye in context
grep -rniE "DHA resistance|15% FDA|FDA limit|ACH|CFM|PSI|erythrulose|acetone" \
  content/04-pipeline/<slug>/article.md
```

Then by eye:

- Every factual claim is sourced, or labelled as an assumption.
- Every model has an Assumptions block with ranges.
- `faq_items` are questions a reader asks, not restated headings, and each
  answer stands alone.
- `citations` labels name the source and its year, not the claim.
- Category string is spelled **exactly** — the editor silently creates a new
  category record for any string it hasn't seen.
- Standing notes present where required (compliance; financial model).
- At least one internal link to another article in the pillar, and one to a tool.
- `content_html` uses only the allowed tags — see
  [`../01-editorial-system/structure-patterns.md`](../01-editorial-system/structure-patterns.md#allowed-html).

## Status

| Slug | Pillar | Status |
|---|---|---|
| [`what-a-spray-tan-costs`](what-a-spray-tan-costs/) | 1 — Economics | **Drafted, in verification.** 8 open `[VERIFY]` items in its `research.md`. |

Keep this table current — it's the register.

## A note on scale

The repository owns the truth here, but the *published* article lives in
Supabase and is edited through the admin UI. There is no sync job. If someone
edits a live article in the admin editor, this folder goes stale.

Rule: **edits happen here first, then get applied in the editor.** If that
becomes unworkable at volume, the fix is an import script that posts
`article-data.json` + rendered `content_html` to the editor's action endpoint —
not abandoning the repository as the source of truth.
