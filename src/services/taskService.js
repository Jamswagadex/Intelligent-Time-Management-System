const taskRepo = require('../repositories/taskRepository');
const notifRepo = require('../repositories/notificationRepository');
const { computePriority } = require('./priorityEngine');
const { daysUntil } = require('../utils/dateUtils');
const { classify } = require('./eisenhower');

/**
 * Recomputes priority (score may drift as deadline approaches) and
 * annotates deadline status for the client.
 */
function decorate(task) {
  const p = computePriority({
    importance: task.importance,
    urgency: task.urgency,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    estimatedDuration: task.estimatedDuration,
    status: task.status,
  });
  const d = daysUntil(task.dueDate, task.dueTime);
  let deadlineStatus = 'upcoming';
  if (task.status === 'COMPLETED') deadlineStatus = 'completed';
  else if (d < 0) deadlineStatus = 'overdue';
  else if (d === 0) deadlineStatus = 'dueToday';

  return {
    ...task,
    quadrant: p.quadrant,
    quadrantLabel: p.quadrantLabel,
    quadrantAction: p.quadrantAction,
    priority: p.priority,
    priorityScore: p.priorityScore,
    priorityReason: p.priorityReason,
    deadlineStatus,
  };
}

function createTask(userId, input) {
  const p = computePriority({
    importance: input.importance,
    urgency: input.urgency,
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    estimatedDuration: input.estimatedDuration,
    status: 'PENDING',
  });
  const task = taskRepo.create({
    userId,
    ...input,
    quadrant: p.quadrant,
    priority: p.priority,
    priorityScore: p.priorityScore,
    priorityReason: p.priorityReason,
  });
  scheduleReminder(task);
  return decorate(task);
}

function updateTask(userId, id, input) {
  const p = computePriority({
    importance: input.importance,
    urgency: input.urgency,
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    estimatedDuration: input.estimatedDuration,
    status: 'PENDING',
  });
  const task = taskRepo.update(id, userId, {
    ...input,
    quadrant: p.quadrant,
    priority: p.priority,
    priorityScore: p.priorityScore,
    priorityReason: p.priorityReason,
  });
  // reschedule reminder
  notifRepo.deleteByTask(id);
  if (task && task.status === 'PENDING') scheduleReminder(task);
  return decorate(task);
}

function listTasks(userId) {
  return taskRepo.listAll(userId).map(decorate);
}

function getTask(userId, id) {
  const t = taskRepo.findById(id, userId);
  return t ? decorate(t) : null;
}

function deleteTask(userId, id) {
  notifRepo.deleteByTask(id);
  return taskRepo.remove(id, userId) > 0;
}

function setStatus(userId, id, status) {
  if (!['PENDING', 'COMPLETED'].includes(status)) return null;
  const t = taskRepo.setStatus(id, userId, status);
  if (!t) return null;
  if (status === 'COMPLETED') notifRepo.deleteByTask(id);
  else scheduleReminder(t);
  return decorate(t);
}

/** Creates a notification row scheduled for (due - reminderMinutes). */
function scheduleReminder(task) {
  if (!task.reminderMinutes || task.reminderMinutes <= 0) return;
  const due = new Date(`${task.dueDate}T${task.dueTime || '09:00'}:00`);
  const when = new Date(due.getTime() - task.reminderMinutes * 60000);
  if (when.getTime() <= Date.now()) return; // past — skip
  notifRepo.create({
    userId: task.userId,
    taskId: task.id,
    title: 'Task Reminder',
    body: `${task.title} is due soon.`,
    type: 'REMINDER',
    scheduledAt: when.toISOString(),
  });
}

module.exports = { createTask, updateTask, listTasks, getTask, deleteTask, setStatus, decorate };
