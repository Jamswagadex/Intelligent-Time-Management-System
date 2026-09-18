const { getDb } = require('../config/database');

function rowToTask(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    category: r.category,
    importance: !!r.importance,
    urgency: !!r.urgency,
    quadrant: r.quadrant,
    priority: r.priority,
    priorityScore: r.priority_score,
    priorityReason: r.priority_reason,
    dueDate: r.due_date,
    dueTime: r.due_time,
    reminderMinutes: r.reminder_minutes,
    estimatedDuration: r.estimated_duration,
    status: r.status,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  };
}

function create(data) {
  const now = new Date().toISOString();
  const info = getDb().prepare(`
    INSERT INTO tasks (
      user_id, title, description, category, importance, urgency, quadrant,
      priority, priority_score, priority_reason, due_date, due_time,
      reminder_minutes, estimated_duration, status, created_at
    ) VALUES (
      @user_id, @title, @description, @category, @importance, @urgency, @quadrant,
      @priority, @priority_score, @priority_reason, @due_date, @due_time,
      @reminder_minutes, @estimated_duration, 'PENDING', @created_at
    )
  `).run({
    user_id: data.userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    importance: data.importance ? 1 : 0,
    urgency: data.urgency ? 1 : 0,
    quadrant: data.quadrant,
    priority: data.priority,
    priority_score: data.priorityScore,
    priority_reason: data.priorityReason,
    due_date: data.dueDate,
    due_time: data.dueTime || null,
    reminder_minutes: data.reminderMinutes || 0,
    estimated_duration: data.estimatedDuration || 30,
    created_at: now,
  });
  return findById(info.lastInsertRowid, data.userId);
}

function findById(id, userId) {
  const r = getDb().prepare('SELECT * FROM tasks WHERE id=? AND user_id=?').get(id, userId);
  return rowToTask(r);
}

function listAll(userId) {
  return getDb().prepare('SELECT * FROM tasks WHERE user_id=? ORDER BY due_date ASC, due_time ASC')
    .all(userId).map(rowToTask);
}

function update(id, userId, data) {
  getDb().prepare(`
    UPDATE tasks SET
      title=@title, description=@description, category=@category,
      importance=@importance, urgency=@urgency, quadrant=@quadrant,
      priority=@priority, priority_score=@priority_score, priority_reason=@priority_reason,
      due_date=@due_date, due_time=@due_time, reminder_minutes=@reminder_minutes,
      estimated_duration=@estimated_duration
    WHERE id=@id AND user_id=@user_id
  `).run({
    id, user_id: userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    importance: data.importance ? 1 : 0,
    urgency: data.urgency ? 1 : 0,
    quadrant: data.quadrant,
    priority: data.priority,
    priority_score: data.priorityScore,
    priority_reason: data.priorityReason,
    due_date: data.dueDate,
    due_time: data.dueTime || null,
    reminder_minutes: data.reminderMinutes || 0,
    estimated_duration: data.estimatedDuration || 30,
  });
  return findById(id, userId);
}

function remove(id, userId) {
  return getDb().prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(id, userId).changes;
}

function setStatus(id, userId, status) {
  const completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
  getDb().prepare('UPDATE tasks SET status=?, completed_at=? WHERE id=? AND user_id=?')
    .run(status, completedAt, id, userId);
  return findById(id, userId);
}

module.exports = { create, findById, listAll, update, remove, setStatus };
