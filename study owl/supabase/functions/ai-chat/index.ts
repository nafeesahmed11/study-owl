// Supabase Edge Function — AI Study chat.
//
// The provider API key lives in the function's secrets (never in the browser
// bundle). The function:
//
//   1. validates the caller's Supabase JWT,
//   2. loads the user's agent configuration (name + system instructions),
//   3. reserves credits atomically (1 credit per 100 tokens, prompt+completion),
//   4. calls an OpenAI-compatible /chat/completions endpoint,
//   5. settles the reservation with the actual token usage (or releases it in
//      full when the provider call fails),
//   6. persists the user + assistant messages and returns the reply.
//
// Required secrets (supabase secrets set ...):
//   AI_API_KEY      — provider key
//   AI_API_BASE_URL — e.g. https://api.openai.com/v1 (no trailing slash)
//   AI_MODEL        — e.g. gpt-4o-mini
// Optional secrets:
//   AI_SYSTEM_PROMPT — overrides the built-in tutor persona
//   AI_MAX_TOKENS    — completion cap (default 1024)

import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  ALLOWED_ROLES,
  MAX_MESSAGE_CHARS,
  MAX_HISTORY_MESSAGES,
  CREDITS_PER_100_TOKENS,
  approximateTokens,
  actualCreditsFor,
  buildSystemPrompt,
  creditsForTokens,
  reserveAmountFor,
  sanitizeMessages,
  titleFromMessage,
  type ChatRole,
  type IncomingMessage,
  type ProviderUsage,
} from "./logic.ts";

const DEFAULT_SYSTEM_PROMPT =
  "You are Study Owl, an academic tutor for university students. Explain concepts " +
  "clearly, use structured markdown with short sections and bullet points, and " +
  "always end study answers with an exam-oriented tip. Be accurate and concise.";

export { ALLOWED_ROLES, MAX_MESSAGE_CHARS, MAX_HISTORY_MESSAGES, CREDITS_PER_100_TOKENS };
export {
  approximateTokens,
  actualCreditsFor,
  buildSystemPrompt,
  creditsForTokens,
  reserveAmountFor,
  sanitizeMessages,
  titleFromMessage,
};
export type { ChatRole, IncomingMessage, ProviderUsage };


