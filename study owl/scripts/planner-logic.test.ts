// Node's ESM resolver needs explicit file extensions, but the source files use
// extensionless imports (Vite convention). This loader bridges the two.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

register('./ts-resolver.mjs', pathToFileURL(import.meta.filename));

const { toLocalISODate, todayISODate, addDaysISO, compareISODate, formatDueLabel, isValidISODate } = await import('../src/lib/date.ts');
const { bucketOf, bucketTasks, bucketCounts, nextTaskId, seedTasks, tasksKey, parseTask, loadTasks, saveTasks, clearTasks } = await import('../src/lib/taskStore.ts');
const today = '2026-10-21';
const mk = (over: Partial<any> = {}) => ({ id: 1, title: 'T', subject: 'DBMS', desc: '', priority: 'Medium', due: today, status: 'Todo', ...over });

// bucketOf
assert.equal(bucketOf(mk({ due: today }), today), 'today');
assert.equal(bucketOf(mk({ due: '2026-10-22' }), today), 'upcoming');
assert.equal(bucketOf(mk({ due: '2026-09-28' }), today), 'overdue');
assert.equal(bucketOf(mk({ due: '2026-09-28', status: 'Done' }), today), 'done');
assert.equal(bucketOf(mk({ due: today, status: 'Done' }), today), 'done');

// the exact recorded scenario: due 09/28/2026 on 10/21/2026 -> overdue
assert.equal(bucketOf(mk({ due: '2026-09-28' }), today), 'overdue');

// counts == list lengths, and every task in exactly one bucket
const tasks = [
  mk({ id: 1, due: today }),
  mk({ id: 2, due: '2026-10-22' }),
  mk({ id: 3, due: '2026-09-28' }),
  mk({ id: 4, due: '2026-09-01', status: 'Done' }),
  mk({ id: 5, due: today, status: 'Done' }),
];
const b = bucketTasks(tasks, today);
const c = bucketCounts(tasks, today);
assert.equal(b.today.length + b.upcoming.length + b.overdue.length + b.done.length, tasks.length);
for (const k of ['today', 'upcoming', 'overdue', 'done']) assert.equal(c[k as keyof typeof c], b[k as keyof typeof b].length);
// done tasks never appear in a date bucket
assert.ok(!b.today.some(t => t.status === 'Done'));
assert.ok(!b.overdue.some(t => t.status === 'Done'));

// date helpers
assert.equal(addDaysISO(today, 1), '2026-10-22');
assert.equal(addDaysISO(today, -3), '2026-10-18');
assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
assert.equal(addDaysISO('2024-02-28', 1), '2024-02-29'); // leap year
assert.equal(addDaysISO('2026-03-01', -1), '2026-02-28');
assert.equal(compareISODate('2026-10-21', '2026-10-21'), 0);
assert.equal(compareISODate('2026-10-21', '2026-10-22'), -1);
assert.equal(compareISODate('2026-10-22', '2026-10-21'), 1);
assert.equal(toLocalISODate(new Date(2026, 9, 21)), '2026-10-21');
// Timezone regression: 18:30Z is already the next calendar day in UTC+5:30,
// but still the previous day in UTC. toLocalISODate must follow the LOCAL day.
assert.equal(toLocalISODate(new Date('2026-10-20T18:30:00Z')), '2026-10-21');
// ...while the old toISOString() approach (the bug) reports the previous day.
assert.equal(new Date('2026-10-20T18:30:00Z').toISOString().slice(0, 10), '2026-10-20');
assert.equal(formatDueLabel('2026-10-21'), 'Oct 21, 2026');
assert.equal(isValidISODate('2026-02-30'), false);
assert.equal(isValidISODate('2026-10-21'), true);
assert.equal(todayISODate().length, 10);

// seeds are relative to today and spread across buckets
const seeds = seedTasks(today);
const sc = bucketCounts(seeds, today);
assert.equal(sc.today, 1);
assert.equal(sc.upcoming, 2);
assert.equal(sc.overdue, 2);
assert.equal(sc.done, 2);
assert.ok(seeds.every(t => t.subject !== 'CN' && t.subject !== 'SE'));

// id generation
assert.equal(nextTaskId([]), 1);
assert.equal(nextTaskId([mk({ id: 7 })]), 8);

// storage key is per-user
assert.notEqual(tasksKey('u1'), tasksKey('u2'));
assert.ok(tasksKey('u1').startsWith('studyowl_planner_tasks_v1:'));

// malformed records are dropped
assert.equal(parseTask({ id: 1, title: 'x', subject: 'DBMS', due: 'nope', priority: 'High', status: 'Todo' }), null);
assert.equal(parseTask({ id: 1, title: '', subject: 'DBMS', due: '2026-01-01', priority: 'High', status: 'Todo' }), null);
assert.equal(parseTask(null), null);
assert.ok(parseTask({ id: 1, title: 'x', subject: 'DBMS', due: '2026-01-01', priority: 'High', status: 'Todo' }));

// ── Persistence round-trip (with a localStorage stub) ────────────────────────
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
};

const uid = 'user-abc';
// first run
let r = loadTasks(uid);
assert.equal(r.isFirstRun, true);
assert.deepEqual(r.tasks, []);
assert.equal(r.status, 'ready');
// save + reload
assert.equal(saveTasks(uid, tasks), true);
r = loadTasks(uid);
assert.equal(r.isFirstRun, false);
assert.equal(r.tasks.length, tasks.length);
assert.equal(r.tasks[0].due, today);
// malformed entries dropped, valid ones kept
store.set(tasksKey(uid), JSON.stringify([tasks[0], { id: 'x' }, null, 42]));
r = loadTasks(uid);
assert.equal(r.tasks.length, 1);
// corrupt JSON -> error status, empty list
store.set(tasksKey(uid), '{not json');
r = loadTasks(uid);
assert.equal(r.status, 'error');
assert.deepEqual(r.tasks, []);
// non-array -> error
store.set(tasksKey(uid), '{"a":1}');
r = loadTasks(uid);
assert.equal(r.status, 'error');
// clear
clearTasks(uid);
assert.equal(loadTasks(uid).isFirstRun, true);
// users are isolated
saveTasks('u1', tasks);
saveTasks('u2', []);
assert.equal(loadTasks('u1').tasks.length, tasks.length);
assert.equal(loadTasks('u2').tasks.length, 0);

console.log('ALL PLANNER LOGIC TESTS PASSED');
