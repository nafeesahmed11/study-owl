import { useState } from "react";
import { C, Card, Badge, Btn, Tabs, PageHeader, Modal, Input, Select, Textarea } from "../components/ui";
import { IconCalendar, IconPlus, IconCheck, IconTrash, IconEdit, IconChevronRight } from "../components/Icons";

/**
 * Page: Study Planner (/app/planner) — student-only, inside AppLayout.
 * Purpose: Task manager bucketed by deadline — Today / Upcoming / Overdue /
 *   Done — with counts, a per-task done toggle, delete, and an add-task modal.
 * Data source: seeded from `initTasks` and held in React state only, so tasks
 *   reset on reload (no persistence yet).
 */

type Task = { id: number; title: string; subject: string; desc: string; priority: 'High' | 'Medium' | 'Low'; due: string; status: 'Todo' | 'Done' };

// Seed tasks on first mount
const initTasks: Task[] = [
  { id: 1, title: "Revise Normalization (DBMS)", subject: "DBMS", desc: "Cover 1NF, 2NF, 3NF, BCNF with examples from past papers.", priority: "High", due: "2024-12-12", status: "Todo" },
  { id: 2, title: "Practice Dijkstra's Algorithm", subject: "Algorithms", desc: "Solve at least 3 practice problems from 2022 paper.", priority: "High", due: "2024-12-12", status: "Todo" },
  { id: 3, title: "Read Chapter 5 – OSI Model", subject: "CN", desc: "Focus on data link layer and error detection.", priority: "Medium", due: "2024-12-13", status: "Todo" },
  { id: 4, title: "Complete SE Assignment 3", subject: "SE", desc: "Design pattern implementation exercise.", priority: "High", due: "2024-12-14", status: "Todo" },
  { id: 5, title: "Bisection Method Practice", subject: "Numerical Methods", desc: "Practice 5 problems for exam readiness.", priority: "Low", due: "2024-12-15", status: "Todo" },
  { id: 6, title: "DBMS Mock Test", subject: "DBMS", desc: "Take the online mock test for Chapter 1-4.", priority: "Medium", due: "2024-12-10", status: "Done" },
  { id: 7, title: "CN Lab Report", subject: "CN", desc: "Write up Lab 4 ping experiment.", priority: "Low", due: "2024-12-09", status: "Done" },
];

// Dropdown options and the priority -> badge variant mapping
const subjects = ['DBMS', 'Algorithms', 'Computer Networks', 'Software Engineering', 'Numerical Methods', 'Compiler Design', 'Other'].map(s => ({ value: s, label: s }));
const priorities = ['High', 'Medium', 'Low'].map(p => ({ value: p, label: p }));
const priorityBadge = (p: string) => p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'default';

/**
 * Presentational sub-component: one task row.
 * Shows a completion checkbox, title, subject/due metadata, priority badge,
 * and a delete icon. Overdue styling is computed locally here.
 * Both mutations are delegated to the parent via callbacks.
 */
