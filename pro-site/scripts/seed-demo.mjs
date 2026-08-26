#!/usr/bin/env node
/**
 * Seed the Jimmy Coco trade admin with demo content.
 *
 *   npm run seed:demo -- --dry-run        inspect what would be written
 *   npm run seed:demo                     wipe previous demo rows, then seed
 *   npm run seed:demo -- --scale heavy    150 applications / 60 accounts / 500 orders
 *   npm run seed:demo -- --purge          remove every demo row and stop
 *
 * Safety model. Every row this script writes is identifiable:
 *
 *   · people      → email address ends @demo.jimmycoco.pro
 *   · accounts    → account_code starts DEMO
 *   · orders      → reference starts DEMO-
 *   · campaigns   → id starts demo-
 *   · events      → svix_id starts demo_svix_ / external_event_id starts demo_biz_
 *
 * Every delete is filtered on one of those markers, so a purge cannot reach a
 * real applicant, account, order or contact. The script refuses to start if the
 * generated data violates that rule.
 *
 * Seeded campaigns are created disabled, and every seeded address is added to
 * email_suppressions with global scope — so no combination of settings can
 * cause a demo contact to be emailed.
 */

import { createClient } from "@supabase/supabase-js";
import {
  buildDemoDataset,
  summarise,
  DEMO_DOMAIN,
  DEMO_ACCOUNT_PREFIX,
  DEMO_CAMPAIGN_PREFIX,
  DEMO_REFERENCE_PREFIX,
  DEMO_PASSWORD,
  SCALES,
} from "./seed/demo-dataset.mjs";

/* ------------------------------------------------------------------ *
 * Arguments
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const options = {
    scale: "full",
    seed: 20260807,
    purge: false,
    dryRun: false,
    withAuth: true,
    password: DEMO_PASSWORD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    switch (arg) {
      case "--scale": options.scale = next(); break;
      case "--seed": options.seed = Number(next()); break;
      case "--password": options.password = next(); break;
      case "--purge": options.purge = true; break;
      case "--dry-run": options.dryRun = true; break;
      case "--no-auth": options.withAuth = false; break;
      case "--help": case "-h": options.help = true; break;
      default:
        if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}. Try --help.`);
    }
  }

  if (!SCALES[options.scale]) {
    throw new Error(`Unknown --scale "${options.scale}". Use: ${Object.keys(SCALES).join(", ")}.`);
  }
  if (!Number.isFinite(options.seed)) throw new Error("--seed must be a number.");
  return options;
}

const HELP = `
Seed the Jimmy Coco trade admin with demo content.

  --scale <light|full|heavy>   how much data (default: full)
  --seed <number>              change the data without changing the shape
  --dry-run                    print the summary, write nothing
  --purge                      delete every demo row and exit
  --no-auth                    skip creating demo portal logins
  --password <value>           password for the demo logins
  -h, --help                   this message

Scales:
${Object.entries(SCALES)
  .map(([name, sizes]) => `  ${name.padEnd(6)} ${sizes.applications} applications · ${sizes.accounts} accounts · ${sizes.orders} orders · ${sizes.contacts} contacts`)
  .join("\n")}
`;

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const CHUNK = 200;

function chunk(rows, size = CHUNK) {
  const out = [];
  for (let index = 0; index < rows.length; index += size) out.push(rows.slice(index, index + size));
  return out;
}

/** Strips the _-prefixed join keys the generator uses internally. */
function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !key.startsWith("_")));
}

const money = (pence) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

function step(message) {
  process.stdout.write(`  ${message}\n`);
}

async function insertAll(db, table, rows, { returning = "minimal", onConflict } = {}) {
  const collected = [];
  for (const batch of chunk(rows)) {
    const query = onConflict
      ? db.from(table).upsert(batch.map(clean), { onConflict })
      : db.from(table).insert(batch.map(clean));
    const { data, error } = returning === "minimal" ? await query : await query.select(returning);
    if (error) throw new Error(`insert into ${table} failed: ${error.message}${error.details ? ` (${error.details})` : ""}`);
    if (data) collected.push(...data);
  }
  return collected;
}

