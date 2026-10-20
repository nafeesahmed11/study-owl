import { useEffect, useState } from 'react';
import { C, Modal, Input, Textarea, Btn } from '../ui';
import { IconRefresh } from '../Icons';
import {
  AGENT_INSTRUCTIONS_MAX,
  AGENT_NAME_MAX,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_AGENT_NAME,
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
 * The note under the switch is intentionally honest: instructions are stored
 * locally and only affect real model behavior once a live AI backend exists
 * (the current chat replies are canned demo text).
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

  useEffect(() => {
    if (open) {
      setName(config.name);
      setInstructions(config.instructions);
    }
    // Seeding at open-time only; later edits live in draft state on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () =>
    onApply({
      name: sanitizeAgentName(name),
      instructions: sanitizeAgentInstructions(instructions),
    });

  const reset = () => {
    onReset();
    setName(DEFAULT_AGENT_CONFIG.name);
    setInstructions(DEFAULT_AGENT_CONFIG.instructions);
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
          <>Settings are saved in this browser. System instructions are stored now and apply automatically once a live AI backend is connected — chat replies are currently canned demo text.</>
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

      </div>

      {/* Actions: Reset on the left, Cancel/Apply on the right; wraps on phones. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
        <Btn variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={reset} disabled={!devMode}>
          Reset to defaults
        </Btn>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn size="sm" onClick={apply} disabled={!devMode}>Apply changes</Btn>
        </div>
      </div>

    </Modal>
  );
}
