import { useState } from "react";
import { C, Card, Badge, ProgressBar, Tabs, PageHeader, Btn, EmptyState, SearchInput } from "../components/ui";
import { IconBook, IconFolder, IconFileText, IconSparkles, IconCheck, IconChevronRight } from "../components/Icons";

/**
 * Page: Subjects (/app/subjects) — student-only, inside AppLayout.
 * Purpose: Master-detail view of the student's subjects. The list view shows
 *   a searchable grid of subject cards; clicking one swaps the whole page for
 *   that subject's detail view (4 tabs: Overview, Resources, Papers, Topics).
 * Data source: hard-coded `allSubjects` plus the `resources`/`papers` mock
 *   arrays used inside the detail view. No persistence.
 */

// Subject catalogue: code, teacher, coverage %, counts, colour, and syllabus topics
const allSubjects = [
  { code: "CSE-401", name: "Database Management Systems", teacher: "Dr. A.K. Rahman", semester: 6, progress: 72, resources: 14, papers: 8, color: "#4F46E5", topics: ["ER Model", "Normalization", "SQL", "Transactions", "Indexing", "Concurrency Control"] },
  { code: "CSE-402", name: "Algorithms & Complexity", teacher: "Prof. M. Hossain", semester: 6, progress: 58, resources: 9, papers: 5, color: "#059669", topics: ["Divide & Conquer", "Dynamic Programming", "Greedy Algorithms", "Graph Algorithms", "NP-Completeness"] },
  { code: "CSE-403", name: "Computer Networks", teacher: "Dr. S. Islam", semester: 6, progress: 45, resources: 11, papers: 6, color: "#D97706", topics: ["OSI Model", "TCP/IP", "Routing Algorithms", "Error Detection", "Data Link Layer"] },
  { code: "CSE-404", name: "Software Engineering", teacher: "Prof. N. Begum", semester: 6, progress: 83, resources: 7, papers: 4, color: "#DC2626", topics: ["SDLC", "Requirements", "Design Patterns", "Testing", "Agile & Scrum"] },
  { code: "CSE-405", name: "Numerical Methods", teacher: "Dr. K. Chowdhury", semester: 6, progress: 34, resources: 6, papers: 3, color: "#7C3AED", topics: ["Bisection Method", "Newton-Raphson", "Interpolation", "Numerical Integration"] },
  { code: "CSE-406", name: "Compiler Design", teacher: "Prof. Z. Ahmed", semester: 6, progress: 61, resources: 8, papers: 5, color: "#0EA5E9", topics: ["Lexical Analysis", "Parsing", "Semantic Analysis", "Code Generation"] },
];

// Sample resources shown in the detail view's "Resources" tab
const resources = [
  { title: "DBMS Lecture Notes – Unit 1-4", type: "PDF", date: "Dec 1", verified: true },
  { title: "SQL Query Practice Sheet", type: "Note", date: "Nov 28", verified: true },
  { title: "Normalization Examples", type: "PDF", date: "Nov 20", verified: false },
];

// Sample question papers shown in the detail view's "Question Papers" tab
const papers = [
  { year: 2023, exam: "Final", marks: 100, questions: 10, analyzed: true },
  { year: 2022, exam: "Final", marks: 100, questions: 10, analyzed: true },
  { year: 2023, exam: "Midterm", marks: 50, questions: 6, analyzed: false },
];

/**
 * Sub-component: the expanded view for one subject.
 * Owns its own tab state and renders a header card (badges, progress, counts)
 * followed by one of four tab bodies. `onBack` returns to the subject grid.
 * Note the resource/paper lists here are the shared mock arrays above, so
 * every subject shows the same items.
 */