/* ------------------------------------------------------------------ *
 * Guard: prove every row is identifiable as demo data before we write
 * ------------------------------------------------------------------ */

function assertSafelyMarked(dataset) {
  const problems = [];
  const suffix = `@${DEMO_DOMAIN}`;
  const emailed = [
    ["applications", dataset.applications],
    ["resellers", dataset.resellers],
    ["contacts", dataset.contacts],
    ["suppressions", dataset.suppressions],
  ];

  for (const [name, rows] of emailed) {
    for (const row of rows) {
      const email = row.email ?? row.recipient_email;
      if (!email?.endsWith(suffix)) problems.push(`${name}: ${email} is not on ${DEMO_DOMAIN}`);
    }
  }
  for (const row of dataset.messages) {
    if (!row.recipient_email.endsWith(suffix)) problems.push(`messages: ${row.recipient_email} is not on ${DEMO_DOMAIN}`);
  }
  for (const row of dataset.resellers) {
    if (!row.account_code.startsWith(DEMO_ACCOUNT_PREFIX)) problems.push(`resellers: ${row.account_code} is not prefixed ${DEMO_ACCOUNT_PREFIX}`);
  }
  for (const row of dataset.orders) {
    if (!row.reference.startsWith(DEMO_REFERENCE_PREFIX)) problems.push(`orders: ${row.reference} is not prefixed ${DEMO_REFERENCE_PREFIX}`);
  }
  for (const row of dataset.campaigns) {
    if (!row.id.startsWith(DEMO_CAMPAIGN_PREFIX)) problems.push(`campaigns: ${row.id} is not prefixed ${DEMO_CAMPAIGN_PREFIX}`);
    if (row.enabled) problems.push(`campaigns: ${row.id} must be seeded disabled`);
  }

  if (problems.length) {
    throw new Error(`Refusing to seed — demo markers missing:\n  ${problems.slice(0, 10).join("\n  ")}`);
  }
}

/* ------------------------------------------------------------------ *
 * Purge — every filter is a demo marker, never a bare "delete all"
 * ------------------------------------------------------------------ */

