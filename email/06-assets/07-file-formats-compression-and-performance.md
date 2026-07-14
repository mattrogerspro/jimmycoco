# File Formats, Compression and Performance

## Purpose

Define how email assets are exported and delivered with appropriate visual quality, client compatibility and file weight.

## Principles

1. Choose format by image function, not habit.
2. Preserve protected-asset fidelity before aggressive compression.
3. Avoid oversized source dimensions in production email.
4. Use explicit fallbacks when client support requires them.
5. Record export settings so quality changes can be reproduced.
6. Measure the complete email asset weight, not only individual files.

## Format guidance

### JPEG

Use for:

- photographic imagery;
- editorial scenes;
- celebrity and customer photography when transparency is not required;
- complex gradients where JPEG remains efficient.

Review compression closely around faces, product labels, skin gradients and fine typography.

### PNG

Use for:

- transparency where lossless edges matter;
- logos and marks when SVG cannot be used safely;
- small interface graphics;
- assets with limited colours and sharp geometry.

Avoid large photographic PNG files.

### WebP

Use where the approved delivery and email-client strategy supports it, with an appropriate fallback when required.

WebP may be useful for:

- photographic assets;
- transparent product cut-outs;
- compressed responsive derivatives.

Do not assume universal client behaviour without current testing.

### GIF

Use only when animation is justified and an effective first-frame fallback exists.

Avoid animation that:

- creates distraction;
- flashes rapidly;
- hides essential information after the first frame;
- dramatically increases message weight;
- fails in Outlook without a useful static first frame.

### SVG

Use cautiously and only where the template and client-support policy permits. Maintain a raster fallback for critical marks when required.

## Colour management

Exports should use a web-safe colour profile appropriate to the production workflow.

For product and skin imagery:

- preserve approved colour appearance;
- avoid unreviewed profile stripping;
- compare source and export;
- test warm ivory, champagne, skin and product shade tones;
- reject shifts that change product or result meaning.

## Compression review

Evaluate at actual rendered size and high magnification.

Reject when compression creates:

- banding in skin or gradients;
- halos around products;
- broken label text;
- colour blocks;
- facial artefacts;
- muddy shadows;
- noisy transparent edges;
- visible degradation in proof imagery.

## File-weight targets

Targets should be defined by module and campaign, not treated as universal legal limits.

Track:

- each image weight;
- total initial email image weight;
- number of remote requests;
- mobile asset weight;
- animation weight;
- impact of high-density exports;
- fallback duplication.

Use the smallest file that preserves the approved visual standard.

## Dimensions

Do not upload a very large master and rely on the email client to scale it.

Production exports must match:

- target rendered width;
- required density;
- intended crop;
- module aspect ratio.

Include explicit HTML width and height where the template system supports them to reduce layout shift.

## Transparency

Review transparent assets on:

- warm ivory;
- white;
- dark-mode surfaces;
- Outlook fallback backgrounds;
- mobile stacking surfaces.

Check for white fringes, dark halos and clipped shadows.

## Image hosting

Production hosting should provide:

- HTTPS;
- stable URLs;
- correct MIME type;
- cache strategy;
- versioned replacement paths;
- reliable geographic delivery;
- access without authentication;
- monitoring for broken or missing assets.

Do not use temporary preview URLs in production.

## Preload and client behaviour

Email clients control loading differently. The message must remain understandable when images:

- load slowly;
- are blocked;
- are proxied;
- are cached from an earlier version;
- fail completely.

Performance optimisation must work with accessible HTML copy and meaningful fallback behaviour.

## Quality tiers

Recommended internal labels:

- `MASTER` — highest-quality approved source or layered file;
- `PRODUCTION_2X` — high-density email export;
- `PRODUCTION_1X` — standard-density email export;
- `FALLBACK` — compatible alternative;
- `THUMBNAIL` — internal preview only, never production.

## Release blockers

Do not release when:

- format support has not been validated;
- production URL is temporary;
- colour shift changes product or proof meaning;
- compression damages faces, labels or result evidence;
- file weight is unreasonable for the message role;
- transparency fails on expected backgrounds;
- missing dimensions destabilise the layout;
- an animation lacks a useful first frame.