# Responsive Crops and Export Specifications

## Purpose

Define how approved source imagery is adapted for desktop, mobile and high-density email rendering without losing product identity, proof integrity or visual hierarchy.

## Core rule

Responsive assets must be deliberately art-directed. A mobile crop is not an automatic centre crop of the desktop image.

## Required export set

Depending on module and template, maintain:

- desktop standard-density export;
- desktop high-density export;
- mobile standard-density export;
- mobile high-density export;
- fallback format where required;
- dark-mode alternative only when genuinely necessary;
- transparent version where module design requires it.

## Module dimensions

Exact dimensions must come from the approved template system. The asset manifest must identify the target module rather than assuming a universal email width.

Common roles include:

- full-width hero;
- split hero;
- product card;
- routine row;
- proof image;
- editorial panel;
- banner;
- icon;
- footer mark.

## Crop priorities

Use this priority order:

1. preserve protected people and documentary evidence;
2. preserve product identity and packaging;
3. preserve the main visual proposition;
4. protect copy-safe space;
5. maintain intentional composition;
6. minimise non-essential background.

## Focal-point metadata

Record focal position for each source or derivative:

- horizontal focal percentage;
- vertical focal percentage;
- protected bounding box;
- minimum safe crop;
- copy-safe region;
- mobile-specific focal point.

Do not infer focal position at send time.

## Protected imagery

For celebrity, customer-result and proof assets:

- do not stretch;
- do not use content-aware generative expansion;
- do not remove or reconstruct body parts;
- do not create a different facial crop without approval;
- preserve aspect ratio;
- use contain or approved letterboxing when a crop would damage identity or evidence.

## Product imagery

For product assets:

- retain enough packaging to identify the item;
- do not crop labels into misleading fragments;
- preserve relative scale in product groups;
- prevent edges, pumps, caps or applicators from being clipped unintentionally;
- ensure the mobile crop still matches the CTA product and variant.

## Copy-safe space

The image brief should specify:

- intended text side;
- minimum clear area;
- maximum text width;
- no-go subject regions;
- desktop and mobile differences;
- whether text overlays are permitted.

When the image cannot provide reliable copy-safe space, place copy in HTML outside the image.

## Density

High-density exports should generally use two times the rendered pixel dimensions when practical, while HTML width and height preserve the intended layout size.

Avoid unnecessarily oversized files when the visual improvement is negligible.

## Aspect ratio changes

A new aspect ratio is a separate derivative and requires:

- explicit filename;
- manifest record;
- transformation record;
- crop review;
- accessibility review;
- approval.

## Small-screen review

Test at representative narrow widths and confirm:

- focal subject remains clear;
- faces and products are not awkwardly cropped;
- text does not cover critical detail;
- embedded text remains readable or is removed;
- image order supports the reading sequence;
- file weight remains appropriate for mobile connections.

## Client resilience

Consider:

- clients that scale images unexpectedly;
- maximum-width constraints;
- blocked images;
- Outlook rendering;
- dark-mode background changes;
- retina displays;
- forwarded email layouts.

No essential information may depend on a perfect crop.

## Export record

Record:

- source asset ID;
- derivative asset ID;
- target module;
- rendered dimensions;
- export dimensions;
- aspect ratio;
- crop coordinates;
- focal point;
- format;
- file size;
- compression settings;
- approver;
- approval date.

## Release blockers

Do not release when:

- the mobile crop is unreviewed;
- protected identity or proof has changed;
- product packaging is clipped or distorted;
- aspect ratio is wrong for the module;
- copy overlaps critical detail;
- image dimensions cause layout instability;
- the derivative cannot be traced to its source.