async function purge(db, { withAuth }) {
  const like = `%@${DEMO_DOMAIN}`;
  const removed = {};

  const count = async (table, apply) => {
    const { count: total, error } = await apply(db.from(table).select("*", { count: "exact", head: true }));
    if (error) throw new Error(`counting ${table} failed: ${error.message}`);
    return total ?? 0;
  };
  const wipe = async (table, apply) => {
    const before = await count(table, apply);
    if (before === 0) return 0;
    const { error } = await apply(db.from(table).delete());
    if (error) throw new Error(`deleting from ${table} failed: ${error.message}`);
    // Some tables are wiped in batches, so accumulate rather than overwrite.
    removed[table] = (removed[table] ?? 0) + before;
    return before;
  };

  // Ids we need before their owning rows disappear.
  const { data: demoContacts } = await db.from("email_contacts").select("id").ilike("email", like);
  const contactIds = (demoContacts ?? []).map((row) => row.id);

  await wipe("email_events", (q) => q.like("svix_id", "demo_svix_%"));
  await wipe("email_business_events", (q) => q.like("external_event_id", "demo_biz_%"));
  await wipe("email_messages", (q) => q.ilike("recipient_email", like));
  if (contactIds.length) {
    for (const batch of chunk(contactIds)) {
      await wipe("email_jobs", (q) => q.in("contact_id", batch));
      await wipe("email_enrollments", (q) => q.in("contact_id", batch));
    }
  }
  await wipe("email_contacts", (q) => q.ilike("email", like));
  await wipe("email_suppressions", (q) => q.ilike("email", like));
  await wipe("email_campaign_steps", (q) => q.like("campaign_id", `${DEMO_CAMPAIGN_PREFIX}%`));
  await wipe("email_campaigns", (q) => q.like("id", `${DEMO_CAMPAIGN_PREFIX}%`));

  // Clear draft invoices before their order links are removed. The invoice-line
  // safeguard then evaluates the still-present parent as a draft. Issued
  // invoices remain immutable and are deliberately excluded.
  const { data: demoDraftInvoices } = await db
    .from("invoices")
    .select("id")
    .like("internal_note", "DEMO seed invoice:%")
    .eq("status", "draft");
  const draftInvoiceIds = (demoDraftInvoices ?? []).map((row) => row.id);
  for (const batch of chunk(draftInvoiceIds)) {
    await wipe("invoice_payments", (q) => q.in("invoice_id", batch));
    await wipe("invoice_lines", (q) => q.in("invoice_id", batch));
    await wipe("invoices", (q) => q.in("id", batch).eq("status", "draft"));
  }

  // Remove completed demo orders, then retain only reseller accounts that carry
  // immutable issued demo invoices. Their refreshed seed row is upserted below.
  const { data: demoOrders } = await db
    .from("reseller_orders")
    .select("id")
    .like("reference", `${DEMO_REFERENCE_PREFIX}%`);
  const orderIds = (demoOrders ?? []).map((row) => row.id);
  for (const batch of chunk(orderIds)) {
    await wipe("reseller_order_items", (q) => q.in("order_id", batch));
  }
  await wipe("reseller_orders", (q) => q.like("reference", `${DEMO_REFERENCE_PREFIX}%`));

  const { data: demoResellers, error: demoResellersError } = await db
    .from("resellers")
    .select("id")
    .ilike("email", like);
  if (demoResellersError) throw new Error(`reading demo reseller accounts failed: ${demoResellersError.message}`);
  const demoResellerIds = (demoResellers ?? []).map((row) => row.id);
  const { data: immutableDemoInvoices, error: immutableDemoInvoicesError } = demoResellerIds.length
    ? await db.from("invoices").select("reseller_id").in("reseller_id", demoResellerIds).neq("status", "draft")
    : { data: [], error: null };
  if (immutableDemoInvoicesError) throw new Error(`reading issued demo invoices failed: ${immutableDemoInvoicesError.message}`);
  const retainedResellerIds = new Set((immutableDemoInvoices ?? []).map((row) => row.reseller_id));
  const removableResellerIds = demoResellerIds.filter((id) => !retainedResellerIds.has(id));
  for (const batch of chunk(removableResellerIds)) {
    await wipe("resellers", (q) => q.in("id", batch));
  }
  if (retainedResellerIds.size) step(`retaining ${retainedResellerIds.size} demo account(s) with issued invoices`);
  await wipe("reseller_applications", (q) => q.ilike("email", like));

  if (withAuth) {
    let page = 1;
    let deleted = 0;
    for (;;) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(`listing auth users failed: ${error.message}`);
      const users = data?.users ?? [];
      for (const user of users) {
        if (user.email?.endsWith(`@${DEMO_DOMAIN}`)) {
          const { error: deleteError } = await db.auth.admin.deleteUser(user.id);
          if (deleteError) throw new Error(`deleting auth user ${user.email} failed: ${deleteError.message}`);
          deleted += 1;
        }
      }
      if (users.length < 200) break;
      page += 1;
    }
    if (deleted) removed["auth.users"] = deleted;
  }

  return removed;
}

/* ------------------------------------------------------------------ *
 * Apply
 * ------------------------------------------------------------------ */

