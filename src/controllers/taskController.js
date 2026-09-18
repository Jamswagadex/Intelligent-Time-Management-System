const taskService = require('../services/taskService');
const { recommendNext } = require('../services/priorityEngine');
const { validateTask } = require('../utils/validators');

exports.list = (req, res, next) => {
  try {
    const tasks = taskService.listTasks(req.userId);
    res.json({ tasks });
  } catch (e) { next(e); }
};

exports.get = (req, res, next) => {
  try {
    const t = taskService.getTask(req.userId, Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task: t });
  } catch (e) { next(e); }
};

exports.create = (req, res, next) => {
  const errors = validateTask(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });
  try {
    const t = taskService.createTask(req.userId, normalize(req.body));
    res.status(201).json({ task: t });
  } catch (e) { next(e); }
};

exports.update = (req, res, next) => {
  const errors = validateTask(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });
  try {
    const t = taskService.updateTask(req.userId, Number(req.params.id), normalize(req.body));
    if (!t) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task: t });
  } catch (e) { next(e); }
};

exports.remove = (req, res, next) => {
  try {
    const ok = taskService.deleteTask(req.userId, Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (e) { next(e); }
};

exports.setStatus = (req, res, next) => {
  try {
    const t = taskService.setStatus(req.userId, Number(req.params.id), req.body.status);
    if (!t) return res.status(400).json({ error: 'Invalid status.' });
    res.json({ task: t });
  } catch (e) { next(e); }
};

exports.recommend = (req, res, next) => {
  try {
    const tasks = taskService.listTasks(req.userId);
    const next_ = recommendNext(tasks);
    res.json({
      recommendation: next_ ? {
        id: next_.id,
        title: next_.title,
        priority: next_.priority,
        priorityScore: next_.priorityScore,
        reason: next_.priorityReason,
        dueDate: next_.dueDate,
        dueTime: next_.dueTime,
      } : null,
    });
  } catch (e) { next(e); }
};

function normalize(b) {
  return {
    title: String(b.title || '').trim(),
    description: b.description ? String(b.description).trim() : '',
    category: b.category,
    importance: b.importance === true || b.importance === 1 || b.importance === 'true' || b.importance === '1',
    urgency:    b.urgency    === true || b.urgency    === 1 || b.urgency    === 'true' || b.urgency    === '1',
    dueDate: b.dueDate,
    dueTime: b.dueTime || null,
    reminderMinutes: Number(b.reminderMinutes || 0),
    estimatedDuration: Number(b.estimatedDuration || 30),
  };
}
