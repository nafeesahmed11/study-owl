/**
 * Google integration configuration — the single source of truth for client id
 * and scopes.
 *
 * Vite inlines every `VITE_*` value into the built bundle, so only a *public*
 * OAuth client id may live here. A client secret would be meaningless in the
 * browser: the Google Identity Services token model never uses one, which is
 * exactly what makes this flow work without a backend.
 */

/** Build-time env bag. `import.meta.env` is provided by Vite (see vite-env.d.ts). */
const env = import.meta.env as Record<string, string | undefined>;

/** Public OAuth 2.0 client id from Google Cloud Console. Empty when unconfigured. */
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID ?? '';

/** True when a client id was supplied, i.e. "Connect" can do real work. */
export const isGoogleConfigured = GOOGLE_CLIENT_ID.trim().length > 0;

/** Sign-in identity, used to show which Google account authorised the connection. */
export const OPENID_SCOPES = ['openid', 'email', 'profile'];

/** Drive: read-only metadata + read-only content. Never `.modify` / `.delete`. */
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

/** Classroom: read-only course, coursework and course-material scopes. */
export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
];

/** The full read-only consent set requested on connect. */
export const GOOGLE_SCOPES = [...OPENID_SCOPES, ...DRIVE_SCOPES, ...CLASSROOM_SCOPES];

/**
 * How long a Classroom sync may go un-run before we auto-trigger one on load.
 * A browser tab cannot poll while closed, so this is checked on mount / focus.
 */
export const AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Minimum gap between manual "Sync now" clicks, per user. */
export const MANUAL_SYNC_COOLDOWN_MS = 60 * 1000;
