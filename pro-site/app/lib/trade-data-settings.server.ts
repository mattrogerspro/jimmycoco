import type { SupabaseClient } from "@supabase/supabase-js";

export type TradeDataSettings = {
  create_new_records_as_demo: boolean;
  updated_at: string;
};

export function visibilityFromTradeDataSettings(settings: TradeDataSettings) {
  return { showDemoData: settings.create_new_records_as_demo };
}

export async function getTradeDataVisibility(supabase: SupabaseClient) {
  return visibilityFromTradeDataSettings(await getTradeDataSettings(supabase));
}

export async function getTradeDataSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("trade_data_settings")
    .select("create_new_records_as_demo, updated_at")
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load data-mode settings: ${error.message}`);
  if (!data) throw new Error("Data-mode settings are missing. Apply the Demo/Live migration first.");
  return data as TradeDataSettings;
}

export async function updateTradeDataSettings(supabase: SupabaseClient, createNewRecordsAsDemo: boolean) {
  const { error } = await supabase
    .from("trade_data_settings")
    .update({ create_new_records_as_demo: createNewRecordsAsDemo })
    .eq("id", true);

  if (error) throw new Error(`Could not save data-mode settings: ${error.message}`);
}
