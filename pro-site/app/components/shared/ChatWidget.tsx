import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import type { RealtimeChannel, SupabaseClient, User } from "@supabase/supabase-js";
import type { ChatConversation, ChatMessage, SupabasePublicConfig } from "../../lib/chat";

type ChatWidgetProps = {
  config: SupabasePublicConfig;
};

type WidgetState = "closed" | "starting" | "intro" | "chat" | "unavailable";

function mergeMessage(messages: ChatMessage[], incoming: ChatMessage) {
  if (messages.some((message) => message.id === incoming.id)) return messages;
  return [...messages, incoming].sort((a, b) => a.id - b.id);
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function getOrCreateUser(client: SupabaseClient): Promise<User> {
  const { data: sessionData } = await client.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("Anonymous chat sign-in failed.");
  return data.user;
}

export function ChatWidget({ config }: ChatWidgetProps) {
  const location = useLocation();
  const [widgetState, setWidgetState] = useState<WidgetState>("closed");
  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const isPrivateArea = location.pathname.startsWith("/admin")
    || location.pathname.startsWith("/portal");

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, widgetState]);

  useEffect(() => {
    if (!client || !conversation || widgetState === "closed") return;

    if (channelRef.current) client.removeChannel(channelRef.current);
    const channel = client
      .channel(`chat-widget-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((current) => mergeMessage(current, payload.new as ChatMessage));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => setConversation(payload.new as ChatConversation),
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [client, conversation?.id, widgetState]);

  if (isPrivateArea) return null;

  async function loadConversation(activeClient: SupabaseClient, activeUser: User) {
    const { data: existing, error: conversationError } = await activeClient
      .from("chat_conversations")
      .select("*")
      .eq("visitor_id", activeUser.id)
      .eq("status", "open")
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!existing) {
      setWidgetState("intro");
      return;
    }

    const activeConversation = existing as ChatConversation;
    const { data: existingMessages, error: messagesError } = await activeClient
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", activeConversation.id)
      .order("created_at", { ascending: true })
      .limit(250);

    if (messagesError) throw messagesError;
    setConversation(activeConversation);
    setMessages((existingMessages ?? []) as ChatMessage[]);
    setWidgetState("chat");
  }

  async function openChat() {
    setErrorMessage("");
    setWidgetState("starting");
    try {
      const activeClient = client ?? (await import("../../lib/supabase.browser"))
        .getChatVisitorClient(config);
      if (!client) setClient(activeClient);
      const activeUser = user ?? await getOrCreateUser(activeClient);
      setUser(activeUser);
      await loadConversation(activeClient, activeUser);
    } catch (error) {
      console.error("Unable to start website chat", error);
      setWidgetState("unavailable");
    }
  }

  async function startConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !user || sending) return;

    const form = new FormData(event.currentTarget);
    const visitorName = String(form.get("name") ?? "").trim();
    const visitorEmail = String(form.get("email") ?? "").trim().toLowerCase();
    const firstMessage = String(form.get("message") ?? "").trim();
    if (!visitorName || !firstMessage) return;

    setSending(true);
    setErrorMessage("");
    try {
      const { data: created, error: createError } = await client
        .from("chat_conversations")
        .insert({
          visitor_id: user.id,
          visitor_name: visitorName,
          visitor_email: visitorEmail || null,
          source_path: `${location.pathname}${location.search}`.slice(0, 500),
        })
        .select("*")
        .single();

      if (createError) throw createError;
      const activeConversation = created as ChatConversation;
      const { data: createdMessage, error: messageError } = await client
        .from("chat_messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          sender_kind: "visitor",
          body: firstMessage,
          client_nonce: crypto.randomUUID(),
        })
        .select("*")
        .single();

      if (messageError) throw messageError;
      setConversation(activeConversation);
      setMessages([createdMessage as ChatMessage]);
      setWidgetState("chat");
    } catch (error) {
      console.error("Unable to create website chat", error);
      setErrorMessage("We could not start the conversation. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!client || !body || !conversation || !user || sending || conversation.status !== "open") return;

    setSending(true);
    setErrorMessage("");
    try {
      const { data, error } = await client
        .from("chat_messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_kind: "visitor",
          body,
          client_nonce: crypto.randomUUID(),
        })
        .select("*")
        .single();

      if (error) throw error;
      setMessages((current) => mergeMessage(current, data as ChatMessage));
      setDraft("");
    } catch (error) {
      console.error("Unable to send website chat message", error);
      setErrorMessage("That message did not send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const isOpen = widgetState !== "closed";

  return (
    <aside className={`chat-widget${isOpen ? " is-open" : ""}`} aria-label="Chat with Jimmy Coco Professional">
      {isOpen && (
        <section className="chat-window" role="dialog" aria-modal="false" aria-labelledby="chat-title">
          <header className="chat-window-head">
            <div>
              <span className="chat-presence" aria-hidden="true" />
              <p>Jimmy Coco Professional</p>
              <h2 id="chat-title">How can we help?</h2>
            </div>
            <button type="button" onClick={() => setWidgetState("closed")} aria-label="Close chat">×</button>
          </header>

          {widgetState === "starting" && <div className="chat-loading">Opening a secure conversation…</div>}

          {widgetState === "intro" && (
            <form className="chat-intro" onSubmit={startConversation}>
              <p>Ask us about the professional litre, a free trial or your salon setup.</p>
              <label>
                Your name
                <input name="name" autoComplete="name" maxLength={80} required />
              </label>
              <label>
                Email <span>(optional)</span>
                <input name="email" type="email" autoComplete="email" maxLength={254} />
              </label>
              <label>
                Your question
                <textarea name="message" rows={4} maxLength={2000} required />
              </label>
              {errorMessage && <p className="chat-error" role="alert">{errorMessage}</p>}
              <button className="chat-primary" type="submit" disabled={sending}>
                {sending ? "Starting chat…" : "Start conversation"}
              </button>
              <small>Messages are handled by the Jimmy Coco professional team.</small>
            </form>
          )}

          {widgetState === "chat" && (
            <>
              <div className="chat-transcript" aria-live="polite">
                <div className="chat-welcome">
                  Thanks for getting in touch. Leave your message here and the professional team will reply in this conversation.
                </div>
                {messages.map((message) => (
                  <article key={message.id} className={`chat-message is-${message.sender_kind}`}>
                    <p>{message.body}</p>
                    <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
                  </article>
                ))}
                {conversation?.status === "closed" && (
                  <p className="chat-closed">This conversation has been closed. Reopen chat to start a new one.</p>
                )}
                <div ref={messageEndRef} />
              </div>
              <form className="chat-composer" onSubmit={sendMessage}>
                {errorMessage && <p className="chat-error" role="alert">{errorMessage}</p>}
                <label className="sr-only" htmlFor="chat-message-draft">Message</label>
                <textarea
                  id="chat-message-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Write a message…"
                  disabled={conversation?.status !== "open"}
                />
                <button type="submit" disabled={sending || !draft.trim() || conversation?.status !== "open"}>
                  Send <span aria-hidden="true">→</span>
                </button>
              </form>
            </>
          )}

          {widgetState === "unavailable" && (
            <div className="chat-unavailable">
              <p>Chat is temporarily unavailable.</p>
              <a href="mailto:partnerships@jimmycoco.pro">Email the professional team</a>
              <button type="button" onClick={openChat}>Try again</button>
            </div>
          )}
        </section>
      )}

      <button
        className="chat-launcher"
        type="button"
        onClick={isOpen ? () => setWidgetState("closed") : openChat}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : "Chat with Jimmy Coco Professional"}
      >
        <span className="chat-launcher-icon" aria-hidden="true">{isOpen ? "×" : "↗"}</span>
        <span>{isOpen ? "Close" : "Chat with us"}</span>
      </button>
    </aside>
  );
}