async function apply(db, dataset, { withAuth, password }) {
  step("applications…");
  const applications = await insertAll(
    db,
    "reseller_applications",
    dataset.applications.map((application) => ({ ...clean(application), data_mode: "demo" })),
    { returning: "id, email" },
  );
  const applicationByEmail = new Map(applications.map((row) => [String(row.email).toLowerCase(), row.id]));

  step("reseller accounts…");
  const resellerRows = dataset.resellers.map((reseller) => ({
    ...clean(reseller),
    application_id: applicationByEmail.get(reseller._applicationEmail.toLowerCase()) ?? null,
    data_mode: "demo",
  }));
  const resellers = await insertAll(db, "resellers", resellerRows, {
    returning: "id, account_code, email",
    onConflict: "account_code",
  });
  const resellerByCode = new Map(resellers.map((row) => [row.account_code, row.id]));

  step("orders…");
  const orderRows = dataset.orders.map((order) => ({
    ...clean(order),
    reseller_id: resellerByCode.get(order._accountCode),
    data_mode: "demo",
  }));
  const orders = await insertAll(db, "reseller_orders", orderRows, { returning: "id, reference" });
  const orderByReference = new Map(orders.map((row) => [row.reference, row.id]));

  step("order lines…");
  const lineRows = dataset.orders.flatMap((order) =>
    order._lines.map((line) => ({ ...line, order_id: orderByReference.get(order.reference) })),
  );
  await insertAll(db, "reseller_order_items", lineRows);
  // Give the admin a bounded set of real draft invoices to exercise the
  // order → invoice → issue → payment journey. Drafts remain safely reseedable.
  step("draft invoices…");
  const invoiceOrders = dataset.orders
    .filter((order) => order.status !== "cancelled")
    .slice(0, Math.min(24, dataset.orders.length));
  const invoiceRows = invoiceOrders.map((order) => ({
    reseller_id: resellerByCode.get(order._accountCode),
    order_id: orderByReference.get(order.reference),
    currency: order.currency || "GBP",
    customer_note: order.customer_note ?? null,
    internal_note: `DEMO seed invoice: ${order.reference}`,
    data_mode: "demo",
  }));
  const invoices = await insertAll(db, "invoices", invoiceRows, { returning: "id, order_id" });
  const invoiceByOrderId = new Map(invoices.map((invoice) => [invoice.order_id, invoice.id]));
  const invoiceLineRows = invoiceOrders.flatMap((order) => {
    const orderId = orderByReference.get(order.reference);
    const invoiceId = invoiceByOrderId.get(orderId);
    if (!invoiceId) return [];
    return order._lines.map((line, index) => ({
      invoice_id: invoiceId,
      sku: line.sku,
      title: line.title,
      quantity: line.quantity,
      unit_price_pence: line.unit_price_pence,
      vat_rate_bps: 0,
      net_pence: line.line_total_pence,
      vat_pence: 0,
      gross_pence: line.line_total_pence,
      sort_order: index + 1,
    }));
  });
  await insertAll(db, "invoice_lines", invoiceLineRows);

  step("campaigns…");
  await insertAll(db, "email_campaigns", dataset.campaigns);
  await insertAll(db, "email_campaign_steps", dataset.campaignSteps);

  step("contacts and suppressions…");
  const contacts = await insertAll(db, "email_contacts", dataset.contacts, { returning: "id, email" });
  const contactByEmail = new Map(contacts.map((row) => [String(row.email).toLowerCase(), row.id]));
  await insertAll(db, "email_suppressions", dataset.suppressions);

  step("enrollments and messages…");
  const enrollmentRows = dataset.enrollments.map((enrollment) => ({
    ...clean(enrollment),
    contact_id: contactByEmail.get(enrollment._contactEmail.toLowerCase()),
  }));
  const enrollments = await insertAll(db, "email_enrollments", enrollmentRows, { returning: "id, campaign_id, contact_id" });
  const contactIdToEmail = new Map(contacts.map((row) => [row.id, String(row.email).toLowerCase()]));
  const enrollmentByKey = new Map(
    enrollments.map((row) => [`${row.campaign_id}::${contactIdToEmail.get(row.contact_id)}`, row.id]),
  );

  const messageRows = dataset.messages.map((message) => ({
    ...clean(message),
    contact_id: contactByEmail.get(message._contactEmail.toLowerCase()),
    enrollment_id: enrollmentByKey.get(message._enrollmentKey.toLowerCase()) ?? enrollmentByKey.get(message._enrollmentKey) ?? null,
  }));
  const messages = await insertAll(db, "email_messages", messageRows, { returning: "id, idempotency_key" });
  const messageByKey = new Map(messages.map((row) => [row.idempotency_key, row.id]));

  step("delivery events…");
  await insertAll(
    db,
    "email_events",
    dataset.events.map((event) => ({ ...clean(event), message_id: messageByKey.get(event._messageKey) ?? null })),
  );
  await insertAll(
    db,
    "email_business_events",
    dataset.businessEvents.map((event) => ({
      ...clean(event),
      contact_id: contactByEmail.get(event._contactEmail.toLowerCase()),
      enrollment_id: enrollmentByKey.get(event._enrollmentKey) ?? null,
    })),
  );

  const logins = [];
  if (withAuth) {
    step("portal logins…");
    for (const account of dataset.loginAccounts) {
      const { data, error } = await db.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { demo_seed: true, business_name: account.business_name },
      });
      if (error) throw new Error(`creating demo login ${account.email} failed: ${error.message}`);

      const { error: linkError } = await db
        .from("resellers")
        .update({ user_id: data.user.id })
        .eq("account_code", account.account_code);
      if (linkError) throw new Error(`linking ${account.account_code} to its login failed: ${linkError.message}`);

      logins.push({ ...account, password });
    }
  }

  return { logins };
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
        "Run it through the npm script, which loads .env.local for you: npm run seed:demo",
    );
  }

  const dataset = buildDemoDataset({ seed: options.seed, scale: options.scale });
  assertSafelyMarked(dataset);
  const summary = summarise(dataset);

  process.stdout.write(`\nJimmy Coco demo seed — scale "${options.scale}", seed ${options.seed}\n`);
  process.stdout.write(`Target: ${url}\n\n`);

  if (options.dryRun) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n\n`);
    process.stdout.write("Sample application:\n");
    process.stdout.write(`${JSON.stringify(dataset.applications[0], null, 2)}\n\n`);
    process.stdout.write("Sample order:\n");
    process.stdout.write(`${JSON.stringify({ ...dataset.orders[0], _lines: dataset.orders[0]._lines }, null, 2)}\n\n`);
    process.stdout.write("Dry run — nothing was written.\n");
    return;
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  process.stdout.write("Removing any previous demo rows…\n");
  const removed = await purge(db, { withAuth: true });
  const removedTotal = Object.values(removed).reduce((total, value) => total + value, 0);
  step(removedTotal ? Object.entries(removed).map(([table, n]) => `${table}: ${n}`).join(", ") : "nothing to remove");

  if (options.purge) {
    process.stdout.write("\nPurge complete. No new data was written.\n");
    return;
  }

  process.stdout.write("\nWriting demo content…\n");
  const { logins } = await apply(db, dataset, options);

  process.stdout.write("\nDone.\n\n");
  process.stdout.write(`  Applications  ${summary.applications.total} `);
  process.stdout.write(`(${summary.applications.pending ?? 0} pending, ${summary.applications.approved ?? 0} approved, ${summary.applications.declined ?? 0} declined, ${summary.applications.on_hold ?? 0} on hold)\n`);
  process.stdout.write(`  Accounts      ${summary.resellers.total} `);
  process.stdout.write(`(${summary.resellers.active ?? 0} active, ${summary.resellers.suspended ?? 0} suspended, ${summary.resellers.closed ?? 0} closed)\n`);
  process.stdout.write(`  Orders        ${summary.orders.total} across ${summary.orders.lines} lines, ${money(summary.orders.valuePence)} excluding cancellations\n`);
  process.stdout.write(`  Email         ${summary.email.contacts} contacts, ${summary.email.enrollments} enrollments, ${summary.email.messages} messages, ${summary.email.events} events\n`);

  if (logins.length) {
    process.stdout.write("\nPortal logins (password is the same for all three):\n");
    for (const login of logins) {
      process.stdout.write(`  ${login.email}  ${login.account_code}  ${login.business_name}\n`);
    }
    process.stdout.write(`\n  password: ${logins[0].password}\n`);
  }

  process.stdout.write(`\nRemove it all again with:  npm run seed:demo -- --purge\n`);
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n\n`);
  process.exitCode = 1;
});