/** CORS headers so the browser can call the function directly. */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}


Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const env = Deno.env.toObject();
  const apiKey = env.AI_API_KEY;
  const supabaseUrl = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;

  if (!apiKey || !supabaseUrl || !anonKey) {
    return json({ error: "AI backend is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization header." }, 401);

  // A client bound to the caller's token: auth.uid() resolves to the student,
  // so RLS and the credit RPCs apply as if the calls came from the browser.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ error: "Not authenticated." }, 401);
  const user = userData.user;

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const messages = sanitizeMessages(payload.messages);
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : null;
  if (messages.length === 0) return json({ error: "No messages supplied." }, 400);

  const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
  if (!lastUserMessage) return json({ error: "A user message is required." }, 400);

  // The first user message titles the conversation.
  const firstUserMessage = messages.find(m => m.role === "user") ?? lastUserMessage;

  // ─── Agent configuration ────────────────────────────────────────────────
  const { data: agentRow } = await supabase
    .from("ai_agent_config")
    .select("name, instructions, dev_mode, provider, model, temperature, command_prefix")
    .eq("user_id", user.id)
    .maybeSingle();

  const agentName =
    agentRow?.dev_mode && typeof agentRow.name === "string" && agentRow.name.trim()
      ? agentRow.name.trim()
      : "AI Study Assistant";
  const customInstructions =
    typeof agentRow?.instructions === "string" ? agentRow.instructions.trim() : "";
  const provider =
    typeof agentRow?.provider === "string" && agentRow.provider.trim()
      ? agentRow.provider.trim()
      : "openai";
  const model =
    typeof agentRow?.model === "string" && agentRow.model.trim()
      ? agentRow.model.trim()
      : "gpt-4o-mini";
  const temperature =
    typeof agentRow?.temperature === "number" && Number.isFinite(agentRow.temperature)
      ? agentRow.temperature
      : 0.6;

  const baseUrl =
    provider === "google-gemini"
      ? "https://generativelanguage.googleapis.com/v1beta"
      : (env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const systemPrompt = buildSystemPrompt(
    env.AI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
    customInstructions,
  );


  // ─── Conversation / session bookkeeping ─────────────────────────────────
  let targetSessionId = sessionId;
  let createdSession = false;
  if (!targetSessionId) {
    const { data: created, error: createError } = await supabase
      .from("ai_chat_sessions")
      .insert({ user_id: user.id, title: titleFromMessage(firstUserMessage.content) })
      .select("id")
      .single();
    if (createError || !created) return json({ error: "Could not start a conversation." }, 500);
    targetSessionId = created.id;
    createdSession = true;
  } else {
    // The session must exist and belong to the caller.
    const { data: owned } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", targetSessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!owned) return json({ error: "Conversation not found." }, 404);
  }

  // The user turn is persisted only after a successful provider call, so a
  // failed request never leaves an orphaned user message behind.

  /** Aborts the request: refunds the hold and drops a session we just created. */
  const fail = async (message: string, status: number, reservationId?: string) => {
    if (reservationId) {
      await supabase.rpc("ai_release_credits", { p_reservation: reservationId });
    }
    if (createdSession && targetSessionId) {
      await supabase.from("ai_chat_sessions").delete().eq("id", targetSessionId);
    }
    return json({ error: message }, status);
  };

  // ─── Credit reservation ────────────────────────────────────────────────
  // Reserve the worst case (prompt + a full completion) up front, then settle
  // with the real usage. A failed call releases the hold in full.
  const maxTokens = Number.parseInt(env.AI_MAX_TOKENS || "1024", 10) || 1024;
  const promptTexts = [systemPrompt, ...messages.map(m => m.content)];
  const approxPromptTokens = approximateTokens(promptTexts);
  const reserveAmount = reserveAmountFor(promptTexts, maxTokens);

  const { data: reservationId, error: reserveError } = await supabase.rpc(
    "ai_reserve_credits",
    { p_amount: reserveAmount },
  );
  if (reserveError) return await fail("Could not reserve AI credits.", 500);
  if (!reservationId) {
    return await fail("You have run out of AI credits.", 402);
  }

  // ─── Provider call ──────────────────────────────────────────────────────
  let reply = "";
  let usage: ProviderUsage = {};
  try {
    const providerRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!providerRes.ok) {
      const detail = await providerRes.text();
      console.error("provider error", providerRes.status, detail.slice(0, 500));
      return await fail("The AI provider could not be reached.", 502, reservationId);
    }

    const data = await providerRes.json();
    reply = data?.choices?.[0]?.message?.content ?? "";
    usage = (data?.usage ?? {}) as ProviderUsage;

    if (!reply || typeof reply !== "string") {
      return await fail("The AI provider returned an empty response.", 502, reservationId);
    }
  } catch (err) {
    console.error("provider call failed", err);
    return await fail("The AI provider could not be reached.", 502, reservationId);
  }

  // ─── Settle credits with the real token usage ──────────────────────────
  const actualCredits = actualCreditsFor(usage, approxPromptTokens);

  // ─── Persist the exchange ─────────────────────────────────────────────────
  // The user turn is written first so the transcript keeps its order; both
  // rows are inserted together, and the session timestamp is refreshed so the
  // conversation stays at the top of the history list.
  const { error: persistError } = await supabase.from("ai_chat_messages").insert([
    {
      session_id: targetSessionId,
      user_id: user.id,
      role: "user",
      content: lastUserMessage.content,
    },
    {
      session_id: targetSessionId,
      user_id: user.id,
      role: "assistant",
      content: reply,
      credits: actualCredits,
    },
  ]);

  if (persistError) {
    // The reply was generated but could not be stored: refund the credits so
    // the student is not charged for an answer they cannot see again.
    await supabase.rpc("ai_release_credits", { p_reservation: reservationId });
    if (createdSession && targetSessionId) {
      await supabase.from("ai_chat_sessions").delete().eq("id", targetSessionId);
    }
    return json({ error: "Could not save the conversation." }, 500);
  }

  await supabase
    .from("ai_chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", targetSessionId)
    .eq("user_id", user.id);

  const { data: settled, error: settleError } = await supabase.rpc("ai_settle_credits", {
    p_reservation: reservationId,
    p_actual: actualCredits,
  });

  // The authoritative balance always comes from the RPC. If settling failed the
  // hold is still pending, so it is released in full and the release result
  // carries the balance.
  let balance = (settled ?? null) as { total?: number; used?: number; charged?: number } | null;
  if (settleError) {
    console.error("settle failed", settleError);
    const { data: released } = await supabase.rpc("ai_release_credits", {
      p_reservation: reservationId,
    });
    balance = (released ?? null) as typeof balance;
  }

  return json({
    reply,
    sessionId: targetSessionId,
    credits: balance ?? { total: 0, used: 0, charged: actualCredits },
    // When settlement failed the hold was released, so nothing was charged.
    charged: balance?.charged ?? actualCredits,
    agentName,
    model,
  });
});
