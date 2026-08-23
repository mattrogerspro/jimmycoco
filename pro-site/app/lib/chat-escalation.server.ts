import type { SupabaseClient } from "@supabase/supabase-js";
import { CHAT_ESCALATION_DEFAULT_MINUTES, type ChatConversation, type ChatMessage } from "./chat";
import { INTERNAL_NOTICE_ADDRESS } from "./reseller-events.server";
import { createSupabaseServiceClient } from "./supabase.server";

const DEFAULT_FROM = "Sunless Partnerships <partnerships@email.jimmycoco.pro>";
const DEFAULT_REPLY_TO = "partnerships@email.jimmycoco.pro";

type EscalationCandidate = Pick<
  ChatConversation,
  | "id"
  | "visitor_name"
  | "visitor_email"
  | "source_path"
  | "last_visitor_message_at"
  | "last_staff_message_at"
  | "escalated_at"
>;

type LatestVisitorMessage = Pick<ChatMessage, "body" | "created_at">;

export type ChatEscalationResult = {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
};

function escalationMinutes() {
  const value = Number(process.env.CHAT_ESCALATION_MINUTES ?? CHAT_ESCALATION_DEFAULT_MINUTES);
  if (!Number.isFinite(value)) return CHAT_ESCALATION_DEFAULT_MINUTES;
  return Math.min(1440, Math.max(2, Math.round(value)));
}

function batchSize() {
  const value = Number(process.env.CHAT_ESCALATION_BATCH_SIZE ?? 10);
  if (!Number.isFinite(value)) return 10;
  return Math.min(50, Math.max(1, Math.round(value)));
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteOrigin() {
  return (process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://www.jimmycoco.pro")
    .replace(/\/$/, "");
}

function isStillUnanswered(conversation: EscalationCandidate) {
  if (!conversation.last_visitor_message_at || conversation.escalated_at) return false;
  if (!conversation.last_staff_message_at) return true;
  return new Date(conversation.last_staff_message_at).getTime()
    < new Date(conversation.last_visitor_message_at).getTime();
}

async function latestVisitorMessage(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<LatestVisitorMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("body, created_at")
    .eq("conversation_id", conversationId)
    .eq("sender_kind", "visitor")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as LatestVisitorMessage | null;
}

async function claimConversation(supabase: SupabaseClient, conversationId: string, timestamp: string) {
  const { data, error } = await supabase
    .from("chat_conversations")
    .update({ escalated_at: timestamp, updated_at: timestamp })
    .eq("id", conversationId)
    .is("escalated_at", null)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function releaseConversation(supabase: SupabaseClient, conversationId: string) {
  await supabase
    .from("chat_conversations")
    .update({ escalated_at: null, escalation_email_resend_id: null })
    .eq("id", conversationId);
}

function escalationEmailHtml(options: {
  conversation: EscalationCandidate;
  latestMessage: LatestVisitorMessage;
  minutes: number;
  adminUrl: string;
}) {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#f4f0eb;color:#1d1815;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:28px 18px"><section style="background:#fff;padding:30px;border-top:6px solid #a46138"><p style="margin:0 0 20px;color:#0d2c37;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Sunless by Jimmy Coco Professional</p><h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;font-weight:400">Unanswered website chat</h1><p style="margin:0 0 22px;color:#514a45;line-height:1.65"><strong>${escapeHtml(options.conversation.visitor_name)}</strong> has been waiting for more than ${options.minutes} minutes.</p><div style="margin:0 0 22px;padding:18px;background:#f4f0eb;color:#302722;line-height:1.6"><strong style="display:block;margin-bottom:8px">Latest message</strong>${escapeHtml(options.latestMessage.body)}</div><p style="margin:0 0 22px;color:#514a45;line-height:1.65">Email: ${escapeHtml(options.conversation.visitor_email || "Not supplied")}<br>Started from: ${escapeHtml(options.conversation.source_path)}</p><a href="${escapeHtml(options.adminUrl)}" style="display:inline-block;padding:13px 18px;background:#a46138;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Open live chat</a></section></main></body></html>`;
}

async function sendEscalationEmail(options: {
  conversation: EscalationCandidate;
  latestMessage: LatestVisitorMessage;
  minutes: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Chat escalation email delivery is not configured. Set RESEND_API_KEY.");
  }

  const adminUrl = `${siteOrigin()}/admin/chat`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `chat-escalation-${options.conversation.id}-${options.conversation.last_visitor_message_at}`,
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: [INTERNAL_NOTICE_ADDRESS],
      reply_to: process.env.RESEND_REPLY_TO || DEFAULT_REPLY_TO,
      subject: `Unanswered website chat from ${options.conversation.visitor_name}`,
      html: escalationEmailHtml({ ...options, adminUrl }),
      text: `Unanswered website chat\n\n${options.conversation.visitor_name} has been waiting for more than ${options.minutes} minutes.\n\nLatest message:\n${options.latestMessage.body}\n\nEmail: ${options.conversation.visitor_email || "Not supplied"}\nStarted from: ${options.conversation.source_path}\n\nOpen live chat: ${adminUrl}`,
      tags: [
        { name: "type", value: "chat_escalation" },
        { name: "conversation_id", value: options.conversation.id },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!response.ok || !payload.id) {
    throw new Error(`Could not send chat escalation: ${payload.message ?? payload.name ?? `Resend returned ${response.status}`}`);
  }
  return payload.id;
}

export async function processChatEscalations(): Promise<ChatEscalationResult> {
  const supabase = createSupabaseServiceClient();
  const minutes = escalationMinutes();
  const threshold = new Date(Date.now() - minutes * 60_000).toISOString();
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, visitor_name, visitor_email, source_path, last_visitor_message_at, last_staff_message_at, escalated_at")
    .eq("status", "open")
    .is("escalated_at", null)
    .not("last_visitor_message_at", "is", null)
    .lt("last_visitor_message_at", threshold)
    .order("last_visitor_message_at", { ascending: true })
    .limit(batchSize());

  if (error) throw error;

  const candidates = ((data ?? []) as EscalationCandidate[]).filter(isStillUnanswered);
  const result: ChatEscalationResult = {
    checked: data?.length ?? 0,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const conversation of candidates) {
    const claimedAt = new Date().toISOString();
    try {
      const claimed = await claimConversation(supabase, conversation.id, claimedAt);
      if (!claimed) {
        result.skipped += 1;
        continue;
      }

      const latestMessage = await latestVisitorMessage(supabase, conversation.id);
      if (!latestMessage) {
        await releaseConversation(supabase, conversation.id);
        result.skipped += 1;
        continue;
      }

      const resendId = await sendEscalationEmail({ conversation, latestMessage, minutes });
      const { error: updateError } = await supabase
        .from("chat_conversations")
        .update({ escalation_email_resend_id: resendId, updated_at: new Date().toISOString() })
        .eq("id", conversation.id);

      if (updateError) throw updateError;
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      console.error("[chat-escalation] failed", {
        conversationId: conversation.id,
        error: error instanceof Error ? error.message : String(error),
      });
      await releaseConversation(supabase, conversation.id);
    }
  }

  return result;
}
