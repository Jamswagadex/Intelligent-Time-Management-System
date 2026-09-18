const { daysUntil, todayISO } = require('../utils/dateUtils');

/**
 * Deadline Classification (Stage 6.3)
 *
 *   overdue   : due_date < today  AND status=PENDING
 *   dueToday  : due_date == today AND status=PENDING
 *   upcoming  : due_date > today  AND status=PENDING
 *   completed : status=COMPLETED
 */
function classifyDeadline(task) {
  if (task.status === 'COMPLETED') return 'completed';
  const d = daysUntil(task.dueDate, task.dueTime);
  if (d < 0) return 'overdue';
  if (d === 0) return 'dueToday';
  return 'upcoming';
}

function isOverdue(task) {
  return classifyDeadline(task) === 'overdue';
}

function isDueToday(task) {
  return classifyDeadline(task) === 'dueToday';
}

/** Splits a list of tasks into deadline buckets, useful for dashboard sections. */
function bucketTasks(tasks) {
  const buckets = { overdue: [], dueToday: [], upcoming: [], completed: [] };
  tasks.forEach(t => buckets[classifyDeadline(t)].push(t));
  return buckets;
}

module.exports = { classifyDeadline, isOverdue, isDueToday, bucketTasks, todayISO };
