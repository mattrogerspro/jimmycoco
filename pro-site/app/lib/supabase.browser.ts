import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupabasePublicConfig } from "./chat";

let visitorClient: SupabaseClient | null = null;
let visitorProjectUrl = "";

export function getChatVisitorClient(config: SupabasePublicConfig) {
  if (!visitorClient || visitorProjectUrl !== config.url) {
    visitorProjectUrl = config.url;
    visitorClient = createClient(config.url, config.publishableKey, {
      auth: {
        storageKey: "jc-chat-auth",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return visitorClient;
}

export function createChatStaffClient(
  config: SupabasePublicConfig,
  accessToken: string,
) {
  return createClient(config.url, config.publishableKey, {
    accessToken: async () => accessToken,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
