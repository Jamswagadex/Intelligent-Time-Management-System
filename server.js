require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initDatabase } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');
const { startScheduler } = require('./src/scheduler/reminderScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security & parsing middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate limit only auth endpoints
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 60 }));

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

// --- Health check ---
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, 'public')));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Error handler (must be last) ---
app.use(errorHandler);

// --- Boot ---
initDatabase();
startScheduler();
app.listen(PORT, () => {
  console.log(`\n  Intelligent Time Management System`);
  console.log(`  Running at: http://localhost:${PORT}\n`);
});
