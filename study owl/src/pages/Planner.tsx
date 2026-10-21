import { useEffect, useMemo, useRef, useState } from "react";
import { C, Card, Badge, Btn, Tabs, PageHeader, Modal, Input, Select, Textarea, Toast } from "../components/ui";
import { IconCalendar, IconPlus, IconCheck, IconTrash, IconEdit } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { formatDueLabel, todayISODate } from "../lib/date";
import {
  BUCKET_LABEL,
  PRIORITIES,
  SUBJECTS,
  bucketOf,
  bucketTasks,
  loadTasks,
  nextTaskId,
  saveTasks,
  seedTasks,
} from "../lib/taskStore";
import type { Task, TaskBucket, TaskPriority } from "../lib/taskStore";

/**
 * Page: Study Planner (/app/planner) — student-only, inside AppLayout.
 * Purpose: Task manager bucketed by deadline — Today / Upcoming / Overdue /
 *   Done — with counts, a per-task done toggle, edit, delete, and an
 *   add/edit-task modal.
 * Data source: `lib/taskStore` — a per-user, versioned `localStorage` list
 *   (`studyowl_planner_tasks_v1:<userId>`). Tasks survive a page reload.
 *
 * Invariants this page maintains:
 *   - One authoritative task array. The four lists AND the four summary
 *     counts are both derived from it via `bucketTasks`, so they can never
 *     disagree.
 *   - "Today" is the user's LOCAL calendar date (see `lib/date.ts`), never
 *     the UTC date.
 *   - A task belongs to exactly one bucket: done tasks never appear in a
 *     date bucket, and every open task is today / upcoming / overdue.
 */

// Dropdown options and the priority -> badge variant mapping
const subjects = SUBJECTS.map(s => ({ value: s, label: s }));
const priorities = PRIORITIES.map(p => ({ value: p, label: p }));
const priorityBadge = (p: string) => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';

/** The draft fields held by the add/edit modal. */
type Draft = { title: string; subject: string; desc: string; priority: TaskPriority; due: string };

const EMPTY_DRAFT: Draft = { title: '', subject: 'DBMS', desc: '', priority: 'Medium', due: '' };

/** Field-level validation messages for the modal. */
type DraftErrors = Partial<Record<'title' | 'due', string>>;

function validateDraft(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.title.trim()) errors.title = 'Task title is required.';
  if (!draft.due) errors.due = 'Due date is required.';
  return errors;
}

/**
 * Presentational sub-component: one task row.
 * Shows a completion checkbox, title, notes, subject/due metadata, priority
 * badge, an edit button and a delete button. Overdue styling is computed by
 * the parent (which owns the bucket logic) and passed in.
 * All mutations are delegated to the parent via callbacks.
 */
