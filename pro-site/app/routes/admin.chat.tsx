import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, useLoaderData } from "react-router";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { requireArticleStaff } from "../lib/article-auth.server";
import {
  CHAT_STAFF_PRESENCE_CHANNEL,
  countStaffPresence,
  type ChatConversation,
  type ChatMessage,
  type ChatStaffPresence,
} from "../lib/chat";
import { createChatStaffClient } from "../lib/supabase.browser";
import { getSupabasePublicConfig } from "../lib/supabase.server";

export const meta: MetaFunction = () => [
  { title: "Live chat | Jimmy Coco Admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export const headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const [{ data: conversations, error: conversationsError }, sessionResult] = await Promise.all([
    supabase
      .from("chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200),
    supabase.auth.getSession(),
  ]);

  if (conversationsError) {
    console.error("Unable to load chat conversations", conversationsError.message);
    throw new Response("The live chat inbox is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  const accessToken = sessionResult.data.session?.access_token;
  if (!accessToken) {
    throw new Response("Your admin session needs to be refreshed.", {
      status: 401,
      headers: responseHeaders,
    });
  }

  const initialConversations = (conversations ?? []) as ChatConversation[];
  const initialConversation = initialConversations.find((conversation) => conversation.status === "open")
    ?? initialConversations[0]
    ?? null;
  let initialMessages: ChatMessage[] = [];

  if (initialConversation) {
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", initialConversation.id)
      .order("created_at", { ascending: true })
      .limit(500);

    if (messagesError) {
      console.error("Unable to load chat messages", messagesError.message);
    } else {
      initialMessages = (messages ?? []) as ChatMessage[];
    }
  }

  return data({
    staff,
    config: getSupabasePublicConfig(),
    accessToken,
    conversations: initialConversations,
    initialConversationId: initialConversation?.id ?? null,
    initialMessages,
  }, { headers: responseHeaders });
}

function mergeMessage(messages: ChatMessage[], incoming: ChatMessage) {
  if (messages.some((message) => message.id === incoming.id)) return messages;
  return [...messages, incoming].sort((a, b) => a.id - b.id);
}

function mergeConversation(
  conversations: ChatConversation[],
  incoming: ChatConversation,
) {
  const next = conversations.filter((conversation) => conversation.id !== incoming.id);
  next.push(incoming);
  return next.sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
  );
}

function formatListTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat("en-GB", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "short" }).format(date);
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type BrowserNotificationStatus = "unsupported" | "default" | "granted" | "denied";

