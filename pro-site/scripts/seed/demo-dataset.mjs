/**
 * Deterministic demo dataset for the Jimmy Coco trade admin.
 *
 * Pure: no network, no filesystem, no clock of its own. Give it the same seed
 * and the same `now` and it produces byte-identical output, so a design you
 * screenshot today can be reproduced exactly tomorrow.
 *
 * Every generated email address sits on DEMO_DOMAIN. That single fact is what
 * makes the seed safely reversible — the purge deletes by that domain and can
 * never touch a real applicant, account or contact.
 */

export const DEMO_DOMAIN = "demo.jimmycoco.pro";
export const DEMO_ACCOUNT_PREFIX = "DEMO";
export const DEMO_CAMPAIGN_PREFIX = "demo-";
export const DEMO_REFERENCE_PREFIX = "DEMO-";
export const DEMO_PASSWORD = "JimmyCocoDemo!2026";

export const SCALES = {
  light: { applications: 12, accounts: 8, orders: 25, contacts: 20 },
  full: { applications: 45, accounts: 20, orders: 120, contacts: 70 },
  heavy: { applications: 150, accounts: 60, orders: 500, contacts: 220 },
};

/* ------------------------------------------------------------------ *
 * Deterministic randomness (mulberry32 — same generator the existing
 * generate-admin-fixtures.mjs uses, so behaviour is familiar).
 * ------------------------------------------------------------------ */

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Content pools — plausible UK/UAE beauty businesses. Invented names;
 * any resemblance to a real salon is coincidence, and every address is
 * fictional.
 * ------------------------------------------------------------------ */

const SALON_NAMES = [
  "The Glow Room",
  "Bronze & Bare",
  "Lustre Beauty",
  "Sunkissed Studio",
  "The Tanning Loft",
  "Aurelia Skin",
  "Halo Beauty Bar",
  "Velvet & Vine",
  "The Glow House",
  "Solstice Studio",
  "Bare Beauty Co",
  "Golden Hour Beauty",
  "The Tan Bar",
  "Luxe Lab",
  "Amber & Ash",
  "Serene Skin Studio",
  "The Bronze Parlour",
  "Nectar Beauty",
  "Radiance Rooms",
  "Sundara Spa",
  "The Glow Collective",
  "Ivory Lane Beauty",
  "Copper & Cream",
  "The Tan Atelier",
  "Bloom Beauty Bar",
  "Elysian Skin",
  "The Gilded Room",
  "Marigold Beauty",
  "Sable & Sun",
  "The Glow Editor",
  "Lumen Beauty Studio",
  "The Tan Society",
  "Peach & Pearl",
  "Honeyed Skin Bar",
  "The Bronze Edit",
  "Aurum Beauty",
  "Willow & Wren Beauty",
  "The Sun Room",
  "Cocoa Beauty Lounge",
  "Verve Beauty Studio",
  "The Glow Clinic",
  "Saffron Skin",
  "Bare & Bronze",
  "The Tanning Room Co",
  "Opal Beauty House",
  "Juniper Beauty",
  "The Gloss Room",
  "Aster Skin Studio",
  "Bronze Theory",
  "The Tan Edit",
  "Muse Beauty Bar",
  "Lilac & Sage",
  "The Golden Room",
  "Ember Beauty Studio",
  "Cove Beauty",
  "The Glow Bar Co",
  "Petal & Bronze",
  "Nova Skin Lounge",
  "The Tan Kitchen",
  "Solaire Beauty",
];

const TOWNS = [
  ["Oxford", "OX1", "Oxfordshire"],
  ["Brighton", "BN1", "East Sussex"],
  ["Leeds", "LS1", "West Yorkshire"],
  ["Manchester", "M1", "Greater Manchester"],
  ["Bristol", "BS1", "Bristol"],
  ["Glasgow", "G1", "Glasgow City"],
  ["Cardiff", "CF10", "South Glamorgan"],
  ["Newcastle upon Tyne", "NE1", "Tyne and Wear"],
  ["Nottingham", "NG1", "Nottinghamshire"],
  ["Sheffield", "S1", "South Yorkshire"],
  ["Liverpool", "L1", "Merseyside"],
  ["Birmingham", "B1", "West Midlands"],
  ["Chelmsford", "CM1", "Essex"],
  ["Guildford", "GU1", "Surrey"],
  ["Bath", "BA1", "Somerset"],
  ["York", "YO1", "North Yorkshire"],
  ["Norwich", "NR1", "Norfolk"],
  ["Exeter", "EX1", "Devon"],
  ["Cambridge", "CB1", "Cambridgeshire"],
  ["Reading", "RG1", "Berkshire"],
  ["Edinburgh", "EH1", "Midlothian"],
  ["Belfast", "BT1", "County Antrim"],
  ["Southampton", "SO14", "Hampshire"],
  ["Milton Keynes", "MK9", "Buckinghamshire"],
  ["Harrogate", "HG1", "North Yorkshire"],
  ["Cheltenham", "GL50", "Gloucestershire"],
];

