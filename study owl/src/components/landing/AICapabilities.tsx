import { C, Card } from "../ui";
import { IconBrain, IconSparkles, IconLightbulb, IconZap } from "../Icons";
import { Reveal } from "./Reveal";
import { aiFeatures } from "./content";

const aiIcons = [IconBrain, IconSparkles, IconLightbulb, IconZap];

/**
 * AICapabilities — the four real AI tools (AI Study Chat, AI Analysis,
 * Exam Suggestions, Marks Generator), presented on the pre-scaffolded
 * .landing-ai-band so the AI story gets its own visual beat.
 */
export function AICapabilities() {
  return (
    <section aria-labelledby="landing-ai-title" className="landing-ai-band">
      <div className="landing-section">
        <Reveal>
          <div className="landing-section-head center">
            <span className="landing-eyebrow">AI study tools</span>
            <h2 id="landing-ai-title" className="landing-h2">Study with an AI that knows your syllabus.</h2>
            <p className="landing-sub">Ask questions, analyze past papers, and generate exam-ready answers — all grounded in your own materials.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="landing-cards">
            {aiFeatures.map((f, i) => {
              const Icon = aiIcons[i % aiIcons.length];
              return (
                <Card key={f.title} hover style={{ padding: "24px" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: "44px", height: "44px", borderRadius: "var(--r-xl)",
                      backgroundColor: "#fff", border: "1px solid #E4E2FF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.indigo, marginBottom: "16px",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.navy, marginBottom: "8px", lineHeight: 1.4 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.6 }}>{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
