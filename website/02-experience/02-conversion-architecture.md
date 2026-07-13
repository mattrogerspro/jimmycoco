# Conversion Architecture

## Purpose

Define how the website converts interest into confident purchase without relying on pressure, excessive promotion or generic ecommerce tactics.

## Primary conversion model

The preferred journey is:

> Desire → authority → guidance → proof → product confidence → purchase

The website should reduce uncertainty before increasing urgency.

## Primary conversion routes

### Guided route

Home → Find Your Shade → Recommendation → Product Detail Page → Cart → Checkout

Best for visitors who are uncertain about shade, depth, format or application.

### Direct-shopping route

Home or Collection → Product Detail Page → Cart → Checkout

Best for returning or high-intent visitors.

### Proof-led route

Home or Search → Results → Product Detail Page → Cart → Checkout

Best for visitors who need visual evidence before choosing.

### Education-led route

Journal or Method → Relevant Product Detail Page → Cart → Checkout

Best for visitors arriving through informational search.

## Conversion hierarchy

### Primary actions

- Match My Shade
- Add to Bag
- Buy the Recommended Routine

### Secondary actions

- Shop Best Sellers
- View Results
- Compare Products
- See How to Apply

### Tertiary actions

- Read the Method
- Explore Jimmy’s Story
- Join Email

Only one primary action should dominate each decision state.

## Confidence before commitment

Before Add to Bag, the customer should understand:

- Who the product is for
- The expected colour result
- Undertone or skin-depth suitability
- Development time
- Number of coats
- Application area
- Finish and fade behaviour
- How to apply it
- What is included
- Delivery and returns essentials

## Product-page conversion stack

The product page should resolve questions in this order:

1. What result does this create?
2. Is it right for me?
3. What will it look like?
4. How do I use it?
5. Why is it different?
6. Can I trust the claim?
7. What do I need with it?
8. What happens after I buy?

## Friction controls

Reduce avoidable hesitation through:

- Clear shade suitability
- Specific application instructions
- Visible delivery timing
- Transparent returns information
- Accurate stock state
- Concise review summaries by concern
- Persistent but restrained Add to Bag on mobile
- Preservation of selected shade, quantity and routine choices

## Cross-sell rules

Cross-sell must follow the customer’s task.

Preferred structure:

- Prepare
- Apply
- Perfect

Do not show unrelated recommendations before the customer understands the primary product.

Use one clearly explained routine bundle rather than a carousel of arbitrary products.

## Promotional restraint

Avoid:

- Competing discount banners
- Countdown timers without a real deadline
- Multiple pop-ups
- False low-stock messages
- Repeated sticky bars
- Excessive strike-through pricing
- Forced account creation before checkout

Premium confidence should replace pressure.

## Cart conversion rules

The cart must show:

- Product and selected variant
- Quantity
- Price
- Delivery threshold progress, if accurate
- Estimated delivery context
- One optional, relevant routine addition
- Clear checkout CTA

Do not turn the cart into a second collection page.

## Checkout principles

- Guest checkout first
- Minimal fields
- Address autocomplete where supported
- Clear delivery choices
- Visible total before payment
- Express payment where supported
- No surprise fees
- Error messages adjacent to the affected field

## Measurement framework

Core funnel events:

- `shade_match_started`
- `shade_match_completed`
- `recommendation_viewed`
- `product_viewed`
- `application_guide_opened`
- `results_viewed`
- `variant_selected`
- `add_to_bag`
- `routine_added`
- `cart_viewed`
- `checkout_started`
- `purchase_completed`

Measure conversion by route, not only total site conversion.

## Success criteria

The system succeeds when customers reach Add to Bag with greater certainty, not merely greater exposure to promotional content.