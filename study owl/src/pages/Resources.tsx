import { useState } from "react";
import { C, Card, Badge, Btn, PageHeader, SearchInput, EmptyState, Select, Modal, Input, Textarea } from "../components/ui";
import { IconFileText, IconFolder, IconUpload, IconDownload, IconEye, IconStar, IconShare, IconGrid, IconList, IconFilter, IconLink } from "../components/Icons";
import { useIntegration } from "../context/IntegrationContext";
import { ImportDialog } from "../components/ImportDialog";
import { SyncStatus } from "../components/SyncStatus";

/**
 * Page: Resources (/app/resources) — student-only, inside AppLayout.
 * Purpose: Searchable/filterable resource library with a grid/list view
 *   toggle, a stats row, an upload modal and a Google import dialog.
 * Data source: the seeded `allResources` mock array, merged with any Drive /
 *   Classroom rows imported through the Google integration (read via
 *   `useIntegration()`). Each card keeps its own `saved` flag in local state,
 *   and the upload modal is still purely visual.
 */

// Library contents; `verified`, `saved`, and `drive` drive the badges
const allResources = [
  { id: 1, title: "DBMS Complete Lecture Notes – Units 1-5", type: "PDF", subject: "DBMS", dept: "CSE", semester: 6, year: 2024, by: "Dr. A.K. Rahman", date: "Dec 1, 2024", verified: true, saved: true, views: 342, rating: 4.8, drive: false },
  { id: 2, title: "Algorithms & Data Structures Textbook Notes", type: "Note", subject: "Algorithms", dept: "CSE", semester: 6, year: 2024, by: "Senior Upload", date: "Nov 28, 2024", verified: false, saved: false, views: 187, rating: 4.2, drive: true },
  { id: 3, title: "CN Lab Manual – Semester 6", type: "PDF", subject: "CN", dept: "CSE", semester: 6, year: 2024, by: "Dept. CSE", date: "Nov 25, 2024", verified: true, saved: true, views: 521, rating: 4.9, drive: false },
  { id: 4, title: "Software Engineering Assignment 3 Solution", type: "Assignment", subject: "SE", dept: "CSE", semester: 6, year: 2024, by: "Batch 2022", date: "Nov 22, 2024", verified: false, saved: false, views: 98, rating: 3.9, drive: false },
  { id: 5, title: "Numerical Methods Formula Sheet", type: "Note", subject: "Numerical Methods", dept: "CSE", semester: 6, year: 2024, by: "Dr. K. Chowdhury", date: "Nov 18, 2024", verified: true, saved: false, views: 215, rating: 4.5, drive: false },
  { id: 6, title: "Compiler Design – Parsing Techniques PDF", type: "PDF", subject: "Compiler Design", dept: "CSE", semester: 6, year: 2024, by: "Prof. Z. Ahmed", date: "Nov 15, 2024", verified: true, saved: true, views: 163, rating: 4.3, drive: true },
  { id: 7, title: "DBMS Previous Question Papers 2019-2023", type: "QP", subject: "DBMS", dept: "CSE", semester: 6, year: 2023, by: "Senior Upload", date: "Oct 30, 2024", verified: false, saved: true, views: 445, rating: 4.7, drive: false },
  { id: 8, title: "OOP Design Patterns Reference Guide", type: "Reference", subject: "SE", dept: "CSE", semester: 6, year: 2024, by: "Batch 2021", date: "Oct 20, 2024", verified: true, saved: false, views: 312, rating: 4.6, drive: true },
];

/**
 * A library row: the seeded mock shape, optionally carrying a Google link so an
 * imported item can open its file in Drive/Classroom rather than downloading it.
 * `id` is widened because imported rows use stable string keys
 * (`user:<id>:<source>:<externalId>`) while the seeded rows use numbers.
 */
type LibraryResource = Omit<(typeof allResources)[number], 'id'> & {
  id: string | number;
  webViewLink?: string;
  source?: 'drive' | 'classroom';
};

// Badge colour per resource type. The Drive mime mapper can also emit Slides,
// Sheet, Doc and Video, so those labels are mapped here too.
const typeColors: Record<string, string> = {
  PDF: 'error', Note: 'info', Assignment: 'warning', QP: 'purple', Reference: 'success',
  Slides: 'purple', Sheet: 'success', Doc: 'info', Video: 'error',
};

/**
 * Sub-component: one resource, rendered in either list or grid form.
 * The `grid` prop switches the layout. `saved` is component-local state seeded
 * from the resource's `saved` field, so starring a card does not affect the
 * parent list or the "Saved" stat count.
 */
