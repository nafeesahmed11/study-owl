/**
 * Agent configuration for the AI Study chat page (/app/ai-study).
 *
 * Holds the user's custom agent name (the visible prefix) and free-form system
 * instructions. Study Owl has no AI backend yet — the
 * chat replies with canned text — so everything is persisted in `localStorage`
 * under versioned keys (the same convention as `lib/integrationStore.ts`).
 * System instructions are stored verbatim but only take effect once a live AI
 * backend is connected; the UI states this explicitly.
 */

/** Identity shown whenever Developer Mode is off or no custom name is set. */
export const DEFAULT_AGENT_NAME = 'AI Study Assistant';
export const AGENT_NAME_MAX = 30;
export const AGENT_INSTRUCTIONS_MAX = 1000;

const CONFIG_KEY = 'studyowl_aistudy_agent_config_v1';
const DEV_MODE_KEY = 'studyowl_aistudy_devmode_v1';

export interface AgentConfig {
  /** Custom prefix shown in the header and above replies. '' = default name. */
  name: string;
  /** Free-form system instructions (persisted; applied by a live backend only). */
  instructions: string;
}

/** The default configuration — no customizations. */
export const DEFAULT_AGENT_CONFIG: AgentConfig = Object.freeze({
  name: '',
  instructions: '',
});

/** Single-line text: strip control chars, collapse whitespace, cap length. */
export function sanitizeAgentName(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, AGENT_NAME_MAX);
}

/** Multi-line text: strip control chars except newline, cap length. */
export function sanitizeAgentInstructions(value: string): string {
  return value
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .trim()
    .slice(0, AGENT_INSTRUCTIONS_MAX);
}

/** Coerces arbitrary persisted JSON into a well-formed config. */
function normalize(raw: unknown): AgentConfig {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? sanitizeAgentName(obj.name) : '';
  const instructions =
    typeof obj.instructions === 'string' ? sanitizeAgentInstructions(obj.instructions) : '';
  return { name, instructions };
}

/** Reads the saved config; corrupt or missing data falls back to defaults. */
export function loadAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_AGENT_CONFIG };
    return normalize(JSON.parse(raw));
  } catch {
    // Storage unavailable (private mode) or corrupt JSON — safe default.
    return { ...DEFAULT_AGENT_CONFIG };
  }
}

/** Persists the config; failures are swallowed so the in-memory state still works. */
export function saveAgentConfig(config: AgentConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(normalize(config)));
  } catch {
    /* Quota / private mode — configuration stays session-only. */
  }
}

/** Removes the saved config (Reset to defaults). */
export function clearAgentConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch {
    /* ignore */
  }
}

export function loadDevMode(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveDevMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(DEV_MODE_KEY, '1');
    else localStorage.removeItem(DEV_MODE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * The prefix actually displayed right now: the custom name only while
 * Developer Mode is active, the default identity otherwise — so exiting
 * Developer Mode always restores the standard agent.
 */
export function resolveAgentName(config: AgentConfig, devMode: boolean): string {
  const custom = config.name.trim();
  return devMode && custom ? custom : DEFAULT_AGENT_NAME;
}
