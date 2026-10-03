import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { C } from "./ui";
import { AppFooter } from "./AppFooter";
import { useAuth } from "../context/AuthContext";
import {
  IconHome, IconBook, IconFolder, IconFileText, IconBrain, IconSparkles,
  IconCheck, IconCalendar, IconBarChart, IconUsers, IconUser, IconSettings,
  IconSearch, IconBell, IconChevronDown, IconChevronLeft, IconChevronRight, IconPlus, IconLightbulb, IconZap,
  IconMessageCircle, IconShield, IconLogout, IconMenu, IconX,
} from "./Icons";

const navItems = [
  { label: "Dashboard", path: "/app/dashboard", icon: <IconHome size={17} /> },
  { label: "Subjects", path: "/app/subjects", icon: <IconBook size={17} /> },
  { label: "Resources", path: "/app/resources", icon: <IconFolder size={17} /> },
  { label: "Question Papers", path: "/app/question-papers", icon: <IconFileText size={17} /> },
];

const aiItems = [
  { label: "AI Study Chat", path: "/app/ai-study", icon: <IconBrain size={17} /> },
  { label: "AI Analysis", path: "/app/ai-analysis", icon: <IconSparkles size={17} /> },
  { label: "Exam Suggestions", path: "/app/exam-suggestions", icon: <IconLightbulb size={17} /> },
  { label: "Marks Generator", path: "/app/marks-generator", icon: <IconZap size={17} /> },
];

const practiceItems = [
  { label: "Quiz", path: "/app/quiz", icon: <IconCheck size={17} /> },
  { label: "Study Planner", path: "/app/planner", icon: <IconCalendar size={17} /> },
  { label: "Progress", path: "/app/progress", icon: <IconBarChart size={17} /> },
];

const communityItems = [
  { label: "Community", path: "/app/community", icon: <IconUsers size={17} /> },
];

function NavGroup({ label, items, onClose, collapsed }: { label: string; items: typeof navItems; onClose?: () => void; collapsed?: boolean }) {
  const location = useLocation();
  return (
    <div style={{ marginBottom: '16px' }}>
      <p className="app-nav-group-label" style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.4, color: C.textMuted, padding: '0 20px 8px', userSelect: 'none' }}>
        {label}
      </p>
      {items.map(item => {
        const active = location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div className="app-nav-item" title={collapsed ? item.label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', minHeight: '40px', margin: '2px 12px', borderRadius: 'var(--r-lg)',
              fontSize: 'var(--text-nav-size)', fontWeight: active ? 600 : 500, lineHeight: 1.4,
              letterSpacing: active ? '-0.005em' : '0',
              color: active ? C.indigo : C.text2,
              backgroundColor: active ? C.indigoLight : 'transparent', boxShadow: active ? 'inset 2px 0 0 0 #4F46E5' : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => onClose?.()}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text2; } }}
            >
              <span style={{ display: 'flex', color: active ? C.indigo : C.text3, flexShrink: 0, transition: 'color 0.2s ease' }}>{item.icon}</span>
              <span className="app-nav-label" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          </NavLink>
        );
      })}
    </div>
  );
}

function Sidebar({ onClose, collapsed = false }: { onClose?: () => void; collapsed?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`app-sidebar${collapsed ? ' is-collapsed' : ''}`} style={{
      width: collapsed ? '76px' : 'var(--sidebar-w, 260px)', flexShrink: 0,
      borderRight: `1px solid ${C.border}`, backgroundColor: C.surface,
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto', overflowX: 'hidden',
      transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Logo */}
      <div className="app-sidebar-head" style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '36px', width: 'auto', flexShrink: 0 }} />
          <div className="app-sidebar-brand-text">
            <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy, lineHeight: 1.2, letterSpacing: '-0.01em' }}>Study Owl AI</p>
            <p style={{ fontSize: '11.5px', fontWeight: 500, color: C.textMuted, lineHeight: 1.4, marginTop: '2px' }}>Academic Platform</p>
          </div>
          {onClose && (
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              aria-label="Close menu"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.text3, display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text3; }}
            >
              <IconX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
        <NavGroup label="Main" items={navItems} onClose={onClose} collapsed={collapsed} />
        <NavGroup label="AI Tools" items={aiItems} onClose={onClose} collapsed={collapsed} />
        <NavGroup label="Practice" items={practiceItems} onClose={onClose} collapsed={collapsed} />
        <NavGroup label="Community" items={communityItems} onClose={onClose} collapsed={collapsed} />
      </nav>
    </div>
  );
}

