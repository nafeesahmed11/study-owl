import { useState, ReactNode, CSSProperties, useRef, useEffect } from "react";
import { IconX, IconChevronDown, IconAlertCircle, IconCheckCircle, IconInfo } from "./Icons";

// ─── Color tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg: '#F7F7FA', surface: '#FFFFFF', surface2: '#F1F1F6', border: '#E2E2E8',
  navy: '#0F172A', navyMid: '#1E1B4B',
  indigo: '#4F46E5', indigoHover: '#4338CA', indigoLight: '#EEF2FF',
  text: '#1E293B', text2: '#475569', text3: '#94A3B8', textMuted: '#64748B',
  success: '#059669', successLight: '#ECFDF5',
  warning: '#D97706', warningLight: '#FFFBEB',
  error: '#DC2626', errorLight: '#FEF2F2',
  info: '#0EA5E9', infoLight: '#F0F9FF',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
} as const;

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type BtnSize = 'xs' | 'sm' | 'md' | 'lg';

const btnStyles: Record<BtnVariant, CSSProperties> = {
  primary: { backgroundColor: C.indigo, color: '#fff', border: 'none' },
  secondary: { backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}` },
  ghost: { backgroundColor: 'transparent', color: C.text2, border: 'none' },
  danger: { backgroundColor: C.error, color: '#fff', border: 'none' },
  outline: { backgroundColor: 'transparent', color: C.indigo, border: `1.5px solid ${C.indigo}` },
};

const btnHover: Record<BtnVariant, CSSProperties> = {
  primary: { backgroundColor: C.indigoHover },
  secondary: { backgroundColor: '#E8E8EE' },
  ghost: { backgroundColor: C.surface2, color: C.text },
  danger: { backgroundColor: '#B91C1C' },
  outline: { backgroundColor: C.indigoLight },
};

const btnPad: Record<BtnSize, string> = {
  xs: '5px 12px', sm: '8px 16px', md: '10px 20px', lg: '12px 24px',
};
const btnFont: Record<BtnSize, string> = {
  xs: '12px', sm: '13.5px', md: '14px', lg: '15px',
};

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Btn({
  variant = 'primary', size = 'md', icon, iconRight, loading, fullWidth,
  children, style, ...rest
}: BtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        minHeight: size === 'xs' ? '28px' : size === 'sm' ? '36px' : size === 'md' ? '40px' : '44px',
        padding: btnPad[size], fontSize: btnFont[size], fontWeight: 600, lineHeight: 1.3,
        letterSpacing: '0.005em',
        borderRadius: 'var(--r-md)', cursor: rest.disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, opacity 0.15s',
        opacity: (rest.disabled || loading) ? 0.55 : 1,
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        whiteSpace: 'nowrap',
        ...btnStyles[variant],
        ...(hov && !rest.disabled && !loading ? btnHover[variant] : {}),
        ...style,
      }}
    >
      {loading ? <Spinner size={14} color="currentColor" /> : icon}
      {children}
      {iconRight}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'navy';

const badgeMap: Record<BadgeVariant, [string, string]> = {
  default: [C.surface2, C.text2],
  success: [C.successLight, C.success],
  warning: [C.warningLight, C.warning],
  error: [C.errorLight, C.error],
  info: [C.infoLight, C.info],
  purple: [C.purpleLight, C.purple],
  navy: [C.indigoLight, C.indigo],
};

export function Badge({ variant = 'default', children, style }: {
  variant?: BadgeVariant; children: ReactNode; style?: CSSProperties;
}) {
  const [bg, fg] = badgeMap[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: 'var(--r-pill)',
      fontSize: 'var(--text-badge-size)', fontWeight: 'var(--text-badge-weight)' as any,
      lineHeight: 'var(--text-badge-lh)', letterSpacing: '0.02em', whiteSpace: 'nowrap',
      backgroundColor: bg, color: fg, ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, padding = 24, hover = false }: {
  children: ReactNode; style?: CSSProperties; padding?: number; hover?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 'var(--r-3xl)',
        padding, transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hov ? 'var(--sh-2)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Input({ label, error, icon, fullWidth, style, ...rest }: InputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : undefined }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          {...rest}
          onFocus={e => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={e => { setFocus(false); rest.onBlur?.(e); }}
          style={{
            width: '100%', padding: icon ? '9px 12px 9px 34px' : '9px 12px',
            fontSize: '14px', borderRadius: 'var(--r-md)',
            border: `1.5px solid ${error ? C.error : focus ? C.indigo : C.border}`,
            backgroundColor: C.surface, color: C.text, outline: 'none',
            transition: 'border-color 0.15s',
            ...style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: C.error }}>{error}</span>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string;
}

export function Textarea({ label, error, style, ...rest }: TextareaProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>{label}</label>}
      <textarea
        {...rest}
        onFocus={e => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={e => { setFocus(false); rest.onBlur?.(e); }}
        style={{
          width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px',
          border: `1.5px solid ${error ? C.error : focus ? C.indigo : C.border}`,
          backgroundColor: C.surface, color: C.text, outline: 'none', resize: 'vertical',
          transition: 'border-color 0.15s', minHeight: '80px', ...style,
        }}
      />
      {error && <span style={{ fontSize: '12px', color: C.error }}>{error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; options: { value: string; label: string }[];
}

export function Select({ label, options, style, ...rest }: SelectProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select
          {...rest}
          onFocus={e => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={e => { setFocus(false); rest.onBlur?.(e); }}
          style={{
            width: '100%', padding: '9px 36px 9px 12px', fontSize: '14px', borderRadius: '8px',
            border: `1.5px solid ${focus ? C.indigo : C.border}`,
            backgroundColor: C.surface, color: C.text, outline: 'none',
            appearance: 'none', cursor: 'pointer', transition: 'border-color 0.15s', ...style,
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, pointerEvents: 'none', display: 'flex' }}>
          <IconChevronDown size={14} />
        </span>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 36, src, style }: {
  name: string; size?: number; src?: string; style?: CSSProperties;
}) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#4F46E5', '#0EA5E9', '#059669', '#D97706', '#DC2626', '#7C3AED'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: src ? 'transparent' : colors[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: '#fff',
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color, style }: {
  value: number; max?: number; color?: string; style?: CSSProperties;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} style={{ height: '8px', borderRadius: '99px', backgroundColor: C.surface2, overflow: 'hidden', ...style }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: '99px',
        backgroundColor: color || C.indigo, transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = C.indigo }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, style }: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string; onChange: (id: string) => void; style?: CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, ...style }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', fontSize: '14px', fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          color: active === t.id ? C.indigo : C.text2,
          borderBottom: active === t.id ? `2px solid ${C.indigo}` : '2px solid transparent',
          marginBottom: '-1px', transition: 'color 0.15s',
        }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color, style }: {
  icon: ReactNode; label: string; value: string | number; sub?: string; color?: string; style?: CSSProperties;
}) {
  return (
    <Card style={style}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, color: C.text2, marginBottom: '6px' }}>{label}</p>
          <p style={{ fontSize: 'var(--text-stat-size)', fontWeight: 'var(--text-stat-weight)' as any, color: C.navy, lineHeight: 'var(--text-stat-lh)', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
          {sub && <p style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.5, color: C.textMuted, marginTop: '6px' }}>{sub}</p>}
        </div>
        <div style={{
          width: '44px', height: '44px', borderRadius: 'var(--r-xl)',
          backgroundColor: color || C.indigoLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.indigo, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: {
  icon: ReactNode; title: string; desc?: string; action?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: 'var(--r-3xl)', backgroundColor: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: C.text3 }}>{icon}</div>
      <p style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>{title}</p>
      {desc && <p style={{ fontSize: '14px', color: C.text2, maxWidth: '320px', lineHeight: 1.6 }}>{desc}</p>}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, actions, style }: {
  title: string; sub?: string; actions?: ReactNode; style?: CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', ...style }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-display-size)', fontWeight: 'var(--text-display-weight)' as any, lineHeight: 'var(--text-display-lh)', letterSpacing: 'var(--text-display-track)', color: C.navy, fontFamily: 'var(--font-sans)' }}>{title}</h1>
        {sub && <p style={{ fontSize: '14px', lineHeight: 1.55, color: C.text2, marginTop: '4px' }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ backgroundColor: C.surface, borderRadius: 'var(--r-3xl)', width: '100%', maxWidth: width, boxShadow: 'var(--sh-3)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', display: 'flex', padding: '4px' }}>
            <IconX size={18} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
import { IconSearch } from "./Icons";

export function SearchInput({ placeholder = 'Search…', value, onChange, style }: {
  placeholder?: string; value: string; onChange: (v: string) => void; style?: CSSProperties;
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, display: 'flex' }}>
        <IconSearch size={15} />
      </span>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px 8px 32px', fontSize: '14px', borderRadius: 'var(--r-md)',
          border: `1.5px solid ${C.border}`, backgroundColor: C.surface, color: C.text,
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = C.indigo}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

export function Toast({ type, message, onClose }: {
  type: ToastType; message: string; onClose: () => void;
}) {
  const map: Record<ToastType, [string, string, ReactNode]> = {
    success: [C.successLight, C.success, <IconCheckCircle size={16} color={C.success} />],
    error: [C.errorLight, C.error, <IconAlertCircle size={16} color={C.error} />],
    info: [C.infoLight, C.info, <IconInfo size={16} color={C.info} />],
    warning: [C.warningLight, C.warning, <IconAlertCircle size={16} color={C.warning} />],
  };
  const [bg, border, icon] = map[type];
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      backgroundColor: bg, border: `1px solid ${border}`,
      borderRadius: 'var(--r-lg)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: 'var(--sh-2)', maxWidth: '360px',
    }}>
      {icon}
      <span style={{ fontSize: '14px', color: C.text, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', display: 'flex' }}>
        <IconX size={14} />
      </button>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
export function Divider({ style }: { style?: CSSProperties }) {
  return <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, ...style }} />;
}
