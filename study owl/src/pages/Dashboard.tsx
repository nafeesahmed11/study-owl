import { useNavigate } from "react-router";
import { C, Card, StatCard, Btn, Badge, ProgressBar } from "../components/ui";
import { IconFolder, IconFileText, IconCheck, IconPlus, IconBrain, IconZap, IconSparkles, IconCalendar, IconChevronRight, IconChevronDown } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

/**
 * Page: Dashboard (/app/dashboard, also the /app index route) — student-only.
 * Purpose: The student's landing page — greeting, KPI row, quick-action
 *   shortcuts, subject progress, study tasks, recent resources, AI insights.
 * Data source: a mix. Identity fields (name, department, semester, batch)
 *   come from `useAuth()`; everything else is the hard-coded arrays below.
 *   Task checkboxes are display-only — they cannot be toggled here.
 */

// Headline KPI cards
const stats = [
  { icon: <IconFolder size={20} />, label: "Saved Resources", value: "47", sub: "+3 this week" },
  { icon: <IconFileText size={20} />, label: "Question Papers", value: "23", sub: "6 subjects" },
  { icon: <IconCheck size={20} />, label: "Quiz Score (avg)", value: "78%", sub: "Last 5 quizzes" },
  { icon: <IconCalendar size={20} />, label: "Study Streak", value: "12 days", sub: "Keep it up!" },
];

// Subjects summarised with their coverage percentage
const subjects = [
  { code: "CSE-401", name: "Database Management Systems", progress: 72, resources: 14, papers: 8, color: "#4F46E5" },
  { code: "CSE-402", name: "Algorithms & Complexity", progress: 58, resources: 9, papers: 5, color: "#059669" },
  { code: "CSE-403", name: "Computer Networks", progress: 45, resources: 11, papers: 6, color: "#D97706" },
  { code: "CSE-404", name: "Software Engineering", progress: 83, resources: 7, papers: 4, color: "#DC2626" },
];

// Study tasks preview; `done` drives the checkmark and strikethrough
const tasks = [
  { title: "Revise Normalization (DBMS)", due: "Today", priority: "High", done: false },
  { title: "Practice Dijkstra's Algorithm", due: "Tomorrow", priority: "Medium", done: false },
  { title: "Read Chapter 5 – OSI Model", due: "Dec 12", priority: "Low", done: false },
  { title: "Complete Assignment 3 – SE", due: "Dec 14", priority: "High", done: true },
];

// Newly added library resources
const recentResources = [
  { title: "DBMS Complete Notes – Unit 4", type: "PDF", subject: "DBMS", by: "Dr. Rahman", verified: true },
  { title: "CN Lab Manual 2024", type: "PDF", subject: "CN", by: "Dept. CSE", verified: true },
  { title: "Algo Past Papers 2019–23", type: "QP", subject: "Algorithms", by: "Senior Upload", verified: false },
];

// AI insight cards; each `action` label links through to AI Analysis
const aiInsights = [
  { text: "Normalization appears in 87% of your selected DBMS question papers.", action: "View Analysis" },
  { text: "You haven't studied Computer Networks in 4 days.", action: "Start Session" },
  { text: "Your quiz accuracy in Algorithms dropped 12% this week.", action: "Practice Now" },
];

