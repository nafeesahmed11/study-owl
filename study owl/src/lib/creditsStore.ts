import { supabase } from "./supabase";

/**
 * Credit balance for the AI Study page.
 *
 * The authoritative balance lives in Supabase (`ai_credits`) and is only
 * ever mutated by the SECURITY DEFINER credit RPCs, so concurrent requests can
 * never spend the same credits twice. The `ai_get_credits` RPC returns the
 * caller's balance and creates the row for accounts created before the table
 * existed.
 *
 * `localStorage` is kept as an offline cache and fallback so the page still
 * shows a sensible balance before sign-in or when the network is unavailable.
 */

export interface CreditState {
  total: number;
  used: number;
  status: 'ready' | 'error';
}

const CREDITS_KEY = 'studyowl_aistudy_credits_v1';

/** Allowance granted to a new account (mirrors the SQL default). */
export const DEMO_CREDIT_TOTAL = 1000;

/** Credits still available (total minus settled usage). */
export function remainingCredits(state: CreditState): number {
  return Math.max(0, state.total - state.used);
}

export function estimateExchangeCredits(userText: string): number {
  return Math.max(1, Math.ceil(userText.trim().length / 4) + 20);
}

function toCount(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

/** Reads the cached balance; corrupt or missing data falls back to defaults. */
export function loadCredits(): CreditState {
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) return { total: DEMO_CREDIT_TOTAL, used: 0, status: 'ready' };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { total: DEMO_CREDIT_TOTAL, used: 0, status: 'error' };
    }
    const rec = parsed as Record<string, unknown>;
    const total = toCount(rec.total, DEMO_CREDIT_TOTAL);
    const used = Math.min(toCount(rec.used, 0), total);
    return { total, used, status: 'ready' };
  } catch {
    return { total: DEMO_CREDIT_TOTAL, used: 0, status: 'error' };
  }
}

/** Writes the balance to the local cache; failures are non-fatal. */
export function cacheCredits(state: CreditState): void {
  try {
    localStorage.setItem(CREDITS_KEY, JSON.stringify({ total: state.total, used: state.used }));
  } catch {
    /* Quota / private mode — the server balance stays authoritative. */
  }
}

/**
 * Loads the signed-in student's balance from Supabase.
 *
 * Falls back to the local cache when the request fails, so the page always
 * renders a balance even offline.
 */
export async function fetchCredits(): Promise<CreditState> {
  const { data, error } = await supabase.rpc('ai_get_credits');
  if (error || !data) return loadCredits();

  const rec = (data ?? {}) as Record<string, unknown>;
  const total = toCount(rec.total, DEMO_CREDIT_TOTAL);
  const used = Math.min(toCount(rec.used, 0), total);
  const state: CreditState = { total, used, status: 'ready' };
  cacheCredits(state);
  return state;
}

/**
 * Applies a settled balance returned by the backend.
 *
 * The server is authoritative: the local cache is only updated to match.
 */
export function applyCredits(total: number, used: number): CreditState {
  const safeTotal = toCount(total, DEMO_CREDIT_TOTAL);
  const state: CreditState = {
    total: safeTotal,
    used: Math.min(toCount(used, 0), safeTotal),
    status: 'ready',
  };
  cacheCredits(state);
  return state;
}

/**
 * Consumes credits locally.
 *
 * Kept for the offline/demo path only — the authoritative settlement happens
 * server-side in the `ai_settle_credits` RPC.
 */
export function consumeCredits(userText: string): CreditState {
  const current = loadCredits();
  const affordable = Math.max(0, current.total - current.used);
  const cost = Math.min(estimateExchangeCredits(userText), affordable);
  const next: CreditState = {
    total: current.total,
    used: Math.min(current.total, current.used + cost),
    status: current.status,
  };
  cacheCredits(next);
  return next;
}
