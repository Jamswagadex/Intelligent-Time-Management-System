const { getDb } = require('../config/database');

function create({ userId, taskId, title, body, type, scheduledAt }) {
  const info = getDb().prepare(`
    INSERT INTO notifications (user_id, task_id, title, body, type, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, taskId || null, title, body, type, scheduledAt);
  return info.lastInsertRowid;
}

function deleteByTask(taskId) {
  getDb().prepare('DELETE FROM notifications WHERE task_id=? AND is_sent=0').run(taskId);
}

function dueToSend(nowISO) {
  return getDb().prepare(`
    SELECT * FROM notifications
    WHERE is_sent=0 AND scheduled_at <= ?
    ORDER BY scheduled_at ASC
  `).all(nowISO);
}

function markSent(id) {
  getDb().prepare('UPDATE notifications SET is_sent=1, sent_at=? WHERE id=?')
    .run(new Date().toISOString(), id);
}

function listForUser(userId, limit = 50) {
  return getDb().prepare(`
    SELECT * FROM notifications WHERE user_id=? ORDER BY scheduled_at DESC LIMIT ?
  `).all(userId, limit);
}

module.exports = { create, deleteByTask, dueToSend, markSent, listForUser };
