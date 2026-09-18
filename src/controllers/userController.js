const userRepo = require('../repositories/userRepository');
const authService = require('../services/authService');

exports.getProfile = (req, res, next) => {
  try {
    const u = userRepo.findById(req.userId);
    res.json({ user: authService.publicUser(u) });
  } catch (e) { next(e); }
};

exports.updateProfile = (req, res, next) => {
  try {
    const { fullName, department, level } = req.body;
    const errors = {};
    if (!fullName || fullName.trim().length < 3) errors.fullName = 'Enter your full name (min 3).';
    if (!department) errors.department = 'Select a department.';
    if (!level) errors.level = 'Select a level.';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });
    const u = userRepo.updateProfile(req.userId, { fullName: fullName.trim(), department, level });
    res.json({ user: authService.publicUser(u) });
  } catch (e) { next(e); }
};

exports.changePassword = (req, res, next) => {
  try {
    authService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
    res.json({ message: 'Password updated.' });
  } catch (e) { next(e); }
};

exports.updatePreferences = (req, res, next) => {
  try {
    const { theme, notificationsEnabled, defaultReminder } = req.body;
    const u = userRepo.updatePreferences(req.userId, {
      theme: theme === 'dark' || theme === 'light' ? theme : undefined,
      notificationsEnabled: typeof notificationsEnabled === 'boolean' ? (notificationsEnabled ? 1 : 0) : undefined,
      defaultReminder: Number.isFinite(Number(defaultReminder)) ? Number(defaultReminder) : undefined,
    });
    res.json({ user: authService.publicUser(u) });
  } catch (e) { next(e); }
};
