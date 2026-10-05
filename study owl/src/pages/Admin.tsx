import { useState } from "react";
import { useNavigate } from "react-router";
import { C, Card, StatCard, Badge, Btn, Tabs, Avatar, PageHeader, SearchInput } from "../components/ui";
import { IconUsers, IconFolder, IconFileText, IconCheck, IconAlertCircle, IconShield, IconTrendingUp, IconBook, IconSettings, IconChevronRight } from "../components/Icons";

/**
 * Page: Admin (/admin) — admin-only; ProtectedRoute guards this with
 *   allowedRoles=["admin"] and it renders its OWN full-page nav bar rather
 *   than the student AppLayout.
 * Purpose: Platform administration across four tabs (Overview, Users,
 *   Verification, Reports).
 * Data source: hard-coded `stats`, `users`, and `pendingResources` arrays.
 *   Every action button (verify, reject, edit role, delete) is inert — the
 *   Verify/Reject buttons do not remove items from the queue.
 */

// The four KPI cards on the overview tab
const stats = [
  { icon: <IconUsers size={20} />, label: "Total Users", value: "2,847", sub: "+124 this month" },
  { icon: <IconFolder size={20} />, label: "Total Resources", value: "8,312", sub: "Across all departments" },
  { icon: <IconFileText size={20} />, label: "Question Papers", value: "1,456", sub: "6 departments" },
  { icon: <IconAlertCircle size={20} />, label: "Pending Verification", value: "34", sub: "Needs review", color: C.warningLight },
];

// Student/senior accounts listed in the Users tab
const users = [
  { name: "Alex Johnson", id: "CSE-2022-007", dept: "CSE", sem: 6, role: "Student", status: "Active", joined: "Jan 2022" },
  { name: "Fahim Hossain", id: "CSE-2021-003", dept: "CSE", sem: 8, role: "Senior", status: "Active", joined: "Jan 2021" },
  { name: "Nadia Islam", id: "CSE-2021-012", dept: "CSE", sem: 8, role: "Senior", status: "Active", joined: "Jan 2021" },
  { name: "Rifat Karim", id: "CSE-2023-045", dept: "CSE", sem: 4, role: "Student", status: "Active", joined: "Jan 2023" },
  { name: "Tanvir Ahmed", id: "ECE-2021-008", dept: "ECE", sem: 8, role: "Senior", status: "Inactive", joined: "Jan 2021" },
];

// Upload queue awaiting review, shared by the overview and verification tabs
const pendingResources = [
  { title: "Advanced Algorithms Notes", uploader: "Tanvir Ahmed", subject: "Algorithms", date: "Dec 11", type: "PDF" },
  { title: "CN Lab Report Sem 6", uploader: "Rifat Karim", subject: "CN", date: "Dec 10", type: "Note" },
  { title: "DBMS Mock Test 2024", uploader: "Batch 2022", subject: "DBMS", date: "Dec 9", type: "QP" },
];

// Badge colours per role and per account status
const roleColors: Record<string, string> = { Student: 'default', Senior: 'purple', Admin: 'error' };
const statusColors: Record<string, string> = { Active: 'success', Inactive: 'default' };

