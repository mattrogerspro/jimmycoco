# Email Canvas and Grid

## Standard canvas

Design the primary desktop email at a maximum content width of 600–640px. The email must collapse cleanly to a single mobile column without relying on unsupported CSS.

## Structural model

Use a simple nested-table architecture in production:

- full-width body background
- centred content container
- modular rows
- one or two columns only
- consistent inner padding

## Recommended widths

- Outer email width: 600–640px
- Text column: 440–520px
- Two-column module: approximately 50/50 or 60/40
- Mobile breakpoint target: 480px and below

## Horizontal padding

- Desktop: 32–48px
- Mobile: 20–24px
- Dense utility modules: never below 16px

## Vertical rhythm

Use a restrained spacing scale:

- 8px: micro spacing
- 12px: related label spacing
- 16px: compact content spacing
- 24px: standard internal spacing
- 32px: module separation
- 48px: major chapter separation
- 64px: editorial breathing room

## Module widths

Full-width imagery may span the container. Text should usually sit inside a narrower measure. Product grids should never exceed three columns on desktop and should collapse to one or two columns on mobile.

## Alignment

- Left-align most body copy and product information.
- Centre alignment is reserved for short hero propositions, invitations and decisive closing modules.
- Avoid alternating alignment so frequently that the reading path becomes unstable.

## Responsive rules

- Stack columns in a logical reading order.
- Keep the primary CTA near the proposition it supports.
- Avoid horizontal scrolling.
- Crop responsive imagery deliberately rather than shrinking text within images.
- Preserve at least 16px between touch targets.

## Failure modes

Reject layouts that:

- imitate a desktop webpage at unreadable scale
- depend on CSS grid or complex positioning
- use more than two structural columns
- create edge-to-edge text
- place essential content inside background images
- become excessively long through repeated product modules

## Success criteria

The canvas succeeds when the email feels spacious at 640px, remains clear at 320px and can be implemented reliably across major clients.