const STREETS = [
  "High Street",
  "Market Square",
  "Bridge Street",
  "Queen's Road",
  "Mill Lane",
  "Castle Street",
  "The Parade",
  "Church Row",
  "Victoria Street",
  "Union Passage",
  "Kings Walk",
  "Wharf Road",
  "Granary Yard",
  "Albion Place",
  "Cathedral Green",
  "Old Bank Chambers",
];

const FIRST_NAMES = [
  "Sarah",
  "Chloe",
  "Nadia",
  "Priya",
  "Jodie",
  "Amelia",
  "Leah",
  "Kirsty",
  "Bethan",
  "Aisha",
  "Rosie",
  "Danielle",
  "Emma",
  "Hannah",
  "Freya",
  "Georgia",
  "Imogen",
  "Keeley",
  "Lauren",
  "Megan",
  "Niamh",
  "Olivia",
  "Paige",
  "Rhiannon",
  "Sophie",
  "Tamsin",
  "Verity",
  "Zara",
  "Ellie",
  "Faye",
  "Maria",
  "Layla",
  "Yasmin",
  "Sana",
  "Ava",
  "Isla",
  "Ruby",
  "Grace",
  "Erin",
  "Molly",
];

const LAST_NAMES = [
  "Whitfield",
  "Okonkwo",
  "Marsden",
  "Patel",
  "Kaur",
  "Byrne",
  "Fletcher",
  "Nakamura",
  "Ahmed",
  "Sinclair",
  "Doyle",
  "Hargreaves",
  "Mensah",
  "Rossi",
  "Novak",
  "Kelly",
  "Barnes",
  "Ferguson",
  "Iqbal",
  "Lawson",
  "Moreau",
  "Ncube",
  "Osei",
  "Pryce",
  "Quinn",
  "Rahman",
  "Stroud",
  "Tulloch",
  "Vance",
  "Whelan",
  "Ashworth",
  "Beckett",
  "Cleary",
  "Dunlop",
  "Ellery",
  "Fairbairn",
];

const BUSINESS_TYPES = ["Salon", "Spa", "Mobile professional", "Multi-site group", "Other"];
const MARKETS = ["UK", "UK", "UK", "UK", "UK", "UK", "IE", "UAE", "AU"];

const APPLICATION_MESSAGES = [
  "We already offer spray tanning but the solution we use streaks on darker skin tones. Looking for something we can trust on every client.",
  "Two rooms, five therapists. We're adding tanning for the first time and want a brand our clients recognise.",
  "I've been following Jimmy on Instagram for years. My clients ask for that finish by name.",
  "We do around 40 tans a week in season and want a better margin than our current wholesaler gives us.",
  "Mobile only at the moment, but I'm opening a studio in the spring and want the retail range in from day one.",
  "Currently stocking two brands and want to consolidate to one we can actually stand behind.",
  "Our bridal work is growing and the current solution photographs green under venue lighting. That's the honest reason I'm here.",
  "Interested in the trial kit before committing. Happy to talk through minimum order.",
  "We're a three-site group and want consistent stock across all of them.",
  "New salon, opening in six weeks. Want tanning to be one of our launch treatments.",
  null,
  null,
];

const REVIEW_NOTES = {
  approved: [
    "Strong treatment mix and no competing professional line within a reasonable radius. Approved on standard terms.",
    "Established since 2019, good social proof, sensible volume expectations. Approved.",
    "Multi-site group — approved at silver from the start given the opening order.",
    "Existing spray tan business converting from another brand. Approved.",
    "Approved. Flagged for a training call before the first order.",
  ],
  declined: [
    "Two existing stockists within a mile. Declined on territory, not on merit.",
    "No treatment room and no evidence of an existing client base. Declined for now.",
    "Reseller intent looks like online resale rather than in-salon use. Declined.",
    "Could not verify the business. Declined pending better information.",
  ],
  on_hold: [
    "Waiting on confirmation of the new premises before we decide.",
    "Held — wants to start in the new season, revisit in six weeks.",
    "Held pending a conversation about minimum order.",
  ],
  pending: [null],
};

const CUSTOMER_NOTES = [
  "Could we get this before the weekend if possible? We have a bridal party on Saturday.",
  "Same delivery address as last time please.",
  "Add a couple of extra mitts if you have them in stock.",
  "No rush on this one.",
  "This is our reorder — running low on the litre.",
  null,
  null,
  null,
];

const INTERNAL_NOTES = [
  "Called to confirm quantities. All good.",
  "Invoice raised, 30-day terms.",
  "Held one line pending stock.",
  "Customer asked to split delivery — noted for dispatch.",
  null,
  null,
  null,
];

const DELIVERY_NOTES = [
  "Deliver to the rear entrance, buzzer marked Salon.",
  "Closed Mondays — please avoid Monday delivery.",
  "Leave with the unit next door if we're with a client.",
  null,
  null,
];

