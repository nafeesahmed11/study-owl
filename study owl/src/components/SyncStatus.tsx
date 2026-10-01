import { C, Btn } from './ui';
import { IconRefresh } from './Icons';
import { useIntegration } from '../context/IntegrationContext';

/** Human-friendly "last synced" label, shared by the Settings card and Library. */
export function relativeTime(ts?: number): string {
  if (!ts) return 'never';

  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * "Sync now" control plus the last-synced timestamp.
 *
 * Renders nothing when Google is not connected. When the stored connection is
 * still live but this tab has no access token, it shows a reconnect hint
 * instead of a sync button — the browser token model has no refresh token, so
 * the grant must be re-established by hand.
 */
export function SyncStatus({ compact = false }: { compact?: boolean }) {
  const { connection, hasToken, syncNow, syncing, error } = useIntegration();

  if (!connection) return null;

  if (!hasToken) {
    return (
      <span style={{ fontSize: '12px', color: C.warning }}>
        Session expired — reconnect in Settings to resume syncing.
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <Btn
        size={compact ? 'xs' : 'sm'}
        variant="secondary"
        icon={<IconRefresh size={13} />}
        loading={syncing}
        onClick={() => void syncNow()}
      >
        {syncing ? 'Syncing…' : 'Sync now'}
      </Btn>
      {!compact && (
        <span style={{ fontSize: '12px', color: error ? C.error : C.text3 }}>
          {error ?? `Last synced ${relativeTime(connection.lastSyncedAt)}`}
        </span>
      )}
    </span>
  );
}
