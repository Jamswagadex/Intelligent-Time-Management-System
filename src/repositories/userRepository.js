const { getDb } = require('../config/database');

function findByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}
function findById(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
}
function create(user) {
  const now = new Date().toISOString();
  const info = getDb().prepare(`
    INSERT INTO users (full_name, email, password_hash, department, level, created_at)
    VALUES (@fullName, @email, @passwordHash, @department, @level, @createdAt)
  `).run({ ...user, createdAt: now });
  return findById(info.lastInsertRowid);
}
function updateProfile(id, { fullName, department, level }) {
  getDb().prepare(`
    UPDATE users SET full_name=?, department=?, level=? WHERE id=?
  `).run(fullName, department, level, id);
  return findById(id);
}
function updatePassword(id, passwordHash) {
  getDb().prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash, id);
}
function updatePreferences(id, { theme, notificationsEnabled, defaultReminder }) {
  getDb().prepare(`
    UPDATE users
    SET theme = COALESCE(?, theme),
        notifications_enabled = COALESCE(?, notifications_enabled),
        default_reminder = COALESCE(?, default_reminder)
    WHERE id = ?
  `).run(theme ?? null, notificationsEnabled ?? null, defaultReminder ?? null, id);
  return findById(id);
}
module.exports = { findByEmail, findById, create, updateProfile, updatePassword, updatePreferences };
