export type ChatConversationStatus = "open" | "closed";
export type ChatSenderKind = "visitor" | "staff" | "system";

export type ChatConversation = {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_email: string | null;
  source_path: string;
  status: ChatConversationStatus;
  assigned_to: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  conversation_id: string;
  sender_id: string;
  sender_kind: ChatSenderKind;
  body: string;
  client_nonce: string | null;
  created_at: string;
};

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};
