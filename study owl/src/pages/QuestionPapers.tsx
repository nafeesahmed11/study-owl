import { useState } from "react";
import { useNavigate } from "react-router";
import { C, Card, Badge, Btn, PageHeader, SearchInput, Select, EmptyState } from "../components/ui";
import { IconFileText, IconDownload, IconEye, IconSparkles, IconStar, IconFilter } from "../components/Icons";

/**
 * Page: Question Papers (/app/question-papers) — student-only, inside AppLayout.
 * Purpose: Browsable archive of past exam papers with search, subject/year/
 *   exam-type filters, per-paper save (star) state, and a jump to AI Analysis.
 * Data source: the in-file `papers` mock array. The `saved` flags are copied
 *   into component state so starring a row only affects this session.
 */

const papers = [
  { id: 1, subject: "Database Management Systems", code: "CSE-401", year: 2023, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: true, saved: true },
  { id: 2, subject: "Database Management Systems", code: "CSE-401", year: 2022, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: true, saved: false },
  { id: 3, subject: "Database Management Systems", code: "CSE-401", year: 2023, exam: "Midterm", marks: 50, questions: 6, semester: 6, dept: "CSE", verified: true, analyzed: false, saved: false },
  { id: 4, subject: "Algorithms & Complexity", code: "CSE-402", year: 2023, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: true, saved: true },
  { id: 5, subject: "Algorithms & Complexity", code: "CSE-402", year: 2022, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: false, analyzed: false, saved: false },
  { id: 6, subject: "Computer Networks", code: "CSE-403", year: 2023, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: false, saved: false },
  { id: 7, subject: "Software Engineering", code: "CSE-404", year: 2023, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: true, saved: false },
  { id: 8, subject: "Numerical Methods", code: "CSE-405", year: 2022, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: false, analyzed: false, saved: false },
  { id: 9, subject: "Database Management Systems", code: "CSE-401", year: 2021, exam: "Final", marks: 100, questions: 10, semester: 6, dept: "CSE", verified: true, analyzed: false, saved: false },
  { id: 10, subject: "Computer Networks", code: "CSE-403", year: 2022, exam: "Midterm", marks: 50, questions: 6, semester: 6, dept: "CSE", verified: true, analyzed: false, saved: true },
];

// Badge colour per exam type
const examColors: Record<string, string> = { Final: 'error', Midterm: 'warning', Quiz: 'info', Model: 'purple' };

export default function QuestionPapers() {
  const navigate = useNavigate();
  // Free-text search across subject name and course code
  const [search, setSearch] = useState('');

  // The three dropdown filters; 'all' disables that filter
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');

  // Per-paper starred state, seeded from each paper's `saved` flag (keyed by id)
  const [savedStates, setSavedStates] = useState<Record<number, boolean>>(Object.fromEntries(papers.map(p => [p.id, p.saved])));

  // Dropdown options derived from the dataset (subjects deduped, years/exams hard-coded)
  const subjects = ['all', ...Array.from(new Set(papers.map(p => p.subject)))].map(s => ({ value: s, label: s === 'all' ? 'All Subjects' : s.split(' ').slice(0, 2).join(' ') }));
  const years = ['all', '2023', '2022', '2021'].map(y => ({ value: y, label: y === 'all' ? 'All Years' : y }));
  const exams = ['all', 'Final', 'Midterm', 'Quiz', 'Model'].map(e => ({ value: e, label: e === 'all' ? 'All Types' : e }));

  // Combined filter: a paper must satisfy search AND all three dropdowns
  const filtered = papers.filter(p => {
    const ms = p.subject.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const msub = subjectFilter === 'all' || p.subject === subjectFilter;
    const myr = yearFilter === 'all' || String(p.year) === yearFilter;
    const mex = examFilter === 'all' || p.exam === examFilter;
    return ms && msub && myr && mex;
  });

  return (
    // Page container: wide 1400px to fit the results table
    <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
      {/* Page title + subtitle */}
      <PageHeader title="Question Paper Archive" sub="Previous year papers filtered by subject, year, and exam type" />

      {/* Toolbar: search box, three filters, and the "Analyze Selected" shortcut */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by subject or code…" style={{ flex: 1, minWidth: '240px' }} />
        <Select options={subjects} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} />
        <Select options={years} value={yearFilter} onChange={e => setYearFilter(e.target.value)} />
        <Select options={exams} value={examFilter} onChange={e => setExamFilter(e.target.value)} />
        <Btn variant="outline" size="sm" icon={<IconSparkles size={14} />} onClick={() => navigate('/app/ai-analysis')}>
          Analyze Selected
        </Btn>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ l: 'Total Papers', v: papers.length }, { l: 'AI Analyzed', v: papers.filter(p => p.analyzed).length }, { l: 'Verified', v: papers.filter(p => p.verified).length }].map(s => (
          <div key={s.l} style={{ padding: '6px 14px', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', color: C.text2 }}>
            <strong style={{ color: C.navy }}>{s.v}</strong> {s.l}
          </div>
        ))}
      </div>

      {/* Empty state when no paper matches the current filters */}
      {filtered.length === 0 ? (
        <EmptyState icon={<IconFileText size={28} />} title="No question papers found" desc="Try adjusting your filters." />
      ) : (
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 100px 80px 1fr', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface2 }}>
            {['Subject', 'Code', 'Year', 'Exam Type', 'Marks', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '11.5px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {/* One row per matching paper: subject, code, year, exam, marks, actions */}
          {filtered.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 100px 80px 1fr', gap: '12px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: C.navy }}>{p.subject}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                  {p.verified && <Badge variant="success">Verified</Badge>}
                  {p.analyzed && <Badge variant="purple">AI Analyzed</Badge>}
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: C.text2 }}>{p.code}</span>
              <span style={{ fontSize: '13px', color: C.text2 }}>{p.year}</span>
              <Badge variant={examColors[p.exam] as any}>{p.exam}</Badge>
              <span style={{ fontSize: '13px', color: C.text2 }}>{p.marks} marks</span>
              {/* Row actions: open, download, star (toggles saved), and AI analysis */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <Btn size="xs" variant="ghost" icon={<IconEye size={12} />}>Open</Btn>
                <Btn size="xs" variant="ghost" icon={<IconDownload size={12} />} />
                <Btn size="xs" variant={savedStates[p.id] ? 'primary' : 'ghost'} icon={<IconStar size={12} />} onClick={() => setSavedStates(s => ({ ...s, [p.id]: !s[p.id] }))} />
                <Btn size="xs" variant="outline" icon={<IconSparkles size={12} />} onClick={() => navigate('/app/ai-analysis')}>
                  AI
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
