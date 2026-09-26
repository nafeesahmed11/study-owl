import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { C } from "./ui";
import { useAuth } from "../context/AuthContext";
import {
  IconHome, IconBook, IconFolder, IconFileText, IconBrain, IconSparkles,
  IconCheck, IconCalendar, IconBarChart, IconUsers, IconUser, IconSettings,
  IconSearch, IconBell, IconChevronDown, IconPlus, IconLightbulb, IconZap,
  IconMessageCircle, IconShield, IconLogout,
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

function NavGroup({ label, items }: { label: string; items: typeof navItems }) {
  const location = useLocation();
  return (
    <div style={{ marginBottom: '4px' }}>
      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3, padding: '8px 16px 4px', userSelect: 'none' }}>
        {label}
      </p>
      {items.map(item => {
        const active = location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 14px', margin: '1px 8px', borderRadius: '8px',
              fontSize: '13.5px', fontWeight: active ? 600 : 400,
              color: active ? C.indigo : C.text2,
              backgroundColor: active ? C.indigoLight : 'transparent',
              transition: 'background 0.12s, color 0.12s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = C.surface2; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ display: 'flex', color: active ? C.indigo : C.text3, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          </NavLink>
        );
      })}
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  return (
    <div style={{
      width: 'var(--sidebar-w, 260px)', flexShrink: 0,
      borderRight: `1px solid ${C.border}`, backgroundColor: C.surface,
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '32px', width: 'auto' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>Study Owl AI</p>
            <p style={{ fontSize: '10px', color: C.text3, lineHeight: 1 }}>Academic Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <NavGroup label="Main" items={navItems} />
        <NavGroup label="AI Tools" items={aiItems} />
        <NavGroup label="Practice" items={practiceItems} />
        <NavGroup label="Community" items={communityItems} />
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 8px' }}>
        {[
          { label: 'Profile', path: '/app/profile', icon: <IconUser size={16} /> },
          { label: 'Settings', path: '/app/settings', icon: <IconSettings size={16} /> },
        ].map(item => {
          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 14px',
                  borderRadius: '8px', fontSize: '13.5px', fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.indigo : C.text2, backgroundColor: isActive ? C.indigoLight : 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = C.surface2; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ color: isActive ? C.indigo : C.text3 }}>{item.icon}</span>
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function TopBar() {
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      height: '56px', borderBottom: `1px solid ${C.border}`,
      backgroundColor: C.surface, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '12px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, display: 'flex' }}>
          <IconSearch size={15} />
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search resources, papers, topics…"
          style={{
            width: '100%', padding: '7px 12px 7px 32px', fontSize: '13.5px',
            borderRadius: '8px', border: `1.5px solid ${C.border}`, backgroundColor: C.surface2,
            color: C.text, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = C.indigo}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Quick add */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
          backgroundColor: C.indigo, color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        }}>
          <IconPlus size={14} color="#fff" /> New
        </button>

        {/* Notifications */}
        <button style={{ position: 'relative', background: 'none', border: 'none', color: C.text2, padding: '7px', display: 'flex', borderRadius: '8px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <IconBell size={18} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: C.error, border: `2px solid ${C.surface}` }} />
        </button>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 5px', background: 'none', border: `1.5px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer' }}
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
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      <style>{`
        .sidebar-desktop { display: none; }
        @media (min-width: 1024px) {
          .sidebar-desktop { display: block !important; }
        }
        @media (max-width: 1023px) {
          .mobile-nav-show { display: flex !important; }
        }
      `}</style>

      {/* Desktop sidebar - rendered only once */}
      <aside className="sidebar-desktop">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="mobile-nav-show" style={{ display: 'none' }}>
        <MobileNav />
      </div>
    </div>
  );
}
