import { useState } from "react";
import { C, Card, Badge, Btn, PageHeader, SearchInput, EmptyState, Select, Modal, Input, Textarea } from "../components/ui";
import { IconFileText, IconFolder, IconUpload, IconDownload, IconEye, IconStar, IconShare, IconGrid, IconList, IconFilter } from "../components/Icons";

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

const typeColors: Record<string, string> = {
  PDF: 'error', Note: 'info', Assignment: 'warning', QP: 'purple', Reference: 'success',
};

function ResourceCard({ r, grid }: { r: typeof allResources[0]; grid: boolean }) {
  const [saved, setSaved] = useState(r.saved);
  if (!grid) return (
    <Card padding={14} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
        <Btn size="xs" variant="secondary" icon={<IconDownload size={13} />}>Download</Btn>
      </div>
    </Card>
  );

  return (
    <Card hover style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo }}>
          <IconFileText size={20} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Badge variant={typeColors[r.type] as any}>{r.type}</Badge>
          {r.verified && <Badge variant="success">✓</Badge>}
        </div>
      </div>
      <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: C.navy, marginBottom: '6px', lineHeight: 1.4 }}>{r.title}</h3>
      <p style={{ fontSize: '12px', color: C.text3, marginBottom: '4px' }}>{r.subject}</p>
      <p style={{ fontSize: '11.5px', color: C.text3, marginBottom: '14px' }}>By {r.by} · {r.date}</p>
      {r.drive && (
        <div style={{ padding: '6px 10px', backgroundColor: C.surface2, borderRadius: '6px', fontSize: '11.5px', color: C.text2, marginBottom: '12px' }}>
          📁 Stored in Google Drive
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        <Btn size="xs" variant="secondary" icon={<IconEye size={13} />} style={{ flex: 1 }}>Open</Btn>
        <Btn size="xs" variant={saved ? 'primary' : 'ghost'} icon={<IconStar size={13} />} onClick={() => setSaved(s => !s)} />
        <Btn size="xs" variant="ghost" icon={<IconShare size={13} />} />
      </div>
    </Card>
  );
}

export default function Resources() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', subject: '', desc: '' });

  const filtered = allResources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSubject = subjectFilter === 'all' || r.subject === subjectFilter;
    return matchSearch && matchType && matchSubject;
  });

  const subjects = ['all', ...Array.from(new Set(allResources.map(r => r.subject)))].map(s => ({ value: s, label: s === 'all' ? 'All Subjects' : s }));
  const types = ['all', 'PDF', 'Note', 'Assignment', 'QP', 'Reference'].map(t => ({ value: t, label: t === 'all' ? 'All Types' : t }));

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
      <PageHeader title="Resource Library" sub="Academic resources organized by subject, type, and semester"
        actions={<Btn icon={<IconUpload size={14} />} onClick={() => setUploadOpen(true)}>Upload Resource</Btn>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search resources…" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }} />
        <Select options={subjects} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ width: '160px' }} />
        <Select options={types} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: '140px' }} />
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
        {[{ label: 'All Resources', count: allResources.length }, { label: 'Verified', count: allResources.filter(r => r.verified).length }, { label: 'Drive Files', count: allResources.filter(r => r.drive).length }, { label: 'Saved', count: allResources.filter(r => r.saved).length }].map(s => (
          <div key={s.label} style={{ padding: '6px 14px', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', color: C.text2 }}>
            <strong style={{ color: C.navy }}>{s.count}</strong> {s.label}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<IconFolder size={28} />} title="No resources found" desc="Try adjusting your filters or upload a new resource." action={<Btn onClick={() => setUploadOpen(true)} icon={<IconUpload size={14} />}>Upload Resource</Btn>} />
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(r => <ResourceCard key={r.id} r={r} grid />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(r => <ResourceCard key={r.id} r={r} grid={false} />)}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Resource" width={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Title" placeholder="e.g., DBMS Lecture Notes – Unit 3" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Btn>
            <Btn onClick={() => setUploadOpen(false)} icon={<IconUpload size={14} />}>Upload</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
