import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useAuth } from './AuthContext';
import { AUTO_SYNC_INTERVAL_MS, MANUAL_SYNC_COOLDOWN_MS, isGoogleConfigured } from '../config';
import { requestAccessToken, revokeAccessToken } from '../lib/googleAuth';
import {
  getUserInfo, listActiveCourses, listCourseWork, listCourseWorkMaterials,
  type ClassroomCourse, type ClassroomItem,
} from '../lib/googleApi';
import * as store from '../lib/integrationStore';
import type { GoogleConnection, ImportedResource } from '../lib/integrationStore';

/**
 * App-wide state for the Google Drive + Classroom integration.
 *
 * Mirrors the `AuthContext` pattern: one provider in `App.tsx`, consumed through
 * a `useIntegration()` hook. It owns the connection record, the imported
 * resource list, and the sync lifecycle.
 *
 * Because this app has no server, "scheduled sync" degrades to: run on mount and
 * whenever the tab regains focus, provided the last sync is older than
 * `AUTO_SYNC_INTERVAL_MS`. A closed tab cannot poll — see the plan notes.
 */

export interface ActionResult {
  success: boolean;
  error?: string;
  /** Number of new/changed rows the last sync or import produced. */
  imported?: number;
}

interface IntegrationContextType {
  /** False when VITE_GOOGLE_CLIENT_ID is absent — connect is then disabled. */
  configured: boolean;
  connection: GoogleConnection | null;
  /** True when a live access token is available for this tab. */
  hasToken: boolean;
  resources: ImportedResource[];
  connecting: boolean;
  syncing: boolean;
  error: string | null;
  connect: () => Promise<ActionResult>;
  disconnect: () => Promise<ActionResult>;
  syncNow: (opts?: { silent?: boolean }) => Promise<ActionResult>;
  importDriveFiles: (files: Parameters<typeof store.driveFileToResource>[1][]) => ActionResult;
  importClassroomItems: (items: ClassroomItem[], course: ClassroomCourse) => ActionResult;
  removeResource: (id: string) => void;
  clearError: () => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

/** Pulls every active course plus its published coursework and posted materials. */
async function fetchClassroomItems(token: string) {
  const { courses = [] } = await listActiveCourses(token);
  const collected: { items: ClassroomItem[]; course: ClassroomCourse }[] = [];

  for (const course of courses) {
    const [work, materials] = await Promise.all([
      listCourseWork(token, course.id).catch(() => ({ courseWork: [] as ClassroomItem[] })),
      listCourseWorkMaterials(token, course.id).catch(() => ({ courseWorkMaterial: [] as ClassroomItem[] })),
    ]);

    const items: ClassroomItem[] = [
      ...(work.courseWork ?? []).map(w => ({ ...w, kind: 'courseWork' as const })),
      ...(materials.courseWorkMaterial ?? []).map(m => ({ ...m, kind: 'material' as const })),
    ];
    collected.push({ items, course });
  }
  return collected;
}

export function IntegrationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [connection, setConnection] = useState<GoogleConnection | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [resources, setResources] = useState<ImportedResource[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Timestamp of the last *manual* sync, used to throttle "Sync now". */
  const lastManualSync = useRef(0);

  /** Writes the resource list through to storage and React state together. */
  const persist = useCallback((next: ImportedResource[]) => {
    setResources(next);
    store.saveResources(next);
  }, []);

  /**
   * Pulls Classroom coursework + materials and upserts them into the library.
   * `silent` marks the automatic background path so a failed poll never throws
   * an error banner at the student.
   */
  const syncNow = useCallback(async (opts?: { silent?: boolean }): Promise<ActionResult> => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    const token = store.loadToken();
    if (!token) {
      const message = 'Your Google session expired. Please reconnect.';
      if (!opts?.silent) setError(message);
      setHasToken(false);
      return { success: false, error: message };
    }

    if (!opts?.silent) {
      const now = Date.now();
      if (now - lastManualSync.current < MANUAL_SYNC_COOLDOWN_MS) {
        return { success: false, error: 'Just synced — please wait a moment.' };
      }
      lastManualSync.current = now;
    }

    setSyncing(true);
    try {
      const collected = await fetchClassroomItems(token);
      const incoming = collected.flatMap(({ items, course }) =>
        items.map(item => store.classroomItemToResource(userId, item, course))
      );

      // Idempotent: repeated syncs update existing rows instead of duplicating.
      if (incoming.length) persist(store.upsertResources(resources, incoming));

      const lastSyncedAt = Date.now();
      setConnection(prev => {
        if (!prev) return prev;
        const next = { ...prev, lastSyncedAt, classroomAvailable: collected.length > 0 };
        store.saveConnection(next);
        return next;
      });

      store.saveSyncMeta({ lastSyncAt: lastSyncedAt, lastCourseCount: collected.length });
      if (!opts?.silent) setError(null);
      return { success: true, imported: incoming.length };
    } catch (err: any) {
      const message = err?.message ?? 'Classroom sync failed.';
      store.saveSyncMeta({ ...store.loadSyncMeta(), lastError: message });
      if (!opts?.silent) setError(message);
      return { success: false, error: message };
    } finally {
      setSyncing(false);
    }
  }, [userId, resources, persist]);

