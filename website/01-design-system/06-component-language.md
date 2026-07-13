# Component Language System

## Purpose

This document defines the shared visual and behavioural language for recurring website components. It prevents individual homepage scenes from drifting into unrelated card, button, form or navigation styles while still allowing each chapter to retain a distinct editorial silhouette.

Components must support the experience. They must never become the experience.

## Core rule

Use the smallest number of component families necessary to create clarity, confidence and action.

Do not solve every layout problem with a card.

Do not create new component styles for one-off scenes unless the scene cannot be expressed using the approved system.

## Design character

Every component should feel:

- Refined
- Quietly authoritative
- Tactile
- Spacious
- Commercially clear
- Editorial rather than software-like
- Premium without decorative excess

Avoid:

- Glassmorphism
- Neon accents
- Heavy gradients
- Overly rounded SaaS cards
- Oversized drop shadows
- Dense dashboard patterns
- Decorative badges with no decision value
- Excessive borders

## Component hierarchy

### Level 1 — Conversion components

These control purchase behaviour and must remain visually consistent across all scenes.

Includes:

- Primary buttons
- Secondary buttons
- Product recommendation actions
- Shade-selection controls
- Product-card CTAs
- Final conversion CTA

### Level 2 — Decision-support components

These reduce uncertainty.

Includes:

- Selection chips
- Skin-tone selectors
- Result selectors
- Product suitability labels
- Comparison rows
- Review filters
- Development-time metadata
- Before/after controls

### Level 3 — Editorial components

These support storytelling and proof.

Includes:

- Pull quotes
- Captions
- Founder signature
- Press references
- Trust statistics
- Product annotations
- Image labels

Level 3 components must not visually compete with Level 1 actions.

## Primary button

### Visual treatment

- Matte black or deep charcoal fill
- Warm white text
- Minimal or no shadow
- Subtle corner radius consistent with the brand system
- Comfortable horizontal padding
- Minimum target height: 48px desktop, 52px mobile
- Strong text contrast

### Behaviour

- Clear hover state through slight tonal lift or elevation
- Visible keyboard focus
- No animated shimmer
- No bouncing or pulsing
- No artificial urgency

### Copy rules

Use specific action language.

Approved examples:

- Match My Shade
- Choose My Shade
- Shop Best Sellers
- See My Recommendation
- Build My Routine

Avoid:

- Learn More when a more specific label is possible
- Get Started without context
- Discover Now
- Unlock Your Glow
- Shop Now as the default for every action

## Secondary button

### Visual treatment

- Transparent or pale fill
- Fine charcoal border or text-led treatment
- Lower visual weight than the primary action
- Same height family as the primary button

### Use

Use for alternate routes such as direct product browsing or editorial exploration.

Never place two equally weighted primary actions side by side.

## Text links

Text links should be used for low-commitment exploration.

Requirements:

- Clear wording
- Visible hover and focus states
- Underline or equivalent affordance where context is ambiguous
- Minimum touch target achieved through padding, not tiny typography

## Selection chips and option controls

Selection controls must make decision state immediately legible.

### Approved states

- Default
- Hover
- Selected
- Focused
- Disabled
- Error, only where applicable

### Visual behaviour

- Selected state uses clear contrast, not colour alone
- Labels remain readable at all states
- Chips should not resemble promotional badges
- Avoid excessive pill shapes if every element on the page is already rounded

### Content rules

Options should be mutually understandable and organised by one dimension at a time.

For example:

- Desired result: Natural / Golden / Deep
- Skin tone: Fair / Light / Medium / Olive / Deep
- Experience: First time / Comfortable / Professional

Do not mix result, user identity and experience in one option set.

## Product cards

Product cards are decision tools, not simple image containers.

Every card should answer:

1. What is it?
2. Who is it for?
3. What result does it create?
4. How long does it develop?
5. What is the next action?

### Required information hierarchy

1. Product image
2. Product name
3. Result descriptor
4. Suitability
5. Development time
6. Rating and price
7. CTA

### Card discipline

- Use no more than four primary product cards in a homepage row
- Avoid equal-height content padding that creates large dead areas
- Do not place long paragraphs inside product cards
- Do not use multiple badges on every product
- Use only one differentiating badge where genuinely useful

Approved badges:

- Best for beginners
- Deepest result
- Most loved
- Fast developing

## Recommendation card

The recommendation card is the most important decision-support component on the homepage.

It should feel more like a personalised editorial consultation than a product tile.

### Required structure

- Recommendation label
- Large product render
- Product name
- Why it suits the user
- Expected result
- Suitable skin tones
- Development time
- Primary CTA
- Secondary detail link

### Distinction rule

The recommendation card must be visibly larger, calmer and more important than standard product cards.

## Trust components

Trust elements should appear as integrated proof, not decorative widgets.

Approved forms:

- Rating plus verified review count
- Press names
- Jimmy Coco authority statement
- Verified purchase label
- Real-lighting label
- No-retouching label
- Shade-support reassurance

Avoid generic icon rows that repeat obvious claims.

## Review components

Reviews should be designed around customer relevance.

Useful metadata:

- Skin tone
- Product used
- Experience level
- Development time
- Verified purchase
- Before/after image where available

Do not over-style quotations. The content must remain the focal point.

## Comparison components

Comparison UI should remain quiet and highly legible.

- Minimal borders
- Clear row labels
- Strong column distinction
- Short claims
- No exaggerated red-cross versus green-tick theatrics
- No unsupported superiority claims

## Form components

Forms should feel calm, direct and safe.

### Requirements

- Persistent labels
- Clear required/optional status
- Helpful validation
- Visible focus states
- Logical field order
- Short helper copy
- Privacy reassurance at the point of submission

Placeholders must not replace labels.

## Surface system

Approved surfaces:

- Warm ivory
- Bright white
- Soft stone
- Natural linen
- Warm taupe
- Deep charcoal

Surface choice is determined by chapter role, not decorative variety.

## Radius system

Use a restrained radius family:

- Small controls: subtle radius
- Standard cards: moderate radius
- Heroic editorial scenes: often no card boundary at all

Avoid applying the same large radius to every image, section and button.

## Shadow system

Shadows should suggest physical depth, not interface spectacle.

Use:

- Soft low-opacity grounding shadows
- Subtle product shadows
- Gentle card separation where background contrast is insufficient

Avoid:

- Floating SaaS-panel shadows
- Dark halos
- Multiple layered shadows
- Glow effects

## Iconography

Icons should be:

- Fine-line
- Minimal
- Consistent stroke weight
- Geometrically simple
- Visually subordinate to copy

Use icons only where they improve recognition or scanning.

## Responsive rules

- Preserve CTA prominence
- Keep controls large enough for touch
- Avoid shrinking cards until text becomes unreadable
- Re-stack content based on narrative priority, not source order alone
- Maintain one dominant action per viewport

## Accessibility rules

- Minimum 44px interactive target
- WCAG AA contrast for text and controls
- Visible keyboard focus
- No colour-only state communication
- Meaningful control labels
- Error states paired with text
- Motion must respect reduced-motion settings

## AI generation guidance

When generating visual concepts:

- Preserve the approved component families
- Do not invent unrelated button or card styles
- Do not render every content block as a rounded rectangle
- Use short placeholder copy where text rendering is unreliable
- Rebuild final typography and controls as live UI in production

## Success criteria

The component system succeeds when:

- Every action feels part of one coherent brand
- Components remain legible and commercially clear
- Editorial scenes do not become card grids
- Decision-support tools reduce uncertainty
- Repeated components feel consistent without making the page repetitive
- The homepage still reads as a sequence of distinct chapters