import type { DriveFile, ClassroomItem } from './googleApi';

/**
 * Persistence for the Google integration.
 *
 * This project has no backend or database — `AuthContext.tsx` stores its user
 * database under versioned `localStorage` keys, and this module follows the
 * same convention (`*_v1`). Keys are additive and versioned so future schema
 * changes never destroy existing data: a new version simply reads a new key and
 * the old one is left untouched.
 *
 * Only *metadata* is ever written. No file content is stored or downloaded.
 */

/** Bumping either key is the supported way to migrate; old keys are never mutated. */
export const CONNECTION_KEY = 'studyowl_google_connection_v1';
export const RESOURCES_KEY = 'studyowl_imported_resources_v1';
export const SYNC_META_KEY = 'studyowl_google_syncmeta_v1';

/**
 * The OAuth access token lives in `sessionStorage`, not `localStorage`: it is a
 * live credential, and keeping it per-tab means closing the tab ends our copy.
 * The durable record (email, scopes, last sync) is safe to persist.
 */
const TOKEN_KEY = 'studyowl_google_token_v1';

/** Where an imported resource came from. */
export type ResourceSource = 'drive' | 'classroom';

export interface GoogleConnection {
  /** Study Owl user this grant belongs to — one connection per student. */
  userId: string;
  email: string;
  /** Google's stable subject id for the account. */
  sub: string;
  /** Scopes actually granted, as returned by Google. */
  scopes: string[];
  connectedAt: number;
  lastSyncedAt?: number;
  /** False when the account has no Classroom tenant (personal @gmail.com). */
  classroomAvailable?: boolean;
}

export interface ImportedResource {
  /** Stable composite key, `user:<id>:<source>:<externalId>` — makes re-sync idempotent. */
  id: string;
  source: ResourceSource;
  externalId: string;
  title: string;
  /** Mapped to the library's badge vocabulary (PDF / Note / Assignment / …). */
  type: string;
  mimeType?: string;
  /** Opens the file in Google's viewer; we never fetch its bytes. */
  webViewLink?: string;
  courseId?: string;
  courseName?: string;
  subject?: string;
  /** Pre-formatted for direct display in the library cards. */
  date: string;
  importedAt: number;
  /** Set by a later sync when the upstream item changed. */
  updatedAt?: number;
}

export interface SyncMeta {
  lastSyncAt?: number;
  lastCourseCount?: number;
  lastError?: string;
}

// ─── Generic safe readers/writers ─────────────────────────────────────────────

function read<T>(key: string, storage: Storage, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown, storage: Storage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota / private-mode failures are non-fatal; the UI re-reads stale data. */
  }
}

// ─── Connection ───────────────────────────────────────────────────────────────

export function loadConnection(): GoogleConnection | null {
  return read<GoogleConnection | null>(CONNECTION_KEY, localStorage, null);
}

export function saveConnection(connection: GoogleConnection) {
  write(CONNECTION_KEY, connection, localStorage);
}

export function clearConnection() {
  localStorage.removeItem(CONNECTION_KEY);
}

// ─── Access token (session-scoped) ────────────────────────────────────────────

export function loadToken(): string | null {
  return read<string | null>(TOKEN_KEY, sessionStorage, null);
}

export function saveToken(token: string) {
  write(TOKEN_KEY, token, sessionStorage);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ─── Imported resources ───────────────────────────────────────────────────────

export function loadResources(): ImportedResource[] {
  const rows = read<ImportedResource[]>(RESOURCES_KEY, localStorage, []);
  return Array.isArray(rows) ? rows : [];
}

export function saveResources(resources: ImportedResource[]) {
  write(RESOURCES_KEY, resources, localStorage);
}

/** Drops every imported row belonging to one user. Used on disconnect. */
export function clearResourcesForUser(userId: string) {
  saveResources(loadResources().filter(r => !r.id.startsWith(`user:${userId}:`)));
}

// ─── Sync bookkeeping ─────────────────────────────────────────────────────────

export function loadSyncMeta(): SyncMeta {
  return read<SyncMeta>(SYNC_META_KEY, localStorage, {});
}

export function saveSyncMeta(meta: SyncMeta) {
  write(SYNC_META_KEY, meta, localStorage);
}

// ─── Mappers: Google shapes → library resources ───────────────────────────────

/** The `user:` prefix in the id is what lets us scope rows per student. */
const idFor = (userId: string, source: ResourceSource, externalId: string) =>
  `user:${userId}:${source}:${externalId}`;

/** Maps a Drive mime type onto the library's existing badge vocabulary. */
export function driveTypeFromMime(mime: string): string {
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('presentation')) return 'Slides';
  if (mime.includes('spreadsheet')) return 'Sheet';
  if (mime.includes('document')) return 'Doc';
  if (mime.includes('video')) return 'Video';
  return 'Reference';
}

/** Short, locale-independent date used by the library cards. */
function formatDate(value?: string | number): string {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Converts a Drive file into a library resource. Metadata only. */
export function driveFileToResource(userId: string, file: DriveFile): ImportedResource {
  return {
    id: idFor(userId, 'drive', file.id),
    source: 'drive',
    externalId: file.id,
    title: file.name,
    type: driveTypeFromMime(file.mimeType),
    mimeType: file.mimeType,
    webViewLink: file.webViewLink,
    subject: 'Google Drive',
    date: formatDate(file.modifiedTime),
    importedAt: Date.now(),
  };
}

/**
 * Converts a Classroom coursework item or material into a library resource.
 * `linkToDriveFile` is the canonical attachment; otherwise the first attached
 * material wins. If neither exists the item is still kept (minus a link) so the
 * assignment itself appears in the library.
 */
export function classroomItemToResource(
  userId: string,
  item: ClassroomItem,
  course: { id: string; name: string }
): ImportedResource {
  const driveFile = item.linkToDriveFile?.driveFile ?? item.materials?.find(m => m.driveFile)?.driveFile;
  const attachmentTitle = item.linkToDriveFile?.title ?? item.materials?.find(m => m.driveFile)?.title;

  return {
    id: idFor(userId, 'classroom', `${course.id}:${item.kind}:${item.id}`),
    source: 'classroom',
    externalId: item.id,
    title: attachmentTitle ? `${item.title} — ${attachmentTitle}` : item.title,
    type: item.kind === 'courseWork' ? 'Assignment' : 'Note',
    // Drive attachments open in the Drive viewer; coursework opens in Classroom.
    // Both are rendered by Google — this app never downloads the file.
    webViewLink: driveFile?.id
      ? `https://drive.google.com/open?id=${driveFile.id}`
      : `https://classroom.google.com/c/${course.id}/p/${item.id}`,
    courseId: course.id,
    courseName: course.name,
    subject: course.name,
    date: formatDate(),
    importedAt: Date.now(),
  };
}

/**
 * Merges freshly fetched rows into the stored list, upserting on the composite
 * id so repeated syncs never duplicate an item. Existing rows keep their
 * original `importedAt` and gain `updatedAt` when re-observed by a sync.
 */
export function upsertResources(
  current: ImportedResource[],
  incoming: ImportedResource[]
): ImportedResource[] {
  const byId = new Map(current.map(r => [r.id, r]));

  for (const next of incoming) {
    const prev = byId.get(next.id);
    byId.set(next.id, prev ? { ...next, importedAt: prev.importedAt, updatedAt: Date.now() } : next);
  }
  return Array.from(byId.values());
}
