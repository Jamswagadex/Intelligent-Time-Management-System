function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  console.error(`[${status}] ${err.message}`);
  res.status(status).json({
    error: err.message || 'Internal server error',
    field: err.field,
    errors: err.errors,
  });
}
module.exports = { errorHandler };
