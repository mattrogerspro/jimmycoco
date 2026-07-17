---
name: generate-jimmy-coco-video
description: Generate on-brand Sunless by Jimmy Coco AI video content and the still keyframes that feed it (UGC clips, educational demos, reveal shots) via the ComfyUI MCP, strictly following the repository's AI-generation knowledge base. Use whenever anyone asks to create, build, plan, regenerate, fix or extend AI video, UGC clips, reels, TikTok/Instagram content, video keyframes or character-based product imagery.
---

# Generate Jimmy Coco Video

Treat the repository as canonical. The knowledge base at `assets/ai-generation/` owns product
truth and creative rules; this skill owns the process. Video models do NOT reliably obey
written rules — the process below exists because prompts alone provably fail. Do not skip
gates to save time; every skipped gate here has already cost real money in failed generations.

## 1. Mandatory preflight — read, never recall

Before writing ANY prompt, READ these files completely in the current session (do not rely
on memory of them, do not claim to have read files that were not opened):

- `assets/ai-generation/_shared/creative-rules.md` — starts with the 🚩 CRITICAL flags.
- `assets/ai-generation/_shared/routine-model.json` — routine steps + per-step wardrobe.
- `assets/ai-generation/products/<product>.json` — for EVERY product appearing in the asset.

From the product file, extract into the working brief: `hero_action`, `correct_motions`,
`never_show` (verbatim), `sides` (which side does what), and `canonical_reference` (which
repo image to use for which side/purpose). If the product file does not exist, STOP and
build it first with the user — never generate from guessed product facts.

## 2. Non-negotiables (from the knowledge base, restated because they are load-bearing)

- 🚩 NO TAN LINES anywhere on a finished tan. Even, all-over glow.
- 🚩 NO device UI, record buttons, timers, timestamps, captions or on-screen text. Never
  write "iPhone camera", "front camera" or "video first frame" in a prompt — describe the
  look, not the device.
- 🚩 Correct product mechanics per the product-truth file (right product, right side,
  right routine step; e.g. mitt: buff dry FIRST, then apply MOUSSE with the velvet side,
  product faces the skin, ONE mitt on ONE hand, end on the result never the tool).
- Wardrobe per routine step (towel indoors / dark swimwear coastal for apply; reveal is
  the only glamorous step). No mousse near light fabric.
- One LOCKED character reference per campaign, reused everywhere. Never regenerate the
  character casually — every derived asset inherits the face.

## 3. The video complexity envelope — hard limits of current models

Video generation is reliable ONLY inside this envelope. Outside it, failure is the norm
regardless of prompt quality:

- **One clip = one shot = one action.** Single continuous take, one subject action.
- **Product is held or shown, not manipulated.** Pumping, side-switching, two-handed
  handling, dispensing-then-rubbing sequences DO NOT survive generation (models invent
  extra mitts, wrong sides, garbled actions). Complex product mechanics belong in STILLS.
- **Label text does not survive motion.** Keep product labels to approved stills or large
  static in-frame presence; never rely on legible moving type.
- **Storyboard mode: ENABLE it explicitly and match the counts.** For multi-beat videos on
  Kling 3.0 Omni, storyboard mode must be ON and the number of storyboards MUST equal the
  number of reference keyframes, in order — frame 1 → storyboard 1, frame 2 → storyboard 2,
  and so on — with one prompt per segment. A count mismatch (or storyboards silently off)
  makes the model pool the references across segments, which produces wrong-step actions.
  VERIFY storyboards are actually enabled before spending: `save_workflow` conversion drops
  the storyboard settings (they show OFF in the canvas), so always submit fresh API-format
  JSON with the storyboard fields set — never re-run a saved storyboard file.
- **Per-clip fallback.** When one beat keeps failing QA, generate that beat as its own
  single-keyframe clip and re-roll it surgically; the human stitches clips in an editor.
- **Duration:** 4–10s per clip / ~4s per storyboard segment. Longer = more drift.

Model routing:
- Stills/keyframes: Nano Banana Pro (`GeminiImage2Node`, `gemini-3-pro-image-preview`).
- Talking-to-camera clips: Kling 2.6 `KlingImageToVideoWithAudio` — first-frame-locked,
  native lip-synced speech, ≤10s. This is the proven UGC format.
- Motion/action clips from a keyframe: Kling 3.0 Omni (`KlingOmniProImageToVideoNode`)
  with EXACTLY ONE reference image. Lip-sync on 3.0 is stochastic — if a clip's mouth
  misses, repair that clip alone with `KlingLipSyncTextToVideoNode`; do not re-roll blind.
- `save_workflow` conversion silently DROPS storyboard/dynamic-combo settings — always run
  video jobs from a fresh API-format submit, never by re-running a saved storyboard file.

## 4. Approval gates — nothing advances unapproved

1. **Brief** — settings, beats, wardrobe, product actions per the routine model.
2. **Character** — the locked reference, or explicit user approval of a new one.
3. **Keyframes** — every video clip is anchored to a still the user has APPROVED. No clip
   is generated from an unapproved frame. Frames are cheap; clips are expensive.
4. **Credits** — every paid generation batch needs the user's go-ahead; report the running
   spend tally each turn (balance itself is only visible in the Comfy dashboard).

## 5. Verification — the agent is blind; behave accordingly

The sandbox cannot open Comfy's file host: generated VIDEOS CANNOT BE VIEWED by the agent.
Therefore:

- Never describe a video's content as fact; deliver it as UNVERIFIED with a per-clip QA
  checklist built from the product's `never_show` list plus the critical flags (tan lines,
  UI/text, extra mitts/hands, wrong side, wrong action, label garbling, static-when-dynamic).
- The user is the QA gate. One beat at a time for anything new: generate clip 1, get it
  checked, only then spend on clip 2.
- When the user reports a violation: FIRST write the correction into the knowledge base
  (product file or creative rules — every failure becomes a permanent rule), THEN
  regenerate only the failed asset. Never regenerate first and codify later.

## 6. Logistics

- Uploads to Comfy input storage require the user to run the emitted `upload_file` curl
  (sandbox egress is blocked); batch multiple uploads into one paste-able block.
- Outputs are delivered as `cloud.comfy.org/api/s/...` links verbatim; downloads into the
  repo are user-run commands targeting `assets/` paths.
- There is no video stitching in the pipeline: deliver per-beat clips named in sequence
  for assembly in CapCut/iMovie, and say so up front.
- Save reusable graphs to the Comfy workspace with clear names; keyframe images and final
  approved assets belong under `assets/` in the repo (user-run download), never only in chat.

## 7. Report truthfully

End every generation turn with: what was generated (labelled UNVERIFIED for video), links,
the QA checklist, credits spent this turn and the running tally, which knowledge-base files
were actually read, and any rule added this turn. Do not call a video task complete until
the user has confirmed the clips pass QA.
