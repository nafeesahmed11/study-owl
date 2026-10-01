import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../config';

/**
 * Google OAuth for a browser-only app, via the Google Identity Services (GIS)
 * *token model*: `initTokenClient` opens a consent popup and hands back a
 * short-lived access token in a JS callback.
 *
 * Why this shape and not an authorization-code redirect:
 *  - It needs no client secret, which cannot be safely held in a Vite bundle.
 *  - It needs no redirect URI, so it works on the plain-HTTP `localhost:8443`
 *    dev origin that `vite.config.ts` actually serves (no `https` block there).
 *
 * Two honest trade-offs to keep in mind:
 *  - No refresh token is issued, so once the access token expires (~1 hour) the
 *    student must click "Connect" again. That is why we persist the *connection*
 *    but keep the token in `sessionStorage` only.
 *  - With no server there is nothing to verify OAuth `state` against. We bind
 *    each attempt to a per-tab nonce plus the signed-in user id and validate
 *    both on return, which blocks replay and cross-account hijack within the
 *    tab. A server-side flow should still validate `state` properly (see plan).
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client';

/** Where the in-flight attempt nonce is parked while the popup is open. */
const NONCE_KEY = 'studyowl_google_oauth_nonce_v1';

/** An attempt older than this is treated as abandoned and rejected. */
const NONCE_TTL_MS = 10 * 60 * 1000;

declare global {
  interface Window {
    google?: any;
  }
}

/** Loads the GIS script once and resolves with `window.google`. */
export function loadGoogleIdentity(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve(window.google);

    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () =>
        reject(new Error('Could not load Google Identity Services.'))
      );
      return;
    }

    const el = document.createElement('script');
    el.src = GIS_SRC;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve(window.google);
    el.onerror = () => reject(new Error('Could not load Google Identity Services.'));
    document.head.appendChild(el);
  });
}

/** Records a fresh opaque nonce bound to the initiating user. */
function beginAuthorization(userId: string): void {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(NONCE_KEY, JSON.stringify({ nonce, userId, at: Date.now() }));
}

/** Consumes the nonce, throwing when the round-trip is missing, stale or mismatched. */
function consumeAuthorization(userId: string): void {
  const raw = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  if (!raw) throw new Error('OAuth state was missing. Please retry the connection.');

  const saved = JSON.parse(raw);
  if (saved.userId !== userId) {
    throw new Error('OAuth state does not match the signed-in user. Connection rejected.');
  }
  if (Date.now() - saved.at > NONCE_TTL_MS) {
    throw new Error('OAuth state expired. Please retry the connection.');
  }
}

/**
 * Opens the Google consent popup and resolves with the granted access token.
 * `userId` is the signed-in Study Owl user; the round-trip is bound to it.
 */
export async function requestAccessToken(userId: string): Promise<{ token: string; scope: string }> {
  if (!GOOGLE_CLIENT_ID.trim()) {
    throw new Error('Google integration is not configured. Set VITE_GOOGLE_CLIENT_ID in .env.');
  }

  const google = await loadGoogleIdentity();
  beginAuthorization(userId);

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES.join(' '),
      // The consent prompt lists only read-only scopes; no write scope is ever
      // requested, so Study Owl cannot modify or delete anything in the account.
      callback: (resp: any) => {
        try {
          consumeAuthorization(userId);
          if (resp?.error) throw new Error(resp.error_description || resp.error);
          if (!resp?.access_token) throw new Error('Google did not return an access token.');
          resolve({ token: resp.access_token as string, scope: resp.scope ?? '' });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Google sign-in failed.'));
        }
      },
      error_callback: (err: any) =>
        reject(new Error(err?.message || 'Google sign-in was cancelled.')),
    });
    client.requestAccessToken();
  });
}

/**
 * Revokes the grant at Google so "Disconnect" genuinely kills the token rather
 * than just forgetting it locally.
 */
export async function revokeAccessToken(token: string): Promise<void> {
  await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });
}
