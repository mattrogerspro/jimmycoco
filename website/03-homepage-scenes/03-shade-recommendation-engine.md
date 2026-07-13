# Scene 03 — Shade Recommendation Engine

## Role in the experience

The shade recommendation engine is the commercial centrepiece of the homepage.

It transforms the website from a product catalogue into a guided expert experience. The scene should give the customer the feeling that Jimmy’s professional judgement has been translated into a simple, personalised recommendation.

## Commercial objective

Reduce choice uncertainty and move the visitor toward one confident product decision.

The engine should increase:

- Product-selection confidence
- Click-through to recommended products
- Purchase completion
- Relevance of product detail pages
- Customer satisfaction
- Trust in the brand’s expertise

It should reduce:

- Repeated comparison between similar products
- Wrong-shade anxiety
- Homepage abandonment
- Reliance on generic bestseller browsing
- Returns or dissatisfaction caused by poor fit

## User questions answered

- Which result is right for me?
- Which product best suits my skin tone?
- Is it appropriate for my level of experience?
- How long will it take to develop?
- Why is this product being recommended?
- Is there a lighter or deeper alternative?

## Classification model

The existing homepage concept mixes experience level, colour depth and professional identity within one row of cards. The improved system must separate these dimensions.

Use three primary questions.

### Step 1 — Desired result

Options:

- Natural glow
- Golden holiday tan
- Deep bronze

Each option should be represented by a concise visual result cue rather than a generic lifestyle card.

### Step 2 — Natural skin tone

Options:

- Fair
- Light
- Medium
- Olive
- Deep

Use inclusive, realistic skin-tone references. Do not imply that skin tone alone determines undertone or result.

### Step 3 — Experience level

Options:

- First time
- Some experience
- Professional or highly confident

This question should influence formula, development and guidance—not simply product depth.

## Optional advanced logic

Future versions may include:

- Undertone
- Desired development time
- Formula preference
- Event date
- Face versus body use
- Skin dryness or sensitivity

Do not expose every variable in the initial homepage interaction. Use progressive disclosure.

## Recommendation output

The output should present:

### Primary recommendation

- Accurate product image
- Product name
- Result description
- Recommended skin-tone range
- Development time
- Suggested number of coats
- Experience suitability
- Why Jimmy recommends it
- Price
- Rating
- Primary CTA

### Alternative recommendation

Offer one clearly framed alternative:

- Lighter result
- Deeper result
- Faster development
- Different formula

Do not display another broad product grid beneath the answer.

## Example recommendation language

> **Your best match: Malibu Medium/Dark**
>
> A natural olive-gold result for medium and olive skin tones. Build one coat for a polished everyday tan or layer a second coat for deeper colour.

Jimmy’s rationale:

> I recommend this formula because it develops gradually and gives you more control over depth without a flat, one-tone finish.

All copy must be verified against actual product characteristics before publication.

## CTA hierarchy

### Primary

**BUY MY MATCH** or **CHOOSE MY SHADE**

Use the label that best matches the actual product and variant flow.

### Secondary

**See Product Details**

### Tertiary

**Adjust My Answers**

The primary CTA should remain matte charcoal and visually dominant.

## Composition

The chapter should occupy its own soft mineral-stone environment.

Recommended desktop composition:

- Large centred or left-biased chapter introduction
- Three horizontally arranged question modules in the upper half
- One large recommendation workspace beneath
- Oversized product render occupying approximately 4–5 columns
- Recommendation copy and data occupying approximately 4 columns
- CTA and alternative treatment occupying the remaining space

The output card should feel like a flagship product reveal, not a form result panel.

## Architectural silhouette

This is a structured, contained decision workspace that contrasts with the cinematic hero above and airy method chapter below.

Its silhouette should be:

- Wide
- Grounded
- Clearly bounded by background tone rather than a heavy border
- More structured than surrounding editorial scenes
- Large enough to register as the page’s principal interactive moment

## Visual hierarchy

Intended eye path:

1. Chapter headline
2. Three simple decision steps
3. Recommended product render
4. Product name and result
5. Jimmy’s rationale
6. Primary CTA
7. Alternative recommendation

The eye should not be forced to inspect every answer control before understanding the benefit of completing the process.

## Headline and supporting copy

Recommended headline:

> Find your perfect tan in under a minute.

Supporting copy:

> Tell us the result you want, your natural skin tone and your experience level. We’ll recommend the formula and depth Jimmy would choose for you.

Only promise a time estimate if operationally accurate.

## Selection controls

Controls should feel premium and obvious.

Approved treatments:

- Large segmented choices
- Radio-style selectors with image or tone cues
- Clear selected states
- Concise labels
- Generous pointer targets

Avoid:

