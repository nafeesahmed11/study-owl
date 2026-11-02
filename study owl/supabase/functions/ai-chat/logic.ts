/**
 * Pure helpers of the `ai-chat` Edge Function.
 *
 * This module has no Deno or Supabase imports, so the exact same code that runs
 * on the server can be unit-tested from Node with `npm run test:ai-chat`.
 */

export const ALLOWED_ROLES = ["user", "assistant"];
export const MAX_MESSAGE_CHARS = 8000;
export const MAX_HISTORY_MESSAGES = 40;
export const CREDITS_PER_100_TOKENS = 1;

export type ChatRole = "user" | "assistant";

export interface IncomingMessage {
  role: ChatRole;
  content: string;
}

export interface ProviderUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/** Credits for a token count: 1 credit per 100 tokens, rounded up. */
export function creditsForTokens(tokens: number): number {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  return Math.ceil(tokens / 100) * CREDITS_PER_100_TOKENS;
}

/** Rough token estimate (~4 characters per token), used to size the hold. */
export function approximateTokens(texts: string[]): number {
  return texts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
}

/** Validates and trims the incoming message list. */
export function sanitizeMessages(input: unknown): IncomingMessage[] {
  if (!Array.isArray(input)) return [];
  const out: IncomingMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const role = (raw as { role?: unknown }).role;
    const content = (raw as { content?: unknown }).content;
    if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!trimmed) continue;
    out.push({ role: role as ChatRole, content: trimmed });
  }
  return out.slice(-MAX_HISTORY_MESSAGES);
}

/** Title for a conversation: the first user message, truncated. */
export function titleFromMessage(content: string): string {
  const line = content.split("\n")[0].trim();
  const title = line.length > 60 ? `${line.slice(0, 57)}…` : line;
  return title || "New conversation";
}

/**
 * The system prompt sent to the provider: the built-in tutor persona plus the
 * student's own instructions. Empty instructions change nothing.
 */
export function buildSystemPrompt(basePrompt: string, customInstructions: string): string {
  const extra = customInstructions.trim();
  if (!extra) return basePrompt;
  return `${basePrompt}\n\nStudent's additional instructions:\n${extra}`;
}

/**
 * The credit hold for one request: the worst case (prompt + a full completion),
 * so the balance can never be over-committed during the provider call.
 */
export function reserveAmountFor(
  promptTexts: string[],
  maxTokens: number,
): number {
  const approx = approximateTokens(promptTexts) + Math.max(0, maxTokens);
  return Math.max(1, creditsForTokens(approx));
}

/**
 * The credits actually charged for a completed exchange: based on the provider's
 * reported token usage, falling back to the prompt estimate when the provider
 * does not report usage.
 */
export function actualCreditsFor(
  usage: ProviderUsage,
  fallbackTokens: number,
): number {
  const total =
    usage.total_tokens ??
    (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0);
  return creditsForTokens(Number(total) || fallbackTokens);
}
