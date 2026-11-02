import { useEffect, useState, useRef } from 'react';
import { C, Modal, Input, Textarea, Select, Btn } from '../ui';
import { IconRefresh } from '../Icons';
import {
  AGENT_INSTRUCTIONS_MAX,
  AGENT_NAME_MAX,
  ALLOWED_MODELS,
  ALLOWED_PROVIDERS,
  ALLOWED_PROVIDERS_LABEL,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_AGENT_NAME,
  DEFAULT_COMMAND_PREFIX,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  DEFAULT_TEMPERATURE,
  sanitizeAgentName,
  sanitizeAgentInstructions,
  type AgentConfig,
} from '../../lib/agentConfig';

/**
 * AgentConfigModal — the Developer Mode configuration interface for the
 * AI Study chat page.
 *
 * Contains an explicit two-state mode switch (Default ↔ Developer), so the
 * default agent mode is always one click away and Developer Mode stays
 * optional. Editable fields are disabled while in Default mode.
 *
 * - Agent name / prefix: live counter, capped at AGENT_NAME_MAX (30)
 * - System instructions: counter, capped at AGENT_INSTRUCTIONS_MAX (1000),
 *   sanitized on Apply (control chars stripped, newlines preserved)
 * - Draft state: re-seeded every time the dialog opens; Cancel or the header
 *   X discards unsaved edits
 * - Reset: clears the saved configuration back to defaults (draft included)
 *
 * The note under the switch describes the real behaviour: the instructions are
 * stored in the student's Supabase row and applied by the backend on every
 * request.
 */
