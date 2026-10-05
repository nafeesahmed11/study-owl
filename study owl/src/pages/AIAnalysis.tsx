import { useState } from "react";
import { C, Card, Badge, Btn, PageHeader, ProgressBar, Spinner, Select } from "../components/ui";
import { IconSparkles, IconFileText, IconCheck, IconPlus, IconX, IconTrendingUp } from "../components/Icons";

/**
 * Page: AI Analysis (/app/ai-analysis) — student-only, inside AppLayout.
 * Purpose: Pick question papers, run a fake "analysis", then show topic
 *   frequencies, frequently repeated questions, and the marks distribution.
 * Data source: NOT a real AI call. `analyze` hides the results, waits 1.8s,
 *   then re-renders the same static `analysisResult` object regardless of which
 *   papers are selected.
 */

// Papers available to select for analysis
const paperPool = [
  { id: 1, label: "DBMS Final 2023", subject: "DBMS" },
  { id: 2, label: "DBMS Final 2022", subject: "DBMS" },
  { id: 3, label: "DBMS Final 2021", subject: "DBMS" },
  { id: 4, label: "DBMS Midterm 2023", subject: "DBMS" },
  { id: 5, label: "Algorithms Final 2023", subject: "Algorithms" },
];

// The canned analysis payload shown for every run
const analysisResult = {
  subject: "DBMS",
  papers: 4,
  totalQuestions: 38,
  topTopics: [
    { topic: "Normalization (1NF, 2NF, 3NF, BCNF)", freq: 92, marks: [5, 10], appeared: 4 },
    { topic: "Transaction Management & ACID Properties", freq: 78, marks: [5, 10], appeared: 3 },
    { topic: "SQL Queries & Joins", freq: 71, marks: [5, 10], appeared: 3 },
    { topic: "ER Diagram & Relational Mapping", freq: 65, marks: [5], appeared: 3 },
    { topic: "Indexing & Hashing", freq: 54, marks: [5, 10], appeared: 2 },
    { topic: "Concurrency Control", freq: 48, marks: [5], appeared: 2 },
    { topic: "Database Security", freq: 32, marks: [3, 5], appeared: 2 },
  ],
  repeatedQuestions: [
    { question: "Explain the different normal forms with examples. Normalize the given relation to BCNF.", count: 3, marks: 10 },
    { question: "What are ACID properties? Explain each with an example.", count: 3, marks: 5 },
    { question: "Write SQL queries for the given schema involving joins and subqueries.", count: 3, marks: 10 },
    { question: "Draw and explain the ER diagram for a university management system.", count: 2, marks: 10 },
    { question: "Compare B-tree and B+ tree indexing structures.", count: 2, marks: 5 },
  ],
  marksDistribution: [
    { marks: "2 marks", count: 5, pct: 13 },
    { marks: "3 marks", count: 8, pct: 21 },
    { marks: "5 marks", count: 14, pct: 37 },
    { marks: "10 marks", count: 11, pct: 29 },
  ],
};

