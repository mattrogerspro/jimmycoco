# Protected Asset Protocol

## Purpose

Define how original product, celebrity, customer-result, founder and brand assets are handled when AI is involved in email production.

## Protected asset classes

### Class A — Identity-critical people

Includes celebrity, founder, employee, creator and customer photography.

Permitted:

- lossless placement;
- proportionate scaling;
- approved crop;
- layout masking that does not alter the source pixels;
- export conversion that does not materially change appearance.

Prohibited:

- face or body regeneration;
- skin-tone adjustment;
- retouching;
- expression change;
- hair, clothing or jewellery alteration;
- synthetic extension of missing body areas;
- compositing that implies an unapproved endorsement or setting.

### Class B — Product truth

Includes packs, bottles, brushes, caps, labels, boxes, swatches and variant photography.

Permitted:

- proportional scaling;
- approved crop;
- non-destructive background removal where source accuracy is retained;
- compositing into an approved generated environment;
- subtle source-matched shadow added outside the product pixels.

Prohibited:

- regenerated packaging;
- changed colour or shade;
- altered label copy, logo or typography;
- changed proportions;
- invented product bundles;
- generated liquid, swatch or texture presented as exact product evidence.

### Class C — Documentary proof

Includes before-and-after results, application demonstrations and professional-use evidence.

These assets must remain documentary. AI may not alter the represented result.

### Class D — Brand marks

Logos, wordmarks, seals and approved graphic marks must use original source files. Never ask an image model to reproduce them.

## Pixel-faithful compositing

Where protected imagery is combined with generated content:

1. generate the environment independently;
2. preserve the protected source as a separate layer;
3. place without warping or generative fill;
4. use a deterministic mask;
5. compare the final composite with the original source;
6. retain the layered master and source checksum.

## Crop rules

Crops must:

- preserve the person’s recognisability and dignity;
- retain product identity;
- avoid misleading scale;
- avoid removing context required for a claim;
- use documented focal points for desktop and mobile;
- never stretch or distort.

## Colour management

Do not apply a global grade across protected product or proof imagery when it changes product colour, skin tone or result interpretation. Apply environmental grading separately wherever possible.

## Verification record

Record:

- source path and SHA;
- output path;
- crop coordinates;
- scale percentage;
- mask or background-removal method;
- colour operations;
- reviewer;
- comparison status;
- usage approval.

## Automatic rejection

Reject any output containing:

- changed facial features;
- smoothed or modified skin;
- altered body shape;
- changed product colour or packaging;
- garbled logos or labels;
- invented before-and-after evidence;
- duplicated people or products;
- synthetic celebrity endorsement;
- missing traceability.