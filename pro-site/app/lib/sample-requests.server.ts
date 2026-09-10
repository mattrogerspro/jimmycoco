import type { SupabaseClient } from "@supabase/supabase-js";

export type SampleAddress = {
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
};

export type SampleRequest = {
  id: string;
  reseller_application_id: string | null;
  business_name: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  market: string;
  address: SampleAddress;
  sample_shipped: boolean;
  tracking_details: string | null;
  created_at: string;
  updated_at: string;
};

export type SampleRequestUpdate = Pick<
  SampleRequest,
  "sample_shipped" | "tracking_details"
>;

const COLUMNS = "id, reseller_application_id, business_name, contact_name, email, phone, market, address, sample_shipped, tracking_details, created_at, updated_at";

export async function listSampleRequests(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("sample_requests")
    .select(COLUMNS)
    .order("sample_shipped", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load sample requests: " + error.message);
  return (data ?? []) as SampleRequest[];
}

export async function updateSampleRequest(
  supabase: SupabaseClient,
  id: string,
  input: SampleRequestUpdate,
) {
  const { error } = await supabase
    .from("sample_requests")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error("Could not update the sample request: " + error.message);
}