- Tiny chips
- Complex dropdowns
- Multiple card carousels
- Decorative images that obscure selection
- Hover-dependent controls

## Progressive disclosure

Initially show only the first question or all three concise questions depending on interaction design testing.

Do not display dense recommendation details before the visitor has made selections.

When the recommendation appears:

- Animate subtly if motion is used
- Preserve the user’s answers visibly
- Allow easy editing
- Do not reset the page position

## Trust integration

Place one or two highly relevant proof elements near the recommendation:

- Verified rating for the recommended product
- Real result on a similar skin tone
- Shade-support reassurance
- Clear development time

Do not repeat the entire authority strip.

## Conversion principles

### Choice reduction

Return one primary answer, not many equivalent choices.

### Commitment

Each low-effort selection increases investment in the final recommendation.

### Authority

Jimmy’s rationale explains the recommendation instead of presenting it as an opaque algorithm.

### Recognition over recall

All key product suitability data remains visible in the output.

### Risk reduction

The user understands what the result should look like and why.

## Accessibility

- Every control must have a visible label
- Selection cannot depend on colour alone
- Keyboard navigation must follow a logical order
- Focus states must be highly visible
- Status changes should be announced to assistive technology
- Product result should appear after the controls in the DOM
- Touch targets should be at least 44px
- Skin-tone imagery requires clear text labels

## Mobile behaviour

On mobile:

- Use one question per step
- Show visible progress, such as `1 of 3`
- Keep answer controls large and thumb-friendly
- Preserve selected answers
- Present recommendation as a vertical product reveal
- Keep the primary CTA sticky only when it does not obscure content
- Avoid horizontal micro-cards

## Product data requirements

Before implementation, establish a reliable mapping between answers and:

- Product SKU
- Shade or depth
- Skin-tone suitability
- Undertone guidance
- Development time
- Number of coats
- Experience level
- Formula type
- Product availability

The visual concept must not imply recommendation logic that the ecommerce system cannot support.

## Common AI failure modes

Reject concepts that:

- Turn the selector into three generic lifestyle cards
- Mix desired result and experience in one choice row
- Show five recommended products at once
- Use tiny chips or unreadable labels
- Make the output look like a dashboard
- Use a bright technology-style interface
- Overuse rounded cards
- Place product information in small grey text
- Invent product packaging or claims
- Treat skin tone as a decorative colour swatch without human context
- Make the section visually equal to a standard product grid

## Success criteria

The scene succeeds when:

- It is unmistakably the primary commercial mechanism after the hero
- The three questions are understood instantly
- The recommendation feels personal and expert-led
- One product becomes the obvious next step
- The customer understands why it suits them
- The scene has a dedicated tonal and architectural identity
- It feels premium, calm and effortless rather than technical

## Final AI image prompt

Create one ultra-premium 1700px-wide desktop ecommerce chapter for **Sunless by Jimmy Coco** titled **“Find your perfect tan in under a minute.”** Use the attached current homepage, approved product references and Sunless website design-system documents as strict references. This is an evolution, not a redesign.

Make this chapter the homepage’s commercial centrepiece. Place it on a clearly distinct soft mineral-stone background with substantially more vertical breathing room than a conventional ecommerce section. Build a structured, Apple-quality recommendation workspace rather than another row of product cards.

In the upper area, show three clear selection modules:

1. **Desired Result** — Natural Glow, Golden Holiday Tan, Deep Bronze
2. **Your Skin Tone** — Fair, Light, Medium, Olive, Deep
3. **Experience** — First Time, Some Experience, Professional

Use large, highly legible controls with restrained image or tone cues, obvious selected states and generous pointer targets. Do not use tiny chips, complex dropdowns or generic lifestyle cards.

Below the questions, create one large flagship recommendation reveal approximately twice the visual weight of a normal product card. Show one accurate oversized Sunless product bottle, the label **“Your best match”**, product name, concise natural-result description, development time, suitable skin tones, suggested coat guidance, verified rating and a short **“Why Jimmy recommends it”** statement. Add one dominant matte-charcoal CTA reading **“BUY MY MATCH”** or **“CHOOSE MY SHADE”**, a quieter **“See Product Details”** action and one clearly secondary lighter or deeper alternative.

Use an invisible 12-column grid, elegant serif heading, refined sans-serif information, warm neutral materials, soft natural light, generous whitespace and restrained depth. The chapter should feel like Apple introducing a flagship product inside a luxury Vogue beauty story. Avoid dashboards, glassmorphism, excessive cards, bright technology colours, invented claims, generic Shopify styling, tiny copy or multiple equal recommendations. Production-ready, photorealistic, calm, precise and unmistakably Sunless by Jimmy Coco.