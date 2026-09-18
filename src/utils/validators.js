const { isValidDate, isValidTime } = require('./dateUtils');

const CATEGORIES = ['Academic', 'Personal', 'Project', 'Assignment', 'Examination', 'Other'];
const REMINDER_OPTIONS = [0, 10, 30, 60, 1440]; // minutes; 0 = none

function validateRegistration({ fullName, email, password, confirmPassword, department, level }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 3) errors.fullName = 'Enter your full name (min 3 characters).';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!department || !department.trim()) errors.department = 'Select your department.';
  if (!level || !level.trim()) errors.level = 'Select your level.';
  return errors;
}

function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

function validateTask(body) {
  const errors = {};
  if (!body.title || !body.title.trim()) errors.title = 'Please enter a task title.';
  if (body.title && body.title.length > 120) errors.title = 'Title is too long (max 120).';
  if (!CATEGORIES.includes(body.category)) errors.category = 'Select a valid category.';
  if (body.importance === undefined || ![0, 1, true, false].includes(body.importance))
    errors.importance = 'Select importance.';
  if (body.urgency === undefined || ![0, 1, true, false].includes(body.urgency))
    errors.urgency = 'Select urgency.';
  if (!body.dueDate || !isValidDate(body.dueDate)) errors.dueDate = 'Please select a valid deadline.';
  if (body.dueTime && !isValidTime(body.dueTime)) errors.dueTime = 'Select a valid time.';
  if (body.reminderMinutes !== undefined && !REMINDER_OPTIONS.includes(Number(body.reminderMinutes)))
    errors.reminderMinutes = 'Select a valid reminder.';
  if (body.estimatedDuration !== undefined) {
    const n = Number(body.estimatedDuration);
    if (!Number.isFinite(n) || n < 5 || n > 1440) errors.estimatedDuration = 'Duration must be 5–1440 minutes.';
  }
  return errors;
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask,
  CATEGORIES,
  REMINDER_OPTIONS,
};
