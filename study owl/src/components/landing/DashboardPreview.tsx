import { C, Badge } from "../ui";
import {
  IconFolder, IconFileText, IconBrain, IconCalendar, IconCheck, IconBarChart,
} from "../Icons";

/**
 * DashboardPreview — a static, token-built illustration of the real dashboard
 * for the hero column. It mirrors the copy, values, and visual patterns of
 * src/pages/Dashboard.tsx (KPI stats, quick actions, subject progress, AI
 * insights) but is explicitly non-interactive: the frame is decorative
 * (aria-hidden) with a screen-reader description, and no fake functionality
 * is implied. Buttons are rendered as inert spans, never real controls.
 */
export function DashboardPreview() {
  return (
    <div
      className="landing-preview"
      role="img"
      aria-label="Preview of the Study Owl AI dashboard showing study statistics, subject progress, and AI insights."
    >
      <span className="sr-only">Preview of the Study Owl AI dashboard.</span>
      {/* Window bar */}
      <div className="landing-preview-bar" aria-hidden="true">
        <span className="landing-preview-dot" style={{ backgroundColor: "#F87171" }} />
        <span className="landing-preview-dot" style={{ backgroundColor: "#FBBF24" }} />
        <span className="landing-preview-dot" style={{ backgroundColor: "#34D399" }} />
        <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 600, color: C.textMuted }}>
          Study Owl AI — Dashboard
        </span>
      </div>
      <div className="landing-preview-body" aria-hidden="true">
        {/* KPI row */}
        <div className="landing-preview-kpis">
          {[
            { label: "Saved Resources", value: "47", icon: <IconFolder size={16} /> },
            { label: "Question Papers", value: "23", icon: <IconFileText size={16} /> },
            { label: "Quiz Score (avg)", value: "78%", icon: <IconCheck size={16} /> },
            { label: "Study Streak", value: "12 days", icon: <IconCalendar size={16} /> },
          ].map(s => (
            <div key={s.label} className="landing-preview-mini" style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: C.indigo, marginBottom: "6px" }}>
                {s.icon}
              </div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>{s.value}</p>
              <p style={{ fontSize: "11px", fontWeight: 500, color: C.textMuted, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Subject progress */}
        <div className="landing-preview-mini">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>Subject Progress</p>
            <span style={{ fontSize: "12px", fontWeight: 600, color: C.indigo }}>View all</span>
          </div>
          {[
            { name: "Database Management Systems", code: "CSE-401", progress: 72, color: "#4F46E5" },
            { name: "Algorithms & Complexity", code: "CSE-402", progress: 58, color: "#059669" },
            { name: "Computer Networks", code: "CSE-403", progress: 45, color: "#D97706" },
          ].map(s => (
            <div key={s.code} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <p style={{ fontSize: "12.5px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.name}
                </p>
                <span style={{ fontSize: "12px", fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.progress}%</span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", backgroundColor: C.surface2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: "99px", backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* AI insight + quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "12px" }}>
          <div className="landing-preview-mini" style={{ backgroundColor: "#F8F7FF", border: "1px solid #E4E2FF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <IconBrain size={15} color={C.indigo} />
              <p style={{ fontSize: "12px", fontWeight: 600, color: C.navy }}>AI Study Insights</p>
            </div>
            <p style={{ fontSize: "12px", lineHeight: 1.6, color: C.text }}>
              Normalization appears in 87% of your selected DBMS question papers.
            </p>
          </div>
          <div className="landing-preview-mini">
            <p style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Quick Actions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Upload", "Analyze", "Ask AI", "Quiz", "Planner"].map(a => (
                <span key={a} style={{ fontSize: "11px", fontWeight: 600, color: C.text, backgroundColor: C.surface2, border: `1px solid ${C.border}`, borderRadius: "var(--r-md)", padding: "4px 8px" }}>
                  {a}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", alignItems: "center" }}>
              <Badge variant="navy">DBMS</Badge>
              <span style={{ display: "inline-flex", alignItems: "center", color: C.indigo }}><IconBarChart size={14} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
