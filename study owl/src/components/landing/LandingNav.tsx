import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { C, Btn } from "../ui";
import { IconMenu, IconX } from "../Icons";
import { NavDropdown } from "./NavDropdown";
import { dropdownMenus } from "./content";

/**
 * LandingNav — public-site navbar. Links and destinations are unchanged:
 * "Features" anchors to #features, every dropdown item anchors to #features,
 * "Sign in" navigates to /login, "Get Started" navigates to /register, and the
 * logo navigates home. Only presentation, spacing, and keyboard/ARIA support
 * were improved here.
 */
export function LandingNav() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Close the mobile sheet on any mousedown outside the navbar
  useEffect(() => {
    if (!mobileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [mobileOpen]);

  // Escape closes the mobile sheet and returns focus to the hamburger
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(247,247,250,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        className="landing-nav-row"
        style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px",
          display: "flex", alignItems: "center", gap: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: "34px", width: "auto" }} />
          <span style={{ fontSize: "14px", fontWeight: 700, color: C.navy, letterSpacing: "-0.01em" }}>
            Study Owl <span style={{ color: C.indigo }}>AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
          <div className="landing-nav-links" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <a
              href="#features"
              style={{ fontSize: "14px", fontWeight: 500, color: C.text2, padding: "6px 10px", borderRadius: "var(--r-md)" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.indigo)}
              onMouseLeave={e => (e.currentTarget.style.color = C.text2)}
            >
              Features
            </a>
            <NavDropdown label="Resources" items={dropdownMenus["Resources"]} />
            <NavDropdown label="Question Papers" items={dropdownMenus["Question Papers"]} />
            <NavDropdown label="AI Tools" items={dropdownMenus["AI Tools"]} />
            <NavDropdown label="Community" items={dropdownMenus["Community"]} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="landing-nav-signin"
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 16px", fontSize: "14px", fontWeight: 500, color: C.text,
                background: "none", border: `1.5px solid ${C.border}`,
                borderRadius: "var(--r-md)", cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.indigo)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              Sign in
            </button>
            <Btn className="landing-nav-getstarted" size="sm" onClick={() => navigate("/register")}>
              Get Started
            </Btn>
            {/* Hamburger — mobile/tablet only */}
            <button
              ref={hamburgerRef}
              className="landing-nav-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
              style={{
                display: "none", alignItems: "center", justifyContent: "center",
                minWidth: "40px", minHeight: "40px", background: "none",
                border: `1.5px solid ${C.border}`, borderRadius: "var(--r-md)",
                color: C.text2, cursor: "pointer",
              }}
            >
              {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet — logo + Get Started stay in the bar; everything else
          (Features, the four dropdown groups, Sign in) lives here. */}
      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className="landing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`,
            boxShadow: "var(--sh-3)", padding: "8px 16px 16px",
            maxHeight: "calc(100vh - 64px)", overflowY: "auto",
          }}
        >
          <a href="#features" onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "12px 10px", fontSize: "15px", fontWeight: 600, color: C.navy, borderRadius: "var(--r-md)" }}>Features</a>
          {Object.entries(dropdownMenus).map(([label, items]) => (
            <div key={label} style={{ padding: "4px 0" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMuted, padding: "8px 10px 4px" }}>{label}</p>
              {items.map(item => (
                <a key={item} href="#features" onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "9px 10px", fontSize: "14px", color: C.text2, borderRadius: "var(--r-md)" }}>{item}</a>
              ))}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "10px", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Btn variant="secondary" fullWidth onClick={() => { setMobileOpen(false); navigate("/login"); }}>Sign in</Btn>
            <Btn fullWidth onClick={() => { setMobileOpen(false); navigate("/register"); }}>Get Started</Btn>
          </div>
        </div>
      )}
    </nav>
  );
}
