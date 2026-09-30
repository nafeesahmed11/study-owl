import { C } from "./ui";

/**
 * Component: AppFooter — the branding/legal bar pinned to the bottom of the
 *   signed-in /app/* shell, rendered once by AppLayout.
 * Purpose: Visual twin of the public Landing footer (src/pages/Landing.tsx),
 *   slimmed down so it does not steal height from full-height pages such as
 *   the AI Study chat. The Privacy/Terms/Contact links are placeholders,
 *   exactly as they are on the Landing page.
 * Layout: hidden below 1024px via the `.app-footer` class so it never collides
 *   with the fixed MobileNav; AppLayout's media query switches it back on for
 *   desktop, matching the `.sidebar-desktop` / `.mobile-nav-show` pattern.
 */
export function AppFooter() {
  return (
    <footer
      className="app-footer"
      style={{
        borderTop: `1px solid ${C.border}`,
        backgroundColor: C.surface,
        padding: '12px 24px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      <p style={{ fontSize: '12.5px', color: C.text3 }}>© 2026 Study Owl AI. All rights reserved.</p>

      <div style={{ display: 'flex', gap: '20px' }}>
        {['Privacy', 'Terms', 'Contact'].map(link => (
          <a key={link} href="#" style={{ fontSize: '12.5px', color: C.text2 }}>
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
