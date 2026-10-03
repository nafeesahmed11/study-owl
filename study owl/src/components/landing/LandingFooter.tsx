import { useNavigate } from "react-router";
import { C } from "../ui";
import { dropdownMenus } from "./content";

/**
 * LandingFooter — public-site footer. Links are placeholders ("#" targets),
 * exactly mirroring the app shell's AppFooter so the two stay consistent.
 */
export function LandingFooter() {
  const navigate = useNavigate();
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface, padding: "48px 24px 0" }}>
      <div className="landing-footer-grid">
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "12px" }}
            onClick={() => navigate("/")}
          >
            <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: "28px", width: "auto" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: C.navy }}>
              Study Owl <span style={{ color: C.indigo }}>AI</span>
            </span>
          </div>
          <p style={{ fontSize: "13.5px", color: C.text2, lineHeight: 1.65, maxWidth: "300px" }}>
            Your entire academic life, in one place — resources, question papers, AI study tools, and planning.
          </p>
        </div>
        {Object.entries(dropdownMenus).map(([label, items]) => (
          <nav key={label} aria-label={label}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMuted, marginBottom: "12px" }}>
              {label}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map(item => (
                <li key={item}>
                  <a href="#features" style={{ fontSize: "13.5px", color: C.text2 }}>{item}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="landing-footer-bottom">
        <p style={{ fontSize: "13px", color: C.textMuted }}>© 2026 Study Owl AI. All rights reserved.</p>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <a key={link} href="#" style={{ fontSize: "13px", color: C.text2 }}>{link}</a>
          ))}
        </div>
      </div>
      <div style={{ height: "24px" }} />
    </footer>
  );
}
