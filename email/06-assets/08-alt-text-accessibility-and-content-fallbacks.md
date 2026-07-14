# Alt Text, Accessibility and Content Fallbacks

## Purpose

Define how email assets are described, hidden or supported so the message remains understandable when images are unavailable or assistive technology is used.

## Core rule

Alt text describes the function of the image in the message. It is not a filename, SEO field, visual inventory or place to repeat adjacent copy.

## Functional categories

### Informative image

Use concise alt text that communicates the information needed to understand the message.

Example:

`Tinted Tan Soufflé in Dark, the recommended shade in your result.`

### Functional linked image

Describe the action or destination when the image acts as a link.

Example:

`View the Malibu Beach Face Contour Kit.`

### Documentary proof

Describe what is shown without exaggerating the claim.

Example:

`Customer before-and-after images showing the documented result after the approved development period.`

### Celebrity or editorial image

Describe the approved context only. Do not add an unapproved endorsement or product-use claim.

### Decorative image

Use empty alt text when the image adds no information and adjacent HTML contains the full meaning.

## Alt-text principles

- keep it concise;
- lead with useful information;
- match the image’s role in this specific email;
- identify a product or variant when necessary;
- do not describe decorative detail that adds no meaning;
- do not repeat the headline word for word;
- do not include “image of” unless the distinction matters;
- do not embed offer terms only in alt text;
- avoid unsupported claims;
- preserve natural punctuation.

## Product imagery

Alt text may include:

- approved product name;
- variant or shade when relevant;
- routine role;
- action when linked.

Do not infer product contents, benefits or shade from appearance.

## Celebrity imagery

Alt text should follow approved naming and rights rules.

Where naming is permitted, identify the person and neutral context. Where it is not, use an approved contextual description.

Never use alt text to introduce an endorsement, quote or usage claim absent from the approved copy.

## Customer results and proof

Alt text should:

- distinguish before and after when relevant;
- state only documented context;
- avoid subjective exaggeration;
- avoid medical or universal claims;
- point to adjacent disclosure when required.

## Embedded text

When an image contains meaningful text:

- reproduce the meaning in HTML;
- include essential wording in alt text only when no better structure exists;
- avoid making long promotional artwork depend on a very long alt attribute;
- provide offer terms outside the image;
- create language-specific accessible equivalents.

## Image-blocked experience

Review the email with images disabled.

Confirm:

- the main proposition remains clear;
- product identity is available in HTML;
- CTA labels still make sense;
- offer terms remain visible;
- proof is not the only support for a claim;
- spacing does not produce confusing blank areas;
- background images do not contain essential information;
- fallback colours preserve contrast.

## Background images

Assume background images may fail in some clients.

Provide:

- a suitable background colour;
- HTML text independent of the image;
- VML or other approved Outlook fallback where the template requires it;
- acceptable layout when the background does not render.

## Dark mode

Review:

- logo visibility;
- transparent product edges;
- text embedded in imagery;
- colour inversion;
- fallback surfaces;
- contrast between image and surrounding HTML.

Use a dark-mode-specific asset only when normal resilient design cannot solve the problem.

## Motion accessibility

For animated assets:

- ensure the first frame communicates the essential message;
- avoid rapid flashing;
- keep motion non-essential;
- provide a static alternative where required;
- do not force the user to watch animation to understand an offer or instruction.

## Manifest fields

Every production asset should record:

- image function;
- approved alt text;
- empty-alt permission;
- adjacent text equivalent;
- embedded-text state;
- background-image state;
- motion state;
- dark-mode requirement;
- accessibility reviewer;
- review date.

## Release blockers

Do not release when:

- informative imagery has no text equivalent;
- decorative imagery is announced unnecessarily;
- alt text introduces unsupported claims;
- product or person identification is inaccurate;
- image-blocked rendering removes essential meaning;
- background failure destroys readability;
- animation flashes or hides essential information;
- embedded offer or service text has no HTML equivalent.