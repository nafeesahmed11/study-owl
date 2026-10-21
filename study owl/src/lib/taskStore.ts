/**
 * Study Planner task store — the single source of truth for planner tasks.
 *
 * Follows the same convention as the other local stores in this project
 * (`lib/creditsStore.ts`, `lib/integrationStore.ts`): a versioned
 * `localStorage` key, every read/write wrapped in try/catch so a private-mode
 * or quota failure degrades gracefully instead of throwing.
 *
 * Tasks are scoped PER USER (`studyowl_planner_tasks_v1:<userId>`) so two
 * students signed in on the same browser never share a list.
 *
 * This module also owns the authoritative bucketing logic (`bucketOf` /
 * `bucketTasks`). The planner's list rendering and its summary counts both
 * read from these functions, which guarantees the counts can never drift
 * away from the lists they describe.
 */

import { addDaysISO, compareISODate, todayISODate } from './date';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Todo' | 'Done';
export type TaskBucket = 'today' | 'upcoming' | 'overdue' | 'done';

export interface Task {
  id: number;
  title: string;
  subject: string;
  desc: string;
  priority: TaskPriority;
  /** Calendar date, `YYYY-MM-DD`. Never a timestamp. */
  due: string;
  status: TaskStatus;
}

const KEY_PREFIX = 'studyowl_planner_tasks_v1';

/** Every subject a task may be filed under. */
export const SUBJECTS = [
  'DBMS',
  'Algorithms',
  'Computer Networks',
  'Software Engineering',
  'Numerical Methods',
  'Compiler Design',
  'Other',
] as const;

export const PRIORITIES: readonly TaskPriority[] = ['High', 'Medium', 'Low'];

/** Human-readable bucket name, used in toast messages. */
export const BUCKET_LABEL: Record<TaskBucket, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  done: 'Done',
};

/** Storage key for one user's task list. */
export function tasksKey(userId: string): string {
  return `${KEY_PREFIX}:${userId}`;
}

/* ── Seed data ──────────────────────────────────────────────────────────────── */

/**
 * Demo tasks used the very first time a user opens the planner.
 *
 * Due dates are relative to today so the four buckets are always populated
 * and meaningful (instead of every seed sitting in "Overdue" forever).
 */
export function seedTasks(today: string = todayISODate()): Task[] {
  return [
    { id: 1, title: 'Revise Normalization (DBMS)', subject: 'DBMS', desc: 'Cover 1NF, 2NF, 3NF, BCNF with examples from past papers.', priority: 'High', due: addDaysISO(today, -3), status: 'Todo' },
    { id: 2, title: "Practice Dijkstra's Algorithm", subject: 'Algorithms', desc: 'Solve at least 3 practice problems from 2022 paper.', priority: 'High', due: addDaysISO(today, -2), status: 'Todo' },
    { id: 3, title: 'Read Chapter 5 – OSI Model', subject: 'Computer Networks', desc: 'Focus on data link layer and error detection.', priority: 'Medium', due: today, status: 'Todo' },
    { id: 4, title: 'Complete SE Assignment 3', subject: 'Software Engineering', desc: 'Design pattern implementation exercise.', priority: 'High', due: addDaysISO(today, 1), status: 'Todo' },
    { id: 5, title: 'Bisection Method Practice', subject: 'Numerical Methods', desc: 'Practice 5 problems for exam readiness.', priority: 'Low', due: addDaysISO(today, 4), status: 'Todo' },
    { id: 6, title: 'DBMS Mock Test', subject: 'DBMS', desc: 'Take the online mock test for Chapter 1-4.', priority: 'Medium', due: addDaysISO(today, -5), status: 'Done' },
    { id: 7, title: 'CN Lab Report', subject: 'Computer Networks', desc: 'Write up Lab 4 ping experiment.', priority: 'Low', due: addDaysISO(today, -6), status: 'Done' },
  ];
}

/* ── Validation ─────────────────────────────────────────────────────────────── */

function isPriority(v: unknown): v is TaskPriority {
  return v === 'High' || v === 'Medium' || v === 'Low';
}

function isStatus(v: unknown): v is TaskStatus {
  return v === 'Todo' || v === 'Done';
}

function isISODate(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Narrows an unknown record into a `Task`, or returns null when unusable. */
export function parseTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'number' || !Number.isFinite(r.id)) return null;
  if (typeof r.title !== 'string' || !r.title.trim()) return null;
  if (typeof r.subject !== 'string') return null;
  if (!isISODate(r.due)) return null;
  if (!isPriority(r.priority) || !isStatus(r.status)) return null;
  return {
    id: r.id,
    title: r.title,
    subject: r.subject,
    desc: typeof r.desc === 'string' ? r.desc : '',
    priority: r.priority,
    due: r.due,
    status: r.status,
  };
}

/* ── Persistence ────────────────────────────────────────────────────────────── */

export interface LoadResult {
  tasks: Task[];
  /** `error` means the stored value could not be read (private mode / corrupt). */
  status: 'ready' | 'error';
  /** True when the user has never had a task list stored before. */
  isFirstRun: boolean;
}

/**
 * Reads the user's stored task list. Malformed records are dropped rather
 * than poisoning the whole list; a completely unreadable store yields an
 * empty list plus an `error` status so the page can tell the user.
 */
export function loadTasks(userId: string): LoadResult {
  try {
    const raw = localStorage.getItem(tasksKey(userId));
    if (raw === null) return { tasks: [], status: 'ready', isFirstRun: true };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { tasks: [], status: 'error', isFirstRun: false };
    const tasks = parsed.map(parseTask).filter((t): t is Task => t !== null);
    return { tasks, status: 'ready', isFirstRun: false };
  } catch {
    return { tasks: [], status: 'error', isFirstRun: false };
  }
}

/**
 * Persists the user's task list. Returns false when the write failed
 * (quota exceeded / private mode) so the caller can surface the failure
 * instead of pretending the save worked.
 */
export function saveTasks(userId: string, tasks: Task[]): boolean {
  try {
    localStorage.setItem(tasksKey(userId), JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

/** Removes the user's stored task list entirely. */
export function clearTasks(userId: string): void {
  try {
    localStorage.removeItem(tasksKey(userId));
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/* ── Bucketing (the authoritative categorisation) ───────────────────────────── */

/**
 * The single place that decides which bucket a task belongs to.
 *
 * The four buckets are mutually exclusive and exhaustive, so every task is
 * counted exactly once. Done tasks never appear in a date bucket.
 */
export function bucketOf(task: Task, today: string): TaskBucket {
  if (task.status === 'Done') return 'done';
  const cmp = compareISODate(task.due, today);
  if (cmp === 0) return 'today';
  return cmp > 0 ? 'upcoming' : 'overdue';
}

/** Groups every task into its bucket. Drives BOTH the lists and the counts. */
export function bucketTasks(tasks: Task[], today: string): Record<TaskBucket, Task[]> {
  const out: Record<TaskBucket, Task[]> = { today: [], upcoming: [], overdue: [], done: [] };
  for (const t of tasks) out[bucketOf(t, today)].push(t);
  return out;
}

/** Bucket counts derived from the same grouping the list rendering uses. */
export function bucketCounts(tasks: Task[], today: string): Record<TaskBucket, number> {
  const b = bucketTasks(tasks, today);
  return { today: b.today.length, upcoming: b.upcoming.length, overdue: b.overdue.length, done: b.done.length };
}

/** Generates a task id that does not collide with existing ones. */
export function nextTaskId(tasks: Task[]): number {
  return tasks.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1;
}