export default function Admin() {
  // `navigate` is used by the logo and the back-to-site link in the top bar
  const navigate = useNavigate();

  // Which of the four admin sections is showing
  const [tab, setTab] = useState('overview');

  // Search term for the Users tab table
  const [search, setSearch] = useState('');

  return (
    // Full-height admin shell (not the student AppLayout)
    <div className="admin-page" style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      {/* Admin nav — wraps onto a second row on phones */}
      <div className="admin-nav" style={{ backgroundColor: C.navyMid, padding: '0 32px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', minHeight: '56px', rowGap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }} onClick={() => navigate('/')}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '28px', filter: 'brightness(10)' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: '2px', marginLeft: '24px', flexWrap: 'wrap' }} className="admin-tabs">
          {[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'verify', label: 'Verification' }, { id: 'reports', label: 'Reports' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: tab === t.id ? 'rgba(255,255,255,0.15)' : 'transparent', color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge variant="error">Admin</Badge>
          <button onClick={() => navigate('/')} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to App</button>
        </div>
      </div>

      {/* Content area — one branch rendered per tab (responsive padding via .page) */}
      <div className="page" style={{ maxWidth: '1400px' }}>
        {/* Overview tab: KPI row, verification queue, and platform activity */}
        {tab === 'overview' && (
          <>
            <PageHeader title="Admin Overview" sub="Study Owl AI platform statistics and management" />
            <div className="stats-4" style={{ marginBottom: '24px' }}>
              {stats.map((s, i) => <StatCard key={i} icon={s.icon} label={s.label} value={s.value} sub={s.sub} color={s.color} />)}
            </div>

            <div className="cols-2">
              {/* Pending verification */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>Pending Verification</h3>
                  <Badge variant="warning">{pendingResources.length} items</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingResources.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', backgroundColor: C.warningLight, border: `1px solid ${C.warning}30`, borderRadius: '10px' }}>
                      <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                        <p style={{ fontSize: '13.5px', fontWeight: 500, color: C.text, overflowWrap: 'anywhere' }}>{r.title}</p>
                        <p style={{ fontSize: '11.5px', color: C.text3 }}>By {r.uploader} · {r.date}</p>
                      </div>
                      <Badge variant="navy">{r.type}</Badge>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <Btn size="xs" variant="secondary">Review</Btn>
                        <Btn size="xs">✓ Verify</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Platform stats */}
              <Card>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '16px' }}>Platform Activity</h3>
                {[
                  { label: 'New users (this week)', value: 47, max: 100 },
                  { label: 'Resources uploaded (this week)', value: 163, max: 300 },
                  { label: 'AI queries (today)', value: 812, max: 1500 },
                  { label: 'Quiz attempts (today)', value: 234, max: 500 },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: C.text2 }}>{s.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: C.navy }}>{s.value}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', backgroundColor: C.surface2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(s.value / s.max) * 100}%`, backgroundColor: C.indigo, borderRadius: '99px' }} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* Users tab: searchable table of accounts */}
        {tab === 'users' && (
          <>
            <PageHeader title="User Management" sub="View, manage, and moderate student accounts" />
            <SearchInput value={search} onChange={setSearch} placeholder="Search users by name, ID, or department…" style={{ marginBottom: '16px', maxWidth: '400px' }} />
            <div className="table-x" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 'var(--r-xl)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 80px 100px 1fr', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface2 }}>
                {['Name', 'Student ID', 'Dept', 'Sem', 'Role', 'Status', 'Actions'].map(h => (
                  <span key={h} style={{ fontSize: '11.5px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {/* One row per user matching the search term */}
              {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase())).map((u, i, arr) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 80px 100px 1fr', gap: '12px', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={u.name} size={32} />
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: C.navy }}>{u.name}</p>
                      <p style={{ fontSize: '11.5px', color: C.text3 }}>{u.joined}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', color: C.text2 }}>{u.id}</span>
                  <span style={{ fontSize: '13px', color: C.text2 }}>{u.dept}</span>
                  <span style={{ fontSize: '13px', color: C.text2 }}>{u.sem}</span>
                  <Badge variant={roleColors[u.role] as any}>{u.role}</Badge>
                  <Badge variant={statusColors[u.status] as any}>{u.status}</Badge>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <Btn size="xs" variant="ghost">View</Btn>
                    <Btn size="xs" variant="secondary">Edit Role</Btn>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Verification tab: the full review queue with reject/verify actions */}
        {tab === 'verify' && (
          <>
            <PageHeader title="Resource Verification" sub="Review and verify uploaded academic resources" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingResources.map((r, i) => (
                <Card key={i} padding={18}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: C.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconFileText size={22} color={C.warning} />
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: C.navy, overflowWrap: 'anywhere' }}>{r.title}</p>
                      <p style={{ fontSize: '13px', color: C.text2, overflowWrap: 'anywhere' }}>Uploaded by <strong>{r.uploader}</strong> · {r.subject} · {r.date}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                    <div className="actions-row">
                      <Btn size="sm" variant="ghost">Preview</Btn>
                      <Btn size="sm" variant="danger">Reject</Btn>
                      <Btn size="sm">✓ Verify</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Reports tab: placeholder, no analytics implemented yet */}
        {tab === 'reports' && (
          <><PageHeader title="Reports & Analytics" /><Card><p style={{ color: C.text3, textAlign: 'center', padding: '48px' }}>Advanced analytics coming soon.</p></Card></>
        )}
      </div>
    </div>
  );
}
