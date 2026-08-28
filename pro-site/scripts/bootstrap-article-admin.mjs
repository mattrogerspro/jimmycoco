//bootstrap-articlesdsfdsfdsf
import { createClient } from "@supabase/supabase-js";

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  console.error(`Bootstrap stopped: ${message}`);
  process.exit(1);
}

const email = readFlag("--email")?.trim().toLowerCase();
const displayName = readFlag("--name")?.trim();
const apply = process.argv.includes("--apply");
const createUser = process.argv.includes("--create-user");
const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !email.includes("@")) fail("pass a valid --email address.");
if (!displayName) fail("pass the administrator's --name.");
if (!supabaseUrl) fail("SUPABASE_URL is missing.");
if (!secretKey) fail("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is missing.");

const projectHost = new URL(supabaseUrl).host;
const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail() {
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) fail(`could not inspect Auth users (${error.message}).`);

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 100) return null;
  }

  fail("the Auth user search exceeded 10,000 users.");
}

const { data: activeAdmins, error: adminError } = await supabase
  .from("article_admin_profiles")
  .select("user_id")
  .eq("role", "admin")
  .eq("is_active", true);

if (adminError) fail(`could not inspect administrator profiles (${adminError.message}).`);

let user = await findUserByEmail();
const targetAlreadyAdmin = user
  ? activeAdmins?.some((profile) => profile.user_id === user.id)
  : false;

if ((activeAdmins?.length ?? 0) > 0 && !targetAlreadyAdmin) {
  fail("an active administrator already exists; use the protected admin workflow to add staff.");
}

console.log(`Project: ${projectHost}`);
console.log(`Account: ${email}`);
console.log(`Auth user: ${user ? "exists" : "not found"}`);
console.log(`Active article admin: ${targetAlreadyAdmin ? "already assigned" : "not assigned"}`);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to make this one-time change.");
  if (!user && createUser) {
    console.log("The Auth user would be created without sending an email.");
  } else if (!user) {
    console.log("Create the Auth user first, or add --create-user and provide ARTICLE_ADMIN_INITIAL_PASSWORD.");
  }
  process.exit(0);
}

if (!user && !createUser) {
  fail("the Auth user does not exist; add --create-user or create the user in Supabase first.");
}

if (!user) {
  const password = process.env.ARTICLE_ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 12) {
    fail("ARTICLE_ADMIN_INITIAL_PASSWORD must contain at least 12 characters.");
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error || !data.user) {
    fail(`could not create the Auth user (${error?.message ?? "unknown error"}).`);
  }

  user = data.user;
}

const { error: profileError } = await supabase.from("article_admin_profiles").upsert({
  user_id: user.id,
  display_name: displayName,
  role: "admin",
  is_active: true,
  created_by: user.id,
});

if (profileError) fail(`could not assign article admin access (${profileError.message}).`);

console.log(targetAlreadyAdmin ? "Administrator access is already correct." : "First article administrator created.");
