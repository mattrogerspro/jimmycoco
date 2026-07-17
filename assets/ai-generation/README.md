# Sunless by Jimmy Coco — AI Generation Knowledge Base

**Status: DRAFT (v0.1.0) — proposal for review. Nothing here is wired into any generator yet.**

## Why this exists

AI image/video generators produce *plausible* output, not *correct* output. Left to a
bare prompt, a model will happily show a product being used the wrong way, in the wrong
step of the routine, or as the hero of a shot where it should be incidental. This section
gives every generation a single authoritative source of product truth and creative rules
to read **before** it builds a prompt — the same principle the email system already runs on
(the repository owns the truth; nothing ships without validation).

The trigger for this: a UGC mitt video was generated showing the wrong action and ending
on the mitt itself, when the mitt is an **applicator** and the shot should end on the
result. That is a knowledge gap, not a prompt-tuning gap. This fixes the gap at the source.

## Layers

| Layer | File(s) | What it holds |
|-------|---------|---------------|
| Product truth | `products/*.json` | Per-product facts: role, routine position(s), correct motion, `never_show` list, canonical reference image. Every claim is tagged with its source. |
| Routine model | `_shared/routine-model.json` | The one canonical tanning routine (prep → apply → develop → glow). A brief must declare which step it depicts; a product may not act outside its declared positions. |
| Creative rules | `_shared/creative-rules.md` | Narrative-arc, motion and brand-look guardrails that apply across all products (e.g. "applicator/prep products end on the result, never on the tool"). |
| Schema | `schema/product-truth.schema.json` | Structure + required fields for a product-truth file, so files are machine-checkable. |

## How a generator should consume it (intended flow)

1. Resolve the product → load its `products/<id>.json`.
2. Read `role`, `routine_positions`, `hero_action`, `correct_motions`, `never_show`.
3. Read `_shared/creative-rules.md` for the shot type (hero vs UGC vs video).
4. Use `canonical_reference` for the LoadImage input — **not** an arbitrary packshot.
5. Build the prompt from the above. Validate the brief against `never_show` and the
   routine model **before** spending credits. Fail loudly rather than generate something
   incorrect.

## Provenance discipline

Per repo rules, we never invent claims. Each claim in a product file carries a `source`:
- `website` — customer-facing copy supplied from jimmycoco.co.uk
- `pack` — printed copy on the retail packaging (in `assets/images/product-images/`)
Where sources disagree, the disagreement is recorded in `open_questions` for a human to
settle — it is **not** silently merged.

## Known asset gaps

- **Bare Buff & Glow Mitt shot** — the repo has the retail *pouch* (front/back) and the mitt
  inside a kit arrangement, but no clean isolated shot of the bare navy mitt. UGC/hero shots
  that show the mitt in-hand need this; flagged in the mitt file.

## Not yet done (future scope)

- Product-truth files for the rest of the range (soufflé, sprays, brushes, contour kit).
- A real validation script (mirrors `npm run` checks before an email publishes).
- Wiring the saved Comfy workflows to read `canonical_reference` automatically.
