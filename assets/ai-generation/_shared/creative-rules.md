# Creative rules — AI-generated assets (DRAFT v0.1.0)

Cross-product guardrails. A product's own `never_show` list always takes precedence where
it is more specific.

## 🚩 CRITICAL — never violate

These are hard fails. A generation that breaks any of these must not be used.

- 🚩 **NO TAN LINES.** The finished tan is even and all-over — never show tan lines, bikini
  or strap marks, pale untanned patches or a two-tone body. (Full detail under *Tan depiction*.)
- 🚩 **NO device UI or on-screen text** — no camera/phone interface, record button, timer,
  timestamp, captions or watermark. (Full detail under *Clean output*.)
- 🚩 **Correct product mechanics** — right product, right side, right routine step; never
  depict a product doing something on its `never_show` list.

## Narrative arc (video)

- **Applicator and prep products end on the RESULT, never on the tool.** A mitt, brush or
  exfoliator is a means to an end (bronzed, streak-free, glowing skin). The final beat of a
  video is the skin/result or the person, not the applicator held up to camera.
- Respect routine order. Do not depict a later step before an earlier one (e.g. tan already
  developed while she is still "prepping").
- One product, one job per shot. Do not have a single product appear to perform two routine
  steps in the same continuous action unless the product genuinely spans them (declare via
  `routine_positions`), and even then show the correct side/side-change explicitly.

## Motion (video)

- Motion must be physically grounded: real weight, real skin contact, correct gravity.
  No floaty, robotic or morphing movement; no warping hands or faces.
- Application motions follow the product's `correct_motions` (e.g. mitt glow side = long
  sweeping strokes; buff side = circular on dry skin). Do not invent a motion.
- Prefer a mostly-static propped/handheld phone frame with subtle natural drift over
  aggressive camera moves — this reads as authentic UGC.

## Clean output — no device UI or on-screen text

- The output is always a CLEAN photograph. Never render phone/camera interface, recording
  UI, record buttons, timers, battery/status bars, date or **time stamps**, captions,
  subtitles, watermarks or any on-screen text — even when the intended aesthetic is
  "phone selfie" or "UGC".
- Describe the authentic look through lens, framing, skin texture and lighting — NOT by
  naming a camera app. Naming "iPhone camera", "front camera" or "video first frame" in a
  prompt tends to make the model draw the device UI and a timestamp; describe the *look*
  ("natural, slightly wide, handheld, realistic skin"), not the device.
- This applies to reference images too: a timestamp or UI baked into a character reference
  propagates into every frame derived from it. Keep references clean.

## Brand look

- Warm, editorial, quietly premium. Palette leans to the brand neutrals (ivory, linen,
  mineral stone, champagne, muted bronze); charcoal, not pure black.
- Believable, lightly-retouched skin. Avoid heavy glamour/beauty-retouch and avoid an
  obviously synthetic sheen.
- No invented text, logos, graphics, badges or price/claim overlays in-frame.

## Wardrobe & styling

Wardrobe is continuity AND believability — a real person protects their clothes from
mousse — and it keeps content platform-safe. Overall stance: **modest & premium**
(spa-luxury, editorial; never lingerie-styled or sexualised; TikTok/IG nudity policies
apply).

Application-step wardrobe **varies by setting**:
- Bathroom / bedroom → a towel wrapped and tucked just under the armpits (strapless).
- Coastal / outdoor → dark swimwear (black bikini or one-piece).
Both keep the arms and décolletage clear for even application and are stain-safe.

By routine step:
- **Prep (dry buff):** a robe slipped off the limb being buffed, or a towel. Most-covered
  step; skin is dry, no product yet.
- **Apply (mousse):** minimal, stain-safe, with straps moved clear so nothing catches
  product and no strap tan-lines form. Towel (indoor) or dark swimwear (coastal). Never a
  t-shirt or good clothes over an area being tanned.
- **Develop:** loose, DARK, breathable (black oversized tee + shorts, or a robe) so the
  developing tan doesn't rub off or transfer. Never tight or light-coloured.
- **Reveal (result):** styled to show the glow — white/cream/neutral or a going-out look;
  jewellery back on; hair down.

Cross-cutting:
- Colour: no white or pale fabric near wet product (it stains). Save cream/white for the reveal.
- Tan-lines: move straps and waistbands aside so the area being tanned is unobstructed and even.
- Hair up/clipped during prep + apply (don't let it drag through product); down for the reveal.
- Remove rings, watch and bracelets during application (they catch product and leave
  untanned gaps); back on for the reveal.
- Barefoot during application.
- Continuity: clothing stays clean — no stray mousse smudges on fabric; the reveal outfit
  is pristine.

## Tan depiction (the finished tan) — 🚩 CRITICAL

- 🚩 **CRITICAL — NO TAN LINES.** The finished self-tan is EVEN and all-over — a seamless,
  flawless glow. NEVER show tan lines, bikini or strap marks, pale untanned patches, or a
  two-tone body. Self-tan's whole
  promise is a streak-free, LINE-FREE, uniform colour, so any reveal or glow shot must show
  consistent tone across all visible skin (face, neck, chest, shoulders, arms, legs).
- This is why straps are moved aside during application (no application lines) AND why the
  reveal must never expose a tan line at a dress edge, neckline or hem.
- "Glowing" means visibly, richly bronzed and radiant — not a literal harsh line or an
  orange tone. Push depth while keeping it a believable, premium, even glow.

## Shot types

- **Hero (still):** product-forward, generous negative space for headline copy. Packaging,
  label text and colours reproduced exactly from `canonical_reference`.
- **UGC frame/video (9:16):** person-forward, authentic creator framing; the product is
  used correctly and incidentally, in service of the result.

## Consistency inputs

- Use a product's `canonical_reference` for the product's appearance — not an arbitrary
  packshot, and not a kit/arrangement image where the product is one of several (stacking
  multiple products into one generation causes scene-blend artefacts).
- Reuse the fixed character reference for UGC so the same person recurs across a campaign.
