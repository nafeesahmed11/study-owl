import { useState, useRef, useEffect } from "react";
import { C } from "../ui";
import { IconChevronDown } from "../Icons";

export type NavDropdownProps = { label: string; items: string[] };

/**
 * NavDropdown — a navbar dropdown. Owns its open state and closes on any
 * outside mousedown or Escape. The trigger exposes aria-haspopup /
 * aria-expanded / aria-controls and responds to Enter/Space; every panel link
 * anchors to #features, exactly as before.
 */
export function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = `landing-nav-panel-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  // Close the dropdown when a mousedown lands outside `ref`
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Escape closes the dropdown
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex", alignItems: "center", gap: "4px",
          fontSize: "14px", fontWeight: 500, color: open ? C.indigo : C.text2,
          background: "none", border: "none", cursor: "pointer",
          padding: "6px 10px", borderRadius: "var(--r-md)",
        }}
      >
        {label} <IconChevronDown size={13} color={open ? C.indigo : C.text3} />
      </button>
      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={label}
          style={{
            position: "absolute", top: "110%", left: 0,
            backgroundColor: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "var(--r-xl)", padding: "6px", minWidth: "190px",
            boxShadow: "var(--sh-2)", zIndex: 100,
          }}
        >
          {items.map(item => (
            <a
              key={item}
              href="#features"
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "8px 14px", fontSize: "13.5px",
                color: C.text2, borderRadius: "var(--r-md)", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.surface2)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
