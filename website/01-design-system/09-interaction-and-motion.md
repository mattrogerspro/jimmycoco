# Interaction and Motion System

## Purpose

Define how the website responds to input and uses motion to communicate hierarchy, state and continuity without becoming theatrical or distracting.

## Motion philosophy

Motion should feel calm, precise and editorial.

It may:

- Confirm an action
- Reveal hierarchy
- Preserve spatial continuity
- Explain a state change
- Direct attention to the next step

It must not exist merely to make the website feel animated.

## Timing principles

Recommended ranges:

- Immediate feedback: 100–160ms
- Hover and focus transitions: 140–220ms
- Panels, drawers and accordions: 220–320ms
- Editorial image or chapter reveals: 350–600ms

Avoid long sequences that delay reading or purchasing.

## Easing

Use restrained ease-out curves for elements entering or responding. Avoid elastic, springy or exaggerated motion in core commerce flows.

## Navigation

- Header state changes should be subtle.
- Mega menus should open quickly and remain stable.
- Mobile navigation should use a controlled drawer or full-height panel.
- Do not animate every navigation item independently.

## Buttons and links

- Hover and focus states must remain clearly visible.
- Primary buttons may change tone, border or subtle depth.
- Avoid scale effects that cause layout movement.
- Loading buttons must preserve width and label context.
- Disabled states must not rely on opacity alone.

## Product cards

Permitted behaviours:

- Subtle image transition to a secondary approved view
- Clear focus treatment
- Quiet underline or directional cue on text links

Avoid:

- Rapid image cycling
- Automatic video playback
- Floating cards
- Excessive elevation
- Hidden essential product information revealed only on hover

## Product gallery

- Thumbnail selection should update immediately.
- Zoom should be deliberate and reversible.
- Swipe gestures must not interfere with page scrolling.
- Product media should not auto-advance while the customer is reading.
- Preserve image position when selecting a variant where possible.

## Accordions

Use accordions for secondary product detail on smaller screens, not to conceal core suitability or purchase information.

- Animate height cleanly.
- Maintain focus position.
- Use explicit expanded and collapsed states.
- Do not collapse content unexpectedly after interaction.

## Shade matcher

- Advance only after a clear selection or explicit Continue action.
- Show progress changes smoothly.
- Preserve the directional relationship between previous and next questions.
- Result changes should feel connected to edited answers.
- Never use gamified confetti or novelty quiz effects.

## Cart and mini-cart

- Confirm Add to Bag immediately.
- Use a stable mini-cart or confirmation state.
- Do not block the entire interface unnecessarily.
- Quantity updates must show processing and completion.
- Error states must be explicit and recoverable.

## Scroll behaviour

- Avoid aggressive scroll hijacking.
- Do not force snap scrolling across long editorial chapters.
- Sticky elements must release predictably.
- Anchor links should preserve orientation.

## Reduced motion

Respect `prefers-reduced-motion`.

When reduced motion is requested:

- Remove parallax
- Remove decorative reveals
- Replace large transitions with direct state changes
- Preserve all functional feedback
- Avoid moving backgrounds and auto-playing video

## Accessibility

- Every hover state must have an equivalent focus state.
- Motion must not be required to understand content.
- Avoid flashing or rapid contrast changes.
- Focus must not be lost when drawers, modals or accordions close.
- Announce important dynamic commerce updates to assistive technology.

## AI concept guidance

Static AI-generated website concepts should imply interaction through clear states, controls and hierarchy. They should not invent floating cursors, motion trails or decorative animation graphics.

## Success criteria

The interaction system succeeds when the website feels responsive and premium, customers always understand what changed, and motion never slows down product comprehension or purchase.