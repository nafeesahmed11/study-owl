import { supabase } from "./supabase";

/**
 * Client for the AI Study backend.
 *
 * All provider traffic goes through the `ai-chat` Supabase Edge Function, so
 * the provider API key never reaches the browser. The function authenticates
 * the caller with the signed-in Supabase session (the shared client attaches
 * the access token automatically), reserves and settles credits, and persists
 * the conversation.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  /** The assistant's answer. */
  reply: string;
  /** Session the exchange was stored under (newly created when omitted). */
  sessionId: string;
  /** Credit balance after the exchange. */
  credits: { total: number; used: number; charged?: number };
  /** Credits actually charged for this exchange. */
  charged: number;
  /** Agent name the backend used for the reply. */
  agentName: string;
  /** Model that produced the reply. */
  model: string;
}

export interface ChatError extends Error {
  /** HTTP status of the edge function response, when there was one. */
  status?: number;
}

/** Error thrown when the backend rejects a chat request. */
export function chatError(message: string, status?: number): ChatError {
  const err = new Error(message) as ChatError;
  err.status = status;
  return err;
}

/**
 * Sends a conversation to the backend and returns the assistant's reply.
 *
 * `messages` should contain the full visible conversation (oldest first) so
 * the model keeps its context. `sessionId` is omitted for a new conversation
 * and reused afterwards to continue the same one.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  sessionId?: string | null,
): Promise<ChatReply> {
  if (messages.length === 0) {
    throw chatError("Nothing to send.");
  }

  const { data, error } = await supabase.functions.invoke("ai-chat", {
    body: { messages, sessionId: sessionId ?? null },
  });

  if (error) {
    // Supabase wraps non-2xx responses in an error object; the edge function
    // always answers with JSON, so the message is recoverable from the body.
    const body = (error as { context?: Response }).context;
    let message = error.message || "The AI backend could not be reached.";
    let status: number | undefined;

    if (body) {
      status = body.status;
      try {
        const parsed = (await body.json()) as { error?: string };
        if (parsed?.error) message = parsed.error;
      } catch {
        /* Non-JSON error body — keep the generic message. */
      }
    }

    throw chatError(message, status);
  }

  const payload = data as Partial<ChatReply> | null;
  if (!payload || typeof payload.reply !== "string") {
    throw chatError("The AI backend returned an unexpected response.");
  }

  return {
    reply: payload.reply,
    sessionId: payload.sessionId ?? "",
    credits: {
      total: Number(payload.credits?.total ?? 0),
      used: Number(payload.credits?.used ?? 0),
      charged: Number(payload.credits?.charged ?? payload.charged ?? 0),
    },
    charged: Number(payload.charged ?? payload.credits?.charged ?? 0),
    agentName: payload.agentName ?? "",
    model: payload.model ?? "",
  };
}

/** A stored conversation in the student's history. */
export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

/** A stored message in a conversation. */
export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  saved: boolean;
  createdAt: string;
}

/**
 * Lists the student's conversations, newest first.
 *
 * RLS limits the query to the caller's own rows.
 */
export async function listChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw chatError(error.message);
  return ((data ?? []) as { id: string; title: string; updated_at: string }[]).map(row => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
  }));
}

/**
 * Loads the messages of one conversation, oldest first.
 */
export async function loadChatMessages(sessionId: string): Promise<StoredChatMessage[]> {
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, saved, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw chatError(error.message);
  return ((data ?? []) as {
    id: string;
    role: string;
    content: string;
    saved: boolean;
    created_at: string;
  }[]).map(row => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    saved: !!row.saved,
    createdAt: row.created_at,
  }));
}

/**
 * Starts a fresh conversation by creating an empty session, so the next reply
 * is appended to it instead of the current one.
 */
export async function createChatSession(title = "New conversation"): Promise<string> {
  // `ai_chat_sessions.user_id` has no default, so the owner must be supplied
  // explicitly; RLS rejects the insert unless it is the signed-in student.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw chatError("Not signed in.");

  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .insert({ user_id: userData.user.id, title })
    .select("id")
    .single();

  if (error) throw chatError(error.message);
  return (data as { id: string }).id;
}

/**
 * Marks a stored message as saved (starred) or unsaves it.
 */
export async function setChatMessageSaved(messageId: string, saved: boolean): Promise<void> {
  const { error } = await supabase
    .from("ai_chat_messages")
    .update({ saved })
    .eq("id", messageId);
  if (error) throw chatError(error.message);
}

/**
 * Deletes a conversation and all of its messages.
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from("ai_chat_sessions").delete().eq("id", sessionId);
  if (error) throw chatError(error.message);
}