function TopBar({ onMenuClick, isSidebarOpen, onToggleNav, isNavCollapsed }: { onMenuClick?: () => void; isSidebarOpen?: boolean; onToggleNav?: () => void; isNavCollapsed?: boolean }) {
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      height: '64px', borderBottom: `1px solid ${C.border}`,
      backgroundColor: C.surface, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    }}>
      <button
        className="mobile-only"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-expanded={!!isSidebarOpen}
        style={{ display: 'none', background: 'none', border: 'none', color: C.text2, padding: '8px', marginLeft: '-8px', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text2; }}
      >
        <IconMenu size={22} />
      </button>

      <button
        className="desktop-only"
        onClick={onToggleNav}
        aria-label={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!isNavCollapsed}
        title={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: C.text2, padding: '8px', marginLeft: '-8px', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text2; }}
      >
        {isNavCollapsed ? <IconChevronRight size={20} /> : <IconChevronLeft size={20} />}
      </button>

      <div className="desktop-only" style={{ position: 'relative', flex: 1, maxWidth: '440px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.text3, display: 'flex' }}>
          <IconSearch size={16} />
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search resources, papers, topics…"
          aria-label="Search resources, papers and topics"
          style={{
            width: '100%', padding: '9px 16px 9px 40px', fontSize: '14px', lineHeight: 1.5,
            borderRadius: 'var(--r-pill)', border: `1px solid ${C.border}`, backgroundColor: C.bg,
            color: C.text, outline: 'none', transition: 'all 0.2s ease',
          }}
          onFocus={e => { e.target.style.borderColor = C.indigo; e.target.style.backgroundColor = C.surface; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.backgroundColor = C.bg; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="desktop-only" style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
          backgroundColor: C.indigo, color: '#fff', border: 'none', borderRadius: 'var(--r-pill)',
          fontSize: '13.5px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.005em', cursor: 'pointer',
          transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.indigoHover; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.indigo; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(79, 70, 229, 0.2)'; }}
      >
          <IconPlus size={16} color="#fff" /> New
        </button>

        <button aria-label="Notifications" style={{ position: 'relative', background: 'none', border: 'none', color: C.text2, padding: '10px', display: 'flex', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text2; }}>
          <IconBell size={20} />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.error, border: `2px solid ${C.surface}` }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: 'none', border: `1px solid ${profileOpen ? C.indigo : C.border}`, borderRadius: 'var(--r-pill)', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: profileOpen ? C.indigoLight : 'transparent' }}
            onMouseEnter={e => { if (!profileOpen) { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
            onMouseLeave={e => { if (!profileOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = C.border; } }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>A</div>
            <span className="desktop-only" style={{ fontSize: '14px', fontWeight: 600, color: C.navy }}>Alex J.</span>
            <IconChevronDown size={14} color={C.text3} />
          </button>

          {profileOpen && (
            <div style={{ position: 'absolute', right: 0, top: '115%', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', boxShadow: 'var(--sh-3)', minWidth: '240px', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: '#F8FAFC' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>Alex Johnson</p>
                <p style={{ fontSize: '13px', color: C.text2, marginTop: '2px' }}>CSE · 6th Sem · 2022</p>
              </div>
              <div style={{ padding: '8px 0' }}>
                {[
                  { label: 'Profile', icon: <IconUser size={16} />, path: '/app/profile' },
                  { label: 'Settings', icon: <IconSettings size={16} />, path: '/app/settings' },
                ].map(item => (
                  <button key={item.label} onClick={() => { navigate(item.path); setProfileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: C.text, textAlign: 'left', transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.indigo; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text; }}>
                    <span style={{ color: C.text3 }}>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${C.border}` }} />
              <div style={{ padding: '8px 0' }}>
                <button onClick={() => { navigate('/'); setProfileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: C.error, textAlign: 'left', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.errorLight}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <IconLogout size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  // Mobile drawer visibility; the desktop sidebar ignores this entirely
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktop-only icon rail. Purely presentational: the content column is a
  // flex sibling, so it widens into the freed space automatically.
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const location = useLocation();

  // Auto-close the drawer whenever the route changes (covers deep links and
  // browser back/forward, which do not always fire a nav-link click)
  useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

  // Escape closes the drawer; the listener only exists while it is open
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSidebarOpen]);

  return (
    // Outer frame: exactly one screen tall, column direction, clipped. Nothing
    // may grow it — every scroll happens inside `main`.
    <div
      className="app-shell"
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', maxHeight: '100vh', width: '100%',
        overflow: 'hidden', backgroundColor: C.bg,
      }}
    >
      <style>{`
        .sidebar-desktop { display: none; }
        .app-footer { display: none; }
        @media (min-width: 1024px) {
          .sidebar-desktop { display: block !important; }
          .app-footer { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
        }

        /* Desktop navigation rail. Collapsing hides the labels visually but
           keeps them in the accessibility tree, so every item keeps its name
           (and shows a tooltip). Purely CSS - no item is ever unmounted. */
        @media (min-width: 1024px) {
          .app-sidebar.is-collapsed .app-nav-label {
            position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
            overflow: hidden; white-space: nowrap; clip-path: inset(50%);
          }
          .app-sidebar.is-collapsed .app-nav-group-label,
          .app-sidebar.is-collapsed .app-sidebar-brand-text { display: none; }
          .app-sidebar.is-collapsed .app-nav-item {
            justify-content: center; padding-left: 0; padding-right: 0;
          }
          .app-sidebar.is-collapsed .app-sidebar-head { padding-left: 8px; padding-right: 8px; }
        }

        /* Prefer the dynamic viewport unit where supported so mobile browser
           toolbars cannot push the footer out of view. */
        @supports (height: 100dvh) {
          .app-shell { height: 100dvh !important; max-height: 100dvh !important; }
        }

        /* Mobile drawer: fixed overlay panel, slid with a 300ms transform.
           z-index must clear the TopBar (50), so the drawer sits at 210 and
           the backdrop at 200. */
        .mobile-drawer {
          display: flex;
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 210;
          transform: translateX(-100%);
          transition: transform 300ms ease-in-out;
          box-shadow: 0 0 24px rgba(0,0,0,0.18);
        }
        .mobile-drawer.open { transform: translateX(0); }
        @media (min-width: 1024px) {
          .mobile-drawer { display: none !important; }
          .mobile-backdrop { display: none !important; }
        }

        /* Translucent scrim behind the open drawer; tap to dismiss */
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background-color: rgba(0,0,0,0.4);
        }
      `}</style>

      {/* Middle workspace: fills every pixel between the top of the screen and
          the footer. `minHeight: 0` stops inner panes from stretching the shell
          downward instead of scrolling themselves. */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* Desktop sidebar - rendered once; collapses to an icon rail via the
            TopBar toggle. Its height comes from the workspace row, so it ends
            at the footer's top edge instead of running past it. */}
        <aside className="sidebar-desktop" style={{ height: '100%', flexShrink: 0 }}>
          <Sidebar collapsed={isNavCollapsed} />
        </aside>

        {/* Mobile drawer - same Sidebar, overlaid and collapsible */}
        <aside
          className={`mobile-drawer${isSidebarOpen ? ' open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Backdrop; click anywhere outside the drawer to close it */}
        {isSidebarOpen && (
          <div className="mobile-backdrop" aria-hidden="true" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Content column: top bar plus the single scrolling region */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <TopBar
            onMenuClick={() => setIsSidebarOpen(true)}
            isSidebarOpen={isSidebarOpen}
            onToggleNav={() => setIsNavCollapsed(v => !v)}
            isNavCollapsed={isNavCollapsed}
          />
          <main className="app-main" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global footer: a flat child of the shell, so it spans the full width
          (including under the sidebar) and pins to the bottom edge. */}
      <AppFooter />

    </div>
  );
}
