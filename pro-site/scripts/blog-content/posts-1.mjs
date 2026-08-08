// Authored articles for jimmycoco.pro, in the Oxford Roof Masters shape:
// bodies are HTML, FAQ and citations are structured, and everything that does
// not vary per post — author, status, publish date — is applied centrally by
// scripts/seed-articles.mjs.
//
// Source of truth for the copy is content/04-pipeline/<slug>/article.md.
// Product figures come from email/04-copy-system/14-professional-product-facts.md.

export default [
  {
    slug: "what-a-spray-tan-costs",
    title: "What a spray tan actually costs you to deliver",
    category: "The Economics of Tanning",
    tags: ["costs", "pricing", "margin", "retail"],
    readingTimeMinutes: 10,
    isFeatured: true,
    seoTitle: "What a spray tan costs to deliver: the full UK model",
    metaDescription: "A spray tan costs £2.14 in solution and £3.24 in consumables. The full loaded cost is about £18.70. Here's the model, in sterling, and the five levers that actually move your margin.",
    ogTitle: "What a spray tan actually costs you to deliver",
    ogDescription: "The full UK cost model in sterling — solution, consumables, chair time and overheads — and why the litre price is the smallest lever you have.",
    keywords: ["spray tan cost per treatment", "how much does a spray tan cost to do", "spray tan profit margin uk", "cost per tan uk", "how many tans from a litre", "salon spray tan economics"],
    excerpt: "At £30 a tan, the solution costs £2.14 and your consumables £3.24. Here is the full model — chair time, overhead apportionment and all — and the five levers that actually move your margin.",
    content: `
<blockquote>
<p>At £30 a tan, the solution in the bottle costs you <strong>£2.14</strong>. All your
consumables together come to <strong>£3.24</strong>. Add chair time and a share of your
overheads and the full loaded cost is about <strong>£18.70</strong>, leaving roughly
<strong>£11.30</strong> of profit per tan.</p>
<p>The number most people worry about — what they pay per litre — is the
smallest lever in the whole model.</p>
</blockquote>
<p>Almost every conversation about spray tan costs in this industry is a
conversation about the price of solution. It's the number on the invoice, so
it's the number that feels like the cost.</p>
<p>It isn't. At a £30 ticket, solution is 7% of what the client pays you. The other
93% is where your margin actually lives, and most of it is in things nobody puts
on a spreadsheet: how long the chair is occupied, how many slots go empty, and
whether anything left the salon with the client.</p>
<p>Here is the whole model, with the arithmetic showing, so you can put your own
numbers in.</p>
<h2>The worked example</h2>
<p>One salon, one treatment room, an employed therapist. Twelve tans a week — 624 a
year — at £30 each. These are middling numbers on purpose: spray tans run
£20–£40 across the UK, and twelve a week is a real tanning column rather than an
aspirational one.</p>
<p>Every assumption below is listed in one block near the end, with the range it
realistically moves in. Substitute yours.</p>
<h2>What leaves the room with every client</h2>
<h3>Solution — £2.14</h3>
<p>A litre of Sunset Professional is £60. At 28 tans to the litre:</p>
<p><code>£60 ÷ 28 = £2.14 per tan</code></p>
<p>Twenty-eight is the figure for the Sunset professional litre. Your own number
will sit either side of it depending on your equipment, your technique and how
much of the body you're covering — a therapist doing full-coverage tans on larger
frames with an older gun will get fewer; a light, efficient hand with a
well-set-up HVLP will get more. We have not seen a published study putting
numbers on that spread, so we are not going to invent one.</p>
<p><strong>Measure your own.</strong> Mark the bottle, count the tans, divide. It takes one
week and it's the single most useful number in this article, because everything
downstream depends on it. Every tan you gain or lose per litre moves your
solution cost by roughly 8p.</p>
<h3>Disposables — £0.75</h3>
<p>Hairnet, sticky feet, disposable briefs, barrier cream, wipes.</p>
<p>This is an assumption, not a survey — the realistic spread is £0.40 to £1.50
depending on what you provide. A salon that gives everyone briefs and a
barrier-cream sachet is at the top of that; one where most clients bring their
own is at the bottom.</p>
<h3>Filters, liners and laundry — £0.35</h3>
<p>Extraction filter and tent liner, amortised across the tans they last for:
about <strong>£0.15</strong>. Towels and gowns through the wash: about <strong>£0.20</strong>.</p>
<p>Small numbers, and they're the two people leave out entirely. Together they're
more than a sixth of your solution cost.</p>
<h3>Total consumables: £3.24</h3>
<p><code>£2.14 + £0.75 + £0.15 + £0.20 = £3.24</code></p>
<p>That's the number to have in your head. Not £2.14 — the solution price on its
own is never the real consumable cost of a treatment.</p>
<h2>The bits that don't feel like costs</h2>
<h3>Card fees — £0.45</h3>
<p>At around 1.5% on a £30 transaction, about 45p. Trivial per tan; £281 a
year across 624 of them.</p>
<h3>Your contribution per tan: £26.31</h3>
<p><code>£30.00 − £3.24 − £0.45 = £26.31</code></p>
<p>This is the figure to use for every "should I take one more booking" decision,
because it's what an additional tan actually puts in the till before anything
fixed changes.</p>
<h2>The loaded cost of chair time</h2>
<p>Here is where the real money is, and where nearly every costing conversation in
this industry stops short.</p>
<p>A spray tan is not a fifteen-minute treatment. Door to door — consultation,
prep, treatment, clean-down, reset — assume <strong>25 minutes</strong>. Some rooms run it in
20; plenty run it in 35 once you count the reset honestly.</p>
<p>For an employed therapist on the National Living Wage, which rose to <strong>£12.71 an
hour in April 2026</strong>:</p>
<p><code>£12.71 × (25 ÷ 60) = £5.30</code></p>
<p>Then the on-costs. Employer National Insurance is charged above a secondary
threshold that was cut to <strong>£5,000</strong> and frozen to 2031, and holiday pay accrues
on top. Taken together that comes to roughly a <strong>1.20×</strong> multiplier on gross
wage — an assumption, and one worth checking against your own payroll:</p>
<p><code>£5.30 × 1.20 = £6.36</code></p>
<p><strong>After labour, the tan leaves you £19.95.</strong></p>
<p>If you're the owner and you're doing the tans yourself, there's no wage leaving
the business — but the 25 minutes is still the scarcest thing you own, and any
decision about whether to hire has to price it. Cost it at what you'd pay
someone else to do it.</p>
<h2>The share of everything else</h2>
<p>Overheads are the part no honest article can give you a number for, because the
number is yours. What we can give you is the method, which is:</p>
<p><code>room-attributable fixed costs per month ÷ treatments per month</code></p>
<p>Attributable means the share that belongs to tanning — a portion of rent and
rates, the room's heat and light and water, your treatment liability insurance,
a slice of the booking software. Not your entire salon's cost base.</p>
<p>For this example, take <strong>£450 a month</strong>. That is an assumption and it is the
most business-specific figure in the model; a room in a Manchester high street
is a different number from a room in Zone 2.</p>
<p>At 12 tans a week, you're doing 52 a month:</p>
<p><code>£450 ÷ 52 = £8.65 per tan</code></p>
<p><strong>Note what that does.</strong> The overhead per tan is a function of how busy you are,
not of how much you spend. At 52 tans a month it's £8.65. At 75 it's £6.00. At
30 it's £15. <strong>Doing more tans in the same room is the same thing as making the
room cheaper</strong>, which is the single most important sentence in this article.</p>
<h2>The full picture</h2>
<table>
<thead>
<tr>
<th></th>
<th>Per tan</th>
</tr>
</thead>
<tbody>
<tr>
<td>Client pays</td>
<td>£30.00</td>
</tr>
<tr>
<td>Solution</td>
<td>−£2.14</td>
</tr>
<tr>
<td>Disposables</td>
<td>−£0.75</td>
</tr>
<tr>
<td>Filters and liners</td>
<td>−£0.15</td>
</tr>
<tr>
<td>Laundry</td>
<td>−£0.20</td>
</tr>
<tr>
<td>Card fee</td>
<td>−£0.45</td>
</tr>
<tr>
<td>Chair time, loaded</td>
<td>−£6.36</td>
</tr>
<tr>
<td>Share of fixed costs</td>
<td>−£8.65</td>
</tr>
<tr>
<td><strong>Profit</strong></td>
<td><strong>£11.30</strong></td>
</tr>
</tbody>
</table>
<p><strong>£11.30 on a £30 tan — 37.7%.</strong></p>
<p>If you're doing the tans yourself, take the wage out and it's <strong>£17.65</strong>, or
58.8% — which is not really profit so much as profit plus your own wages, and
it's worth being clear-eyed about that when you're comparing yourself to a salon
that employs.</p>
<h3>Is that a good margin?</h3>
<p>The average UK salon profit margin is 8.2%, and <strong>20% of UK salons
are currently operating at a loss</strong> (NHBF, March 2026, n=423).</p>
<p>Against that, a treatment running at 37% is doing real work. Tanning is a good
column. If yours isn't producing something in this region, the model above will
tell you which line is wrong.</p>
<h2>What actually moves the number</h2>
<p>This is the part worth the read. Same salon, 624 tans a year, one change at a
time:</p>
<table>
<thead>
<tr>
<th>Change</th>
<th>Extra profit per year</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Sell three retail items a week</strong> (£18 soufflé at 50% margin)</td>
<td><strong>£1,404</strong></td>
</tr>
<tr>
<td><strong>Put your price up £2</strong></td>
<td><strong>£1,229</strong></td>
</tr>
<tr>
<td><strong>One more tan a week</strong></td>
<td><strong>£1,038</strong></td>
</tr>
<tr>
<td><strong>Eliminate no-shows entirely</strong></td>
<td><strong>£391–£515</strong></td>
</tr>
<tr>
<td><strong>Find a solution 20% cheaper</strong></td>
<td><strong>£267</strong></td>
</tr>
</tbody>
</table>
<p>Read that table from the bottom.</p>
<p><strong>A litre 20% cheaper is worth about £267 a year.</strong> That's £5 a week. It is the
smallest lever available to you, and it's the one the industry spends most of its
time arguing about. If a cheaper solution costs you a single client — one person
whose colour went wrong and who quietly went somewhere else — you are behind for
the year.</p>
<p><strong>Retail is the largest lever, and it costs no chair time at all.</strong> Three items a
week. Retail is currently <strong>4% of UK salon revenue against a 15–25% benchmark</strong>
(SalonIQ, 2026), and <strong>70% of clients who don't buy retail say they would like
to</strong> (Phorest). That gap is the most under-claimed margin in your business.</p>
<p><strong>No-shows are worth more than they look.</strong> Tanning has the <strong>highest no-show
rate of any treatment category, at 3.14%</strong>, peaking June to August (Treatwell,
2025). On 624 tans that's about 20 empty slots a year. What recovering them is
worth depends on whether you're paying a therapist to sit through them — £391 if
the labour is avoidable, £515 if it isn't. Across the UK, no-shows cost the
sector £1.6bn a year at roughly £39 a miss. Pre-payment halves them, and only
17% of salons use it.</p>
<p><strong>And cutting chair time isn't a saving — it's capacity.</strong> Getting a tan from 25
minutes to 20 doesn't put £1.27 in your pocket. It puts 25% more slots in your
day, and it's only worth anything if you fill them.</p>
<h2>Assumptions</h2>
<p>Everything above that we chose rather than sourced. Change them to yours.</p>
<table>
<thead>
<tr>
<th>Assumption</th>
<th>Used here</th>
<th>Realistic range</th>
</tr>
</thead>
<tbody>
<tr>
<td>Yield per litre</td>
<td>28 tans</td>
<td>product figure — measure your own</td>
</tr>
<tr>
<td>Disposables per tan</td>
<td>£0.75</td>
<td>£0.40–£1.50</td>
</tr>
<tr>
<td>Filter and liner, amortised</td>
<td>£0.15</td>
<td>£0.05–£0.30</td>
</tr>
<tr>
<td>Laundry</td>
<td>£0.20</td>
<td>£0.10–£0.40</td>
</tr>
<tr>
<td>Chair time, door to door</td>
<td>25 min</td>
<td>20–35 min</td>
</tr>
<tr>
<td>Employer on-cost multiplier</td>
<td>1.20×</td>
<td>1.15–1.25×</td>
</tr>
<tr>
<td>Room-attributable fixed costs</td>
<td>£450/month</td>
<td>£250–£900</td>
</tr>
<tr>
<td>Retail margin at RRP</td>
<td>50%</td>
<td>40–60%</td>
</tr>
<tr>
<td>Ticket price</td>
<td>£30</td>
<td>£20–£40</td>
</tr>
<tr>
<td>Volume</td>
<td>12 tans/week</td>
<td>—</td>
</tr>
</tbody>
</table>
<h2>What to do about it</h2>
<ol>
<li><strong>Measure your actual yield.</strong> Mark the bottle, count the tans, divide. One
   week. Everything else in the model moves with it.</li>
<li><strong>Work out your room's fixed costs and divide by last month's treatments.</strong>
   That single number tells you more about your tanning business than any other.</li>
<li><strong>Time a tan properly, door to door.</strong> Include the reset. Most people are 5–8
   minutes optimistic, and that's 20–30% of the labour cost.</li>
<li><strong>Count how many clients left with something.</strong> If it's under one in five,
   the largest lever in the table is sitting untouched.</li>
<li><strong>Stop optimising the litre price.</strong> It's £5 a week. Spend that attention on
   the top three rows instead.</li>
</ol>
<p><em>These figures are a model, not a forecast. Substitute your own numbers — the
assumptions are listed above so you can.</em></p>
<h2>Questions</h2>
<h3>How much does a litre of spray tan solution cost per treatment?</h3>
<p>At £60 a litre and 28 treatments to the litre, £2.14 a tan. Your own number will sit either side of that depending on equipment, technique and coverage. Solution is only part of your consumable cost — with disposables, filters and laundry, budget around £3.24 a treatment.</p>
<h3>How many spray tans do you get from a litre?</h3>
<p>Twenty-eight for the Sunset professional litre. Your own number will sit either side of that depending on equipment, technique and how much of the body you cover. Measure your own: mark the bottle, count the tans over a week, and divide. It's the number every other calculation depends on.</p>
<h3>What profit is there in a spray tan?</h3>
<p>On a £30 tan with an employed therapist, about £11.30 after consumables, card fees, loaded chair time and a share of fixed costs — roughly 37%. If you do the tans yourself, about £17.65, though that includes what you'd otherwise pay someone. Against an average UK salon margin around 8%, tanning is a strong column.</p>
<h3>Is it worth switching to a cheaper spray tan solution?</h3>
<p>Probably not. At 12 tans a week, a solution 20% cheaper saves about £267 a year — roughly £5 a week, and the smallest lever in the model. Selling three retail items a week is worth £1,404, and putting £2 on your price is worth £1,229. One lost client from a poor result wipes out the saving.</p>
<h3>How do I work out my overhead per spray tan?</h3>
<p>Take the fixed costs attributable to the tanning room each month — a share of rent, rates, utilities, insurance and booking software — and divide by the treatments you did that month. At £450 a month and 52 tans, that's £8.65 a tan. The figure falls as you get busier, which is why filling the room is the same thing as making it cheaper.</p>
<h3>What does a spray tan cost to deliver if I'm mobile?</h3>
<p>The consumables are the same, but travel time, fuel and equipment amortisation change the picture materially, and a no-show costs you the journey as well as the slot. That model is different enough to need its own article.</p>
`,
    faq: [
      { question: "How much does a litre of spray tan solution cost per treatment?", answer: "At £60 a litre and 28 treatments to the litre, £2.14 a tan. Your own number will sit either side of that depending on equipment, technique and coverage. Solution is only part of your consumable cost — with disposables, filters and laundry, budget around £3.24 a treatment." },
      { question: "How many spray tans do you get from a litre?", answer: "Twenty-eight for the Sunset professional litre. Your own number will sit either side of that depending on equipment, technique and how much of the body you cover. Measure your own: mark the bottle, count the tans over a week, and divide. It's the number every other calculation depends on." },
      { question: "What profit is there in a spray tan?", answer: "On a £30 tan with an employed therapist, about £11.30 after consumables, card fees, loaded chair time and a share of fixed costs — roughly 37%. If you do the tans yourself, about £17.65, though that includes what you'd otherwise pay someone. Against an average UK salon margin around 8%, tanning is a strong column." },
      { question: "Is it worth switching to a cheaper spray tan solution?", answer: "Probably not. At 12 tans a week, a solution 20% cheaper saves about £267 a year — roughly £5 a week, and the smallest lever in the model. Selling three retail items a week is worth £1,404, and putting £2 on your price is worth £1,229. One lost client from a poor result wipes out the saving." },
      { question: "How do I work out my overhead per spray tan?", answer: "Take the fixed costs attributable to the tanning room each month — a share of rent, rates, utilities, insurance and booking software — and divide by the treatments you did that month. At £450 a month and 52 tans, that's £8.65 a tan. The figure falls as you get busier, which is why filling the room is the same thing as making it cheaper." },
      { question: "What does a spray tan cost to deliver if I'm mobile?", answer: "The consumables are the same, but travel time, fuel and equipment amortisation change the picture materially, and a no-show costs you the journey as well as the slot. That model is different enough to need its own article." },
    ],
    citations: [
      { text: "National Living Wage rates, gov.uk, 2026", url: "https://www.gov.uk/national-minimum-wage-rates" },
      { text: "Employer National Insurance secondary threshold, HM Treasury, 2025", url: "" },
      { text: "NHBF, State of the Industry, March 2026 (n=423)", url: "" },
      { text: "SalonIQ, salon retail benchmarks, 2026", url: "" },
      { text: "Phorest, salon client research, 2025 (n=716)", url: "" },
      { text: "Treatwell, UK no-show data, 2025", url: "" },
      { text: "Sunset 1 Ltr Professional Spray price list, Sunless by Jimmy Coco, 2026", url: "https://www.jimmycoco.pro/products/malibu-professional-spray-1l" },
    ],
  },
  {
    slug: "tans-per-litre",
    title: "How many spray tans do you get from a litre?",
    category: "The Economics of Tanning",
    tags: ["costs", "margin", "equipment", "technique"],
    readingTimeMinutes: 6,
    isFeatured: false,
    seoTitle: "How Many Spray Tans in a Litre? The UK Answer, in £",
    metaDescription: "Approximately 28 full-body tans from a litre, at about 36ml each and £2.14 of solution per tan. How to measure your own yield in a week, and what each tan is worth.",
    ogTitle: "How many spray tans do you get from a litre?",
    ogDescription: "28 to the litre, 36ml a tan, £2.14 of solution. Measure your own in a week — and see what a tan of difference is actually worth.",
    keywords: ["how many spray tans in a litre", "spray tan solution per client", "ml per spray tan", "spray tan cost per treatment", "tans per litre uk", "how much solution for a spray tan"],
    excerpt: "Twenty-eight from a litre, at about 36ml a tan and £2.14 of solution. Here is how to measure your own yield in a week, and what each tan of difference is actually worth.",
    content: `
<blockquote>
<p><strong>Twenty-eight</strong> from a litre of the professional solution. At £60 a litre that
is <strong>£2.14 of solution per tan</strong>, and about <strong>36ml</strong> on the client.</p>
<p>Your own number will sit either side of that. Here is how to measure it, and
what each tan of difference is actually worth — which is less than almost
everyone assumes.</p>
</blockquote>
<p>Ask this question anywhere in the UK trade and you get a number back within
seconds. Ask what the number is based on and the conversation stops.</p>
<p>That is the honest state of the answer. Most of what ranks for this question is
forum threads written between 2008 and 2018, and most of the rest is US brands
quoting US pricing. So here is the figure, what it rests on, and how to work out
yours — because yours is the only one that matters for your ordering.</p>
<h2>The figure</h2>
<p><strong>A litre of Sunless by Jimmy Coco professional solution is rated at
approximately 28 full-body tans.</strong> The solution is 10% DHA.</p>
<p>Twenty-eight is arithmetic you can check:</p>
<p><code>1,000ml ÷ 28 tans = 35.7ml per full-body tan</code></p>
<p>That is the dose the rating assumes — a little under 36ml on the client, once.
Not per coat, not per pass, and not including what you lose to the cup, the line
and the tent.</p>
<h2>What it costs you</h2>
<p><code>£60 ÷ 28 = £2.14 per tan</code></p>
<p>On a £30 treatment, that is <strong>7.1% of the ticket</strong>. Worth holding on to, because
it is the fact that makes the rest of this article make sense.</p>
<h2>What actually moves your number</h2>
<p>Six things, in rough order of how much difference they make:</p>
<p><strong>Coverage.</strong> A full-body tan on a size 8 frame and a full-body tan on a size 20
frame are not the same volume of solution. This is the largest single variable
and nobody's rating can account for it.</p>
<p><strong>Technique.</strong> Distance from the skin, speed of pass, overlap and how many passes
you make. A tight, efficient hand covers a body in materially less solution than
a heavy one, and this is the variable you can actually train.</p>
<p><strong>Equipment and setup.</strong> Gun, needle, air pressure and pattern width. A pattern
that is too wide puts solution past the edge of the client.</p>
<p><strong>Priming and line loss.</strong> Every prime, every purge, every colour change. Small
per session, real across a week.</p>
<p><strong>Cup residue.</strong> What you cannot get out of the cup at the end of the day.</p>
<p><strong>Depth chasing.</strong> Going back over an area to make it darker rather than
selecting the right depth to begin with. This is the most expensive habit on the
list and it does not reliably produce a darker result — depth comes from the
solution and the development, not from volume on the skin.</p>
<p>We have not found a published study putting numbers on any of those, and we are
not going to invent one. What follows is how to replace the estimate with your
own measurement.</p>
<h2>How to measure yours</h2>
<p>One week. It is the most useful hour of admin in your tanning business.</p>
<ol>
<li><strong>Start a fresh litre</strong> and mark the date on it.</li>
<li><strong>Count every full-body tan</strong> you do from it — a tally on the bottle works.
   Do not count touch-ups, half-body treatments or practice.</li>
<li><strong>Stop when the bottle is done</strong>, not when it looks nearly done.</li>
<li><strong>Divide.</strong> Tans ÷ 1 litre is your yield.</li>
<li><strong>Divide again.</strong> £60 ÷ your yield is your true solution cost per tan.</li>
</ol>
<p>Two conditions make the number honest: run it across a normal week rather than a
quiet one, and do not change how you spray while you are counting. A yield
measured on your best behaviour tells you what is possible, not what is
happening.</p>
<h2>What a tan of difference is worth</h2>
<p>This is the part that surprises people.</p>
<p>At 12 tans a week — 624 a year — <strong>each additional tan you get from a litre is
worth about £46 a year.</strong></p>
<table>
<thead>
<tr>
<th>Your yield</th>
<th>Solution per tan</th>
<th>Cost per year at 624 tans</th>
</tr>
</thead>
<tbody>
<tr>
<td>26</td>
<td>£2.31</td>
<td>£1,440</td>
</tr>
<tr>
<td>27</td>
<td>£2.22</td>
<td>£1,387</td>
</tr>
<tr>
<td><strong>28</strong></td>
<td><strong>£2.14</strong></td>
<td><strong>£1,337</strong></td>
</tr>
<tr>
<td>29</td>
<td>£2.07</td>
<td>£1,291</td>
</tr>
<tr>
<td>30</td>
<td>£2.00</td>
<td>£1,248</td>
</tr>
</tbody>
</table>
<p>The whole spread between a heavy hand and an efficient one — four tans a litre —
is about <strong>£223 a year</strong>. Real money, and worth having. But set it against the
things sitting next to it in the same business: three retail sales a week is
worth £1,404 a year, and £2 on your price is worth £1,229.</p>
<p><strong>Yield is worth improving. It is not worth optimising.</strong> If measuring it turns
into changing supplier over 8p a tan, the tail is wagging the dog — and a
cheaper litre that produces one poor result costs more than a year of the
saving. The <a href="/articles/what-a-spray-tan-costs">full cost model</a> sets out where
the money actually is.</p>
<h2>What it means for ordering</h2>
<p>Once you have your own yield, reordering stops being a guess:</p>
<p><code>litres per month = (tans per week × 52 ÷ 12) ÷ your yield</code></p>
<p>At 12 tans a week and 28 to the litre, that is <strong>1.9 litres a month</strong>, or about
<strong>22 litres a year</strong>. At 20 tans a week it is 3.1 a month.</p>
<p>Order to your measured number, not the rated one, and keep a litre of headroom
for a busy week — running out mid-season costs a great deal more than a spare
bottle.</p>
<h2>Assumptions</h2>
<table>
<thead>
<tr>
<th>Assumption</th>
<th>Used here</th>
<th>Note</th>
</tr>
</thead>
<tbody>
<tr>
<td>Yield</td>
<td>28 tans per litre</td>
<td>The product figure for the professional solution</td>
</tr>
<tr>
<td>Litre price</td>
<td>£60</td>
<td>Current list price</td>
</tr>
<tr>
<td>Volume</td>
<td>12 tans a week, 624 a year</td>
<td>For the worked examples only — substitute yours</td>
</tr>
<tr>
<td>Ticket price</td>
<td>£30</td>
<td>Mid-point of the £20–£40 national range</td>
</tr>
</tbody>
</table>
<h2>What to do about it</h2>
<ol>
<li><strong>Measure one litre.</strong> A tally on the bottle, one week.</li>
<li><strong>Recalculate your cost per tan</strong> with your own number, not ours.</li>
<li><strong>Set your reorder point</strong> from that figure rather than from when the shelf
   looks empty.</li>
<li><strong>If your yield is well below 28, look at pattern width and passes first</strong> —
   they are the two variables you can change on Monday.</li>
<li><strong>Then stop thinking about it.</strong> Solution is 7% of your ticket. The levers
   worth your attention are in the cost model.</li>
</ol>
<p><em>These figures are a model, not a forecast. Substitute your own numbers — the
assumptions are listed above so you can.</em></p>
<h2>Questions</h2>
<h3>How many spray tans in a litre of solution?</h3>
<p>Approximately 28 full-body tans from a litre of Sunless by Jimmy Coco professional solution, which works out at about 36ml per treatment. Your own number will sit either side of that depending on coverage, technique and equipment. Measure a full litre over a normal week to find yours.</p>
<h3>How much solution should a full-body spray tan use?</h3>
<p>Around 36ml, which is what 28 tans to a litre works out at. Using materially more usually points to a pattern that is too wide, too much distance from the skin or repeated passes over the same area — rather than to a better result.</p>
<h3>How much does the solution cost per spray tan?</h3>
<p>£2.14 at £60 a litre and 28 tans to the litre. On a £30 treatment that is 7.1% of what the client pays you. Total consumables, including disposables, filters and laundry, come to about £3.24 a tan.</p>
<h3>How do I work out my own tans per litre?</h3>
<p>Start a fresh litre, tally every full-body tan you do from it, stop when the bottle is genuinely empty, and divide. Do it across a normal week and do not change how you spray while you are counting. Then divide £60 by that number for your true solution cost.</p>
<h3>Is it worth switching solution to get more tans per litre?</h3>
<p>Rarely. Each extra tan per litre is worth about £46 a year at 12 tans a week, and the full realistic spread is around £223. One client lost to a result you were not happy with costs more than that.</p>
<h3>How many litres should I order a month?</h3>
<p>Take your tans per week, multiply by 52, divide by 12, then divide by your measured yield. At 12 tans a week and 28 to the litre that is 1.9 litres a month. Keep a litre of headroom for a busy week.</p>
`,
    faq: [
      { question: "How many spray tans in a litre of solution?", answer: "Approximately 28 full-body tans from a litre of Sunless by Jimmy Coco professional solution, which works out at about 36ml per treatment. Your own number will sit either side of that depending on coverage, technique and equipment. Measure a full litre over a normal week to find yours." },
      { question: "How much solution should a full-body spray tan use?", answer: "Around 36ml, which is what 28 tans to a litre works out at. Using materially more usually points to a pattern that is too wide, too much distance from the skin or repeated passes over the same area — rather than to a better result." },
      { question: "How much does the solution cost per spray tan?", answer: "£2.14 at £60 a litre and 28 tans to the litre. On a £30 treatment that is 7.1% of what the client pays you. Total consumables, including disposables, filters and laundry, come to about £3.24 a tan." },
      { question: "How do I work out my own tans per litre?", answer: "Start a fresh litre, tally every full-body tan you do from it, stop when the bottle is genuinely empty, and divide. Do it across a normal week and do not change how you spray while you are counting. Then divide £60 by that number for your true solution cost." },
      { question: "Is it worth switching solution to get more tans per litre?", answer: "Rarely. Each extra tan per litre is worth about £46 a year at 12 tans a week, and the full realistic spread is around £223. One client lost to a result you were not happy with costs more than that." },
      { question: "How many litres should I order a month?", answer: "Take your tans per week, multiply by 52, divide by 12, then divide by your measured yield. At 12 tans a week and 28 to the litre that is 1.9 litres a month. Keep a litre of headroom for a busy week." },
    ],
    citations: [
      { text: "Sunset 1 Ltr Professional Spray product specification, Sunless by Jimmy Coco, 2026", url: "https://www.jimmycoco.pro/products/malibu-professional-spray-1l" },
      { text: "Spray tan pricing benchmarks, UK sector data, 2025–26", url: "" },
    ],
  },
];
