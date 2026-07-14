# Template and Component Build Order

## Purpose

Define a dependency-aware sequence for building shared website and email primitives before page- or campaign-specific work.

## Build principles

- Build primitives before assemblies.
- Build assemblies before pages or sequences.
- Use constrained variants instead of one-off styling.
- Keep website and email components separate where rendering constraints differ.
- Share tokens and content contracts, not incompatible presentation code.
- Require fixtures, accessibility states and tests with each component.

## Phase 1 — Shared foundations

Implement and approve:

- colour tokens;
- typography roles;
- spacing scale;
- radii;
- border and shadow rules;
- motion durations and easing;
- responsive breakpoints;
- asset identifiers;
- product and offer data contracts;
- copy and claim references.

Output:

- typed token definitions;
- CSS variables or equivalent;
- documentation examples;
- automated token validation;
- migration map from legacy values.

## Phase 2 — Website primitives

Build:

- container and grid;
- section wrapper;
- typography components;
- button and link;
- image and responsive picture;
- icon;
- badge and label;
- divider;
- disclosure;
- visually hidden text;
- focus treatment;
- loading and error states.

Every primitive requires:

- supported variants;
- semantic HTML;
- keyboard behaviour;
- responsive behaviour;
- automated tests;
- visual fixture.

## Phase 3 — Website commerce components

Build:

- product card;
- product image gallery;
- price and offer block;
- variant or shade selector;
- quantity control;
- add-to-cart action;
- cart line item;
- availability state;
- review or proof module;
- trust and delivery information;
- recommendation module;
- sticky purchase region where specified.

Business rules must stay outside visual components.

## Phase 4 — Website editorial assemblies

Build:

- navigation and announcement system;
- hero layouts;
- editorial split sections;
- full-bleed image sections;
- film-strip celebrity section;
- product story sections;
- routine or process modules;
- quote and proof sections;
- collection or product grids;
- editorial CTA sections;
- footer.

Each assembly should support only the compositions required by the approved page specifications.

## Phase 5 — Website page templates

Recommended order:

1. global shell;
2. homepage;
3. collection or listing page;
4. product page;
5. cart;
6. checkout integration surfaces;
7. shade-match experience;
8. editorial and content pages;
9. account and service pages.

Do not duplicate assemblies at route level.

## Phase 6 — Email primitives

Build email-safe equivalents for:

- outer shell;
- preheader;
- header;
- typography;
- button;
- text link;
- spacer and divider;
- responsive image;
- product detail;
- two-column and stacked layouts;
- legal footer;
- preference and unsubscribe region.

These must use email-compatible markup and inlining rather than website components.

## Phase 7 — Email assemblies

Build:

- editorial hero;
- product recommendation;
- shade result;
- routine steps;
- order summary;
- fulfilment status;
- testimonial or proof;
- promotion block;
- loyalty milestone;
- support and service block;
- plain-text renderer.

## Phase 8 — Email templates

Recommended order:

1. service shell;
2. order confirmation;
3. dispatch update;
4. welcome;
5. shade-match result;
6. post-purchase;
7. cart abandonment;
8. browse abandonment;
9. replenishment;
10. win-back;
11. VIP and loyalty;
12. campaign master.

## Component acceptance template

Every component ticket must specify:

```yaml
component: ""
channel: website | email
source_documents:
  - ""
props_contract: ""
variants:
  - ""
responsive_states:
  - ""
accessibility_requirements:
  - ""
data_dependencies:
  - ""
fixtures:
  - ""
automated_tests:
  - ""
visual_acceptance:
  - ""
owner: ""
approver: ""
```

## Prohibited implementation patterns

- route-level copies of shared components;
- arbitrary one-off colours or spacing;
- components that fetch uncontrolled business data internally;
- silent fallback to the wrong product or asset;
- universal image crops;
- HTML email built from browser-only components;
- unversioned template changes;
- large generic components controlled by dozens of unrelated flags.

## Completion criteria

The component system is ready when approved pages and emails can be assembled from tested, documented, accessible and versioned components without introducing unapproved visual or business logic.