function TaskCard({ task, overdue, onToggle, onEdit, onDelete }: {
  task: Task;
  overdue: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    // Task row; border turns red and the title is struck through when done/overdue
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', backgroundColor: task.status === 'Done' ? C.surface2 : C.surface, border: `1px solid ${overdue ? C.error + '40' : C.border}`, borderRadius: '12px', transition: 'box-shadow 0.15s' }}>
      {/* Round checkbox — clicking it flips Todo/Done */}
      <button aria-label="Toggle task status" onClick={onToggle} style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${task.status === 'Done' ? C.success : C.border}`, backgroundColor: task.status === 'Done' ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: task.status === 'Done' ? C.success : 'none' }}>
        {task.status === 'Done' && <IconCheck size={12} color="#fff" />}
      </button>
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: task.status === 'Done' ? C.text3 : C.text, textDecoration: task.status === 'Done' ? 'line-through' : 'none', marginBottom: '3px', overflowWrap: 'anywhere' }}>{task.title}</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: C.text3 }}>{task.subject}</span>
          <span style={{ fontSize: '12px', color: overdue ? C.error : C.text3 }}>· Due {formatDueLabel(task.due)}</span>
          {overdue && <Badge variant="error">Overdue</Badge>}
        </div>
        {/* Notes captured on the task are shown here so the info is not lost */}
        {task.desc && (
          <p style={{ fontSize: '12px', color: C.text3, marginTop: '4px', overflowWrap: 'anywhere' }}>{task.desc}</p>
        )}
      </div>
      <Badge variant={priorityBadge(task.priority) as any}>{task.priority}</Badge>
      {/* Edit — opens the same modal pre-filled with this task */}
      <button aria-label="Edit task" onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex', padding: '4px', minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => e.currentTarget.style.color = C.indigo}
        onMouseLeave={e => e.currentTarget.style.color = C.text3}>
        <IconEdit size={15} />
      </button>
      <button aria-label="Delete task" onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex', padding: '4px', minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => e.currentTarget.style.color = C.error}
        onMouseLeave={e => e.currentTarget.style.color = C.text3}>
        <IconTrash size={15} />
      </button>
    </div>
  );
}

export default function Planner() {
  const { user, loading: authLoading } = useAuth();

  // Scope key for this user's task list. `null` until the session resolves, so
  // the seed list is never written to a shared "anonymous" bucket.
  const userId = user?.id ?? null;

  // Master task list — the source of truth for every bucket below
  const [tasks, setTasks] = useState<Task[]>([]);

  // True while the stored list is being read on mount
  const [loading, setLoading] = useState(true);

  // Active bucket shown by the Tabs bar
  const [tab, setTab] = useState<TaskBucket>('today');

  // Visibility flag for the add/edit-task modal
  const [addOpen, setAddOpen] = useState(false);

  // Id of the task being edited, or null when adding a new task
  const [editingId, setEditingId] = useState<number | null>(null);

  // Draft values for the task being composed in the modal
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  // Field-level validation messages
  const [errors, setErrors] = useState<DraftErrors>({});

  // True while a save is in flight — guards against double submits
  const [saving, setSaving] = useState(false);

  // Transient feedback banner (success / error)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Today's LOCAL calendar date. Recomputed when the tab changes and when the
  // window regains focus, so a session left open across midnight re-buckets.
  const [today, setToday] = useState<string>(() => todayISODate());

  const refreshToday = useRef(() => setToday(todayISODate()));

  // Load the persisted task list for this user (and seed on first run)
  useEffect(() => {
    // Wait for the session to resolve so the list is scoped to the real user.
    if (authLoading) return;
    // Signed out: drop any list still held in memory so it cannot leak to
    // the next account that signs in on this browser.
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const res = loadTasks(userId);
    if (cancelled) return;
    if (res.isFirstRun) {
      const seeded = seedTasks(todayISODate());
      saveTasks(userId, seeded);
      setTasks(seeded);
    } else {
      setTasks(res.tasks);
    }
    if (res.status === 'error') {
      setToast({ type: 'error', message: 'Could not read your saved tasks. Changes may not persist until storage is available.' });
    }
    setLoading(false);
    return () => { cancelled = true; };
  }, [userId, authLoading]);

  // Keep "today" accurate across tab switches, midnight rollover and refocus
  useEffect(() => {
    refreshToday.current();
  }, [tab]);

  // Poll for the local date to change so a session left open overnight
  // re-buckets without needing a reload.
  useEffect(() => {
    const id = setInterval(() => refreshToday.current(), 60_000);
    const onFocus = () => refreshToday.current();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // Auto-dismiss the toast after a few seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /**
   * The single write path for every task mutation: updates React state and
   * persists the list. A failed write is surfaced instead of silently lost.
   */
  const commit = (next: Task[], successMessage?: string) => {
    // Not signed in: refuse the change outright so the UI never shows a
    // task that was not actually stored anywhere.
    if (!userId) {
      setToast({ type: 'error', message: 'You are not signed in, so your tasks cannot be saved.' });
      return false;
    }
    setTasks(next);
    const saved = saveTasks(userId, next);
    if (!saved) {
      // Storage is unavailable (private mode / quota). Keep the change in
      // memory for this session, but tell the user it is not persisted.
      setToast({ type: 'error', message: 'Could not save your tasks — storage is unavailable. Your change is only in this session.' });
      return false;
    }
    if (successMessage) setToast({ type: 'success', message: successMessage });
    return true;
  };

  // Flips a task between Todo and Done. Re-bucketing is automatic because
  // the buckets are derived from `tasks` on every render.
  const toggle = (id: number) => {
    const next = tasks.map(t => t.id === id ? { ...t, status: t.status === 'Done' ? 'Todo' as const : 'Done' as const } : t);
    const updated = next.find(x => x.id === id);
    commit(next, updated ? `Task marked ${updated.status === 'Done' ? 'done' : 'open'}.` : undefined);
  };

  // Removes a task entirely, after an explicit confirmation
  const del = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    commit(tasks.filter(t => t.id !== id), 'Task deleted.');
  };

  // Buckets: derived from the one task array, so the lists and the counts can
  // never disagree. Done tasks are excluded from the date-based buckets, so
  // each task appears in exactly one of today / upcoming / overdue / done.
  const buckets = useMemo(() => bucketTasks(tasks, today), [tasks, today]);

  // Per-bucket counts used by both the stat cards and the tab labels
  const counts = useMemo(() => ({
    today: buckets.today.length,
    upcoming: buckets.upcoming.length,
    overdue: buckets.overdue.length,
    done: buckets.done.length,
  }), [buckets]);

  // The list to render for the active tab
  const currentList = buckets[tab];

  // Opens the modal for a brand-new task
  const openAdd = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setAddOpen(true);
  };

  // Opens the modal pre-filled with an existing task
  const openEdit = (task: Task) => {
    setEditingId(task.id);
    setDraft({ title: task.title, subject: task.subject, desc: task.desc, priority: task.priority, due: task.due });
    setErrors({});
    setAddOpen(true);
  };

  // Closes the modal and discards the draft (no stale values leak between opens)
  const closeModal = () => {
    setAddOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSaving(false);
  };

  // Validates the draft (title + due required), then adds or updates the task.
  // On success the view jumps to the bucket the task landed in, so the user
  // immediately sees the result instead of an apparently empty list.
  const saveTask = () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (found.title || found.due) return;

    setSaving(true);
    if (editingId !== null) {
      const existing = tasks.find(t => t.id === editingId);
      if (!existing) { closeModal(); return; }
      const updated: Task = {
        ...existing,
        title: draft.title.trim(),
        subject: draft.subject,
        desc: draft.desc,
        priority: draft.priority,
        due: draft.due,
      };
      const next = tasks.map(t => (t.id === editingId ? updated : t));
      const bucket = bucketOf(updated, today);
      if (commit(next, `Task updated — filed under ${BUCKET_LABEL[bucket]}.`)) {
        setTab(bucket);
        closeModal();
      } else {
        setSaving(false);
      }
      return;
    }

    const task: Task = {
      id: nextTaskId(tasks),
      title: draft.title.trim(),
      subject: draft.subject,
      desc: draft.desc,
      priority: draft.priority,
      due: draft.due,
      status: 'Todo',
    };
    const next = [task, ...tasks];
    const bucket = bucketOf(task, today);
    if (commit(next, `Task added — filed under ${BUCKET_LABEL[bucket]}.`)) {
      setTab(bucket);
      closeModal();
    } else {
      setSaving(false);
    }
  };

  return (
    // Page container: 900px max width (responsive padding via .page)
    <div className="page" style={{ maxWidth: '900px' }}>
      {/* Page title + "Add Task" button that opens the modal */}
      <PageHeader title="Study Planner" sub="Manage your academic tasks, deadlines, and daily study goals"
        actions={<Btn icon={<IconPlus size={14} />} onClick={openAdd}>Add Task</Btn>}
      />

      {/* Stats */}
      <div className="stats-4" style={{ marginBottom: '24px' }}>
        {[{ label: 'Today', value: counts.today, color: C.indigo }, { label: 'Upcoming', value: counts.upcoming, color: C.info }, { label: 'Overdue', value: counts.overdue, color: C.error }, { label: 'Completed', value: counts.done, color: C.success }].map(s => (
          <Card key={s.label} padding={16} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Bucket tabs, each labelled with its live count */}
      <Tabs tabs={[
        { id: 'today', label: `Today (${counts.today})` },
        { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
        { id: 'overdue', label: `Overdue (${counts.overdue})` },
        { id: 'done', label: `Done (${counts.done})` },
      ]} active={tab} onChange={id => setTab(id as TaskBucket)} style={{ marginBottom: '20px' }} />

      {loading ? (
        // Placeholder while the saved list is read from storage
        <div style={{ textAlign: 'center', padding: '48px 24px', color: C.text3 }}>
          <p style={{ fontSize: '13px' }}>Loading your tasks…</p>
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: C.text3 }}>
          <IconCalendar size={36} color={C.border} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginTop: '12px' }}>No tasks here</p>
          <p style={{ fontSize: '13px', color: C.text3, marginTop: '4px' }}>
            {tab === 'today' ? "You're all caught up for today!" : 'Nothing in this category yet.'}
          </p>
          {tab === 'today' && <Btn size="sm" variant="outline" style={{ marginTop: '14px' }} onClick={openAdd} icon={<IconPlus size={13} />}>Add a task</Btn>}
        </div>
        // Task list for the active bucket
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentList.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              overdue={bucketOf(t, today) === 'overdue'}
              onToggle={() => toggle(t.id)}
              onEdit={() => openEdit(t)}
              onDelete={() => del(t.id)}
            />
          ))}
        </div>
      )}

      {/* Add/edit-task modal: title, subject + priority, due date, notes, actions */}
      <Modal open={addOpen} onClose={closeModal} title={editingId !== null ? 'Edit Study Task' : 'Add Study Task'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Task Title" placeholder="e.g., Revise Normalization – DBMS" value={draft.title} error={errors.title} onChange={e => setDraft(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div className="form-2">
            <Select label="Subject" options={subjects} value={draft.subject} onChange={e => setDraft(f => ({ ...f, subject: e.target.value }))} />
            <Select label="Priority" options={priorities} value={draft.priority} onChange={e => setDraft(f => ({ ...f, priority: e.target.value as TaskPriority }))} />
          </div>
          <Input label="Due Date" type="date" value={draft.due} error={errors.due} onChange={e => setDraft(f => ({ ...f, due: e.target.value }))} fullWidth />
          <Textarea label="Notes (optional)" placeholder="What do you need to cover?" value={draft.desc} onChange={e => setDraft(f => ({ ...f, desc: e.target.value }))} />
          <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={saveTask} loading={saving} disabled={saving}>{editingId !== null ? 'Save Changes' : 'Add Task'}</Btn>
          </div>
        </div>
      </Modal>

      {/* Transient feedback for the last action */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
