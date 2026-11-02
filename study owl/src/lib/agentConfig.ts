import { supabase } from "./supabase";

/**
 * Agent configuration for the AI Study chat page (/app/ai-study).
 *
 * Persistence is Supabase-first: ai_agent_config holds one row per student,
 * so the same agent follows the student across devices. localStorage stays as
 * an offline cache and fallback.
 */

export const DEFAULT_AGENT_NAME = 'AI Study Assistant';
export const AGENT_NAME_MAX = 30;
export const AGENT_INSTRUCTIONS_MAX = 1000;

const CONFIG_KEY = 'studyowl_aistudy_agent_config_v1';
const DEV_MODE_KEY = 'studyowl_aistudy_devmode_v1';

export const ALLOWED_PROVIDERS = ['openai', 'google-gemini'] as const;
export const ALLOWED_PROVIDERS_LABEL: Record<string, string> = {
  openai: 'OpenAI / compatible',
  'google-gemini': 'Google Gemini',
};

export const DEFAULT_PROVIDER = 'openai';
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_TEMPERATURE = 0.6;
export const DEFAULT_COMMAND_PREFIX = '?';

export interface AgentConfig {
  name: string;
  instructions: string;
  provider: string;
  model: string;
  temperature: number;
  commandPrefix: string;
  apiKey?: string;
  apiBaseUrl?: string;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = Object.freeze({
  name: '',
  instructions: '',
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.6,
  commandPrefix: '?',
});

export function sanitizeAgentName(value: string): string {
  return value
    .replace(/[\\u0000-\\u001F\\u007F]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim()
    .slice(0, AGENT_NAME_MAX);
}

export function sanitizeAgentInstructions(value: string): string {
  return value
    .replace(/[\\u0000-\\u0009\\u000B-\\u001F\\u007F]/g, '')
    .trim()
    .slice(0, AGENT_INSTRUCTIONS_MAX);
}

export function sanitizeProvider(value: string): string {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ALLOWED_PROVIDERS.includes(normalized as (typeof ALLOWED_PROVIDERS)[number])
    ? normalized
    : DEFAULT_PROVIDER;
}

export const ALLOWED_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview'],
  'google-gemini': ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
};

export function sanitizeModel(value: string, provider: string): string {
  const normalized = String(value ?? '').trim();
  if (!normalized) return DEFAULT_MODEL;
  const allowed = ALLOWED_MODELS[provider] || [];
  return allowed.includes(normalized) ? normalized : DEFAULT_MODEL;
}

export function sanitizeTemperature(value: string | number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_TEMPERATURE;
  return Math.min(2, Math.max(0, Math.round(n * 10) / 10));
}

export function sanitizeCommandPrefix(value: string): string {
  const cleaned = value
    .replace(/[\\u0000-\\u001F\\u007F]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
  return cleaned.length > 0 && cleaned.length <= 3 ? cleaned : DEFAULT_COMMAND_PREFIX;
}

function normalize(raw: unknown): AgentConfig {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? sanitizeAgentName(obj.name) : '';
  const instructions = typeof obj.instructions === 'string' ? sanitizeAgentInstructions(obj.instructions) : '';
  const provider = sanitizeProvider(typeof obj.provider === 'string' ? obj.provider : '');
  const model = sanitizeModel(typeof obj.model === 'string' ? obj.model : '', provider);
  const temperature = sanitizeTemperature(typeof obj.temperature === 'number' ? obj.temperature : String(obj.temperature ?? DEFAULT_TEMPERATURE));
  const commandPrefix = sanitizeCommandPrefix(typeof obj.commandPrefix === 'string' ? obj.commandPrefix : '');
  return { name, instructions, provider, model, temperature, commandPrefix };
}

export function loadAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_AGENT_CONFIG };
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AGENT_CONFIG };
  }
}

export function saveAgentConfig(config: AgentConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(normalize(config)));
  } catch { /* ignore */ }
}

export function clearAgentConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch { /* ignore */ }
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
  } catch { /* ignore */ }
}

export function resolveAgentName(config: AgentConfig, devMode: boolean): string {
  const custom = config.name.trim();
  return devMode && custom ? custom : DEFAULT_AGENT_NAME;
}

// ─── Supabase-backed persistence ────────────────────────────────────────────

interface AgentConfigRow {
  name: string;
  instructions: string;
  dev_mode: boolean;
  provider: string;
  model: string;
  temperature: number;
  command_prefix: string;
}

export async function fetchAgentConfig(): Promise<{
  config: AgentConfig;
  devMode: boolean;
}> {
  const { data, error } = await supabase
    .from('ai_agent_config')
    .select('name, instructions, dev_mode, provider, model, temperature, command_prefix')
    .maybeSingle();

  if (error || !data) {
    return { config: loadAgentConfig(), devMode: loadDevMode() };
  }

  const row = data as AgentConfigRow;
  const config: AgentConfig = {
    name: sanitizeAgentName(row.name ?? ''),
    instructions: sanitizeAgentInstructions(row.instructions ?? ''),
    provider: sanitizeProvider(row.provider ?? ''),
    model: sanitizeModel(row.model ?? '', row.provider ?? DEFAULT_PROVIDER),
    temperature: sanitizeTemperature(row.temperature ?? DEFAULT_TEMPERATURE),
    commandPrefix: sanitizeCommandPrefix(row.command_prefix ?? DEFAULT_COMMAND_PREFIX),
  };
  const devMode = !!row.dev_mode;

  saveAgentConfig(config);
  saveDevMode(devMode);

  return { config, devMode };
}

export async function persistAgentConfig(
  config: AgentConfig,
  devMode: boolean,
): Promise<{ success: boolean; error?: string }> {
  const next = {
    name: sanitizeAgentName(config.name),
    instructions: sanitizeAgentInstructions(config.instructions),
    provider: sanitizeProvider(config.provider),
    model: sanitizeModel(config.model, config.provider),
    temperature: sanitizeTemperature(config.temperature),
    commandPrefix: sanitizeCommandPrefix(config.commandPrefix),
  };

  saveAgentConfig(next);
  saveDevMode(devMode);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { success: false, error: 'Sign in to save your agent settings.' };
  }

  const { error } = await supabase.from('ai_agent_config').upsert(
    {
      user_id: userId,
      name: next.name,
      instructions: next.instructions,
      provider: next.provider,
      model: next.model,
      temperature: next.temperature,
      command_prefix: next.commandPrefix,
      dev_mode: devMode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function removeAgentConfig(): Promise<{ success: boolean; error?: string }> {
  clearAgentConfig();
  saveDevMode(false);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { success: true };

  const { error } = await supabase
    .from('ai_agent_config')
    .delete()
    .eq('user_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}