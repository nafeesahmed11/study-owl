import { C } from "./ui";

/**
 * Component: AppFooter — the branding/legal bar pinned to the bottom of the
 *   signed-in /app/* shell, rendered once by AppLayout.
 * Purpose: Visual twin of the public Landing footer (src/pages/Landing.tsx),
 *   slimmed down so it does not steal height from full-height pages such as
 *   the AI Study chat. The Privacy/Terms/Contact links are placeholders,
 *   exactly as they are on the Landing page.
 * Layout: rendered from 1024px up via the `.app-footer` class, matching the
 *   `.sidebar-desktop` pattern; AppLayout's media query switches it on for
 *   desktop only.
 */
export function AppFooter() {
  return (
    <footer
      className="app-footer"
      style={{
        borderTop: `1px solid ${C.border}`,
        backgroundColor: C.surface,
        padding: '8px 20px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0,
      }}
    >
      <p style={{ fontSize: '11.5px', color: C.text3 }}>© 2026 Study Owl AI. All rights reserved.</p>

      <div style={{ display: 'flex', gap: '16px' }}>
        {['Privacy', 'Terms', 'Contact'].map(link => (
          <a key={link} href="#" style={{ fontSize: '11.5px', color: C.text2 }}>
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
