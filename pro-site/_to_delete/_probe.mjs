import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(url, key, { auth: { persistSession: false } });
for (const t of ["reseller_applications","resellers","reseller_orders","reseller_order_items","reseller_products","email_contacts","email_campaigns","email_enrollments","email_messages","email_events","email_business_events","email_suppressions","email_jobs"]) {
  const { count, error } = await db.from(t).select("*", { count: "exact", head: true });
  console.log(t.padEnd(24), error ? "ERR " + error.message : count);
}
const { data: camps } = await db.from("email_campaigns").select("id,name,mode,classification,enabled,timezone,definition_version,market");
console.log("campaigns:", JSON.stringify(camps));
