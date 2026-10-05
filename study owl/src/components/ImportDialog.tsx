import { useCallback, useEffect, useState } from 'react';
import { C, Btn, Badge, Modal, SearchInput, Spinner, EmptyState } from './ui';
import { IconDrive, IconClassroom, IconCheck, IconAlertCircle } from './Icons';
import { useIntegration } from '../context/IntegrationContext';
import { loadToken, driveTypeFromMime } from '../lib/integrationStore';
import {
  listDriveFiles, listActiveCourses, listCourseWork, listCourseWorkMaterials,
  type DriveFile, type ClassroomCourse, type ClassroomItem,
} from '../lib/googleApi';

/** One course plus everything we could pull from it. */
interface CourseBundle {
  course: ClassroomCourse;
  items: ClassroomItem[];
}

/** Stable key for a Classroom row, mirroring the resource id used on import. */
const courseItemKey = (courseId: string, item: ClassroomItem) =>
  `${courseId}:${item.kind}:${item.id}`;

/**
 * Browse-and-import dialog for the Resource Library. Fetches Drive metadata and
 * Classroom coursework, lets the student tick items, and writes them into the
 * library as metadata rows. Nothing is downloaded — the stored `webViewLink`
 * opens in Google's viewer later.
 */
export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importDriveFiles, importClassroomItems } = useIntegration();

  const [tab, setTab] = useState<'drive' | 'classroom'>('drive');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [bundles, setBundles] = useState<CourseBundle[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  /** Flips one row in the selection list. */
  const toggle = (key: string) =>
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  /** Loads the chosen source. A missing token short-circuits before any request. */
  const load = useCallback(async (which: 'drive' | 'classroom') => {
    const token = loadToken();
    if (!token) {
      setLoadError('Your Google session expired. Please reconnect in Settings.');
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      if (which === 'drive') {
        const { files } = await listDriveFiles(token);
        setDriveFiles(files);
      } else {
        const { courses = [] } = await listActiveCourses(token);
        // Sequential on purpose: a large tenant must not fire dozens of
        // requests simultaneously against the Classroom API.
        const loaded: CourseBundle[] = [];
        for (const course of courses) {
          const [work, materials] = await Promise.all([
            listCourseWork(token, course.id).catch(() => ({ courseWork: [] as ClassroomItem[] })),
            listCourseWorkMaterials(token, course.id).catch(() => ({ courseWorkMaterial: [] as ClassroomItem[] })),
          ]);
          loaded.push({
            course,
            items: [
              ...(work.courseWork ?? []).map(w => ({ ...w, kind: 'courseWork' as const })),
              ...(materials.courseWorkMaterial ?? []).map(m => ({ ...m, kind: 'material' as const })),
            ],
          });
        }
        setBundles(loaded);
      }
    } catch (err: any) {
      setLoadError(err?.message ?? 'Could not load your Google files.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch fresh data whenever the dialog opens or the source tab changes.
  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setSearch('');
    void load(tab);
  }, [open, tab, load]);

  /** Commits the ticked rows, then closes. */
  const commit = () => {
    if (tab === 'drive') {
      const result = importDriveFiles(driveFiles.filter(f => selected.includes(f.id)));
      if (!result.success) return setLoadError(result.error ?? 'Import failed.');
    } else {
      for (const { course, items } of bundles) {
        const picked = items.filter(i => selected.includes(courseItemKey(course.id, i)));
        if (picked.length) importClassroomItems(picked, course);
      }
    }
    setSelected([]);
    onClose();
  };

  /** Segmented source switch. */
  const tabButton = (id: 'drive' | 'classroom', label: string, icon: React.ReactNode) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
        borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        border: `1.5px solid ${tab === id ? C.indigo : C.border}`,
        backgroundColor: tab === id ? C.indigoLight : C.surface,
        color: tab === id ? C.indigo : C.text2,
      }}
    >
      {icon} {label}
    </button>
  );

  /** Checkbox row shared by both tabs. */
  const row = (key: string, title: string, meta: string, badge?: string) => {
    const on = selected.includes(key);
    return (
      <button
        key={key}
        onClick={() => toggle(key)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left',
          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
          backgroundColor: on ? C.indigoLight : C.surface,
          border: `1.5px solid ${on ? C.indigo : C.border}`,
        }}
      >
        <span style={{
          width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
          border: `1.5px solid ${on ? C.indigo : C.border}`,
          backgroundColor: on ? C.indigo : C.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          {on && <IconCheck size={12} />}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
          <span style={{ display: 'block', fontSize: '11.5px', color: C.text3 }}>{meta}</span>
        </span>
        {badge && <Badge variant="default">{badge}</Badge>}
      </button>
    );
  };

  const term = search.trim().toLowerCase();
  const visibleFiles = term
    ? driveFiles.filter(f => f.name.toLowerCase().includes(term))
    : driveFiles;

  return (
    <Modal open={open} onClose={onClose} title="Import from Google" width={620}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Source switch — wraps on narrow screens */}
        <div className="actions-row">
          {tabButton('drive', 'Google Drive', <IconDrive size={14} />)}
          {tabButton('classroom', 'Google Classroom', <IconClassroom size={14} />)}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tab === 'drive' ? 'Search your Drive files…' : 'Search courses and items…'}
        />

        {loadError && (
          <div style={{
            display: 'flex', gap: '8px', padding: '12px 14px', backgroundColor: C.errorLight,
            border: `1px solid ${C.error}30`, borderRadius: '10px', fontSize: '13px', color: C.error,
          }}>
            <IconAlertCircle size={16} />
            <span>{loadError}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', justifyContent: 'center' }}>
            <Spinner size={20} />
            <span style={{ fontSize: '13.5px', color: C.text2 }}>Reading your Google files…</span>
          </div>
        ) : tab === 'drive' ? (
          visibleFiles.length === 0 ? (
            <EmptyState icon={<IconDrive size={26} />} title="No files found" desc="Nothing in Drive matched your search." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
              {visibleFiles.map(f => row(f.id, f.name, f.mimeType, driveTypeFromMime(f.mimeType)))}
            </div>
          )
        ) : bundles.length === 0 ? (
          <EmptyState
            icon={<IconClassroom size={26} />}
            title="No Classroom courses"
            desc="Classroom needs a Workspace for Education account. A personal @gmail.com account always returns an empty list."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto' }}>
            {bundles.map(({ course, items }) => {
              const shown = term
                ? items.filter(i => i.title.toLowerCase().includes(term) || course.name.toLowerCase().includes(term))
                : items;
              if (!shown.length) return null;

              return (
                <div key={course.id}>
                  <p style={{ fontSize: '12.5px', fontWeight: 700, color: C.navy, marginBottom: '8px' }}>
                    {course.name}{course.section ? ` · ${course.section}` : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {shown.map(item => row(
                      courseItemKey(course.id, item),
                      item.title,
                      item.kind === 'courseWork' ? 'Assignment' : 'Course material',
                      item.kind === 'courseWork' ? 'Assignment' : 'Note',
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="actions-row" style={{ justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={selected.length === 0} onClick={commit}>
            Import {selected.length > 0 ? `${selected.length} item${selected.length === 1 ? '' : 's'}` : ''}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
