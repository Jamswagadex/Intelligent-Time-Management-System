const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Use a temp DB for tests
process.env.DB_PATH = './data/test_itms.db';

const { initDatabase, getDb } = require('../src/config/database');
const userRepo = require('../src/repositories/userRepository');
const taskService = require('../src/services/taskService');
const authService = require('../src/services/authService');

function freshDb() {
  try { fs.unlinkSync(path.resolve(process.env.DB_PATH)); } catch {}
  try { fs.unlinkSync(path.resolve(process.env.DB_PATH) + '-wal'); } catch {}
  try { fs.unlinkSync(path.resolve(process.env.DB_PATH) + '-shm'); } catch {}
  initDatabase();
}

function makeUser() {
  return authService.register({
    fullName: 'Test Student',
    email: 'test@pi.edu.ng',
    password: 'secret123',
    confirmPassword: 'secret123',
    department: 'Computer Science',
    level: 'HND 2',
  }).user;
}

function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

test('task creation persists and computes quadrant + priority', () => {
  freshDb();
  const user = makeUser();
  const t = taskService.createTask(user.id, {
    title: 'Submit Database Assignment',
    description: 'Chapter 5',
    category: 'Assignment',
    importance: true, urgency: true,
    dueDate: tomorrow(), dueTime: '10:00',
    reminderMinutes: 0, estimatedDuration: 60,
  });
  assert.ok(t.id);
  assert.strictEqual(t.quadrant, 1);
  assert.ok(['HIGH','CRITICAL'].includes(t.priority));
});

test('task update recomputes quadrant', () => {
  freshDb();
  const user = makeUser();
  const t = taskService.createTask(user.id, {
    title: 'Read notes', description: '', category: 'Academic',
    importance: true, urgency: false,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });
  assert.strictEqual(t.quadrant, 2);

  const updated = taskService.updateTask(user.id, t.id, {
    title: 'Read notes', description: '', category: 'Academic',
    importance: true, urgency: true,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });
  assert.strictEqual(updated.quadrant, 1);
});

test('task deletion removes it', () => {
  freshDb();
  const user = makeUser();
  const t = taskService.createTask(user.id, {
    title: 'Temp', description: '', category: 'Other',
    importance: false, urgency: false,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });
  const ok = taskService.deleteTask(user.id, t.id);
  assert.strictEqual(ok, true);
  assert.strictEqual(taskService.getTask(user.id, t.id), null);
});

test('completing and undoing a task', () => {
  freshDb();
  const user = makeUser();
  const t = taskService.createTask(user.id, {
    title: 'Complete me', description: '', category: 'Academic',
    importance: true, urgency: true,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });
  const done = taskService.setStatus(user.id, t.id, 'COMPLETED');
  assert.strictEqual(done.status, 'COMPLETED');
  assert.ok(done.completedAt);

  const undone = taskService.setStatus(user.id, t.id, 'PENDING');
  assert.strictEqual(undone.status, 'PENDING');
  assert.strictEqual(undone.completedAt, null);
});

test('users only see their own tasks', () => {
  freshDb();
  const a = authService.register({
    fullName: 'User A', email: 'a@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 1',
  }).user;
  const b = authService.register({
    fullName: 'User B', email: 'b@pi.edu.ng', password: 'secret123',
    confirmPassword: 'secret123', department: 'CS', level: 'ND 2',
  }).user;

  taskService.createTask(a.id, {
    title: 'A task', description: '', category: 'Academic',
    importance: true, urgency: false,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });
  taskService.createTask(b.id, {
    title: 'B task', description: '', category: 'Personal',
    importance: false, urgency: true,
    dueDate: tomorrow(), dueTime: null, reminderMinutes: 0, estimatedDuration: 30,
  });

  assert.strictEqual(taskService.listTasks(a.id).length, 1);
  assert.strictEqual(taskService.listTasks(a.id)[0].title, 'A task');
  assert.strictEqual(taskService.listTasks(b.id).length, 1);
  assert.strictEqual(taskService.listTasks(b.id)[0].title, 'B task');
});
