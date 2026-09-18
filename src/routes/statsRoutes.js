const express = require('express');
const { getStats } = require('../controllers/statsController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.get('/', requireAuth, getStats);
module.exports = router;
