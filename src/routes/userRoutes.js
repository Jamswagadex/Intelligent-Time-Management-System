const express = require('express');
const c = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);
router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.put('/password', c.changePassword);
router.put('/preferences', c.updatePreferences);

router.get('/notifications', (req, res) => {
  const notifRepo = require('../repositories/notificationRepository');
  res.json({ notifications: notifRepo.listForUser(req.userId) });
});

module.exports = router;