export default function Dashboard() {
  // `navigate` powers every shortcut on this page
  const navigate = useNavigate();

  // Signed-in user from context; supplies the greeting and academic details
  const { user } = useAuth();

  // Maps a task priority to its badge colour
  const priorityBadge = (p: string) => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';

  // Identity fields for the header, each with a fallback if context is empty
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const dept = user?.department || 'CSE';
  const sem = user?.semester || '6';
  const batch = user?.batch || '2022';

  return (
    // Page container: wide 1400px for the dashboard grid (responsive padding via .dash-page)
    <div className="dash-page">
      {/* Welcome block: greeting, academic details, and two header actions */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-display-size)', fontWeight: 'var(--text-display-weight)' as any, lineHeight: 'var(--text-display-lh)', letterSpacing: 'var(--text-display-track)', color: C.navy, marginBottom: '6px' }}>
            Good morning, {firstName} 👋
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.55, color: C.text2 }}>
            {dept} · {sem}th Semester · Batch {batch} · <span style={{ color: C.indigo, fontWeight: 600 }}>Finals in 23 days</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Btn variant="secondary" size="sm" icon={<IconPlus size={14} />} onClick={() => navigate('/app/resources')}>Upload Resource</Btn>
          <Btn size="sm" icon={<IconBrain size={14} />} onClick={() => navigate('/app/ai-study')}>Ask AI</Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats" style={{ marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      {/* Quick actions: compact low-emphasis chip row; first four inline, the
          rest in a native "More" menu. Every handler is unchanged. */}
      {/* Quick-action shortcuts: six buttons, each navigating to a feature */}
      <Card style={{ marginBottom: '24px', padding: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: C.textMuted, lineHeight: 1.4, marginBottom: '12px' }}>Quick Actions</p>
        <div className="dash-quick-actions">
          {(() => {
            const quickActions = [
              { label: 'Upload Resource', icon: <IconFolder size={14} />, path: '/app/resources', color: C.indigo },
              { label: 'Analyze Papers', icon: <IconSparkles size={14} />, path: '/app/ai-analysis', color: '#059669' },
              { label: 'Ask AI', icon: <IconBrain size={14} />, path: '/app/ai-study', color: '#7C3AED' },
              { label: 'Start Quiz', icon: <IconCheck size={14} />, path: '/app/quiz', color: '#D97706' },
              { label: 'Add Study Task', icon: <IconCalendar size={14} />, path: '/app/planner', color: '#0EA5E9' },
              { label: 'Marks Generator', icon: <IconZap size={14} />, path: '/app/marks-generator', color: '#DC2626' },
            ];
            const inlineActions = quickActions.slice(0, 4);
            const overflowActions = quickActions.slice(4);
            return (<>
              {inlineActions.map(a => (
                <button key={a.label} className="dash-chip" onClick={() => navigate(a.path)}>
                  <span style={{ color: a.color, display: 'flex' }}>{a.icon}</span>{a.label}
                </button>
              ))}
              {overflowActions.length > 0 && (
                <details className="dash-more-menu">
                  <summary className="dash-chip" aria-label="More quick actions">
                    <IconChevronDown size={14} /> More
                  </summary>
                  <div className="dash-more">
                    {overflowActions.map(a => (
                      <button key={a.label} onClick={() => navigate(a.path)}>
                        <span style={{ color: a.color, display: 'flex' }}>{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </>);
          })()}
        </div>
      </Card>

      {/* Two-column row: current subjects (left) and study tasks (right) */}
      <div className="dash-grid-2">
        {/* Subjects */}
        <Card style={{ padding: '20px', boxShadow: 'var(--sh-1)', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em', color: C.navy }}>Current Subjects</h3>
            <button onClick={() => navigate('/app/subjects')} style={{ fontSize: '12.5px', fontWeight: 600, color: C.indigo, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap', transition: 'opacity 150ms ease' }}>
              View all <IconChevronRight size={12} color={C.indigo} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Display-only preview of the first three subjects; the full list lives on /app/subjects */}
            {subjects.slice(0, 3).map(s => (
              <div key={s.code} onClick={() => navigate('/app/subjects')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: C.navy }}>{s.name}</p>
                    <p style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.5, color: C.textMuted, marginTop: '2px' }}>{s.code} · {s.resources} resources · {s.papers} papers</p>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums', color: C.text2, flexShrink: 0 }}>{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} color={C.indigo} />
              </div>
            ))}
          </div>
        </Card>

        {/* Study Tasks */}
        <Card style={{ padding: '20px', boxShadow: 'var(--sh-1)', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em', color: C.navy }}>Study Tasks</h3>
            <button onClick={() => navigate('/app/planner')} style={{ fontSize: '12.5px', fontWeight: 600, color: C.indigo, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap', transition: 'opacity 150ms ease' }}>
              Open Planner <IconChevronRight size={12} color={C.indigo} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Display-only preview of the first three tasks; the full list lives on /app/planner */}
            {tasks.slice(0, 3).map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '56px', padding: '10px 12px', backgroundColor: t.done ? C.surface2 : C.surface, border: `1px solid ${C.border}`, borderRadius: 'var(--r-lg)', opacity: t.done ? 0.65 : 1 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${t.done ? C.success : C.border}`, backgroundColor: t.done ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.45, color: C.text, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</p>
                  <p style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.5, color: C.textMuted, marginTop: '2px' }}>Due: {t.due}</p>
                </div>
                <Badge variant={priorityBadge(t.priority) as any} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted }}>{t.priority}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: recent resources (wide) and AI insights (340px sidebar) */}
      <div className="dash-grid-aside">
        {/* Recent resources */}
        <Card style={{ padding: '20px', boxShadow: 'var(--sh-1)', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em', color: C.navy }}>Recent Resources</h3>
            <button onClick={() => navigate('/app/resources')} style={{ fontSize: '12.5px', fontWeight: 600, color: C.indigo, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 150ms ease' }}>View Library</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentResources.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px', padding: '12px', backgroundColor: C.surface2, borderRadius: 'var(--r-lg)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-lg)', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo, flexShrink: 0 }}>
                  <IconFileText size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.45, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</p>
                  <p style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.5, color: C.textMuted, marginTop: '2px' }}>{r.subject} · By {r.by}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <Badge variant="navy">{r.type}</Badge>
                  {r.verified && <Badge variant="success">✓</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card style={{ backgroundColor: '#F8F7FF', border: `1px solid #E4E2FF`, padding: '20px', boxShadow: 'var(--sh-1)', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: 'var(--r-md)', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconBrain size={16} color={C.indigo} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em', color: C.navy }}>AI Study Insights</h3>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.4, color: C.textMuted, marginTop: '2px' }}>Powered by Owl AI</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiInsights.map((ins, i) => (
              <div key={i} style={{ padding: '12px 14px', backgroundColor: C.surface, border: `1px solid #E4E2FF`, borderRadius: 'var(--r-lg)' }}>
                <p style={{ fontSize: '14px', lineHeight: 1.55, color: C.text, marginBottom: '8px' }}>{ins.text}</p>
                <button onClick={() => navigate('/app/ai-analysis')} style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.3, color: C.indigo, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 150ms ease' }}>{ins.action} →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