/** Mirrors the catalogue seeded by the reseller_accounts migration. */
export const CATALOGUE = [
  { sku: "MALIBU-1L", title: "Malibu professional spray tan solution — 1 litre", trade_price_pence: 6000, weight: 6 },
  { sku: "MITT-BUFF-GLOW", title: "Buff & Glow Mitt", trade_price_pence: 1250, weight: 4 },
  { sku: "SOUFFLE-SELF-TAN", title: "The Self Tan Soufflé", trade_price_pence: 1750, weight: 3 },
  { sku: "KIT-A-LIST-GLOW", title: "The A-List Glow Kit", trade_price_pence: 3950, weight: 2 },
];

const CAMPAIGNS = [
  {
    id: `${DEMO_CAMPAIGN_PREFIX}uk-stockist-recruitment`,
    name: "DEMO · UK Stockist Recruitment",
    market: "UK",
    mode: "sequence",
    classification: "promotional",
    timezone: "Europe/London",
    steps: [
      {
        step_key: "01",
        step_number: 1,
        day_offset: 0,
        template_alias: "demo-stockist-1-opener",
        subject: "Your clients already know this name",
      },
      {
        step_key: "02",
        step_number: 2,
        day_offset: 3,
        template_alias: "demo-stockist-2-nudge",
        subject: "A quick Jimmy Coco follow-up",
      },
      {
        step_key: "03",
        step_number: 3,
        day_offset: 8,
        template_alias: "demo-stockist-3-two-revenue-lines",
        subject: "Two tan revenue lines, one partner",
      },
      {
        step_key: "04",
        step_number: 4,
        day_offset: 15,
        template_alias: "demo-stockist-4-last-call",
        subject: "Should I close the file?",
      },
    ],
  },
  {
    id: `${DEMO_CAMPAIGN_PREFIX}uk-reseller-lifecycle`,
    name: "DEMO · UK Reseller Lifecycle",
    market: "UK",
    mode: "event",
    classification: "service",
    timezone: "Europe/London",
    steps: [
      {
        step_key: "application-received",
        step_number: 1,
        trigger_name: "application_submitted",
        template_alias: "demo-lifecycle-1-received",
        subject: "Thank you — we have your application",
      },
      {
        step_key: "approved-welcome",
        step_number: 2,
        trigger_name: "application_approved",
        template_alias: "demo-lifecycle-3-approved",
        subject: "You are approved",
      },
      {
        step_key: "declined",
        step_number: 3,
        trigger_name: "application_declined",
        template_alias: "demo-lifecycle-4-declined",
        subject: "About your trade application",
      },
    ],
  },
  {
    id: `${DEMO_CAMPAIGN_PREFIX}uk-season-reorder`,
    name: "DEMO · UK Season Reorder",
    market: "UK",
    mode: "broadcast",
    classification: "promotional",
    timezone: "Europe/London",
    steps: [
      {
        step_key: "pilot",
        step_number: 1,
        day_offset: 0,
        template_alias: "demo-reorder-1-pilot",
        subject: "Stock up before the season turns",
      },
    ],
  },
];

const MESSAGE_OUTCOMES = [
  { status: "delivered", opened: true, clicked: true, weight: 3 },
  { status: "delivered", opened: true, clicked: false, weight: 5 },
  { status: "delivered", opened: false, clicked: false, weight: 6 },
  { status: "sent", opened: false, clicked: false, weight: 2 },
  { status: "bounced", opened: false, clicked: false, weight: 1 },
  { status: "queued", opened: false, clicked: false, weight: 1 },
  { status: "failed", opened: false, clicked: false, weight: 1 },
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const DAY = 86_400_000;

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Deals `total` values in roughly the given proportions, guaranteeing at least
 * one of each when there is room, then shuffles deterministically. Use this
 * wherever an empty bucket would make the UI look broken.
 */
function distribute(rng, total, spec) {
  const sum = spec.reduce((running, item) => running + item.weight, 0);
  const plan = [];
  for (const item of spec) plan.push(...Array(Math.max(1, Math.round((item.weight / sum) * total))).fill(item.value));
  while (plan.length > total) {
    // Trim from the largest group so the guaranteed minimum survives.
    const counts = plan.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map());
    const largest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    plan.splice(plan.lastIndexOf(largest), 1);
  }
  while (plan.length < total) plan.push(spec[0].value);
  for (let index = plan.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [plan[index], plan[swap]] = [plan[swap], plan[index]];
  }
  return plan;
}

function weightedPick(rng, items) {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let point = rng() * total;
  for (const item of items) {
    point -= item.weight ?? 1;
    if (point <= 0) return item;
  }
  return items[items.length - 1];
}

/* ------------------------------------------------------------------ *
 * The generator
 * ------------------------------------------------------------------ */

