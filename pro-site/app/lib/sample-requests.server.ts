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

export type SampleRequestInput = Pick<
  SampleRequest,
  "business_name" | "contact_name" | "email" | "sample_shipped" | "tracking_details"
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

export async function createSampleRequest(supabase: SupabaseClient, input: SampleRequestInput) {
  const { error } = await supabase.from("sample_requests").insert(input);
  if (error) throw new Error("Could not add the sample request: " + error.message);
}

export async function updateSampleRequest(
  supabase: SupabaseClient,
  id: string,
  input: SampleRequestInput,
) {
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("sample_requests")
    .update({ ...input, updated_at: updatedAt })
    .eq("id", id)
    .select("reseller_application_id")
    .single();

  if (error) throw new Error("Could not update the sample request: " + error.message);

  if (data.reseller_application_id) {
    const applicationPatch: Record<string, unknown> = {
      business_name: input.business_name,
      contact_name: input.contact_name,
      wants_trial: true,
      status: "approved",
      updated_at: updatedAt,
    };
    if (input.email) applicationPatch.email = input.email;

    const { error: applicationError } = await supabase
      .from("reseller_applications")
      .update(applicationPatch)
      .eq("id", data.reseller_application_id);

    if (applicationError) {
      throw new Error("The sample was updated, but its application could not be updated: " + applicationError.message);
    }
  }
}
