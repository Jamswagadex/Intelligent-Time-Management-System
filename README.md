# Intelligent Time Management System

A full-stack Node.js web application implementing an intelligent task/time
management system for students, built for The Polytechnic Ibadan final-year
project. It runs entirely in the browser (Chrome) via Express + SQLite, and
can later be wrapped as an Android app with Capacitor.

## Features

- Email/password authentication (bcrypt + JWT)
- Task CRUD with categories, due dates/times, reminders, and estimated duration
- Automatic **Eisenhower Matrix** quadrant classification (importance × urgency)
- **Rule-based intelligent priority engine** with human-readable explanations
- Dashboard with "Do this next" recommendation, today's tasks, urgent tasks, and upcoming deadlines
- Full task list with search and filter chips (status, quadrant, priority, category)
- Calendar month view with day-level task browsing
- Productivity statistics (completion %, weekly/monthly charts, quadrant distribution)
- Profile management, password change, notification preferences, dark/light theme
- Browser notifications (Web Notifications API + Service Worker) with a polling-based reminder/overdue scheduler (node-cron)

## Quick Start

```bash
cd intelligent-time-management
cp .env.example .env
# edit .env and set a strong JWT_SECRET
npm install
npm start
```

Open `http://localhost:3000` in Chrome.

## Testing

```bash
npm test
```

Runs the built-in Node test suite (`node:test`) covering the Eisenhower
classifier, the priority engine, authentication, and task service logic.
Each suite uses its own isolated SQLite database file.

## Project Structure

See `src/` for the Express backend (config, models, repositories, services,
controllers, middleware, routes, scheduler, utils) and `public/` for the
vanilla-JS single-page frontend (hash router, screens, CSS design tokens).

## Architecture

Layered MVC + Repository pattern:

```
Routes -> Controllers -> Services -> Repositories -> SQLite
```

- `priorityEngine` and `eisenhower` are pure, unit-tested functions.
- `taskService` orchestrates repository access, priority computation, and
  reminder scheduling.
- `requireAuth` middleware decodes the JWT and injects `req.userId` into
  every protected route.

## Porting to Android

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "ITMS" "ng.edu.polyibadan.itms" --web-dir=public
npx cap add android
npx cap sync
```

Then open the generated `android/` project in Android Studio to build an APK.

## License

Final-year academic project — The Polytechnic Ibadan.