export default function AIAnalysis() {
  // Ids of the papers currently ticked in the selector (pre-seeded with the 4 DBMS papers)
  const [selected, setSelected] = useState<number[]>([1, 2, 3, 4]);

  // In-flight flag driving the spinner and the button label
  const [analyzing, setAnalyzing] = useState(false);

  // Whether the results panel is mounted; cleared while analyzing
  const [showResult, setShowResult] = useState(true);

  // Fakes the round-trip: hide results, wait 1.8s, then show the canned analysis
  const analyze = () => {
    setShowResult(false);
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setShowResult(true); }, 1800);
  };

  return (
    // Page container: 1200px max width (responsive padding via .page)
    <div className="page" style={{ maxWidth: '1200px' }}>
      {/* Page title + subtitle */}
      <PageHeader title="AI Question Paper Analysis" sub="Detect repeated questions, topic frequencies, and marks distribution across past papers" />

      {/* Two-column layout: 300px selector sidebar, flexible results area.
          Stacks to one column on tablet and phone. */}
      <div className="cols-side-first">
        {/* Paper selector */}
        <Card>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.navy, marginBottom: '14px' }}>Select Papers to Analyze</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {paperPool.map(p => {
              const active = selected.includes(p.id);
              return (
                // Checkbox-style row; clicking toggles this paper in `selected`
                <div key={p.id} onClick={() => setSelected(s => active ? s.filter(x => x !== p.id) : [...s, p.id])} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1.5px solid ${active ? C.indigo : C.border}`, borderRadius: '10px', cursor: 'pointer', backgroundColor: active ? C.indigoLight : C.surface, transition: 'all 0.15s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${active ? C.indigo : C.border}`, backgroundColor: active ? C.indigo : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <IconCheck size={11} color="#fff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>{p.label}</p>
                    <p style={{ fontSize: '11px', color: C.text3 }}>{p.subject}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Btn fullWidth onClick={analyze} loading={analyzing} icon={<IconSparkles size={14} />} disabled={selected.length === 0}>
            {analyzing ? 'Analyzing…' : `Analyze ${selected.length} Paper${selected.length !== 1 ? 's' : ''}`}
          </Btn>
          {selected.length === 0 && <p style={{ fontSize: '12px', color: C.text3, textAlign: 'center', marginTop: '8px' }}>Select at least one paper</p>}
        </Card>

        {/* Results */}
        <div>
          {/* Loading state shown while `analyze` is in flight */}
          {analyzing && (
            <Card style={{ textAlign: 'center', padding: '48px' }}>
              <Spinner size={36} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginTop: '20px' }}>Analyzing question papers…</p>
              <p style={{ fontSize: '13px', color: C.text2, marginTop: '8px' }}>Detecting repeated questions, topic frequency, and marks distribution.</p>
            </Card>
          )}

          {showResult && !analyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary */}
              <div className="stats-4">
                {[{ label: 'Papers Analyzed', value: analysisResult.papers }, { label: 'Total Questions', value: analysisResult.totalQuestions }, { label: 'Topics Identified', value: analysisResult.topTopics.length }, { label: 'Repeated Questions', value: analysisResult.repeatedQuestions.length }].map(s => (
                  <Card key={s.label} padding={16}>
                    <p style={{ fontSize: '22px', fontWeight: 700, color: C.navy }}>{s.value}</p>
                    <p style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>{s.label}</p>
                  </Card>
                ))}
              </div>

              {/* Topic frequency */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <IconTrendingUp size={18} color={C.indigo} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>Topic Frequency Analysis</h3>
                  <Badge variant="purple" style={{ marginLeft: 'auto' }}>AI Generated</Badge>
                </div>
                {analysisResult.topTopics.map((t, i) => (
                  // One topic row: name, evidence line, frequency %, coloured bar
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 500, color: C.text, overflowWrap: 'anywhere' }}>{t.topic}</span>
                        <span style={{ fontSize: '11.5px', color: C.text3, marginLeft: '8px' }}>Appeared in {t.appeared}/{analysisResult.papers} papers · {t.marks.map(m => `${m}M`).join(', ')}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: C.indigo, flexShrink: 0, marginLeft: '12px' }}>{t.freq}%</span>
                    </div>
                    <ProgressBar value={t.freq} />
                  </div>
                ))}
              </Card>

              {/* Repeated questions */}
              <Card>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '16px' }}>Frequently Repeated Questions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.repeatedQuestions.map((q, i) => (
                    // Questions seen 3+ times are highlighted in red
                    <div key={i} style={{ padding: '14px', backgroundColor: q.count >= 3 ? '#FEF2F2' : C.surface2, border: `1px solid ${q.count >= 3 ? '#FECACA' : C.border}`, borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '13.5px', color: C.text, lineHeight: 1.5, flex: '1 1 200px', minWidth: 0, overflowWrap: 'anywhere' }}>{q.question}</p>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <Badge variant={q.count >= 3 ? 'error' : 'warning'}>×{q.count}</Badge>
                          <Badge variant="navy">{q.marks}M</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Marks distribution */}
              <Card>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '16px' }}>Marks Distribution</h3>
                <div className="chart-4">
                  {analysisResult.marksDistribution.map((m, i) => (
                    // One bar per mark band; bar height is percentage * 2px
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '40px', backgroundColor: C.indigo, borderRadius: '6px 6px 0 0', height: `${m.pct * 2}px`, transition: 'height 0.4s', opacity: 0.7 + i * 0.1 }} />
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.navy }}>{m.marks}</p>
                      <p style={{ fontSize: '11px', color: C.text3 }}>{m.count} questions ({m.pct}%)</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
