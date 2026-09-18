CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  department    TEXT    NOT NULL,
  level         TEXT    NOT NULL,
  theme         TEXT    NOT NULL DEFAULT 'light',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  default_reminder      INTEGER NOT NULL DEFAULT 30,
  created_at    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL,
  title              TEXT    NOT NULL,
  description        TEXT,
  category           TEXT    NOT NULL,
  importance         INTEGER NOT NULL,
  urgency            INTEGER NOT NULL,
  quadrant           INTEGER NOT NULL,
  priority           TEXT    NOT NULL,
  priority_score     INTEGER NOT NULL,
  priority_reason    TEXT    NOT NULL,
  due_date           TEXT    NOT NULL,
  due_time           TEXT,
  reminder_minutes   INTEGER NOT NULL DEFAULT 0,
  estimated_duration INTEGER NOT NULL DEFAULT 30,
  status             TEXT    NOT NULL DEFAULT 'PENDING',
  created_at         TEXT    NOT NULL,
  completed_at       TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tasks_user   ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due    ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE TABLE IF NOT EXISTS notifications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  task_id      INTEGER,
  title        TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  type         TEXT    NOT NULL,
  scheduled_at TEXT    NOT NULL,
  sent_at      TEXT,
  is_sent      INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notif_pending ON notifications(is_sent, scheduled_at);
