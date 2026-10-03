import { C, Badge, ProgressBar } from "../ui";
import { IconBrain, IconFolder, IconFileText, IconCalendar, IconSparkles, IconCheck } from "../Icons";
import { Reveal } from "./Reveal";
import { showcase } from "./content";

/** Small point-row with a success check, reused across showcase frames. */
function Point({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13.5px", lineHeight: 1.6, color: C.text }}>
      <span aria-hidden="true" style={{ display: "inline-flex", color: C.success, marginTop: "2px", flexShrink: 0 }}>
        <IconCheck size={15} />
      </span>
      {children}
    </li>
  );
}

/**
 * ShowcaseFrame — a generic product-window illustration.
 * Reuses the .landing-preview window language so every panel feels like
 * the same product. Fully decorative: role="img" + aria-label, children
 * aria-hidden, no real controls.
 */
function ShowcaseFrame({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="landing-preview" role="img" aria-label={`Preview of ${title} inside Study Owl AI.`}>
      <div className="landing-preview-bar" aria-hidden="true">
        <span className="landing-preview-dot" style={{ backgroundColor: "#F87171" }} />
        <span className="landing-preview-dot" style={{ backgroundColor: "#FBBF24" }} />
        <span className="landing-preview-dot" style={{ backgroundColor: "#34D399" }} />
        <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 600, color: C.textMuted }}>
          Study Owl AI — {title}
        </span>
      </div>
      <div className="landing-preview-body" id={id} aria-hidden="true">{children}</div>
    </div>
  );
}

/** Mini preview bodies, mirroring the real pages' structure and values. */
function AiAnalysisBody() {
  return (
    <>
      <div className="landing-preview-mini">
        <p style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          4 DBMS papers selected
        </p>
        <p style={{ fontSize: "18px", fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>38 questions analyzed</p>
      </div>
      <div className="landing-preview-mini">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <p style={{ fontSize: "12.5px", fontWeight: 600, color: C.text }}>Normalization</p>
          <span style={{ fontSize: "12px", fontWeight: 700, color: C.indigo }}>92%</span>
        </div>
        <ProgressBar value={92} color={C.indigo} style={{ height: "6px" }} />
        <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
          <Badge variant="navy">5-mark</Badge>
          <Badge variant="purple">10-mark focus</Badge>
        </div>
      </div>
      <div className="landing-preview-mini" style={{ backgroundColor: "#F8F7FF", border: "1px solid #E4E2FF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconBrain size={15} color={C.indigo} />
          <p style={{ fontSize: "12px", fontWeight: 600, color: C.navy }}>AI verdict</p>
        </div>
        <p style={{ fontSize: "12px", lineHeight: 1.6, color: C.text, marginTop: "6px" }}>
          Revise normalization first — it recurs in nearly every selected paper.
        </p>
      </div>
    </>
  );
}

function ResourcesBody() {
  return (
    <>
      {[
        { title: "DBMS Complete Notes – Unit 4", meta: "PDF · DBMS · By Dr. Rahman", badge: "PDF", verified: true },
        { title: "CN Lab Manual 2024", meta: "PDF · CN · By Dept. CSE", badge: "PDF", verified: true },
        { title: "Algo Past Papers 2019–23", meta: "QP · Algorithms · By Senior Upload", badge: "QP", verified: false },
      ].map(r => (
        <div key={r.title} className="landing-preview-mini" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--r-lg)", backgroundColor: C.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.indigo, flexShrink: 0 }}>
            <IconFileText size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</p>
            <p style={{ fontSize: "11.5px", color: C.textMuted, marginTop: "2px" }}>{r.meta}</p>
          </div>
          <Badge variant="navy">{r.badge}</Badge>
          {r.verified && <Badge variant="success">✓</Badge>}
        </div>
      ))}
    </>
  );
}
function QuestionPapersBody() {
  return (
    <>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {["Finals", "Midterms", "Quizzes", "Model Papers"].map(f => (
          <span key={f} style={{ fontSize: "11.5px", fontWeight: 600, color: C.text, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "var(--r-md)", padding: "4px 10px" }}>
            {f}
          </span>
        ))}
      </div>
      {[
        { title: "CSE-401 Final — Dec 2024", meta: "Final · 2024 · 70 marks" },
        { title: "CSE-402 Midterm — Mar 2024", meta: "Midterm · 2024 · 30 marks" },
        { title: "CSE-403 Final — Dec 2023", meta: "Final · 2023 · 70 marks" },
      ].map(p => (
        <div key={p.title} className="landing-preview-mini" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--r-lg)", backgroundColor: C.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.indigo, flexShrink: 0 }}>
            <IconFolder size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</p>
            <p style={{ fontSize: "11.5px", color: C.textMuted, marginTop: "2px" }}>{p.meta}</p>
          </div>
          <span style={{ display: "inline-flex", color: C.indigo, flexShrink: 0 }}><IconSparkles size={15} /></span>
        </div>
      ))}
    </>
  );
}

function PlannerBody() {
  return (
    <>
      {[
        { title: "Revise Normalization (DBMS)", meta: "Today · High", badge: "error" as const, done: false },
        { title: "Practice Dijkstra's Algorithm", meta: "Tomorrow · Medium", badge: "warning" as const, done: false },
        { title: "Complete Assignment 3 – SE", meta: "Dec 14 · Done", badge: "success" as const, done: true },
      ].map(t => (
        <div key={t.title} className="landing-preview-mini" style={{ display: "flex", alignItems: "center", gap: "10px", opacity: t.done ? 0.7 : 1 }}>
          <div style={{
            width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${t.done ? C.success : C.border}`,
            backgroundColor: t.done ? C.success : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            {t.done && <IconCheck size={11} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: t.done ? "line-through" : "none" }}>
              {t.title}
            </p>
            <p style={{ fontSize: "11.5px", color: C.textMuted, marginTop: "2px" }}>{t.meta}</p>
          </div>
          <Badge variant={t.badge}>{t.done ? "Done" : t.meta.split("·")[0].trim()}</Badge>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.textMuted }}>
        <IconCalendar size={14} />
        <p style={{ fontSize: "12px", fontWeight: 500 }}>Today · Upcoming · Overdue · Done buckets</p>
      </div>
    </>
  );
}

const frameBodies: Record<string, React.ReactNode> = {
  "ai-analysis": <AiAnalysisBody />,
  "resources": <ResourcesBody />,
  "question-papers": <QuestionPapersBody />,
  "planner": <PlannerBody />,
};

/**
 * ProductShowcase — the real product, front and center.
 * Four frames (AI Analysis, Resources, Question Papers, Study Planner —
 * the dashboard itself is the hero's preview), each with a short blurb
 * and proof points drawn from content.ts.
 */
export function ProductShowcase() {
  const items = showcase.filter(s => s.id !== "dashboard");
  return (
    <section aria-labelledby="landing-showcase-title" style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="landing-section">
        <Reveal>
          <div className="landing-section-head">
            <span className="landing-eyebrow">Product tour</span>
            <h2 id="landing-showcase-title" className="landing-h2">See your semester, organized.</h2>
            <p className="landing-sub">The same workspace you study in — resources, papers, AI analysis, and planning in one place.</p>
          </div>
        </Reveal>
        <div className="landing-showcase-grid">
          {items.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i, 3) * 80}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                <ShowcaseFrame id={`showcase-frame-${s.id}`} title={s.title}>
                  {frameBodies[s.id]}
                </ShowcaseFrame>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.navy, marginBottom: "6px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.65, marginBottom: "12px" }}>{s.blurb}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {s.points.map(p => <Point key={p}>{p}</Point>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

