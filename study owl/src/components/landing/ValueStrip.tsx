import { C, Card } from "../ui";
import { IconBook, IconFileText, IconBrain, IconCalendar, IconCheck, IconBarChart } from "../Icons";
import { Reveal } from "./Reveal";
import { valueLabels } from "./content";

const valueIcons = [IconBook, IconFileText, IconBrain, IconCalendar, IconCheck, IconBarChart];

/**
 * ValueStrip — "Everything you need for your semester": six compact
 * icon+label tiles (no heavy cards), one per core value area.
 */
export function ValueStrip() {
  return (
    <section aria-labelledby="landing-value-title" style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="landing-section" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <Reveal>
          <div className="landing-section-head center">
            <h2 id="landing-value-title" className="landing-h2">Everything you need for your semester</h2>
            <p className="landing-sub">Bring your resources, question papers, AI study tools, and planning into one academic workspace.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="landing-value-grid">
            {valueLabels.map((label, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <Card key={label} hover style={{ padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "var(--r-xl)", backgroundColor: C.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.indigo, margin: "0 auto 12px" }}>
                    <Icon size={20} />
                  </div>
                  <p style={{ fontSize: "13.5px", fontWeight: 600, color: C.navy, lineHeight: 1.4 }}>{label}</p>
                </Card>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
