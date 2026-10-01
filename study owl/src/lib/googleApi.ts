/**
 * Read-only Google API helpers (Drive v3 + Classroom v1).
 *
 * Every request here fetches *metadata only*. There is deliberately no
 * `alt=media` anywhere and no binary/blob download path, so no Drive or
 * Classroom file content ever passes through this app — we keep ids, titles and
 * `webViewLink`s and let the browser open the file on Google's own viewer.
 */

const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files';
const CLASSROOM = 'https://classroom.googleapis.com/v1';
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

/** Drive file-page size for the browser picker. */
const PAGE_SIZE = 50;

async function getJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Your Google session expired. Please reconnect.');
    if (res.status === 403) {
      throw new Error('Google denied the request. Classroom also needs a Workspace for Education account.');
    }
    throw new Error(`Google request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

// ─── Shapes returned by Google (only the fields we actually use) ────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface DriveFilePage {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
}

/** A coursework item or a course material — both collapse into one importable shape. */
export interface ClassroomItem {
  id: string;
  title: string;
  kind: 'courseWork' | 'material';
  linkToDriveFile?: { title?: string; driveFile?: { id?: string } };
  materials?: { title?: string; driveFile?: { id?: string }; link?: { url?: string } }[];
}

// ─── Identity ─────────────────────────────────────────────────────────────────

/** Reads the authorised account's email/subject for display and binding. */
export function getUserInfo(token: string): Promise<GoogleUserInfo> {
  return getJson<GoogleUserInfo>(USERINFO, token);
}

// ─── Drive ────────────────────────────────────────────────────────────────────

/**
 * Lists non-trashed Drive files, newest first. `fields` is explicitly narrowed
 * to metadata columns — we never ask Drive for content.
 */
export async function listDriveFiles(token: string, pageToken?: string): Promise<DriveFilePage> {
  const params = new URLSearchParams({
    q: 'trashed = false',
    orderBy: 'modifiedTime desc',
    pageSize: String(PAGE_SIZE),
    fields: 'nextPageToken, files(id,name,mimeType,webViewLink,modifiedTime,size)',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  if (pageToken) params.set('pageToken', pageToken);

  return getJson<DriveFilePage>(`${DRIVE_FILES}?${params.toString()}`, token);
}

// ─── Classroom ────────────────────────────────────────────────────────────────

/**
 * Lists ACTIVE courses. Returns an empty array for personal @gmail.com
 * accounts — Classroom data only exists on Workspace for Education tenants,
 * which the UI surfaces as an explicit hint rather than an error.
 */
export function listActiveCourses(token: string): Promise<{ courses?: ClassroomCourse[] }> {
  return getJson<{ courses?: ClassroomCourse[] }>(
    `${CLASSROOM}/courses?courseStates=ACTIVE&pageSize=100`,
    token
  );
}

/** Assignments for one course. Requires the `coursework.me.readonly` scope. */
export function listCourseWork(
  token: string,
  courseId: string
): Promise<{ courseWork?: ClassroomItem[]; nextPageToken?: string }> {
  return getJson(`${CLASSROOM}/courses/${encodeURIComponent(courseId)}/courseWork?courseWorkStates=PUBLISHED&orderBy=dueDate desc&pageSize=100`, token);
}

/** Posted course materials for one course. Requires `courseworkmaterials.readonly`. */
export function listCourseWorkMaterials(
  token: string,
  courseId: string
): Promise<{ courseWorkMaterial?: ClassroomItem[]; nextPageToken?: string }> {
  return getJson(`${CLASSROOM}/courses/${encodeURIComponent(courseId)}/courseWorkMaterials?orderBy=updateTime desc&pageSize=100`, token);
}
