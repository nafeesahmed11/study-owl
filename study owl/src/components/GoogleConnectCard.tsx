import { useState } from 'react';
import { C, Card, Btn, Badge } from './ui';
import { IconGoogle, IconLink, IconLogout, IconShield, IconAlertCircle } from './Icons';
import { useIntegration } from '../context/IntegrationContext';
import { SyncStatus, relativeTime } from './SyncStatus';

/** Friendly labels for the read-only scopes we request, keyed by short name. */
const SCOPE_LABELS: Record<string, string> = {
  'drive.metadata.readonly': 'Drive metadata (read-only)',
  'drive.readonly': 'Drive file contents (read-only)',
  'classroom.courses.readonly': 'Classroom courses (read-only)',
  'classroom.coursework.me.readonly': 'Your assignments (read-only)',
  'classroom.courseworkmaterials.readonly': 'Course materials (read-only)',
  openid: 'Your name and profile',
  email: 'Your email address',
  profile: 'Your Google profile',
};

/** Turns `.../auth/drive.readonly` into a readable label. */
function describeScope(scope: string): string {
  return SCOPE_LABELS[scope.split('/').pop() ?? scope] ?? scope;
}

/** Small bordered note used for the config hint and the error banner. */
function Note({ tone, children }: { tone: 'warn' | 'error'; children: React.ReactNode }) {
  const palette = tone === 'warn'
    ? { bg: C.warningLight, border: C.warning, fg: C.warning }
    : { bg: C.errorLight, border: C.error, fg: C.error };

  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '12px 14px',
      backgroundColor: palette.bg, border: `1px solid ${palette.border}30`,
      borderRadius: '10px', marginBottom: '14px', fontSize: '13px', color: palette.fg, lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}


/**
 * Settings → Google Drive tab: connect / inspect / sync / disconnect.
 *
 * Replaces the previous mock toggle. Read-only scopes only — Study Owl can list
 * file metadata and Classroom coursework but can never modify or delete
 * anything in the connected account.
 */
export function GoogleConnectCard() {
  const { configured, connection, hasToken, connect, disconnect, connecting, error, clearError } =
    useIntegration();
  const [busy, setBusy] = useState(false);

  /** Runs an async action, holding the button in its loading state meanwhile. */
  const run = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    setBusy(true);
    await action();
    setBusy(false);
  };

  const connected = !!connection;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            backgroundColor: connected ? C.successLight : C.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconGoogle size={22} color={connected ? C.success : C.text3} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>Google Drive &amp; Classroom</h3>
            <Badge variant={connected ? 'success' : 'default'}>{connected ? 'Connected' : 'Not Connected'}</Badge>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.6, marginBottom: '16px' }}>
          Connect your Google account to browse Drive files and auto-sync Classroom course materials
          and assignments into your Resource Library. Study Owl stores file
          <strong> metadata only</strong> — your files stay in Google Drive and open in Google's
          own viewer.
        </p>

        {!configured && (
          <Note tone="warn">
            <IconAlertCircle size={16} />
            <span>
              Not configured yet. Add <code>VITE_GOOGLE_CLIENT_ID</code> to your <code>.env</code>{' '}
              file and restart the dev server.
            </span>
          </Note>
        )}

        {connected && (
          <div style={{
            padding: '12px 16px', backgroundColor: C.successLight,
            border: `1px solid ${C.success}30`, borderRadius: '10px', marginBottom: '14px',
          }}>
            <p style={{ fontSize: '13.5px', color: C.success, fontWeight: 600 }}>
              ✓ Connected as {connection!.email}
            </p>
            <p style={{ fontSize: '12px', color: C.text2, marginTop: '4px' }}>
              {connection!.lastSyncedAt
                ? `Classroom last synced ${relativeTime(connection!.lastSyncedAt)}.`
                : 'Classroom has not synced yet.'}
            </p>
          </div>
        )}

        {error && (
          <Note tone="error">
            <span style={{ flex: 1 }}>{error}</span>
            <Btn size="xs" variant="ghost" onClick={clearError}>Dismiss</Btn>
          </Note>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconShield size={15} color={C.success} />
          <span style={{ fontSize: '12.5px', color: C.text2 }}>
            Read-only access. We never request write or delete permission.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {connected ? (
            <>
              {hasToken
                ? <SyncStatus />
                : <Btn size="sm" onClick={() => void run(connect)} loading={connecting}>Reconnect</Btn>}
              <Btn variant="danger" icon={<IconLogout size={14} />} loading={busy} onClick={() => void run(disconnect)}>
                Disconnect
              </Btn>
            </>
          ) : (
            <Btn
              disabled={!configured}
              icon={<IconLink size={14} />}
              loading={connecting}
              onClick={() => void run(connect)}
            >
              Connect Google Account
            </Btn>
          )}
        </div>
      </Card>

      {/* Granted scopes, so the student can audit exactly what was shared */}
      {connected && connection!.scopes.length > 0 && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '4px' }}>
            Permissions granted
          </h3>
          <p style={{ fontSize: '13px', color: C.text2, marginBottom: '16px' }}>
            Revoking access from your Google account settings also stops syncing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {connection!.scopes.map(scope => (
              <div key={scope} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Badge variant="info">{describeScope(scope)}</Badge>
                <span style={{ fontSize: '11.5px', color: C.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {scope}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Classroom tenant hint — the most common confusing outcome */}
      {connected && connection!.classroomAvailable === false && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '8px' }}>
            No Classroom courses found
          </h3>
          <p style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.6 }}>
            Google Classroom is only available on <strong>Workspace for Education</strong> accounts.
            A personal @gmail.com account always returns an empty course list — Drive import still
            works. Connect a school account to sync coursework.
          </p>
        </Card>
      )}
    </div>
  );
}
