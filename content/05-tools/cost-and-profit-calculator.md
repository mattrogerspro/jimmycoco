# Tool 1 — Spray tan cost and profit calculator

**Route:** `/tools/spray-tan-profit-calculator`
**Status:** partial — a version exists at
`app/components/home/ProfitCalculator.tsx`, embedded in the home page
**Pairs with:** [`what-a-spray-tan-costs`](../04-pipeline/what-a-spray-tan-costs/)

---

## What exists today

`ProfitCalculator` is a good component in the wrong place, modelling the wrong
thing.

**Current inputs:** price per tan (£15–60) · tans per week (1–60) · tans per
bottle (24–32, to be narrowed) · retail add-ons per week (0–20) · average retail price (£10–79)
· retail margin (20–70%).

**Current model:**

```
costPerTan   = 60 / yieldPerLitre
profitPerTan = price − costPerTan
boothWeek    = profitPerTan × tans
retailWeek   = units × retailPrice × margin
month        = (boothWeek + retailWeek) × 52 / 12
```

## What's wrong with it

Five problems, in order of how much they matter.

### 1. It disagrees with the article — fix first

The model treats solution as the *only* cost. The article establishes
consumables at **£3.24**, not £2.14, before any labour or overhead. A reader who
reads the article and then runs the calculator gets two different numbers from
the same brand, and the one that's wrong is ours.

This is the failure the tools rules exist to prevent, and it makes both assets
less credible than either would be alone.

### 2. No chair time

The article's central argument is that loaded chair time (£6.36 a tan) is nearly
three times the solution cost. The calculator doesn't model labour at all, so it
can't reproduce the argument the article makes.

### 3. No overhead apportionment

Same problem, larger number — £8.65 a tan in the worked example, the single
largest line in the stack.

### 4. Stale retail price ceiling

The retail slider tops out at £79, which was the incorrect A-List Glow Kit
price. Per [decision 5](../00-strategy/decisions.md#5-retail-pricing-the-lower-prices-are-correct)
the real range is £15–£59.

### 5. It isn't a page

It lives inside the home page, so it cannot be linked to, cited, bookmarked or
found. The single highest-value SEO and AI-retrieval asset in the programme is
currently a section of a marketing page.

---

## The build

### Extract, don't rewrite

Move `ProfitCalculator` to a shared component, keep the home page usage as a
teaser, and give the full tool its own route. Two modes on one component:

- **`compact`** — the home page version, current inputs, "see the full
  calculator" link
- **`full`** — the `/tools/` version, all inputs below

The compact version must still produce a *consistent* number — the same model
with defaults applied to the fields it doesn't expose. A simplified tool is
fine; a tool that contradicts the full one is not.

### Inputs — full mode

| Group | Input | Default | Range |
|---|---|---|---|
| **In the booth** | Your price per spray tan | £30 | £15–£60 |
| | Spray tans per week | 12 | 1–60 |
| | Tans per litre | 28 | 24–32 slider range; 28 is the product figure |
| | Litre price | £60 | £40–£90 |
| **Consumables** | Disposables per tan | £0.75 | £0–£2.00 |
| | Filters, liners, laundry per tan | £0.35 | £0–£1.00 |
| **Chair time** | Minutes per tan, door to door | 25 | 15–45 |
| | Therapist hourly rate | £12.71 | £0–£25 |
| | *(£0 = you're doing them yourself)* | | |
| **Overheads** | Room fixed costs per month | £450 | £0–£1,500 |
| **On the shelf** | Retail items per week | 3 | 0–20 |
| | Average retail price | £18 | £10–£59 |
| | Your retail margin | 50% | 40–60% |
| **Card** | Card processing rate | 1.5% | 0–3% |

Every default matches the article's worked example exactly. That's the point —
a reader who changes nothing sees the article's numbers.

### Model

```
solutionPerTan    = litrePrice / tansPerLitre
consumablesPerTan = solutionPerTan + disposables + sundries
cardFeePerTan     = price × cardRate
labourPerTan      = hourlyRate × (minutes / 60) × ON_COST_MULTIPLIER   // 1.20
tansPerMonth      = tansPerWeek × 52 / 12
overheadPerTan    = roomFixedCosts / tansPerMonth

profitPerTan      = price − consumablesPerTan − cardFeePerTan
                          − labourPerTan − overheadPerTan

retailProfitWeek  = retailUnits × retailPrice × retailMargin
monthlyProfit     = (profitPerTan × tansPerWeek + retailProfitWeek) × 52 / 12
```

`ON_COST_MULTIPLIER` is 1.20 and depends on `[VERIFY 1]` in the article's
research — employer NIC rate. Keep it as a named constant with a comment, not a
magic number.

### Outputs

- **Estimated profit per month** — the hero number, with the annual figure under it
- Profit per tan, with the full cost stack shown as a breakdown, not just a total
- Weekly booth profit and weekly retail profit, separately
- Litres needed per month
- **Overhead per tan** — worth surfacing on its own, because watching it fall as
  volume rises is the article's most important lesson made interactive

### The levers panel — the differentiating feature

Nobody else has this, and it's the article's payoff made usable. Given her
current inputs, show what each change is worth per year:

- One more tan a week
- Three more retail items a week
- £2 on the price
- A litre 20% cheaper
- Eliminating no-shows (at the 3.14% category rate)

**Sorted by value, descending.** For most realistic inputs the cheaper litre
lands at the bottom, which is the honest finding and a better argument for a good
solution than any claim we could make.

### Crawlable content — non-negotiable

Server-rendered prose beneath the interactive part:

- The worked example from the article, in full, as static HTML
- The method, as text
- The assumptions table
- 4–6 FAQ items with `FAQPage` schema
- A link to the article

A calculator whose content lives entirely in React state is invisible to
crawlers and to assistants. **This section is what makes the page rank; the
interactive part is what makes it useful.** Both are required.

### Schema

`SoftwareApplication` (`applicationCategory: BusinessApplication`,
`offers.price: 0`), plus `FAQPage` for the questions, plus the brand entities.

### Analytics

Reuse the existing pattern in `app/lib/analytics.ts` — `trackOnce` for
`calculator_start`, debounced `calculator_adjust` per control, debounced
`calculator_result` on settled values. Add `calculator_lever_view` when the
levers panel is scrolled into view; it's the feature we most want to know is
being used.

### Also required

- Register in `app/routes.ts`
- **Add the URL to `app/routes/sitemap.ts`** — it queries Supabase for articles
  and will not include a static tool route
- Prerender in `react-router.config.ts`
- `meta`: title, description, canonical, `en-GB` and `x-default` hreflang