export function AgentConfigModal({
  open,
  onClose,
  config,
  devMode,
  onSetDevMode,
  onApply,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  config: AgentConfig;
  devMode: boolean;
  onSetDevMode: (on: boolean) => void;
  onApply: (next: AgentConfig) => void;
  onReset: () => void;
}) {
  // Draft edits — re-seeded from the saved config each time the dialog opens.
  const [name, setName] = useState(config.name);
  const [instructions, setInstructions] = useState(config.instructions);
  const [provider, setProvider] = useState(config.provider);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [commandPrefix, setCommandPrefix] = useState(config.commandPrefix);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl || '');
  const [isApiKeyDirty, setIsApiKeyDirty] = useState(false);

  // Masked API key: show first 6 chars, then asterisks, then last 2 chars
  const maskedApiKey = apiKey
    ? apiKey.length > 12
      ? apiKey.substring(0, 6) + '•••••' + apiKey.substring(apiKey.length - 2)
      : '****' + apiKey
    : '—';

  useEffect(() => {
    if (open) {
      setName(config.name);
      setInstructions(config.instructions);
      setProvider(config.provider);
      setModel(config.model);
      setTemperature(config.temperature);
      setCommandPrefix(config.commandPrefix);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () =>
    onApply({
      name: sanitizeAgentName(name),
      instructions: sanitizeAgentInstructions(instructions),
      provider,
      model,
      temperature,
      commandPrefix,
      apiKey: isApiKeyDirty ? apiKey : undefined,
      apiBaseUrl: isApiKeyDirty ? apiBaseUrl : undefined,
    });

  const reset = () => {
    onReset();
    setName(DEFAULT_AGENT_CONFIG.name);
    setInstructions(DEFAULT_AGENT_CONFIG.instructions);
    setProvider(DEFAULT_AGENT_CONFIG.provider);
    setModel(DEFAULT_AGENT_CONFIG.model);
    setTemperature(DEFAULT_AGENT_CONFIG.temperature);
    setCommandPrefix(DEFAULT_AGENT_CONFIG.commandPrefix);
  };

  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = {
      name,
      instructions,
      provider,
      model,
      temperature,
      commandPrefix,
      devMode,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studyowl-agent-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const next: AgentConfig = {
          name: typeof raw.name === 'string' ? raw.name : '',
          instructions: typeof raw.instructions === 'string' ? raw.instructions : '',
          provider: typeof raw.provider === 'string' ? raw.provider : DEFAULT_PROVIDER,
          model: typeof raw.model === 'string' ? raw.model : DEFAULT_MODEL,
          temperature: typeof raw.temperature === 'number' ? raw.temperature : DEFAULT_TEMPERATURE,
          commandPrefix: typeof raw.commandPrefix === 'string' ? raw.commandPrefix : DEFAULT_COMMAND_PREFIX,
        };
        setName(next.name);
        setInstructions(next.instructions);
        setProvider(next.provider);
        setModel(next.model);
        setTemperature(next.temperature);
        setCommandPrefix(next.commandPrefix);
      } catch {
        // Invalid JSON — silently ignore
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const namePct = name.length / AGENT_NAME_MAX;
  const instrPct = instructions.length / AGENT_INSTRUCTIONS_MAX;

  return (
    <Modal open={open} onClose={onClose} title="Configure AI agent" width={480}>
      {/* Mode switch: Default is always reachable; fields are read-only there. */}
      <div role="group" aria-label="Agent mode" style={{ display: 'flex', gap: '4px', padding: '4px', backgroundColor: C.surface2, borderRadius: 'var(--r-md)', marginBottom: '12px' }}>
        <button
          type="button"
          aria-pressed={!devMode}
          onClick={() => onSetDevMode(false)}
          style={{ flex: 1, padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', backgroundColor: !devMode ? C.surface : 'transparent', color: !devMode ? C.navy : C.text2, boxShadow: !devMode ? 'var(--sh-1)' : 'none', transition: 'background 0.15s, color 0.15s' }}
        >
          Default mode
        </button>
        <button
          type="button"
          aria-pressed={devMode}
          onClick={() => onSetDevMode(true)}
          style={{ flex: 1, padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', backgroundColor: devMode ? C.indigo : 'transparent', color: devMode ? '#fff' : C.text2, boxShadow: devMode ? 'var(--sh-1)' : 'none', transition: 'background 0.15s, color 0.15s' }}
        >
          Developer mode
        </button>
      </div>

      {/* Honest scope note + mode guidance. */}
      <div style={{ backgroundColor: C.infoLight, border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: 'var(--r-md)', padding: '10px 12px', fontSize: '12px', lineHeight: 1.55, color: C.text2, marginBottom: '16px' }}>
        {devMode ? (
          <>Settings are saved to your account and follow you across devices. System instructions are sent with every message, so the agent answers in the style you configure here.</>
        ) : (
          <>You are using the default agent (<strong style={{ color: C.navy, fontWeight: 600 }}>{DEFAULT_AGENT_NAME}</strong>). Switch to Developer mode to customize the agent name and instructions.</>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', opacity: devMode ? 1 : 0.55 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-name-field" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              Agent name <span style={{ color: C.text3, fontWeight: 400 }}>(prefix)</span>
            </label>
            <span style={{ fontSize: '11px', fontVariantNumeric: 'tabular-nums', color: namePct > 0.85 ? C.warning : C.text3 }}>
              {name.length}/{AGENT_NAME_MAX}
            </span>
          </div>
          <Input
            id="ai-study-agent-name-field"
            fullWidth
            maxLength={AGENT_NAME_MAX}
            disabled={!devMode}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={DEFAULT_AGENT_NAME}
            autoComplete="off"
          />
          <p style={{ fontSize: '11.5px', color: C.text2, marginTop: '6px' }}>
            Shown in the chat header and above each reply. Leave empty for the default name.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-instructions" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              System instructions
            </label>
            <span style={{ fontSize: '11px', fontVariantNumeric: 'tabular-nums', color: instrPct > 0.85 ? C.warning : C.text3 }}>
              {instructions.length}/{AGENT_INSTRUCTIONS_MAX}
            </span>
          </div>
          <Textarea
            id="ai-study-agent-instructions"
            aria-label="System instructions"
            disabled={!devMode}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            maxLength={AGENT_INSTRUCTIONS_MAX}
            placeholder="e.g. You are a concise exam-focused tutor. Prefer bullet points, always end with a 5-mark model answer."
            style={{ minHeight: '96px' }}
          />
        </div>

        {/* Model & Generation Configuration */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-provider" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              Model Provider
            </label>
          </div>
          <Select
            id="ai-study-agent-provider"
            options={ALLOWED_PROVIDERS.map(p => ({ value: p, label: ALLOWED_PROVIDERS_LABEL[p] }))}
            value={provider}
            disabled={!devMode}
            onChange={e => setProvider(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginTop: '12px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-model" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              Model
            </label>
          </div>
          <Select
            id="ai-study-agent-model"
            options={ALLOWED_MODELS[provider].map(m => ({ value: m, label: m }))}
            value={model}
            disabled={!devMode}
            onChange={e => setModel(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginTop: '12px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-temperature" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              Temperature
            </label>
            <span style={{ fontSize: '11px', fontVariantNumeric: 'tabular-nums', color: C.text3 }}>
              {temperature}
            </span>
          </div>
          <Input
            id="ai-study-agent-temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            disabled={!devMode}
            value={String(temperature)}
            onChange={e => setTemperature(Number(e.target.value))}
            style={{ width: '100%', padding: 0, height: '6px', backgroundColor: 'transparent', border: 'none' }}
          />
        </div>

        {/* Command Prefix Customization */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
            <label htmlFor="ai-study-agent-command-prefix" style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
              Command prefix
            </label>
            <span style={{ fontSize: '11px', color: C.text3 }}>
              Symbol before command names (e.g. ?fix)
            </span>
          </div>
          <Input
            id="ai-study-agent-command-prefix"
            maxLength={3}
            disabled={!devMode}
            value={commandPrefix}
            onChange={e => setCommandPrefix(e.target.value)}
            placeholder={DEFAULT_COMMAND_PREFIX}
            style={{ width: '60px' }}
          />
        </div>

      {/* API Keys Configuration */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>
            API Configuration
          </label>
          <span style={{ fontSize: '11px', color: C.text3 }}>
            Custom API key for this provider
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: C.text2, marginBottom: '4px' }}>Provider</div>
            <div style={{ fontSize: '12px', color: C.navy, fontWeight: 500 }}>
              {provider === 'openai' ? 'OpenAI / compatible' : 'Google Gemini'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: C.text2, marginBottom: '4px' }}>Model</div>
            <div style={{ fontSize: '12px', color: C.navy, fontWeight: 500 }}>
              {model}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: C.text2, marginBottom: '4px' }}>API Key</div>
            <Input
              id="ai-study-agent-api-key"
              type="password"
              fullWidth
              disabled={!devMode}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setIsApiKeyDirty(true); }}
              placeholder="Enter your API key (optional)"
              autoComplete="off"
            />
            {apiKey && (
              <div style={{ fontSize: '11px', color: C.text3, marginTop: '4px' }}>
                Current key: {maskedApiKey}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: C.text2, marginBottom: '4px' }}>API Base URL</div>
            <Input
              id="ai-study-agent-api-base-url"
              fullWidth
              disabled={!devMode}
              value={apiBaseUrl}
              onChange={(e) => { setApiBaseUrl(e.target.value); setIsApiKeyDirty(true); }}
              placeholder="https://api.openai.com/v1 (optional)"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      </div>

      {/* Actions: Reset on the left, Cancel/Apply on the right; wraps on phones. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={reset} disabled={!devMode}>
            Reset to defaults
          </Btn>
          <Btn variant="ghost" size="sm" onClick={handleExport} disabled={!devMode}>
            Export config
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => importInputRef.current?.click()} disabled={!devMode}>
            Import config
          </Btn>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn size="sm" onClick={apply} disabled={!devMode}>Apply changes</Btn>
        </div>
      </div>

    </Modal>
  );
}
