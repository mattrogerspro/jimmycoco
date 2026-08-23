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
  last_visitor_message_at: string | null;
  last_staff_message_at: string | null;
  escalated_at: string | null;
  escalation_email_resend_id: string | null;
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

export type ChatStaffPresence = {
  staffId: string;
  name: string;
  onlineAt: string;
};

export const CHAT_STAFF_PRESENCE_CHANNEL = "chat:staff-presence";
export const CHAT_ESCALATION_DEFAULT_MINUTES = 10;

export function countStaffPresence(state: Record<string, unknown[]>) {
  return Object.values(state).reduce((total, presences) => total + presences.length, 0);
}
