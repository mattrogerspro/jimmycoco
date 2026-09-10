#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const unexpectedArgs = process.argv.slice(2).filter((arg) => arg !== "--" && arg !== "--dry-run");
if (unexpectedArgs.length) {
  throw new Error("Unknown argument: " + unexpectedArgs[0] + ". Supported option: --dry-run");
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
}

const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function accountCodeFor(application, usedCodes) {
  const prefix = application.business_name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const seed = Number.parseInt(application.id.replaceAll("-", "").slice(0, 8), 16);

  for (let offset = 0; offset < 10000; offset += 1) {
    const suffix = String((seed + offset) % 10000).padStart(4, "0");
    const code = prefix + suffix;
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }
  throw new Error("Could not allocate an account code for " + application.business_name);
}

function line(message) {
  process.stdout.write(message + "\n");
}

const { data: applications, error: applicationsError } = await db
  .from("reseller_applications")
  .select("id, business_name, contact_name, email, phone, market, address, status, data_mode, reviewed_at")
  .eq("data_mode", "live");
if (applicationsError) throw new Error("Could not load applications: " + applicationsError.message);

const { data: accounts, error: accountsError } = await db
  .from("resellers")
  .select("id, application_id, account_code, status");
if (accountsError) throw new Error("Could not load accounts: " + accountsError.message);

const applicationById = new Map((applications ?? []).map((application) => [application.id, application]));
const accountByApplication = new Map(
  (accounts ?? []).filter((account) => account.application_id).map((account) => [account.application_id, account]),
);
const usedCodes = new Set((accounts ?? []).map((account) => account.account_code));

const approved = (applications ?? []).filter((application) => application.status === "approved");
const missing = approved.filter((application) => !accountByApplication.has(application.id));
const reactivate = approved.filter((application) => {
  const account = accountByApplication.get(application.id);
  return account && account.status !== "active";
});
const suspend = (accounts ?? []).filter((account) => {
  if (!account.application_id || account.status !== "active") return false;
  const application = applicationById.get(account.application_id);
  return application && application.status !== "approved";
});

line((dryRun ? "Dry run: " : "") + approved.length + " approved applications found.");
line(missing.length + " missing accounts will be created.");
line(reactivate.length + " approved linked accounts will be activated.");
line(suspend.length + " unapproved linked active accounts will be suspended.");

for (const application of missing) line("  CREATE  " + application.business_name);
for (const application of reactivate) line("  ACTIVATE " + application.business_name);
for (const account of suspend) {
  const application = applicationById.get(account.application_id);
  line("  SUSPEND  " + (application?.business_name || account.account_code));
}

if (dryRun) process.exit(0);

for (const application of missing) {
  const approvedAt = application.reviewed_at || new Date().toISOString();
  const { error } = await db.from("resellers").insert({
    application_id: application.id,
    account_code: accountCodeFor(application, usedCodes),
    business_name: application.business_name,
    contact_name: application.contact_name,
    email: application.email,
    phone: application.phone,
    market: application.market,
    address: application.address || {},
    shipping_address: application.address || {},
    pricing_tier: "standard",
    discount_percent: 0,
    status: "active",
    data_mode: application.data_mode,
    approved_at: approvedAt,
  });
  if (error) throw new Error("Could not create " + application.business_name + ": " + error.message);
}

for (const application of reactivate) {
  const account = accountByApplication.get(application.id);
  const { error } = await db
    .from("resellers")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (error) throw new Error("Could not activate " + application.business_name + ": " + error.message);
}

for (const account of suspend) {
  const { error } = await db
    .from("resellers")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (error) throw new Error("Could not suspend " + account.account_code + ": " + error.message);
}

line("Account backfill complete.");
