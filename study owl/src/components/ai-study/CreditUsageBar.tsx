import type { CSSProperties } from 'react';
import { C } from '../ui';

export function CreditUsageBar({
  total,
  used,
  status,
  loading = false,
  style,
}: {
  total: number;
  used: number;
  status: 'ready' | 'error';
  loading?: boolean;
  style?: CSSProperties;
}) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safeUsed = Number.isFinite(used) ? Math.max(0, Math.floor(used)) : 0;
  const clampedUsed = Math.min(safeUsed, safeTotal);
  const remaining = Math.max(0, safeTotal - clampedUsed);
  const pct = safeTotal > 0 ? Math.min(100, (clampedUsed / safeTotal) * 100) : 0;
  const depleted = safeTotal > 0 && remaining === 0;

  const labelRow = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        AI Credits
      </span>
    </div>
  );

  if (loading) {
    return (
      <section aria-label="AI credits" aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
        {labelRow}
        <div className="ai-study-credit-skeleton" style={{ height: '8px', borderRadius: '99px', backgroundColor: C.surface2 }} />
        <p style={{ fontSize: '10.5px', color: C.text3, margin: 0 }}>Loading credits…</p>
        <style>{'@keyframes ai-study-credit-pulse{0%,100%{opacity:1}50%{opacity:.45}}.ai-study-credit-skeleton{animation:ai-study-credit-pulse 1.4s ease-in-out infinite}'}</style>
      </section>
    );
  }

  return (
    <section aria-label="AI credits" style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {labelRow}
      <div
        role="progressbar"
        aria-label="AI credits used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${clampedUsed} of ${safeTotal} credits used, ${remaining} remaining`}
        style={{ height: '8px', borderRadius: '99px', backgroundColor: C.surface2, overflow: 'hidden' }}
      >
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', backgroundColor: C.indigo, transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: '10.5px', lineHeight: 1.45, color: depleted ? C.warning : C.text3, fontVariantNumeric: 'tabular-nums', margin: 0 }}>
        {safeTotal === 0
          ? 'No credits available'
          : `${clampedUsed.toLocaleString('en-US')} used · ${remaining.toLocaleString('en-US')} remaining of ${safeTotal.toLocaleString('en-US')}`}
      </p>
      {status === 'error' && (
        <p role="status" style={{ fontSize: '10px', lineHeight: 1.4, color: C.error, margin: 0 }}>
          Storage unavailable — showing default demo data.
        </p>
      )}
    </section>
  );
}
