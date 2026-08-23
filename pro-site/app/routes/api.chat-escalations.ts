import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { processChatEscalations } from "../lib/chat-escalation.server";

function isAuthorized(request: Request) {
  const secret = process.env.CHAT_ESCALATION_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("Authorization") === `Bearer ${secret}`;
}

async function handleChatEscalations(request: Request) {
  if (!["GET", "POST", "HEAD"].includes(request.method)) {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, POST, HEAD" },
    });
  }

  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  try {
    const result = await processChatEscalations();
    return new Response(request.method === "HEAD" ? null : JSON.stringify({ ok: true, ...result }), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[chat-escalation] worker failed", error);
    return new Response(JSON.stringify({ error: "chat_escalation_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

export function loader({ request }: LoaderFunctionArgs) {
  return handleChatEscalations(request);
}

export function action({ request }: ActionFunctionArgs) {
  return handleChatEscalations(request);
}
