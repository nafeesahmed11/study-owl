import { C, Card } from "../ui";
import {
  IconFolder, IconFileText, IconBrain, IconSparkles, IconLightbulb, IconZap,
  IconCalendar, IconCheck, IconBarChart, IconUsers,
} from "../Icons";
import { Reveal } from "./Reveal";
import { featureGroups } from "./content";

/** Icon per feature title — all icons come from the existing Icons.tsx set. */
const featureIcons: Record<string, React.ReactNode> = {
  "Academic Resource Library": <IconFolder size={20} />,
  "Question Paper Archive": <IconFileText size={20} />,
  "AI Study Assistant": <IconBrain size={20} />,
  "AI Question Paper Analysis": <IconSparkles size={20} />,
  "Exam Preparation Suggestions": <IconLightbulb size={20} />,
  "Marks-Based Answer Generator": <IconZap size={20} />,
  "Smart Study Planner": <IconCalendar size={20} />,
  "Progress Tracking": <IconBarChart size={20} />,
  "Quiz & Practice": <IconCheck size={20} />,
  "Academic Community": <IconUsers size={20} />,
};

/**
 * Features — the product's real feature set, grouped by value area
 * (Academic Resources, AI Study Tools, Productivity, Community).
 * Every claim maps to an existing /app/* route; nothing is invented.
 */
export function Features() {
  return (
    <section id="features" aria-labelledby="landing-features-title" style={{ scrollMarginTop: "72px" }}>
      <div className="landing-section">
        <Reveal>
          <div className="landing-section-head">
            <span className="landing-eyebrow">Features</span>
            <h2 id="landing-features-title" className="landing-h2">Everything you need to ace your semester.</h2>
            <p className="landing-sub">
              Stop juggling Drive, WhatsApp, notes apps, and AI tools. Study Owl AI brings everything into one intelligent academic workspace.
            </p>
          </div>
        </Reveal>
        {featureGroups.map((group, gi) => (
          <Reveal key={group.label} delay={gi === 0 ? 0 : 60}>
            <div className="landing-group">
              <p className="landing-group-label">{group.label}</p>
              <div className="landing-cards">
                {group.items.map(item => (
                  <Card key={item.title} hover style={{ padding: "24px" }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: "44px", height: "44px", borderRadius: "var(--r-xl)",
                        backgroundColor: C.indigoLight, display: "flex", alignItems: "center",
                        justifyContent: "center", color: C.indigo, marginBottom: "16px",
                      }}
                    >
                      {featureIcons[item.title]}
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.navy, marginBottom: "8px", lineHeight: 1.4 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.6 }}>{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
