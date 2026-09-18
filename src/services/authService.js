const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const EXPIRES = process.env.JWT_EXPIRES || '7d';

function hashPassword(pw) { return bcrypt.hashSync(pw, 10); }
function verifyPassword(pw, hash) { return bcrypt.compareSync(pw, hash); }

function register(data) {
  if (userRepo.findByEmail(data.email)) {
    const err = new Error('An account with this email already exists.');
    err.status = 409; err.field = 'email'; throw err;
  }
  const user = userRepo.create({
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: hashPassword(data.password),
    department: data.department,
    level: data.level,
  });
  return { user: publicUser(user), token: issueToken(user) };
}

function login(email, password) {
  const user = userRepo.findByEmail(String(email || '').toLowerCase().trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    const err = new Error('Invalid email or password.');
    err.status = 401; throw err;
  }
  return { user: publicUser(user), token: issueToken(user) };
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: EXPIRES });
}

function verifyToken(token) {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
}

function changePassword(userId, oldPw, newPw) {
  const user = userRepo.findById(userId);
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }
  if (!verifyPassword(oldPw, user.password_hash)) {
    const e = new Error('Current password is incorrect.'); e.status = 400; e.field = 'oldPassword'; throw e;
  }
  if (!newPw || newPw.length < 6) {
    const e = new Error('New password must be at least 6 characters.'); e.status = 400; e.field = 'newPassword'; throw e;
  }
  userRepo.updatePassword(userId, hashPassword(newPw));
}

function resetPassword(email, newPassword) {
  const user = userRepo.findByEmail(String(email || '').toLowerCase().trim());
  if (!user) { const e = new Error('No account found with that email.'); e.status = 404; throw e; }
  if (!newPassword || newPassword.length < 6) {
    const e = new Error('Password must be at least 6 characters.'); e.status = 400; throw e;
  }
  userRepo.updatePassword(user.id, hashPassword(newPassword));
  return publicUser(user);
}

function publicUser(u) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    department: u.department,
    level: u.level,
    theme: u.theme,
    notificationsEnabled: !!u.notifications_enabled,
    defaultReminder: u.default_reminder,
    createdAt: u.created_at,
  };
}

module.exports = { register, login, verifyToken, changePassword, resetPassword, publicUser };
