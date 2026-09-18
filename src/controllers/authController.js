const authService = require('../services/authService');
const { validateRegistration, validateLogin } = require('../utils/validators');

exports.register = (req, res, next) => {
  const errors = validateRegistration(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });
  try { res.status(201).json(authService.register(req.body)); }
  catch (e) { next(e); }
};

exports.login = (req, res, next) => {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });
  try { res.json(authService.login(req.body.email, req.body.password)); }
  catch (e) { next(e); }
};

exports.me = (req, res, next) => {
  try {
    const userRepo = require('../repositories/userRepository');
    const u = userRepo.findById(req.userId);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ user: authService.publicUser(u) });
  } catch (e) { next(e); }
};

exports.forgotPassword = (req, res, next) => {
  try {
    const user = authService.resetPassword(req.body.email, req.body.newPassword);
    res.json({ message: 'Password reset successfully. You can now log in.', user });
  } catch (e) { next(e); }
};