function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  // Today's date as YYYY-MM-DD, matching the format of the `due` field
  const today = new Date().toISOString().slice(0, 10);

  // A task is overdue when it is still open and its due date is in the past
  const overdue = task.status === 'Todo' && task.due < today;
  return (
    // Task row; border turns red and the title is struck through when done/overdue
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: task.status === 'Done' ? C.surface2 : C.surface, border: `1px solid ${overdue ? C.error + '40' : C.border}`, borderRadius: '12px', transition: 'box-shadow 0.15s' }}>
      {/* Round checkbox — clicking it flips Todo/Done */}
      <button onClick={onToggle} style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${task.status === 'Done' ? C.success : C.border}`, backgroundColor: task.status === 'Done' ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: task.status === 'Done' ? C.success : 'none' }}>
        {task.status === 'Done' && <IconCheck size={12} color="#fff" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: task.status === 'Done' ? C.text3 : C.text, textDecoration: task.status === 'Done' ? 'line-through' : 'none', marginBottom: '3px' }}>{task.title}</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: C.text3 }}>{task.subject}</span>
          <span style={{ fontSize: '12px', color: overdue ? C.error : C.text3 }}>· Due {task.due}</span>
          {overdue && <Badge variant="error">Overdue</Badge>}
        </div>
      </div>
      <Badge variant={priorityBadge(task.priority) as any}>{task.priority}</Badge>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, display: 'flex', padding: '4px' }}
        onMouseEnter={e => e.currentTarget.style.color = C.error}
        onMouseLeave={e => e.currentTarget.style.color = C.text3}>
        <IconTrash size={15} />
      </button>
    </div>
  );
}

export default function Planner() {
  // Master task list — the source of truth for every bucket below
  const [tasks, setTasks] = useState<Task[]>(initTasks);

  // Active bucket shown by the Tabs bar
  const [tab, setTab] = useState('today');

  // Visibility flag for the add-task modal
  const [addOpen, setAddOpen] = useState(false);

  // Draft values for the task being composed in the modal
  const [newTask, setNewTask] = useState({ title: '', subject: 'DBMS', desc: '', priority: 'Medium' as Task['priority'], due: '' });

  // Today's date string, used to split tasks into buckets
  const today = new Date().toISOString().slice(0, 10);

  // Flips a task between Todo and Done
  const toggle = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status: t.status === 'Done' ? 'Todo' : 'Done' } : t));

  // Removes a task entirely
  const del = (id: number) => setTasks(ts => ts.filter(t => t.id !== id));

  // Buckets: done tasks are excluded from the date-based buckets so each task
  // appears in exactly one of today / upcoming / overdue / done
  const filtered = {
    today: tasks.filter(t => t.status === 'Todo' && t.due === today),
    upcoming: tasks.filter(t => t.status === 'Todo' && t.due > today),
    overdue: tasks.filter(t => t.status === 'Todo' && t.due < today),
    done: tasks.filter(t => t.status === 'Done'),
  };

  // Per-bucket counts used by both the stat cards and the tab labels
  const counts = { today: filtered.today.length, upcoming: filtered.upcoming.length, overdue: filtered.overdue.length, done: filtered.done.length };

  // The list to render for the active tab
  const currentList = filtered[tab as keyof typeof filtered] || [];

  // Validates the draft (title + due required), prepends the task, resets the form, closes the modal
  const addTask = () => {
    if (!newTask.title || !newTask.due) return;
    const task: Task = { id: Date.now(), title: newTask.title, subject: newTask.subject, desc: newTask.desc, priority: newTask.priority, due: newTask.due, status: 'Todo' };
    setTasks(ts => [task, ...ts]);
    setNewTask({ title: '', subject: 'DBMS', desc: '', priority: 'Medium', due: '' });
    setAddOpen(false);
  };

  return (
    // Page container: 900px max width
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      {/* Page title + "Add Task" button that opens the modal */}
      <PageHeader title="Study Planner" sub="Manage your academic tasks, deadlines, and daily study goals"
        actions={<Btn icon={<IconPlus size={14} />} onClick={() => setAddOpen(true)}>Add Task</Btn>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
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
      ]} active={tab} onChange={setTab} style={{ marginBottom: '20px' }} />

      {currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: C.text3 }}>
          <IconCalendar size={36} color={C.border} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginTop: '12px' }}>No tasks here</p>
          <p style={{ fontSize: '13px', color: C.text3, marginTop: '4px' }}>
            {tab === 'today' ? "You're all caught up for today!" : 'Nothing in this category yet.'}
          </p>
          {tab === 'today' && <Btn size="sm" variant="outline" style={{ marginTop: '14px' }} onClick={() => setAddOpen(true)} icon={<IconPlus size={13} />}>Add a task</Btn>}
        </div>
        // Task list for the active bucket
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentList.map(t => <TaskCard key={t.id} task={t} onToggle={() => toggle(t.id)} onDelete={() => del(t.id)} />)}
        </div>
      )}

      {/* Add-task modal: title, subject + priority, due date, notes, actions */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Study Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Task Title" placeholder="e.g., Revise Normalization – DBMS" value={newTask.title} onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select label="Subject" options={subjects} value={newTask.subject} onChange={e => setNewTask(f => ({ ...f, subject: e.target.value }))} />
            <Select label="Priority" options={priorities} value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value as Task['priority'] }))} />
          </div>
          <Input label="Due Date" type="date" value={newTask.due} onChange={e => setNewTask(f => ({ ...f, due: e.target.value }))} fullWidth />
          <Textarea label="Notes (optional)" placeholder="What do you need to cover?" value={newTask.desc} onChange={e => setNewTask(f => ({ ...f, desc: e.target.value }))} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Btn>
            <Btn onClick={addTask} disabled={!newTask.title || !newTask.due}>Add Task</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
