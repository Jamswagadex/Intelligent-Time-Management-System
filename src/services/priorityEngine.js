const { classify } = require('./eisenhower');
const { daysUntil } = require('../utils/dateUtils');

/**
 * Rule-Based Intelligent Task Prioritization.
 *
 * Score components (0..100):
 *   quadrant base  : Q1=50, Q2=35, Q3=20, Q4=5
 *   deadline       : overdue=30, today=25, <=2d=20, <=7d=12, <=14d=6, else=2
 *   overdue bonus  : +15
 *   duration       : <=30min=+5, >=180min=-3, else 0
 *
 * Score→label: >=80 CRITICAL, >=60 HIGH, >=40 MEDIUM, else LOW.
 */
function computePriority({ importance, urgency, dueDate, dueTime, estimatedDuration = 30, status = 'PENDING' }) {
  const reasons = [];
  const { quadrant, action, label } = classify(Number(importance), Number(urgency));

  const quadBase = { 1: 50, 2: 35, 3: 20, 4: 5 }[quadrant];

  if (quadrant === 1) reasons.push(`Important and urgent (${action}).`);
  else if (quadrant === 2) reasons.push(`Important but not urgent (${action}).`);
  else if (quadrant === 3) reasons.push(`Urgent but not important (${action}).`);
  else reasons.push(`Not urgent and not important (${action}).`);

  const d = daysUntil(dueDate, dueTime);
  let deadlineScore = 2;
  let isOverdue = false;

  if (status === 'COMPLETED') {
    deadlineScore = 0;
    reasons.length = 0;
    reasons.push('Task completed.');
  } else if (d < 0) {
    deadlineScore = 30; isOverdue = true;
    reasons.push(`Overdue by ${Math.abs(d)} day(s).`);
  } else if (d === 0) {
    deadlineScore = 25;
    reasons.push('Due today.');
  } else if (d <= 2) {
    deadlineScore = 20;
    reasons.push(`Due in ${d} day(s).`);
  } else if (d <= 7) {
    deadlineScore = 12;
    reasons.push(`Due this week (${d} days).`);
  } else if (d <= 14) {
    deadlineScore = 6;
    reasons.push(`Due in ${d} days.`);
  } else {
    deadlineScore = 2;
    reasons.push(`Due in ${d} days.`);
  }

  let durationScore = 0;
  if (estimatedDuration <= 30) { durationScore = 5; reasons.push('Quick task (≤30 min).'); }
  else if (estimatedDuration >= 180) { durationScore = -3; reasons.push('Long task (≥3 h) — plan a block.'); }

  const overdueBonus = isOverdue ? 15 : 0;

  let score = quadBase + deadlineScore + overdueBonus + durationScore;
  score = Math.max(0, Math.min(100, score));

  let priority;
  if (status === 'COMPLETED') priority = 'LOW';
  else if (score >= 80) priority = 'CRITICAL';
  else if (score >= 60) priority = 'HIGH';
  else if (score >= 40) priority = 'MEDIUM';
  else priority = 'LOW';

  return {
    quadrant,
    quadrantLabel: label,
    quadrantAction: action,
    priority,
    priorityScore: score,
    priorityReason: reasons.join(' '),
  };
}

/**
 * Returns the single most important pending task.
 * Tiebreak: earliest due date.
 */
function recommendNext(tasks) {
  const pending = tasks.filter(t => t.status === 'PENDING');
  if (!pending.length) return null;
  return pending.slice().sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    return (a.due_date + (a.due_time || '')).localeCompare(b.due_date + (b.due_time || ''));
  })[0];
}

module.exports = { computePriority, recommendNext };
