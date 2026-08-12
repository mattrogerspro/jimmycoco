# Accessibility Standards

## Purpose

Accessibility is part of the luxury standard. The Sunless website must feel elegant, calm and precise while remaining usable by people with different visual, motor, cognitive and assistive-technology needs.

Accessibility must be designed into the system, not added after visual approval.

## Governing principle

No aesthetic choice may make the website difficult to perceive, understand or operate.

The target is conformance with WCAG 2.2 Level AA as the minimum implementation standard, with selected AAA practices where they improve readability and do not compromise the experience.

## Semantic structure

Every page must use a logical document hierarchy.

Requirements:

- One primary `h1` per page
- Heading levels must not be skipped for visual reasons
- Navigation, main content, complimentary content and footer must use appropriate landmarks
- Lists, tables, forms and buttons must use native semantic elements wherever possible
- Clickable elements must not be built from non-interactive containers
- Visual order and DOM order must remain aligned

## Keyboard access

Every interactive element must be operable with a keyboard.

Requirements:

- Logical tab order
- Visible focus state
- No keyboard traps
- Escape closes overlays and menus where expected
- Enter and Space activate controls according to native behaviour
- Carousels, accordions and selectors must expose clear keyboard interactions
- Skip-to-content link must be available

Focus indicators must be clearly visible against light and dark surfaces. Do not remove focus outlines without replacing them with an equally strong treatment.

## Colour contrast

Minimum contrast targets:

- Normal text: 4.5:1
- Large text: 3:1
- Essential interface graphics and control boundaries: 3:1
- Focus indicators: 3:1 against adjacent colours

Warm ivory, champagne and taupe backgrounds require particular care. Light beige text on cream is not acceptable, even when it appears visually refined.

Deep charcoal should be the default text colour on pale surfaces. Pure black may be used selectively for buttons and high-priority interface objects.

## Text over photography

Critical copy must never depend on an unpredictable image area.

Use one of the following:

- Dedicated negative space in the composition
- A controlled solid or translucent tonal field
- A subtle photographic shadow or gradient designed for legibility
- Separate text placement outside the image

Never place body copy over detailed skin, hair, patterned fabric or mixed highlights.

## Typography and readability

Requirements:

- Body copy should generally render at 16px or above
- Supporting text should not drop below 14px without a strong reason
- Line height should normally sit between 1.45 and 1.7 for body copy
- Long-form line length should usually remain between 45 and 75 characters
- Avoid long passages in all caps
- Avoid excessive letter spacing in paragraphs
- Serif display type must not be used at sizes where its fine details become fragile
- Text must support browser zoom to 200% without loss of content or function

## Motion and animation

Motion should clarify state and hierarchy, not create spectacle.

Requirements:

- Honour `prefers-reduced-motion`
- Avoid parallax that changes reading position unpredictably
- Avoid flashing content
- Do not autoplay video with sound
- Provide pause controls for moving or rotating content lasting more than five seconds
- Use transitions short enough to feel responsive
- Avoid motion that is essential to understanding a process

## Images and alternative text

Alternative text should communicate the purpose of the image in context.

Examples:

- Product image: product name, format and relevant shade or finish
- Results image: the visible result and the product/application context
- Jimmy applying tan: describe his professional action only when it contributes meaning
- Decorative texture: empty alt attribute

Do not use alt text to repeat adjacent captions or fill it with search keywords.

## Product imagery

Product information must not exist only inside an image.

All essential details must also appear as live text:

- Product name
- Shade or depth
- Format
- Price
- Suitability
- Application guidance
- CTA label

## Forms

Requirements:

- Every input has a persistent programmatic label
- Placeholder text is supplementary, not the only label
- Required fields are clearly identified
- Error messages explain what happened and how to fix it
- Errors are associated with the relevant field
- Error summaries receive focus where appropriate
- Instructions appear before the relevant control
- Success states are announced to assistive technology
- Inputs use appropriate autocomplete attributes

## Shade recommendation engine

The recommendation flow must be fully accessible.

Requirements:

- One clear question at a time on smaller screens
- Progress communicated visually and programmatically
- Answer choices implemented as native radios, checkboxes or buttons with correct states
- Selected states must not rely on colour alone
- Back navigation must preserve previous answers
- Recommendation result must be announced after completion
- Product recommendation remains understandable without imagery
- Time estimates must be factual

## Carousels and horizontally scrolling content

Avoid carousels unless they genuinely improve comprehension.

When used:

- Provide visible previous and next controls
- Indicate position and total items
- Do not autoplay by default
- Ensure all slides are reachable by keyboard
- Prevent hidden slides from receiving focus
- Offer a static alternative where practical

## Comparison content

Comparison tables must use semantic table markup where tabular relationships exist.

On mobile, restructuring is allowed, but the relationship between criterion and compared values must remain explicit.

Do not communicate advantage through colour, ticks or crosses alone. Pair icons with text.

## Reviews and social proof

Review information must remain readable and attributable.

Requirements:

- Star ratings include a text equivalent
- Quotes are not embedded only within imagery
- Verification labels have accessible text
- Review filters and concern categories expose their selected state

## Buttons and links

Button labels must describe the action.

Prefer:

- Match My Shade
- View My Recommendation
- Shop Best Sellers
- Build My Routine

Avoid vague labels such as:

- Click Here
- Submit
- Learn More, when a more specific label is possible

Links should remain visually recognisable without relying on colour alone where context is ambiguous.

## Touch and pointer accessibility

Requirements:

- Minimum 44px target size for essential controls
- Adequate separation between neighbouring actions
- No precision dragging required for core tasks
- No hover-only information
- Pointer gestures must have a simple alternative

## Cognitive accessibility

The website should reduce decision fatigue and uncertainty.

Requirements:

- Use concise instructions
- Keep terminology consistent
- Explain tanning-specific language when first introduced
- Present one primary decision at a time
- Avoid urgency patterns that create unnecessary pressure
- Do not use fake scarcity or countdown timers
- Keep navigation labels predictable
- Make prices, delivery and returns easy to find

## Status and error communication

Dynamic status messages must be exposed to assistive technologies when appropriate.

Examples:

- Product added to basket
- Shade recommendation completed
- Form submitted
- Filter applied
- Validation error

Status must never be communicated by colour or animation alone.

## Accessibility QA checklist

Before approval, test:

- Keyboard-only navigation
- Visible focus at every step
- Screen-reader landmark and heading structure
- Form labels and errors
- 200% zoom
- 400% reflow for core content
- Reduced motion
- Colour contrast
- Mobile touch targets
- Image alternative text
- Recommendation-engine completion without a mouse
- Product purchase flow without relying on images

## Success criteria

The website succeeds when a customer can understand the offer, complete the shade journey, evaluate products and make a purchase regardless of whether they use a mouse, keyboard, touch screen, zoom, reduced motion or a screen reader.