function ResourceCard({ r, grid }: { r: LibraryResource; grid: boolean }) {
  // Local star state for this card
  const [saved, setSaved] = useState(r.saved);

  // List layout: a single horizontal row (icon, title/meta, type, actions)
  if (!grid) return (
    <Card padding={14} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo, flexShrink: 0 }}>
        <IconFileText size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</p>
          {r.verified && <Badge variant="success">✓</Badge>}
          {r.drive && <Badge variant="default">Drive</Badge>}
        </div>
        <p style={{ fontSize: '12px', color: C.text3 }}>{r.subject} · {r.by} · {r.date}</p>
      </div>
      <Badge variant={typeColors[r.type] as any}>{r.type}</Badge>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <Btn size="xs" variant="ghost" icon={<IconEye size={13} />}>{r.views}</Btn>
        <Btn size="xs" variant={saved ? 'primary' : 'ghost'} icon={<IconStar size={13} />} onClick={() => setSaved(s => !s)} />
        {r.webViewLink ? (
          <a href={r.webViewLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Btn size="xs" variant="secondary" icon={<IconLink size={13} />}>Open</Btn>
          </a>
        ) : (
          <Btn size="xs" variant="secondary" icon={<IconDownload size={13} />}>Download</Btn>
        )}
      </div>
    </Card>
  );

  // Grid layout: icon + badges on top, then title, meta, and an action row
  return (
    <Card hover style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo, flexShrink: 0 }}>
          <IconFileText size={20} />
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap' }}>
          <Badge variant={typeColors[r.type] as any}>{r.type}</Badge>
          {r.verified && <Badge variant="success">✓</Badge>}
        </div>
      </div>
      <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: C.navy, marginBottom: '6px', lineHeight: 1.4, overflowWrap: 'anywhere' }}>{r.title}</h3>
      <p style={{ fontSize: '12px', color: C.text3, marginBottom: '4px' }}>{r.subject}</p>
      <p style={{ fontSize: '11.5px', color: C.text3, marginBottom: '14px', overflowWrap: 'anywhere' }}>By {r.by} · {r.date}</p>
      {r.drive && (
        <div style={{ padding: '6px 10px', backgroundColor: C.surface2, borderRadius: '6px', fontSize: '11.5px', color: C.text2, marginBottom: '12px' }}>
          📁 {r.source === 'classroom' ? 'Synced from Google Classroom' : 'Stored in Google Drive'}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {/* Imported rows open in Google's own viewer; nothing is downloaded. */}
        {r.webViewLink ? (
          <a href={r.webViewLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
            <Btn size="xs" variant="secondary" icon={<IconLink size={13} />} style={{ width: '100%' }}>Open</Btn>
          </a>
        ) : (
          <Btn size="xs" variant="secondary" icon={<IconEye size={13} />} style={{ flex: 1 }}>Open</Btn>
        )}
        <Btn size="xs" variant={saved ? 'primary' : 'ghost'} icon={<IconStar size={13} />} onClick={() => setSaved(s => !s)} />
        <Btn size="xs" variant="ghost" icon={<IconShare size={13} />} />
      </div>
    </Card>
  );
}

export default function Resources() {
  // Free-text search over title and subject
  const [search, setSearch] = useState('');

  // Layout toggle for the results area
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // The two dropdown filters; 'all' disables that filter
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Visibility flag for the upload modal
  const [uploadOpen, setUploadOpen] = useState(false);

  // Draft values for the resource being uploaded
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', subject: '', desc: '' });

  // Visibility flag for the Google import dialog
  const [importOpen, setImportOpen] = useState(false);

  // Rows imported from Drive / Classroom, plus whether Google is connected
  const { resources: imported, connection } = useIntegration();

  /** Maps an imported metadata row onto the shape the library cards render. */
  const toLibrary = (row: (typeof imported)[number]): LibraryResource => ({
    id: row.id,
    title: row.title,
    type: row.type,
    subject: row.subject ?? 'General',
    dept: 'CSE',
    semester: 6,
    year: new Date(row.importedAt).getFullYear(),
    by: row.source === 'classroom' ? (row.courseName ?? 'Google Classroom') : 'Google Drive',
    date: row.date,
    verified: false,
    saved: false,
    views: 0,
    rating: 0,
    drive: true,
    webViewLink: row.webViewLink,
    source: row.source,
  });

  // Seeded demo content, plus everything imported from Google
  const library: LibraryResource[] = [...allResources, ...imported.map(toLibrary)];

  // Combined filter: must satisfy search AND both dropdowns
  const filtered = library.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSubject = subjectFilter === 'all' || r.subject === subjectFilter;
    return matchSearch && matchType && matchSubject;
  });

  // Filter dropdown options; subjects are deduped from the merged dataset
  const subjects = ['all', ...Array.from(new Set(library.map(r => r.subject)))].map(s => ({ value: s, label: s === 'all' ? 'All Subjects' : s }));
  const types = ['all', ...Object.keys(typeColors)].map(t => ({ value: t, label: t === 'all' ? 'All Types' : t }));

  return (
    // Page container: wide 1400px to fit the library grid (responsive via .page)
    <div className="page" style={{ maxWidth: '1400px' }}>
      {/* Page title + Google import / sync / upload actions */}
      <PageHeader title="Resource Library" sub="Academic resources organized by subject, type, and semester"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {connection && <SyncStatus compact />}
            <Btn variant="secondary" icon={<IconLink size={14} />} onClick={() => setImportOpen(true)}>
              Import from Google
            </Btn>
            <Btn icon={<IconUpload size={14} />} onClick={() => setUploadOpen(true)}>Upload Resource</Btn>
          </div>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search resources…" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }} />
        <Select options={subjects} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ width: '160px', maxWidth: '100%' }} />
        <Select options={types} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: '140px', maxWidth: '100%' }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button onClick={() => setView('grid')} style={{ padding: '8px', borderRadius: '8px', border: `1.5px solid ${view === 'grid' ? C.indigo : C.border}`, background: view === 'grid' ? C.indigoLight : C.surface, color: view === 'grid' ? C.indigo : C.text3, cursor: 'pointer', display: 'flex' }}>
            <IconGrid size={16} />
          </button>
          <button onClick={() => setView('list')} style={{ padding: '8px', borderRadius: '8px', border: `1.5px solid ${view === 'list' ? C.indigo : C.border}`, background: view === 'list' ? C.indigoLight : C.surface, color: view === 'list' ? C.indigo : C.text3, cursor: 'pointer', display: 'flex' }}>
            <IconList size={16} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ label: 'All Resources', count: library.length }, { label: 'Verified', count: library.filter(r => r.verified).length }, { label: 'Drive Files', count: library.filter(r => r.drive).length }, { label: 'Saved', count: library.filter(r => r.saved).length }].map(s => (
          <div key={s.label} style={{ padding: '6px 14px', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', color: C.text2 }}>
            <strong style={{ color: C.navy }}>{s.count}</strong> {s.label}
          </div>
        ))}
      </div>

      {/* Results: empty state, or the grid/list layout selected above */}
      {filtered.length === 0 ? (
        <EmptyState icon={<IconFolder size={28} />} title="No resources found" desc="Try adjusting your filters or upload a new resource." action={<Btn onClick={() => setUploadOpen(true)} icon={<IconUpload size={14} />}>Upload Resource</Btn>} />
      ) : view === 'grid' ? (
        <div className="grid-auto">
          {filtered.map(r => <ResourceCard key={r.id} r={r} grid />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(r => <ResourceCard key={r.id} r={r} grid={false} />)}
        </div>
      )}

      {/* Upload modal: metadata fields, a fake drop zone, and actions */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Resource" width={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Title" placeholder="e.g., DBMS Lecture Notes – Unit 3" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div className="form-2">
            <Select label="Type" options={[{ value: 'PDF', label: 'PDF' }, { value: 'Note', label: 'Lecture Note' }, { value: 'Assignment', label: 'Assignment' }, { value: 'Reference', label: 'Reference' }]} value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))} />
            <Select label="Subject" options={[{ value: 'DBMS', label: 'DBMS' }, { value: 'Algorithms', label: 'Algorithms' }, { value: 'CN', label: 'Computer Networks' }, { value: 'SE', label: 'Software Engineering' }]} value={uploadForm.subject} onChange={e => setUploadForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <Textarea label="Description (optional)" placeholder="Brief description of this resource…" value={uploadForm.desc} onChange={e => setUploadForm(f => ({ ...f, desc: e.target.value }))} />
          <div style={{ border: `2px dashed ${C.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.indigo}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <IconUpload size={24} color={C.text3} />
            <p style={{ fontSize: '14px', color: C.text2, marginTop: '8px' }}>Click to select file or drag & drop</p>
            <p style={{ fontSize: '12px', color: C.text3, marginTop: '4px' }}>PDF, DOCX, PPTX up to 50MB</p>
          </div>
          <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Btn>
            <Btn onClick={() => setUploadOpen(false)} icon={<IconUpload size={14} />}>Upload</Btn>
          </div>
        </div>
      </Modal>

      {/* Google import browser (Drive + Classroom) */}
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
