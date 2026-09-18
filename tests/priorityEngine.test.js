const { test } = require('node:test');
const assert = require('node:assert');
const { computePriority, recommendNext } = require('../src/services/priorityEngine');

function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function today() { return new Date().toISOString().slice(0, 10); }
function yesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

test('Urgent + Important + Due today → CRITICAL', () => {
  const r = computePriority({ importance: true, urgency: true, dueDate: today(), estimatedDuration: 30 });
  assert.strictEqual(r.priority, 'CRITICAL');
  assert.ok(r.priorityScore >= 80);
});

test('Urgent + Important with deadline later this week → HIGH or higher', () => {
  const r = computePriority({ importance: true, urgency: true, dueDate: tomorrow(), estimatedDuration: 60 });
  assert.ok(['HIGH','CRITICAL'].includes(r.priority));
});

test('Important + Not urgent → MEDIUM or better', () => {
  const r = computePriority({ importance: true, urgency: false, dueDate: tomorrow(), estimatedDuration: 60 });
  assert.ok(['MEDIUM','HIGH','CRITICAL'].includes(r.priority));
});

test('Not urgent + Not important → LOW', () => {
  const r = computePriority({ importance: false, urgency: false, dueDate: tomorrow(), estimatedDuration: 60 });
  assert.strictEqual(r.priority, 'LOW');
});

test('Overdue task gets higher score than identical non-overdue', () => {
  const overdue = computePriority({ importance: true, urgency: true, dueDate: yesterday(), estimatedDuration: 30 });
  const future  = computePriority({ importance: true, urgency: true, dueDate: tomorrow(), estimatedDuration: 30 });
  assert.ok(overdue.priorityScore > future.priorityScore);
  assert.ok(overdue.priorityReason.includes('Overdue'));
});

test('recommendNext returns highest-score pending task', () => {
  const tasks = [
    { id: 1, title: 'Low',  status: 'PENDING', priority_score: 20, due_date: tomorrow() },
    { id: 2, title: 'High', status: 'PENDING', priority_score: 90, due_date: today() },
    { id: 3, title: 'Done', status: 'COMPLETED', priority_score: 100, due_date: today() },
  ];
  const r = recommendNext(tasks);
  assert.strictEqual(r.id, 2);
});

test('recommendNext returns null when no pending tasks', () => {
  const r = recommendNext([{ id: 1, status: 'COMPLETED', priority_score: 10, due_date: today() }]);
  assert.strictEqual(r, null);
});
