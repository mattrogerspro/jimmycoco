# 08 — Mobile Shade-Match Experience

## Objective

The mobile experience must feel intentionally designed for one-handed completion, not compressed from desktop.

## Mobile questionnaire structure

Use a full-screen route with:

- compact Sunless header;
- visible close or exit action;
- concise progress indicator;
- one question per screen;
- vertically stacked answer cards;
- sticky Back and Continue controls above the safe area;
- no horizontal scrolling;
- no hidden required content beneath fixed controls.

## Answer-card behaviour

- Full-width tap targets.
- Minimum 44px interactive height.
- Text labels remain primary; images support rather than replace them.
- Selected state uses border, fill and icon—not colour alone.
- Longer lists should scroll naturally while the question remains understandable.

## Image guidance

Use fewer and more purposeful images than desktop. Skin-depth and desired-result references must remain large enough to compare accurately. Do not create tiny image mosaics.

## Keyboard and viewport behaviour

The questionnaire should not require text entry. Optional email capture occurs only after results and must handle the mobile keyboard without covering the submit action or error message.

## Mobile results sequence

1. Your best match
2. Product, selected variant and result statement
3. Price and review summary
4. Sticky or immediately visible Add to Bag
5. Why it matches
6. Expected result and application guidance
7. Matching real results
8. One alternative
9. Routine recommendations
10. Review answers and save result

Do not place a large editorial image above the recommendation and force purchase controls below the fold.

## Sticky purchase action

After the main product block scrolls away, a compact sticky bar may show:

- product shorthand;
- selected variant;
- price;
- Add to Bag.

It must not conceal content or compete with browser and accessibility controls.

## Returning and resume behaviour

Persist progress locally or in the active session. Returning customers should see:

> Continue your shade match

with the current step and an option to restart.

## Performance

- Preload only the next essential question assets.
- Use responsive image formats and dimensions.
- Avoid video backgrounds.
- Do not block first interaction on nonessential analytics.
- Keep transitions short and GPU-light.

## Accessibility

Support screen readers, switch control, dynamic text enlargement, high contrast and reduced motion. Keep focus order aligned with visual order.

## Success criteria

The mobile consultation can be completed comfortably with one hand, the result appears quickly and the correct variant can be added without reopening selectors.