function SubjectDetail({ subject, onBack }: { subject: typeof allSubjects[0]; onBack: () => void }) {
  // Which of the four tabs is visible
  const [tab, setTab] = useState('overview');
  return (
    <div>
      {/* Back link to the subject grid */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: C.text2, marginBottom: '16px', padding: 0 }}>
        ← Back to Subjects
      </button>

      {/* Subject header card: icon, code/semester badges, teacher, coverage, counts */}
      <div style={{ padding: '24px', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: subject.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBook size={24} color={subject.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="navy">{subject.code}</Badge>
              <Badge variant="default">Semester {subject.semester}</Badge>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.navy, marginBottom: '2px' }}>{subject.name}</h2>
            <p style={{ fontSize: '13px', color: C.text2 }}>{subject.teacher}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: subject.color }}>{subject.progress}%</p>
            <p style={{ fontSize: '12px', color: C.text3 }}>coverage</p>
          </div>
        </div>
        <ProgressBar value={subject.progress} color={subject.color} />

        <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
          {[{ label: 'Resources', value: subject.resources }, { label: 'Question Papers', value: subject.papers }, { label: 'Topics Covered', value: `${Math.round(subject.topics.length * subject.progress / 100)}/${subject.topics.length}` }].map(s => (
            <div key={s.label}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: C.navy }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: C.text3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail tab bar */}
      <Tabs tabs={[
        { id: 'overview', label: 'Overview' }, { id: 'resources', label: 'Resources' },
        { id: 'papers', label: 'Question Papers' }, { id: 'topics', label: 'Important Topics' },
      ]} active={tab} onChange={setTab} style={{ marginBottom: '20px' }} />

      {/* Overview tab: syllabus checklist + AI recommendation callout */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Card>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: C.navy, marginBottom: '12px' }}>Syllabus Topics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subject.topics.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: i < Math.round(subject.topics.length * subject.progress / 100) ? C.text : C.text3 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i < Math.round(subject.topics.length * subject.progress / 100) ? subject.color : C.border }} />
                  {t}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: C.navy, marginBottom: '12px' }}>AI Recommendation</h4>
            <div style={{ padding: '12px', backgroundColor: C.indigoLight, borderRadius: '10px', fontSize: '13px', color: C.text2, lineHeight: 1.6 }}>
              Based on previous question papers, <strong>Normalization</strong> and <strong>Transaction Management</strong> are the highest-frequency topics. Prioritize these before your final exam.
            </div>
          </Card>
        </div>
      )}

      {/* Resources tab: one row per resource with type and verified badges */}
      {tab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {resources.map((r, i) => (
            <Card key={i} padding={14} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo }}>
                <IconFileText size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: C.text }}>{r.title}</p>
                <p style={{ fontSize: '12px', color: C.text3 }}>{r.date}</p>
              </div>
              <Badge variant="navy">{r.type}</Badge>
              {r.verified && <Badge variant="success">Verified</Badge>}
            </Card>
          ))}
        </div>
      )}

      {/* Question Papers tab: rows showing an AI Analyzed badge or an Analyze action */}
      {tab === 'papers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {papers.map((p, i) => (
            <Card key={i} padding={14} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <IconFileText size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: C.text }}>{p.exam} {p.year}</p>
                <p style={{ fontSize: '12px', color: C.text3 }}>{p.marks} marks · {p.questions} questions</p>
              </div>
              {p.analyzed ? <Badge variant="success">AI Analyzed</Badge> : <Btn size="xs" variant="outline">Analyze</Btn>}
            </Card>
          ))}
        </div>
      )}

      {/* Important Topics tab: frequency bars for high-yield topics */}
      {tab === 'topics' && (
        <Card>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: C.navy, marginBottom: '16px' }}>High-Frequency Topics from Question Papers</h4>
          {[
            { topic: "Normalization (1NF, 2NF, 3NF, BCNF)", frequency: 92 },
            { topic: "Transaction Management & ACID Properties", frequency: 78 },
            { topic: "SQL Queries & Joins", frequency: 71 },
            { topic: "ER Diagram & Relational Model", frequency: 65 },
            { topic: "Indexing & Hashing", frequency: 54 },
          ].map((t, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13.5px', color: C.text }}>{t.topic}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: subject.color }}>{t.frequency}%</span>
              </div>
              <ProgressBar value={t.frequency} color={subject.color} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export default function Subjects() {
  // Which subject is expanded, or null when showing the grid.
  // This single piece of state drives the list/detail switch below.
  const [selected, setSelected] = useState<typeof allSubjects[0] | null>(null);

  // Free-text search across subject name and course code
  const [search, setSearch] = useState('');

  // Detail view takes over the entire page when a subject is selected
  if (selected) return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <SubjectDetail subject={selected} onBack={() => setSelected(null)} />
    </div>
  );

  // Search filter for the grid; matches subject name or course code
  const filtered = allSubjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));

  return (
    // Page container: 1200px max width
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      {/* Page title + the search box supplied as the header action */}
      <PageHeader title="My Subjects" sub="6th Semester · CSE · Batch 2022"
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Search subjects…" style={{ width: '240px' }} />}
      />

      {/* Responsive grid: min 320px per subject card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(s => (
          // Clicking anywhere in the card body expands that subject
          <Card key={s.code} hover style={{ cursor: 'pointer' }} padding={20} >
            <div onClick={() => setSelected(s)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconBook size={20} color={s.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Badge variant="navy" style={{ marginBottom: '6px' }}>{s.code}</Badge>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>{s.name}</h3>
                  <p style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>{s.teacher}</p>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} color={s.color} style={{ marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: C.text3 }}><strong style={{ color: C.text }}>{s.resources}</strong> resources</span>
                <span style={{ fontSize: '12px', color: C.text3 }}><strong style={{ color: C.text }}>{s.papers}</strong> papers</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
