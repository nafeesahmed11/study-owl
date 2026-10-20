/**
 * Demo credit-usage store for the AI Study page.
 *
 * These values are local demo numbers; no billing or AI usage backend exists.
 */

export interface CreditState {
  total: number;
  used: number;
  status: 'ready' | 'error';
}

const CREDITS_KEY = 'studyowl_aistudy_credits_v1';
export const DEMO_CREDIT_TOTAL = 1000;

export function estimateExchangeCredits(userText: string): number {
  return Math.max(1, Math.ceil(userText.trim().length / 4) + 20);
}

function toCount(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

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

export function consumeCredits(userText: string): CreditState {
  const current = loadCredits();
  const affordable = Math.max(0, current.total - current.used);
  const cost = Math.min(estimateExchangeCredits(userText), affordable);
  const next: CreditState = {
    total: current.total,
    used: Math.min(current.total, current.used + cost),
    status: current.status,
  };
  try {
    localStorage.setItem(CREDITS_KEY, JSON.stringify({ total: next.total, used: next.used }));
    next.status = 'ready';
  } catch {
    next.status = 'error';
  }
  return next;
}
