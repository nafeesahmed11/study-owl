import { C, Card, Badge, Btn, PageHeader, ProgressBar } from "../components/ui";
import { IconLightbulb, IconTrendingUp, IconBook, IconSparkles, IconChevronRight } from "../components/Icons";
import { useNavigate } from "react-router";

/**
 * Page: Exam Suggestions (/app/exam-suggestions) — student-only, inside AppLayout.
 * Purpose: Topic-priority recommendations derived from past-paper analysis,
 *   split into high/medium/low priority bands, plus teacher tips and CTAs.
 * Data source: hard-coded `suggestions` and `teacherTips` arrays. Fully static
 *   apart from two navigation buttons — there is no real AI call here.
 */

const suggestions = [
  {
    category: "High Priority — Very Likely to Appear",
    color: C.error,
    bg: C.errorLight,
    topics: [
      { topic: "Normalization (1NF–BCNF)", reason: "Appeared in 4/4 analyzed papers", freq: 92, marks: "5M or 10M" },
      { topic: "Transaction Management & ACID Properties", reason: "Appeared in 3/4 papers, often as 5M", freq: 78, marks: "5M" },
      { topic: "SQL Queries with Joins & Subqueries", reason: "Consistently tested, usually 10M", freq: 71, marks: "10M" },
    ],
  },
  {
    category: "Medium Priority — Likely to Appear",
    color: C.warning,
    bg: C.warningLight,
    topics: [
      { topic: "ER Diagram & Relational Mapping", reason: "Appeared in 3/4 papers as 10M question", freq: 65, marks: "10M" },
      { topic: "Indexing: B-Tree vs B+ Tree", reason: "Regular 5M question in final exams", freq: 54, marks: "5M" },
      { topic: "Concurrency Control Protocols", reason: "Appeared as 5M in midterms and finals", freq: 48, marks: "5M" },
    ],
  },
  {
    category: "Lower Priority — Review if Time Permits",
    color: C.indigo,
    bg: C.indigoLight,
    topics: [
      { topic: "Database Security & Authorization", reason: "Appeared occasionally as 3M", freq: 32, marks: "3M" },
      { topic: "Distributed Databases", reason: "Less frequent, sometimes as optional", freq: 24, marks: "5M" },
    ],
  },
];

// Community-sourced exam tips shown in the final card
const teacherTips = [
  "Dr. Rahman always includes at least one ER diagram question in finals.",
  "Normalization questions often require you to identify functional dependencies first.",
  "Practice writing SQL queries from scratch — don't just memorize syntax.",
  "Transaction isolation levels have appeared in the last 3 finals.",
];

// Static render; `navigate` is used only by the two CTA buttons at the bottom
export default function ExamSuggestions() {
  const navigate = useNavigate();
  return (
    // Page container: 1100px max width (responsive padding via .page)
    <div className="page" style={{ maxWidth: '1100px' }}>
      {/* Page title + subtitle */}
      <PageHeader title="Exam Preparation Suggestions" sub="AI-generated recommendations based on question paper analysis — not guaranteed predictions" />

      {/* Disclaimer */}
      <div style={{ padding: '12px 16px', backgroundColor: C.indigoLight, border: `1px solid ${C.indigo}30`, borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <IconSparkles size={16} color={C.indigo} style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: C.indigo, lineHeight: 1.6 }}>
          These suggestions are generated from AI analysis of {4} historical question papers. They reflect observed patterns, not guaranteed future exam content.
        </p>
      </div>

      {/* One card per priority band; topics listed inside with a frequency bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {suggestions.map((group, gi) => (
          <Card key={gi}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: group.color }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.navy }}>{group.category}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Single topic: name, evidence, marks badge, frequency badge, bar */}
              {group.topics.map((t, i) => (
                <div key={i} style={{ padding: '14px', backgroundColor: group.bg, border: `1px solid ${group.color}20`, borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.navy, overflowWrap: 'anywhere' }}>{t.topic}</p>
                      <p style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>{t.reason}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <Badge variant="default">{t.marks}</Badge>
                      <Badge variant="navy">{t.freq}%</Badge>
                    </div>
                  </div>
                  <ProgressBar value={t.freq} />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Teacher suggestions */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <IconBook size={18} color={C.indigo} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>Teacher Suggestions & Course Tips</h3>
            <Badge variant="purple">Community Verified</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teacherTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', backgroundColor: C.surface2, borderRadius: '10px' }}>
                <span style={{ color: C.indigo, fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>·</span>
                <p style={{ fontSize: '13.5px', color: C.text, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        {/* Cross-links to the full analysis and the marks-based answer tool */}
        <div className="actions-row">
          <Btn variant="secondary" icon={<IconSparkles size={14} />} onClick={() => navigate('/app/ai-analysis')}>
            View Full Analysis
          </Btn>
          <Btn icon={<IconBook size={14} />} onClick={() => navigate('/app/marks-generator')}>
            Generate Answers
          </Btn>
        </div>
      </div>
    </div>
  );
}