function getBrowserNotificationStatus(): BrowserNotificationStatus {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function getAlertSettingsLabel(status: BrowserNotificationStatus, soundEnabled: boolean) {
  if (status === "unsupported") return soundEnabled ? "Sound on" : "Sound off";
  if (status === "denied") return soundEnabled ? "Sound on · notifications blocked" : "Alerts blocked";
  if (status === "granted") return soundEnabled ? "Alerts on" : "Notifications on · sound off";
  return soundEnabled ? "Enable notifications" : "Enable alerts";
}

export default function AdminChat() {
  const loaderData = useLoaderData<typeof loader>();
  const [conversations, setConversations] = useState(loaderData.conversations);
  const [selectedId, setSelectedId] = useState<string | null>(loaderData.initialConversationId);
  const [messages, setMessages] = useState(loaderData.initialMessages);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [unseen, setUnseen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectionState, setConnectionState] = useState("Connecting…");
  const [notificationStatus, setNotificationStatus] = useState<BrowserNotificationStatus>("unsupported");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [onlineStaffCount, setOnlineStaffCount] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const selectedIdRef = useRef<string | null>(loaderData.initialConversationId);
  const conversationsRef = useRef(loaderData.conversations);
  const notificationStatusRef = useRef<BrowserNotificationStatus>("unsupported");
  const soundEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const client = useMemo(
    () => createChatStaffClient(loaderData.config, loaderData.accessToken),
    [loaderData.accessToken, loaderData.config.publishableKey, loaderData.config.url],
  );
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visibleConversations = filter === "open"
    ? conversations.filter((conversation) => conversation.status === "open")
    : conversations;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    notificationStatusRef.current = notificationStatus;
  }, [notificationStatus]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jc-admin-chat-sound", soundEnabled ? "on" : "off");
    }
  }, [soundEnabled]);

  useEffect(() => {
    setNotificationStatus(getBrowserNotificationStatus());
    notificationStatusRef.current = getBrowserNotificationStatus();

    if (typeof window !== "undefined") {
      const storedSound = window.localStorage.getItem("jc-admin-chat-sound");
      const shouldEnableSound = storedSound === "on";
      setSoundEnabled(shouldEnableSound);
      soundEnabledRef.current = shouldEnableSound;
    }

    return () => {
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    const count = unseen.size;
    const baseTitle = "Live chat | Jimmy Coco Admin";
    document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
    return () => {
      document.title = baseTitle;
    };
  }, [unseen.size]);

  useEffect(() => {
    const channel = client
      .channel("admin-chat-stage-one")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          setConversations((current) => mergeConversation(current, payload.new as ChatConversation));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          if (incoming.conversation_id === selectedIdRef.current) {
            setMessages((current) => mergeMessage(current, incoming));
          } else if (incoming.sender_kind === "visitor") {
            setUnseen((current) => new Set(current).add(incoming.conversation_id));
          }
          if (incoming.sender_kind === "visitor") {
            notifyNewVisitorMessage(incoming);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionState("Live");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("Connection interrupted — refresh to reconnect");
        }
      });

    channelRef.current = channel;
    return () => {
      client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [client]);

  useEffect(() => {
    const channel = client
      .channel(CHAT_STAFF_PRESENCE_CHANNEL, {
        config: { presence: { key: loaderData.staff.userId } },
      })
      .on("presence", { event: "sync" }, () => {
        setOnlineStaffCount(countStaffPresence(channel.presenceState()));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            staffId: loaderData.staff.userId,
            name: loaderData.staff.displayName || loaderData.staff.email || "Jimmy Coco team",
            onlineAt: new Date().toISOString(),
          } satisfies ChatStaffPresence);
        }
      });

    presenceChannelRef.current = channel;
    return () => {
      channel.untrack().catch(() => undefined);
      client.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [client, loaderData.staff.displayName, loaderData.staff.email, loaderData.staff.userId]);

  function playNewMessageSound() {
    if (!soundEnabledRef.current || typeof window === "undefined") return;
    const browserWindow = window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass = browserWindow.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      context.resume().catch(() => undefined);
    }

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    gain.connect(context.destination);

    [720, 960].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + 0.36 + index * 0.08);
    });
  }

  function showBrowserNotification(message: ChatMessage) {
    if (
      notificationStatusRef.current !== "granted"
      || typeof window === "undefined"
      || !("Notification" in window)
    ) {
      return;
    }

    const conversation = conversationsRef.current.find((item) => item.id === message.conversation_id);
    const title = conversation?.visitor_name
      ? `New chat from ${conversation.visitor_name}`
      : "New website chat";
    const notification = new Notification(title, {
      body: message.body.slice(0, 160),
      tag: `jimmy-coco-chat-${message.conversation_id}`,
    });

    notification.onclick = () => {
      window.focus();
      void selectConversation(message.conversation_id);
      notification.close();
    };
  }

  function notifyNewVisitorMessage(message: ChatMessage) {
    playNewMessageSound();
    showBrowserNotification(message);
  }

  async function enableAlerts() {
    setSoundEnabled(true);
    soundEnabledRef.current = true;
    playNewMessageSound();

    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationStatus("unsupported");
      notificationStatusRef.current = "unsupported";
      return;
    }

    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setNotificationStatus(result);
      notificationStatusRef.current = result;
      return;
    }

    setNotificationStatus(Notification.permission);
    notificationStatusRef.current = Notification.permission;
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEnabledRef.current = next;
    if (next) playNewMessageSound();
  }

  async function selectConversation(conversationId: string) {
    setSelectedId(conversationId);
    setErrorMessage("");
    setUnseen((current) => {
      const next = new Set(current);
      next.delete(conversationId);
      return next;
    });

    const { data: loadedMessages, error } = await client
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("Unable to load selected chat", error);
      setErrorMessage("This conversation could not be loaded.");
      return;
    }
    setMessages((loadedMessages ?? []) as ChatMessage[]);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedConversation || selectedConversation.status !== "open" || busy) return;

    setBusy(true);
    setErrorMessage("");
    try {
      if (!selectedConversation.assigned_to) {
        const { error: assignmentError } = await client
          .from("chat_conversations")
          .update({ assigned_to: loaderData.staff.userId, updated_at: new Date().toISOString() })
          .eq("id", selectedConversation.id);
        if (assignmentError) throw assignmentError;
      }

      const { data: reply, error } = await client
        .from("chat_messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: loaderData.staff.userId,
          sender_kind: "staff",
          body,
          client_nonce: crypto.randomUUID(),
        })
        .select("*")
        .single();

      if (error) throw error;
      setMessages((current) => mergeMessage(current, reply as ChatMessage));
      setDraft("");
    } catch (error) {
      console.error("Unable to send staff chat reply", error);
      setErrorMessage("Your reply did not send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function closeConversation() {
    if (!selectedConversation || selectedConversation.status !== "open" || busy) return;
    setBusy(true);
    setErrorMessage("");
    const { data: updated, error } = await client
      .from("chat_conversations")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", selectedConversation.id)
      .select("*")
      .single();
    setBusy(false);

    if (error) {
      console.error("Unable to close chat conversation", error);
      setErrorMessage("The conversation could not be closed.");
      return;
    }
    setConversations((current) => mergeConversation(current, updated as ChatConversation));
  }

  return (
    <main className="admin-main admin-chat-main">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Customer support</p>
          <h1>Live chat</h1>
          <p>Reply to website visitors in real time.</p>
        </div>
        <div className="admin-chat-head-actions">
          <span className={`admin-chat-presence-count${onlineStaffCount > 0 ? " is-online" : ""}`}>
            {onlineStaffCount} online
          </span>
          <button
            className={`admin-chat-alert-toggle${notificationStatus === "granted" && soundEnabled ? " is-on" : ""}`}
            type="button"
            onClick={notificationStatus === "granted" ? toggleSound : enableAlerts}
            aria-pressed={notificationStatus === "granted" && soundEnabled}
          >
            {getAlertSettingsLabel(notificationStatus, soundEnabled)}
          </button>
          <span className={`admin-chat-connection${connectionState === "Live" ? " is-live" : ""}`}>
            {connectionState}
          </span>
        </div>
      </header>

      <section className="admin-chat-shell">
        <aside className="admin-chat-list" aria-label="Chat conversations">
          <div className="admin-chat-list-head">
            <div>
              <strong>Inbox</strong>
              <span>{conversations.filter((conversation) => conversation.status === "open").length} open</span>
            </div>
            <div className="admin-chat-filter">
              <button className={filter === "open" ? "is-active" : ""} type="button" onClick={() => setFilter("open")}>Open</button>
              <button className={filter === "all" ? "is-active" : ""} type="button" onClick={() => setFilter("all")}>All</button>
            </div>
          </div>

          <div className="admin-chat-conversations">
            {visibleConversations.length === 0 && (
              <p className="admin-chat-empty">No {filter === "open" ? "open " : ""}conversations yet.</p>
            )}
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`admin-chat-row${selectedId === conversation.id ? " is-selected" : ""}`}
                type="button"
                onClick={() => selectConversation(conversation.id)}
              >
                <span className="admin-chat-avatar" aria-hidden="true">{conversation.visitor_name.slice(0, 1).toUpperCase()}</span>
                <span className="admin-chat-row-copy">
                  <strong>{conversation.visitor_name}</strong>
                  <small>{conversation.visitor_email || conversation.source_path}</small>
                </span>
                <span className="admin-chat-row-meta">
                  <time dateTime={conversation.last_message_at}>{formatListTime(conversation.last_message_at)}</time>
                  {unseen.has(conversation.id) && <i aria-label="New message" />}
                  {conversation.status === "closed" && <small>Closed</small>}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="admin-chat-thread">
          {!selectedConversation ? (
            <div className="admin-chat-placeholder">
              <span aria-hidden="true">◌</span>
              <h2>Select a conversation</h2>
              <p>New website messages will appear in the inbox automatically.</p>
            </div>
          ) : (
            <>
              <header className="admin-chat-thread-head">
                <div>
                  <h2>{selectedConversation.visitor_name}</h2>
                  <p>
                    {selectedConversation.visitor_email || "No email supplied"}
                    <span> · </span>
                    Started on <a href={selectedConversation.source_path} target="_blank" rel="noreferrer">{selectedConversation.source_path}</a>
                  </p>
                </div>
                {selectedConversation.status === "open" ? (
                  <button type="button" onClick={closeConversation} disabled={busy}>Close conversation</button>
                ) : (
                  <span className="admin-status admin-status-closed">Closed</span>
                )}
              </header>

              <div className="admin-chat-messages" aria-live="polite">
                {messages.map((message) => (
                  <article key={message.id} className={`admin-chat-message is-${message.sender_kind}`}>
                    <p>{message.body}</p>
                    <time dateTime={message.created_at}>
                      {message.sender_kind === "staff" ? "Jimmy Coco team · " : `${selectedConversation.visitor_name} · `}
                      {formatMessageTime(message.created_at)}
                    </time>
                  </article>
                ))}
                <div ref={messageEndRef} />
              </div>

              <form className="admin-chat-reply" onSubmit={sendReply}>
                {errorMessage && <p className="admin-alert" role="alert">{errorMessage}</p>}
                <label htmlFor="admin-chat-draft">Reply</label>
                <textarea
                  id="admin-chat-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder={selectedConversation.status === "open" ? "Write a reply…" : "This conversation is closed"}
                  disabled={selectedConversation.status !== "open"}
                />
                <div>
                  <span>{draft.length}/2000</span>
                  <button className="admin-primary" type="submit" disabled={busy || !draft.trim() || selectedConversation.status !== "open"}>
                    {busy ? "Sending…" : "Send reply"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
