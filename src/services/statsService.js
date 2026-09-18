const { listTasks } = require('./taskService');

function computeStats(userId) {
  const tasks = listTasks(userId);
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const pending   = tasks.filter(t => t.status === 'PENDING').length;
  const overdue   = tasks.filter(t => t.deadlineStatus === 'overdue').length;
  const dueToday  = tasks.filter(t => t.deadlineStatus === 'dueToday').length;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  // Quadrant distribution (pending only)
  const quadrants = { 1: 0, 2: 0, 3: 0, 4: 0 };
  tasks.filter(t => t.status === 'PENDING').forEach(t => { quadrants[t.quadrant]++; });

  // Weekly productivity — last 7 days completion counts
  const weekly = lastNDays(7).map(day => ({
    label: day.slice(5),
    date: day,
    completed: tasks.filter(t => t.completedAt && t.completedAt.slice(0,10) === day).length,
  }));

  // Monthly productivity — last 30 days
  const monthly = lastNDays(30).map(day => ({
    label: day.slice(5),
    date: day,
    completed: tasks.filter(t => t.completedAt && t.completedAt.slice(0,10) === day).length,
  }));

  return { total, completed, pending, overdue, dueToday, completionPct, quadrants, weekly, monthly };
}

function lastNDays(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

module.exports = { computeStats };