export function buildDemoDataset({ seed = 20260807, now = Date.now(), scale = "full" } = {}) {
  const sizes = SCALES[scale];
  if (!sizes) throw new Error(`Unknown scale "${scale}". Use one of: ${Object.keys(SCALES).join(", ")}.`);

  const rng = createRng(seed);
  const pick = (items) => items[Math.floor(rng() * items.length)];
  const pickInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const chance = (threshold) => rng() < threshold;
  const iso = (ms) => new Date(ms).toISOString();
  const daysAgo = (days, jitterHours = 8) => now - days * DAY + Math.floor((rng() - 0.5) * jitterHours * 3_600_000);

  /* -- identities ------------------------------------------------- */

  const usedEmails = new Set();
  const usedNames = new Set();

  function makeBusiness(index) {
    let name = SALON_NAMES[index % SALON_NAMES.length];
    let attempt = 1;
    while (usedNames.has(name))
      name = `${SALON_NAMES[index % SALON_NAMES.length]} ${["", "II", "III", "IV"][attempt++] || attempt}`;
    usedNames.add(name);

    const [town, postcodeArea, county] = pick(TOWNS);
    const contactName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

    let local = `${slugify(contactName.split(" ")[0])}.${slugify(name).slice(0, 18)}`;
    while (usedEmails.has(local)) local = `${local}${pickInt(1, 99)}`;
    usedEmails.add(local);

    return {
      businessName: `${name}, ${town}`,
      shortName: name,
      contactName,
      email: `${local}@${DEMO_DOMAIN}`,
      phone: `07${pickInt(100, 999)} ${pickInt(100000, 999999)}`,
      market: pick(MARKETS),
      businessType: weightedPick(rng, [
        { value: "Salon", weight: 10 },
        { value: "Spa", weight: 3 },
        { value: "Mobile professional", weight: 3 },
        { value: "Multi-site group", weight: 2 },
        { value: "Other", weight: 1 },
      ]).value,
      website: chance(0.65) ? `https://www.${slugify(name)}.co.uk` : null,
      instagram: chance(0.8) ? `@${slugify(name).replace(/-/g, "")}` : null,
      address: {
        line1: `${pickInt(1, 180)} ${pick(STREETS)}`,
        city: town,
        county,
        postcode: `${postcodeArea} ${pickInt(1, 9)}${pick(["AA", "BQ", "DR", "HJ", "LN", "PT", "SW"])}`,
        country: "United Kingdom",
      },
      town,
    };
  }

  /* -- applications ----------------------------------------------- */

  const applications = [];
  const businesses = [];

  for (let index = 0; index < sizes.applications; index += 1) {
    const business = makeBusiness(index);
    businesses.push(business);

    // Newest first in the list, so ages descend as the index grows.
    const ageDays = Math.round((index / sizes.applications) * 165) + pickInt(0, 4);

    // Recent applications are still waiting; older ones have been decided.
    let status;
    if (ageDays <= 9) status = chance(0.85) ? "pending" : "on_hold";
    else if (ageDays <= 20)
      status = weightedPick(rng, [
        { value: "pending", weight: 3 },
        { value: "approved", weight: 4 },
        { value: "on_hold", weight: 2 },
        { value: "declined", weight: 1 },
      ]).value;
    else
      status = weightedPick(rng, [
        { value: "approved", weight: 6 },
        { value: "declined", weight: 2 },
        { value: "on_hold", weight: 1 },
        { value: "pending", weight: 1 },
      ]).value;

    const createdAt = daysAgo(ageDays);
    const decided = status !== "pending";
    const reviewedAt = decided ? createdAt + pickInt(4, 96) * 3_600_000 : null;

    applications.push({
      business_name: business.businessName,
      contact_name: business.contactName,
      email: business.email,
      phone: business.phone,
      business_type: business.businessType,
      market: business.market,
      website: business.website,
      instagram: business.instagram,
      address: business.address,
      message: pick(APPLICATION_MESSAGES),
      wants_trial: chance(0.72),
      status,
      source: weightedPick(rng, [
        { value: "pro-site", weight: 8 },
        { value: "instagram", weight: 2 },
        { value: "referral", weight: 2 },
        { value: "trade-show", weight: 1 },
      ]).value,
      metadata: { demo_seed: true, seeded_at: iso(now) },
      review_note: pick(REVIEW_NOTES[status]),
      reviewed_at: reviewedAt ? iso(reviewedAt) : null,
      created_at: iso(createdAt),
      updated_at: iso(reviewedAt ?? createdAt),
      // Local join keys, stripped before insert.
      _index: index,
      _business: business,
      _createdAtMs: createdAt,
    });
  }

  /* -- reseller accounts ------------------------------------------ */

  // Approved applications become accounts, oldest first, until we hit the target.
  const approvable = applications
    .filter((application) => application.status === "approved")
    .sort((a, b) => a._createdAtMs - b._createdAtMs);

  // If the status draw came up short, promote the oldest pending ones so the
  // account count is always what the scale promises.
  if (approvable.length < sizes.accounts) {
    const extras = applications
      .filter((application) => application.status !== "approved")
      .sort((a, b) => a._createdAtMs - b._createdAtMs)
      .slice(0, sizes.accounts - approvable.length);
    for (const application of extras) {
      application.status = "approved";
      application.review_note = pick(REVIEW_NOTES.approved);
      application.reviewed_at = iso(application._createdAtMs + pickInt(4, 96) * 3_600_000);
      application.updated_at = application.reviewed_at;
      approvable.push(application);
    }
    approvable.sort((a, b) => a._createdAtMs - b._createdAtMs);
  }

  const chosen = approvable.slice(0, sizes.accounts);

  // An approved application with no account behind it is an inconsistent state
  // the real admin can never produce, so any surplus goes back to undecided.
  for (const application of approvable.slice(sizes.accounts)) {
    application.status = weightedPick(rng, [
      { value: "on_hold", weight: 3 },
      { value: "declined", weight: 3 },
      { value: "pending", weight: 2 },
    ]).value;
    application.review_note = pick(REVIEW_NOTES[application.status]);
    if (application.status === "pending") {
      application.reviewed_at = null;
      application.updated_at = application.created_at;
    } else {
      application.reviewed_at = iso(application._createdAtMs + pickInt(4, 96) * 3_600_000);
      application.updated_at = application.reviewed_at;
    }
  }

  // Same reasoning as the account quotas: no empty filter pills, whatever the
  // seed. Only applications without an account behind them can be re-labelled.
  const spare = approvable.slice(sizes.accounts).concat(applications.filter((row) => row.status !== "approved"));
  for (const status of ["pending", "declined", "on_hold"]) {
    if (applications.some((row) => row.status === status)) continue;
    // Take from the most crowded status, never the last holder of another one —
    // otherwise filling one empty bucket just empties a different bucket.
    const counts = applications.reduce((map, row) => map.set(row.status, (map.get(row.status) ?? 0) + 1), new Map());
    const victim = spare
      .filter((row) => row.status !== status && (counts.get(row.status) ?? 0) > 1)
      .sort((a, b) => (counts.get(b.status) ?? 0) - (counts.get(a.status) ?? 0))[0];
    if (!victim) continue;
    victim.status = status;
    victim.review_note = pick(REVIEW_NOTES[status]);
    victim.reviewed_at = status === "pending" ? null : iso(victim._createdAtMs + pickInt(4, 96) * 3_600_000);
    victim.updated_at = victim.reviewed_at ?? victim.created_at;
  }

  const usedCodes = new Set();
  const resellers = [];

  // Tier and status are dealt from a quota rather than drawn independently, so
  // every filter pill in the admin has at least one account behind it whatever
  // the seed. Random draws leave "suspended" empty roughly one run in eight.
  const tierPlan = distribute(rng, chosen.length, [
    { value: "standard", weight: 10 },
    { value: "silver", weight: 6 },
    { value: "gold", weight: 4 },
  ]);
  const statusPlan = distribute(rng, chosen.length, [
    { value: "active", weight: 16 },
    { value: "suspended", weight: 2 },
    { value: "closed", weight: 2 },
  ]);

  chosen.forEach((application, position) => {
    const business = application._business;
    const initials = business.shortName
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, "X");
    let code = `${DEMO_ACCOUNT_PREFIX}${initials}${(position + 1).toString().padStart(2, "0")}`;
    while (usedCodes.has(code)) code = `${DEMO_ACCOUNT_PREFIX}${initials}${pickInt(10, 99)}`;
    usedCodes.add(code);

    const tier = tierPlan[position];
    const discountPercent = tier === "gold" ? 15 : tier === "silver" ? 7.5 : 0;
    const status = statusPlan[position];

    const approvedAt = new Date(application.reviewed_at).getTime();

    resellers.push({
      account_code: code,
      business_name: application.business_name,
      contact_name: application.contact_name,
      email: application.email,
      phone: application.phone,
      market: application.market,
      pricing_tier: tier,
      discount_percent: discountPercent,
      status,
      address: business.address,
      internal_notes: chance(0.45)
        ? pick([
            "Prefers to order by phone — check in monthly.",
            "Training completed with the full team. Confident on shade selection.",
            "Pays on receipt, no credit terms needed.",
            "Watch stock around their bridal season — they run out fast.",
            "Second site opening; revisit tier when volume settles.",
          ])
        : null,
      approved_at: iso(approvedAt),
      created_at: iso(approvedAt),
      updated_at: iso(approvedAt),
      _applicationEmail: application.email,
      _approvedAtMs: approvedAt,
      _position: position,
    });
  });

  /* -- orders ------------------------------------------------------ */

  // Deliberately uneven: a few heavy accounts, a long tail, and some with no
  // orders at all so the empty states get designed too.
  const orderable = resellers.filter((reseller) => reseller.status !== "closed");
  const weights = orderable.map((_, index) => {
    if (index < Math.max(1, Math.round(orderable.length * 0.15))) return 9;
    if (index < Math.round(orderable.length * 0.55)) return 4;
    if (index < Math.round(orderable.length * 0.85)) return 1.5;
    return 0; // never orders — empty account detail page
  });

  const orders = [];
  let reference = 1;

  for (let index = 0; index < sizes.orders; index += 1) {
    const target = weightedPick(
      rng,
      orderable.map((reseller, position) => ({ value: reseller, weight: weights[position] })),
    ).value;
    if (!target) continue;

    // Orders sit between the account's approval and today, weighted towards the
    // recent end — otherwise every order ends up old enough to be shipped and
    // the "open orders" side of the admin is permanently empty.
    const spanDays = Math.max(1, Math.round((now - target._approvedAtMs) / DAY));
    const ageDays = Math.floor(spanDays * rng() ** 2.4);
    const submittedAt = now - ageDays * DAY + Math.floor((rng() - 0.5) * 10 * 3_600_000);

    const status =
      ageDays <= 3
        ? weightedPick(rng, [
            { value: "submitted", weight: 6 },
            { value: "confirmed", weight: 3 },
            { value: "cancelled", weight: 1 },
          ]).value
        : ageDays <= 10
          ? weightedPick(rng, [
              { value: "confirmed", weight: 4 },
              { value: "invoiced", weight: 4 },
              { value: "shipped", weight: 2 },
              { value: "cancelled", weight: 1 },
            ]).value
          : weightedPick(rng, [
              { value: "shipped", weight: 8 },
              { value: "invoiced", weight: 2 },
              { value: "cancelled", weight: 1 },
            ]).value;

    const confirmedAt = status === "submitted" ? null : submittedAt + pickInt(2, 40) * 3_600_000;

    // One to four distinct lines, always including the litre most of the time.
    const lineCount = pickInt(1, 4);
    const pool = [...CATALOGUE];
    const lines = [];
    for (let line = 0; line < lineCount && pool.length; line += 1) {
      const product = weightedPick(
        rng,
        pool.map((item) => ({ value: item, weight: item.weight })),
      ).value;
      pool.splice(pool.indexOf(product), 1);
      const quantity = product.sku === "MALIBU-1L" ? pickInt(1, 12) : pickInt(1, 24);
      const unitPrice = Math.round(product.trade_price_pence * (1 - target.discount_percent / 100));
      lines.push({
        sku: product.sku,
        title: product.title,
        unit_price_pence: unitPrice,
        quantity,
        line_total_pence: unitPrice * quantity,
      });
    }

    orders.push({
      reference: `${DEMO_REFERENCE_PREFIX}${new Date(submittedAt).getUTCFullYear().toString().slice(2)}${(new Date(submittedAt).getUTCMonth() + 1).toString().padStart(2, "0")}-${(reference++).toString().padStart(4, "0")}`,
      status,
      source: weightedPick(rng, [
        { value: "pro_website", weight: 7 },
        { value: "retail_website", weight: 1 },
        { value: "manual", weight: 2 },
      ]).value,
      currency:
        target.market === "UAE" ? "USD" : target.market === "IE" ? "EUR" : target.market === "AU" ? "AUD" : "GBP",
      subtotal_pence: lines.reduce((total, line) => total + line.line_total_pence, 0),
      delivery_note: pick(DELIVERY_NOTES),
      customer_note: pick(CUSTOMER_NOTES),
      internal_note: status === "submitted" ? null : pick(INTERNAL_NOTES),
      submitted_at: iso(submittedAt),
      confirmed_at: confirmedAt ? iso(confirmedAt) : null,
      created_at: iso(submittedAt),
      updated_at: iso(confirmedAt ?? submittedAt),
      _accountCode: target.account_code,
      _lines: lines,
    });
  }

  // Guarantee one of every order status, so the status filters and the
  // "open orders" figure are never empty by accident.
  for (const status of ["submitted", "confirmed", "invoiced", "shipped", "cancelled"]) {
    if (orders.some((order) => order.status === status)) continue;
    const victim = orders.find((order) => order.status !== status);
    if (!victim) continue;
    victim.status = status;
    if (status === "submitted") {
      victim.confirmed_at = null;
      victim.internal_note = null;
    } else if (!victim.confirmed_at) {
      victim.confirmed_at = iso(new Date(victim.submitted_at).getTime() + pickInt(2, 40) * 3_600_000);
    }
    victim.updated_at = victim.confirmed_at ?? victim.submitted_at;
  }

  orders.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));

  /* -- email outreach --------------------------------------------- */

  const contacts = [];
  const seenContactEmails = new Set();

  // Every applicant is a contact...
  for (const application of applications) {
    if (seenContactEmails.has(application.email)) continue;
    seenContactEmails.add(application.email);
    const [firstName, ...rest] = application.contact_name.split(" ");
    contacts.push({
      email: application.email,
      first_name: firstName,
      last_name: rest.join(" ") || null,
      business_name: application.business_name,
      market: application.market,
      timezone:
        application.market === "UAE"
          ? "Asia/Dubai"
          : application.market === "AU"
            ? "Australia/Sydney"
            : "Europe/London",
      marketing_status: application.status === "declined" ? "unsubscribed" : "eligible",
      properties: { demo_seed: true, source: application.source },
      created_at: application.created_at,
      updated_at: application.created_at,
    });
  }

  // ...plus cold prospects who never applied, which is what an outreach list
  // actually looks like.
  for (let index = contacts.length; index < sizes.contacts; index += 1) {
    const business = makeBusiness(index + sizes.applications);
    const [firstName, ...rest] = business.contactName.split(" ");
    const createdAt = daysAgo(pickInt(10, 200));
    contacts.push({
      email: business.email,
      first_name: firstName,
      last_name: rest.join(" ") || null,
      business_name: business.businessName,
      market: business.market,
      timezone:
        business.market === "UAE" ? "Asia/Dubai" : business.market === "AU" ? "Australia/Sydney" : "Europe/London",
      marketing_status: weightedPick(rng, [
        { value: "eligible", weight: 8 },
        { value: "unknown", weight: 3 },
        { value: "unsubscribed", weight: 1 },
      ]).value,
      properties: { demo_seed: true, source: "prospect-list" },
      created_at: iso(createdAt),
      updated_at: iso(createdAt),
    });
  }

  const campaigns = CAMPAIGNS.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    market: campaign.market,
    mode: campaign.mode,
    classification: campaign.classification,
    definition_version: "demo-seed.1",
    enabled: false, // never sendable, by construction
    timezone: campaign.timezone,
    local_send_hour: 10,
    config: { demo_seed: true },
  }));

  const campaignSteps = CAMPAIGNS.flatMap((campaign) =>
    campaign.steps.map((step) => ({
      campaign_id: campaign.id,
      step_key: step.step_key,
      step_number: step.step_number,
      day_offset: step.day_offset ?? null,
      trigger_name: step.trigger_name ?? null,
      template_alias: step.template_alias,
      template_id: null,
      classification: campaign.classification,
      subject: step.subject,
      required_variables: ["FIRST_NAME", "SALON_NAME"],
    })),
  );

  const enrollments = [];
  const messages = [];
  const events = [];
  const businessEvents = [];

  const enrollable = contacts.filter((contact) => contact.marketing_status !== "unsubscribed");
  let svix = 1;
  let idempotency = 1;

  for (const contact of enrollable) {
    if (!chance(0.85)) continue;

    // A contact can have a history of finished campaigns plus at most one live
    // one — which is exactly what the partial unique index in the schema allows.
    const shuffled = [...CAMPAIGNS].sort(() => rng() - 0.5).slice(0, pickInt(1, CAMPAIGNS.length));

    shuffled.forEach((campaign, position) => {
      const mustBeTerminal = position < shuffled.length - 1;
      const enrolledAt = daysAgo(pickInt(3, 150) + position * 30);
      const stepsSent = weightedPick(
        rng,
        campaign.steps.map((_, index) => ({ value: index + 1, weight: index + 1 })),
      ).value;
      const finished = stepsSent >= campaign.steps.length;

      const status = mustBeTerminal
        ? weightedPick(rng, [
            { value: "completed", weight: 6 },
            { value: "exited", weight: 4 },
          ]).value
        : finished
          ? weightedPick(rng, [
              { value: "completed", weight: 6 },
              { value: "exited", weight: 3 },
              { value: "needs_attention", weight: 1 },
            ]).value
          : weightedPick(rng, [
              { value: "active", weight: 7 },
              { value: "paused", weight: 1 },
              { value: "exited", weight: 2 },
            ]).value;

      const exited = status === "exited";

      enrollments.push({
        _key: `${campaign.id}::${contact.email}`,
        campaign_id: campaign.id,
        _contactEmail: contact.email,
        status,
        next_step: Math.min(stepsSent + 1, campaign.steps.length + 1),
        enrolled_at: iso(enrolledAt),
        next_send_at: status === "active" ? iso(now + pickInt(1, 6) * DAY) : null,
        exited_at: exited ? iso(enrolledAt + pickInt(2, 30) * DAY) : null,
        exit_reason: exited ? pick(["reply", "trial_requested", "unsubscribe", "existing_customer"]) : null,
        owner: "demo-seed",
        context: { demo_seed: true, SALON_NAME: contact.business_name },
        created_at: iso(enrolledAt),
        updated_at: iso(enrolledAt),
      });

      for (let stepIndex = 0; stepIndex < stepsSent; stepIndex += 1) {
        const step = campaign.steps[stepIndex];
        const queuedAt = enrolledAt + (step.day_offset ?? stepIndex * 4) * DAY;
        if (queuedAt > now) break;

        const outcome = weightedPick(rng, MESSAGE_OUTCOMES);
        const sentAt = outcome.status === "queued" ? null : queuedAt + pickInt(1, 90) * 60_000;
        const deliveredAt = outcome.status === "delivered" ? sentAt + pickInt(2, 240) * 1000 : null;
        const openedAt = outcome.opened ? deliveredAt + pickInt(5, 2880) * 60_000 : null;
        const clickedAt = outcome.clicked ? openedAt + pickInt(1, 120) * 60_000 : null;
        const key = `demo-${idempotency++}`;

        messages.push({
          _key: key,
          _enrollmentKey: `${campaign.id}::${contact.email}`,
          _contactEmail: contact.email,
          campaign_id: campaign.id,
          step_key: step.step_key,
          step_number: step.step_number,
          source: "sequence_engine",
          classification: campaign.classification,
          idempotency_key: key,
          template_alias: step.template_alias,
          template_id: null,
          recipient_email: contact.email,
          subject: step.subject,
          status: outcome.status,
          resend_email_id: `demo_${key}`,
          tags: { demo_seed: "true", campaign: campaign.id },
          error_message: outcome.status === "failed" ? "Demo seed: simulated provider rejection." : null,
          queued_at: iso(queuedAt),
          sent_at: sentAt ? iso(sentAt) : null,
          delivered_at: deliveredAt ? iso(deliveredAt) : null,
          first_opened_at: openedAt ? iso(openedAt) : null,
          first_clicked_at: clickedAt ? iso(clickedAt) : null,
          bounced_at: outcome.status === "bounced" ? iso(sentAt + 60_000) : null,
          failed_at: outcome.status === "failed" ? iso(queuedAt + 30_000) : null,
          created_at: iso(queuedAt),
          updated_at: iso(clickedAt ?? openedAt ?? deliveredAt ?? sentAt ?? queuedAt),
        });

        const timeline = [
          sentAt && ["email.sent", sentAt],
          deliveredAt && ["email.delivered", deliveredAt],
          openedAt && ["email.opened", openedAt],
          clickedAt && ["email.clicked", clickedAt],
          outcome.status === "bounced" && ["email.bounced", sentAt + 60_000],
          outcome.status === "failed" && ["email.failed", queuedAt + 30_000],
        ].filter(Boolean);

        for (const [type, at] of timeline) {
          events.push({
            _messageKey: key,
            svix_id: `demo_svix_${svix++}`,
            event_type: type,
            resend_email_id: `demo_${key}`,
            occurred_at: iso(at),
            received_at: iso(at + 1500),
            payload: { demo_seed: true, type },
          });
        }
      }

      if (chance(0.3)) {
        const at = enrolledAt + pickInt(1, 40) * DAY;
        if (at <= now) {
          businessEvents.push({
            external_event_id: `demo_biz_${businessEvents.length + 1}`,
            _contactEmail: contact.email,
            campaign_id: campaign.id,
            _enrollmentKey: `${campaign.id}::${contact.email}`,
            event_type: pick(["trial_requested", "sample_dispatched", "call_booked", "reply", "opening_order_placed"]),
            occurred_at: iso(at),
            data: { demo_seed: true },
            created_at: iso(at),
          });
        }
      }
    });
  }

  // Belt and braces: every seeded address is globally suppressed, so even if
  // live mode were switched on with a demo campaign enabled, nothing can send.
  const suppressions = contacts.map((contact) => ({
    email: contact.email,
    scope: "global",
    reason: "Demo seed data — not a real recipient.",
    source: "seed-demo",
    metadata: { demo_seed: true },
    created_at: contact.created_at,
  }));

  /* -- portal logins ---------------------------------------------- */

  const loginAccounts = resellers
    .filter((reseller) => reseller.status === "active")
    .slice(0, 3)
    .map((reseller) => ({
      email: reseller.email,
      password: DEMO_PASSWORD,
      account_code: reseller.account_code,
      business_name: reseller.business_name,
    }));

  return {
    meta: {
      seed,
      scale,
      generatedFor: iso(now),
      domain: DEMO_DOMAIN,
    },
    applications: applications.map(({ _index, _business, _createdAtMs, ...row }) => row),
    resellers,
    orders,
    contacts,
    campaigns,
    campaignSteps,
    enrollments,
    messages,
    events,
    businessEvents,
    suppressions,
    loginAccounts,
  };
}

export function summarise(dataset) {
  const byStatus = (rows) =>
    rows.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] ?? 0) + 1 }), {});

  return {
    applications: { total: dataset.applications.length, ...byStatus(dataset.applications) },
    resellers: { total: dataset.resellers.length, ...byStatus(dataset.resellers) },
    orders: {
      total: dataset.orders.length,
      ...byStatus(dataset.orders),
      lines: dataset.orders.reduce((total, order) => total + order._lines.length, 0),
      valuePence: dataset.orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + order.subtotal_pence, 0),
    },
    email: {
      contacts: dataset.contacts.length,
      campaigns: dataset.campaigns.length,
      enrollments: dataset.enrollments.length,
      messages: dataset.messages.length,
      events: dataset.events.length,
      businessEvents: dataset.businessEvents.length,
      suppressions: dataset.suppressions.length,
    },
  };
}
