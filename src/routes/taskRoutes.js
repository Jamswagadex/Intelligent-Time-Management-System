const express = require('express');
const c = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

router.get('/', c.list);
router.get('/recommend', c.recommend);
router.post('/', c.create);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.patch('/:id/status', c.setStatus);

module.exports = router;
