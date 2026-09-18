function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Whole-day difference between dueDate(+time) and now. Negative = overdue. */
function daysUntil(dueDate, dueTime) {
  const now = new Date();
  const due = new Date(`${dueDate}T${dueTime || '23:59'}:00`);
  const msPerDay = 86400000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue   = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const dayDiff = Math.round((startOfDue - startOfToday) / msPerDay);
  if (dayDiff === 0) {
    // same calendar day: overdue only if time already passed
    return due.getTime() < now.getTime() ? -0.5 : 0;
  }
  return dayDiff;
}

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime());
}

function isValidTime(str) {
  if (!str) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
}

module.exports = { todayISO, daysUntil, isValidDate, isValidTime };