  /** Runs a sync only when the stored connection has actually gone stale. */
  const runIfStale = useCallback(async () => {
    const last = store.loadConnection()?.lastSyncedAt;
    if (!last || Date.now() - last > AUTO_SYNC_INTERVAL_MS) await syncNow({ silent: true });
  }, [syncNow]);

  /** Consent popup → access token → identity → durable connection record. */
  const connect = useCallback(async (): Promise<ActionResult> => {
    if (!userId) return { success: false, error: 'Not authenticated' };
    if (!isGoogleConfigured) {
      return { success: false, error: 'Google integration is not configured. Set VITE_GOOGLE_CLIENT_ID in .env.' };
    }

    setConnecting(true);
    setError(null);
    try {
      const { token, scope } = await requestAccessToken(userId);
      store.saveToken(token);
      setHasToken(true);

      const info = await getUserInfo(token);
      const record: GoogleConnection = {
        userId,
        email: info.email,
        sub: info.sub,
        scopes: scope ? scope.split(' ').filter(Boolean) : [],
        connectedAt: Date.now(),
      };
      store.saveConnection(record);
      setConnection(record);

      // Best-effort probe: a personal @gmail.com has no Classroom tenant, so we
      // learn up-front whether sync can actually return anything.
      try {
        const { courses = [] } = await listActiveCourses(token);
        const withClassroom = { ...record, classroomAvailable: courses.length > 0 };
        store.saveConnection(withClassroom);
        setConnection(withClassroom);
      } catch {
        /* A failed probe must not fail the whole connection. */
      }

      return { success: true };
    } catch (err: any) {
      const message = err?.message ?? 'Google connection failed.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setConnecting(false);
    }
  }, [userId]);

  /** Revokes the grant at Google, then wipes every local trace of it. */
  const disconnect = useCallback(async (): Promise<ActionResult> => {
    const token = store.loadToken();
    // Revoke at Google so the grant actually dies, not just locally forgotten.
    if (token) await revokeAccessToken(token).catch(() => {});

    if (userId) store.clearResourcesForUser(userId);
    store.clearToken();
    store.clearConnection();
    setConnection(null);
    setHasToken(false);
    setError(null);
    persist([]);
    return { success: true };
  }, [userId, persist]);

  const importDriveFiles = useCallback((
    files: Parameters<typeof store.driveFileToResource>[1][]
  ): ActionResult => {
    if (!userId) return { success: false, error: 'Not authenticated' };
    if (!store.loadToken()) return { success: false, error: 'Please reconnect Google Drive first.' };

    const incoming = files.map(f => store.driveFileToResource(userId, f));
    persist(store.upsertResources(resources, incoming));
    return { success: true, imported: incoming.length };
  }, [userId, resources, persist]);

  const importClassroomItems = useCallback((
    items: ClassroomItem[], course: ClassroomCourse
  ): ActionResult => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    const incoming = items.map(i => store.classroomItemToResource(userId, i, course));
    persist(store.upsertResources(resources, incoming));
    return { success: true, imported: incoming.length };
  }, [userId, resources, persist]);

  const removeResource = useCallback((id: string) => {
    persist(resources.filter(r => r.id !== id));
  }, [resources, persist]);

  // Hydrate persisted state whenever the signed-in student changes.
  useEffect(() => {
    if (!userId) {
      setConnection(null);
      setHasToken(false);
      setResources([]);
      setError(null);
      return;
    }
    const stored = store.loadConnection();
    // Only ever surface a connection that belongs to this student.
    setConnection(stored?.userId === userId ? stored : null);
    setHasToken(!!store.loadToken());
    setResources(store.loadResources().filter(r => r.id.startsWith(`user:${userId}:`)));
  }, [userId]);

  // Sync once a connection exists, and again whenever it goes stale.
  useEffect(() => {
    if (!userId || !hasToken || !connection) return;
    void runIfStale();
  }, [userId, hasToken, connection, runIfStale]);

  // Poll while the tab is alive: on window focus and on a slow interval.
  useEffect(() => {
    if (!userId || !hasToken) return;

    const onFocus = () => void runIfStale();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => void runIfStale(), AUTO_SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [userId, hasToken, runIfStale]);

  const value = useMemo<IntegrationContextType>(() => ({
    configured: isGoogleConfigured,
    connection,
    hasToken,
    resources,
    connecting,
    syncing,
    error,
    connect,
    disconnect,
    syncNow,
    importDriveFiles,
    importClassroomItems,
    removeResource,
    clearError: () => setError(null),
  }), [connection, hasToken, resources, connecting, syncing, error, connect, disconnect, syncNow, importDriveFiles, importClassroomItems, removeResource]);

  return <IntegrationContext.Provider value={value}>{children}</IntegrationContext.Provider>;
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (!context) throw new Error('useIntegration must be used within an IntegrationProvider');
  return context;
}
