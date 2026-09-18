const cron = require('node-cron');
const notifRepo = require('../repositories/notificationRepository');
const taskRepo = require('../repositories/taskRepository');
const { daysUntil } = require('../utils/dateUtils');

/**
 * Runs every minute. Two jobs:
 *   1. Send any scheduled REMINDER notifications whose time has arrived.
 *   2. Detect newly overdue tasks and queue an OVERDUE notification (once).
 */
function startScheduler() {
  cron.schedule('* * * * *', () => {
    try {
      // 1. Reminders due
      const pending = notifRepo.dueToSend(new Date().toISOString());
      pending.forEach(n => {
        // In a web app the server can't push to a closed browser tab without
        // Web Push (VAPID). We deliver via the client polling /api/notifications/due.
        // Here we simply mark as sent so the client picks them up once.
        notifRepo.markSent(n.id);
        console.log(`  [reminder] user=${n.user_id} :: ${n.body}`);
      });

      // 2. Overdue detection
      const users = require('../config/database').getDb()
        .prepare('SELECT DISTINCT user_id FROM tasks WHERE status="PENDING"').all();
      users.forEach(({ user_id }) => {
        const tasks = taskRepo.listAll(user_id);
        tasks.forEach(t => {
          if (t.status !== 'PENDING') return;
          const d = daysUntil(t.dueDate, t.dueTime);
          if (d < 0) {
            const existing = require('../config/database').getDb().prepare(`
              SELECT id FROM notifications
              WHERE task_id=? AND type='OVERDUE'
            `).get(t.id);
            if (!existing) {
              notifRepo.create({
                userId: user_id,
                taskId: t.id,
                title: 'Task Overdue',
                body: `${t.title} is overdue.`,
                type: 'OVERDUE',
                scheduledAt: new Date().toISOString(),
              });
              notifRepo.markSent(require('../config/database').getDb()
                .prepare('SELECT last_insert_rowid() id').get().id);
            }
          }
        });
      });
    } catch (e) {
      console.error('Scheduler error:', e.message);
    }
  });
  console.log('  Scheduler started (reminders & overdue detection).');
}

module.exports = { startScheduler };
