// Node's ESM resolver needs explicit file extensions, but the source files use
// extensionless imports (Vite convention). This loader bridges the two.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

register('./ts-resolver.mjs', pathToFileURL(import.meta.filename));

const {
  ALLOWED_ROLES,
  MAX_MESSAGE_CHARS,
  MAX_HISTORY_MESSAGES,
  approximateTokens,
  actualCreditsFor,
  buildSystemPrompt,
  creditsForTokens,
  reserveAmountFor,
  sanitizeMessages,
  titleFromMessage,
} = await import('../supabase/functions/ai-chat/logic.ts');

// ── creditsForTokens: 1 credit per 100 tokens, rounded up ───────────────────
assert.equal(creditsForTokens(0), 0);
assert.equal(creditsForTokens(-5), 0);
assert.equal(creditsForTokens(NaN), 0);
assert.equal(creditsForTokens(Infinity), 0);
assert.equal(creditsForTokens(1), 1);
assert.equal(creditsForTokens(100), 1);
assert.equal(creditsForTokens(101), 2);
assert.equal(creditsForTokens(250), 3);
assert.equal(creditsForTokens(1000), 10);

// ── approximateTokens: ~4 characters per token, rounded up per text ─────────
assert.equal(approximateTokens([]), 0);
assert.equal(approximateTokens(['abc']), 1);
assert.equal(approximateTokens(['abcd']), 1);
assert.equal(approximateTokens(['abcde']), 2);
assert.equal(approximateTokens(['abcd', 'abcd']), 2);
assert.equal(approximateTokens(['abcd', 'abcde']), 3);

// ── sanitizeMessages: only user/assistant turns with real text ──────────────
assert.deepEqual(sanitizeMessages(undefined), []);
assert.deepEqual(sanitizeMessages('nope'), []);
assert.deepEqual(sanitizeMessages([null, 1, 'x']), []);
assert.deepEqual(sanitizeMessages([{ role: 'system', content: 'x' }]), []);
assert.deepEqual(sanitizeMessages([{ role: 'user', content: 42 }]), []);
assert.deepEqual(sanitizeMessages([{ role: 'user', content: '   ' }]), []);
assert.deepEqual(
  sanitizeMessages([{ role: 'user', content: '  hello  ' }]),
  [{ role: 'user', content: 'hello' }],
);
assert.deepEqual(
  sanitizeMessages([{ role: 'assistant', content: 'hi' }]),
  [{ role: 'assistant', content: 'hi' }],
);
// a message is truncated to the maximum length
const long = sanitizeMessages([{ role: 'user', content: 'x'.repeat(MAX_MESSAGE_CHARS + 500) }]);
assert.equal(long[0].content.length, MAX_MESSAGE_CHARS);
// only the last MAX_HISTORY_MESSAGES turns are kept
const many = Array.from({ length: MAX_HISTORY_MESSAGES + 10 }, (_, i) => ({
  role: i % 2 === 0 ? 'user' : 'assistant',
  content: `m${i}`,
}));
const kept = sanitizeMessages(many);
assert.equal(kept.length, MAX_HISTORY_MESSAGES);
assert.equal(kept[kept.length - 1].content, `m${MAX_HISTORY_MESSAGES + 9}`);
assert.equal(ALLOWED_ROLES.length, 2);

// ── titleFromMessage: first line, truncated ────────────────────────────────
assert.equal(titleFromMessage('Explain ACID'), 'Explain ACID');
assert.equal(titleFromMessage('First line\nsecond line'), 'First line');
assert.equal(titleFromMessage('   '), 'New conversation');
assert.equal(titleFromMessage('x'.repeat(80)).length, 58);
assert.ok(titleFromMessage('x'.repeat(80)).endsWith('…'));

// ── buildSystemPrompt: the student's instructions are appended ─────────────
const base = 'You are Study Owl.';
assert.equal(buildSystemPrompt(base, ''), base);
assert.equal(buildSystemPrompt(base, '   '), base);
assert.equal(
  buildSystemPrompt(base, 'Be brief.'),
  `${base}\n\nStudent's additional instructions:\nBe brief.`,
);

// ── reserveAmountFor: worst case hold, never zero ──────────────────────────
assert.ok(reserveAmountFor([''], 0) >= 1);
assert.ok(reserveAmountFor(['hello'], 1024) >= 11);
// a longer prompt needs a bigger hold
assert.ok(reserveAmountFor(['x'.repeat(4000)], 1024) > reserveAmountFor(['x'], 1024));

// ── actualCreditsFor: provider usage, with a fallback estimate ─────────────
assert.equal(actualCreditsFor({ total_tokens: 250 }, 100), 3);
assert.equal(actualCreditsFor({ prompt_tokens: 60, completion_tokens: 60 }, 100), 2);
// no usage reported -> the prompt estimate is used
assert.equal(actualCreditsFor({}, 250), 3);
assert.equal(actualCreditsFor({ total_tokens: 0 }, 250), 3);

console.log('ALL AI CHAT EDGE FUNCTION TESTS PASSED');
