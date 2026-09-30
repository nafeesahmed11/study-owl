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
    <div style={{ marginBottom: '4px' }}>
      <p className="app-nav-group-label" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text2, padding: '10px 16px 6px', userSelect: 'none' }}>
        {label}
      </p>
      {items.map(item => {
        const active = location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div className="app-nav-item" title={collapsed ? item.label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', margin: '1px 8px', borderRadius: 'var(--r-md)',
              fontSize: '13.5px', fontWeight: active ? 600 : 400,
              color: active ? C.indigo : C.text2,
              backgroundColor: active ? C.indigoLight : 'transparent',
              boxShadow: active ? `inset 2px 0 0 ${C.indigo}` : 'none',
              transition: 'background 0.12s, color 0.12s, box-shadow 0.12s',
              cursor: 'pointer',
            }}
            onClick={() => onClose?.()}
            onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = C.surface2; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ display: 'flex', color: active ? C.indigo : C.text3, flexShrink: 0 }}>{item.icon}</span>
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
    // `height: 100%` — the height now comes from the wrapper: the desktop
    // <aside> passes 100vh, the mobile drawer passes inset-y-0. Using 100vh
    // inside the fixed drawer would overshoot on mobile browser toolbars.
    // `collapsed` is only ever true for the desktop instance: the rail shrinks
    // to icons and, because the workspace row is a flex container, the content
    // column reflows into the freed width on its own.
    <div className={`app-sidebar${collapsed ? ' is-collapsed' : ''}`} style={{
      width: collapsed ? '72px' : 'var(--sidebar-w, 240px)', flexShrink: 0,
      borderRight: `1px solid ${C.border}`, backgroundColor: C.surface,
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto', overflowX: 'hidden',
      transition: 'width 200ms ease',
    }}>
      {/* Logo */}
      <div className="app-sidebar-head" style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '32px', width: 'auto', flexShrink: 0 }} />
          <div className="app-sidebar-brand-text">
            <p style={{ fontSize: '13px', fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>Study Owl AI</p>
            <p style={{ fontSize: '10px', color: C.text3, lineHeight: 1 }}>Academic Platform</p>
          </div>
          {/* Drawer-only close button; only the mobile instance gets onClose */}
          {onClose && (
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              aria-label="Close menu"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.text3, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <IconX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
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
      height: '56px', borderBottom: `1px solid ${C.border}`,
      backgroundColor: C.surface, display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '12px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Hamburger — mobile only; the desktop layout keeps the static sidebar */}
      <button
        className="mobile-only"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-expanded={!!isSidebarOpen}
        style={{ display: 'none', background: 'none', border: 'none', color: C.text2, padding: '7px', marginLeft: '-7px', borderRadius: '8px', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <IconMenu size={20} />
      </button>

      {/* Collapse the navigation rail — desktop only. Collapsing hands the
          freed width straight to the page content (flex sibling, no overlay). */}
      <button
        className="desktop-only"
        onClick={onToggleNav}
        aria-label={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!isNavCollapsed}
        title={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: C.text2, padding: '7px', marginLeft: '-7px', borderRadius: '8px', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {isNavCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
      </button>

      {/* Search — desktop only, so the mobile bar has room for the controls */}
      <div className="desktop-only" style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, display: 'flex' }}>
          <IconSearch size={15} />
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search resources, papers, topics…"
          aria-label="Search resources, papers and topics"
          style={{
            width: '100%', padding: '7px 12px 7px 32px', fontSize: '13.5px',
            borderRadius: 'var(--r-md)', border: `1.5px solid ${C.border}`, backgroundColor: C.surface2,
            color: C.text, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = C.indigo}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Quick add — desktop only */}
        <button className="desktop-only" style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
          backgroundColor: C.indigo, color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.indigoHover; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.indigo; }}
      >
          <IconPlus size={14} color="#fff" /> New
        </button>

        {/* Notifications */}
        <button aria-label="Notifications" style={{ position: 'relative', background: 'none', border: 'none', color: C.text2, padding: '7px', display: 'flex', borderRadius: 'var(--r-md)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <IconBell size={18} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: C.error, border: `2px solid ${C.surface}` }} />
        </button>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 5px', background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.borderColor = C.indigo; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>A</div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>Alex J.</span>
            <IconChevronDown size={13} color={C.text3} />
          </button>

          {profileOpen && (
            <div style={{ position: 'absolute', right: 0, top: '110%', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: '200px', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: C.navy }}>Alex Johnson</p>
                <p style={{ fontSize: '12px', color: C.text3 }}>CSE · 6th Sem · 2022</p>
              </div>
              {[
                { label: 'Profile', icon: <IconUser size={14} />, path: '/app/profile' },
                { label: 'Settings', icon: <IconSettings size={14} />, path: '/app/settings' },
              ].map(item => (
                <button key={item.label} onClick={() => { navigate(item.path); setProfileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: C.text2, textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {item.icon}{item.label}
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, margin: '4px 0' }} />
              <button onClick={() => { navigate('/'); setProfileOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: C.error, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.errorLight}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <IconLogout size={14} />Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile bottom nav
function MobileNav() {
  const location = useLocation();
  const mobileItems = [
    { label: 'Home', path: '/app/dashboard', icon: <IconHome size={20} /> },
    { label: 'Subjects', path: '/app/subjects', icon: <IconBook size={20} /> },
    { label: 'AI', path: '/app/ai-study', icon: <IconBrain size={20} /> },
    { label: 'Quiz', path: '/app/quiz', icon: <IconCheck size={20} /> },
    { label: 'More', path: '/app/community', icon: <IconUsers size={20} /> },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {mobileItems.map(item => {
        const active = location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.path} to={item.path} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', color: active ? C.indigo : C.text3, gap: '2px' }}>
              {item.icon}
              <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </div>
          </NavLink>
        );
      })}
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
          .mobile-nav-show { display: flex !important; }
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
          /* Clearance for the fixed MobileNav — only where it exists. */
          .app-main { padding-bottom: 80px !important; }
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
           z-index must clear the TopBar (50) and MobileNav (100), so the
           drawer sits at 210 and the backdrop at 200. */
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

      {/* Mobile bottom nav */}
      <div className="mobile-nav-show" style={{ display: 'none' }}>
        <MobileNav />
      </div>
    </div>
  );
}
