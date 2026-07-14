# Email Asset QA Checklist

## Purpose

Provide the final release checklist for every asset used in a Sunless email.

## Identity and source

- [ ] Canonical asset ID exists
- [ ] Source asset is identified
- [ ] Filename matches the naming standard
- [ ] Manifest version matches the file and hosted URL
- [ ] Product, variant, person or campaign mapping is correct
- [ ] No temporary, preview or local-only file is referenced

## Approval and rights

- [ ] Status is `APPROVED` or valid `APPROVED_WITH_LIMITS`
- [ ] Rights and consent records are traceable
- [ ] Channel, market and purpose are permitted
- [ ] Usage dates are valid at send time
- [ ] Required credit is present
- [ ] Crop and transformation are permitted
- [ ] Accompanying copy does not imply unsupported endorsement or usage

## Product accuracy

- [ ] Packaging version is current
- [ ] Product and variant are correct
- [ ] Product colour and shade remain accurate
- [ ] Label typography and logo are unchanged
- [ ] Product geometry and proportions are unchanged
- [ ] Routine groupings represent real products and compatibility
- [ ] Bundle imagery does not misrepresent included items
- [ ] CTA destination matches the pictured product and variant

## Celebrity, customer and proof integrity

- [ ] Original approved source is used
- [ ] Face, body, hair, skin tone and identifying features are unchanged
- [ ] Aspect ratio is not distorted
- [ ] No generative retouching or synthetic reconstruction has occurred
- [ ] Customer-result evidence remains documentary
- [ ] Testimonial wording and attribution are approved
- [ ] Proof conditions and disclosures are accurate
- [ ] Permission has not expired or been withdrawn

## Composition and responsive crops

- [ ] Asset is compatible with the target module
- [ ] Desktop crop is approved
- [ ] Mobile crop is approved
- [ ] High-density export is appropriate
- [ ] Focal subject remains clear
- [ ] Product identity is not clipped
- [ ] Copy-safe area is sufficient
- [ ] Protected bounding boxes are respected
- [ ] No automatic crop creates an awkward or misleading result

## Technical export

- [ ] Pixel dimensions match the specification
- [ ] Aspect ratio is correct
- [ ] File format is supported by the delivery strategy
- [ ] Fallback format exists where required
- [ ] Colour profile is appropriate
- [ ] Transparency works on expected backgrounds
- [ ] Compression does not damage faces, skin, labels or proof
- [ ] File weight is appropriate
- [ ] Width and height metadata are available
- [ ] Hosted URL uses HTTPS and is stable
- [ ] MIME type and caching behaviour are correct

## Accessibility

- [ ] Image function is classified
- [ ] Approved alt text is present when informative
- [ ] Decorative images use empty alt where appropriate
- [ ] Product or person naming follows approved rules
- [ ] Alt text does not add unsupported claims
- [ ] Embedded text has an HTML equivalent
- [ ] Email remains understandable with images blocked
- [ ] Background-image failure preserves readability
- [ ] Animation has a useful first frame and safe motion
- [ ] Dark-mode behaviour is reviewed

## Lifecycle and campaign context

- [ ] Lifecycle state is compatible with the image
- [ ] Campaign and offer dates are current
- [ ] Dynamic selection uses an approved asset ID
- [ ] Fallback hierarchy is valid
- [ ] No visually similar but incorrect product is used
- [ ] Reuse does not create a new unsupported claim
- [ ] Asset has not been superseded or deprecated

## AI-assisted production

- [ ] Protected assets were not passed through generative alteration
- [ ] Generated elements are limited to approved decorative or environmental content
- [ ] Prompt and model versions are recorded
- [ ] Transformation record is complete
- [ ] Source and output were compared at high magnification
- [ ] AI did not invent products, people, results, text or endorsements
- [ ] Human approval is explicit

## Template and client rendering

- [ ] Asset is tested in the final approved template
- [ ] Real copy and representative data are used
- [ ] Gmail rendering is reviewed
- [ ] Apple Mail rendering is reviewed
- [ ] Outlook rendering is reviewed
- [ ] Mobile stacking is reviewed
- [ ] Images-blocked state is reviewed
- [ ] Dark mode is reviewed where relevant
- [ ] Links and image maps behave correctly

## Archive and replacement

- [ ] Replacement relationships are recorded
- [ ] Old versions are removed from active selectors
- [ ] Historical records are preserved
- [ ] Scheduled sends were checked
- [ ] Cache or hosted-URL action is documented
- [ ] Rejected files are separated from production assets

## Release status

Use one status:

- `APPROVED`
- `APPROVED WITH RECORDED LIMITS`
- `CHANGES REQUIRED`
- `BLOCKED`

## Immediate blockers

Block release when:

- rights are unclear or expired;
- a protected person or proof asset has been altered;
- product or variant identity is wrong;
- mobile crop is missing or misleading;
- the asset is deprecated;
- alt-text and image-blocked behaviour remove essential meaning;
- a temporary or unstable URL is used;
- the final template has not been tested;
- source, transformation or approval cannot be traced.

An asset is production-ready only when its creative quality, factual accuracy, rights, accessibility, technical delivery and lifecycle context all agree.