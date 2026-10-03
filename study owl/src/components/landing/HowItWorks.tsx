import { C } from "../ui";
import { Reveal } from "./Reveal";
import { steps } from "./content";

/**
 * HowItWorks — a simple three-step explanation (Collect → Analyze → Prepare)
 * using only the platform's real capabilities.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="landing-how-title" style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="landing-section">
        <Reveal>
          <div className="landing-section-head center">
            <span className="landing-eyebrow">How it works</span>
            <h2 id="landing-how-title" className="landing-h2">From scattered files to a study plan</h2>
            <p className="landing-sub">Collect your materials, let AI surface what matters, and prepare with structure.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <ol className="landing-steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {steps.map(s => (
              <li key={s.step} style={{ padding: "28px 24px", backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: "var(--r-3xl)" }}>
                <p className="landing-step-num">{s.step}</p>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.navy, marginBottom: "10px" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.65 }}>{s.desc}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
