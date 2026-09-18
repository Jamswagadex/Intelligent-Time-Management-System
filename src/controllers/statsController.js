const { computeStats } = require('../services/statsService');
exports.getStats = (req, res, next) => {
  try { res.json({ stats: computeStats(req.userId) }); }
  catch (e) { next(e); }
};
