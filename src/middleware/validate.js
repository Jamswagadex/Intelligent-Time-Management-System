/**
 * Generic request-body validation middleware factory.
 * Wraps a validator function (body) => errorsObject, used by the
 * validators in src/utils/validators.js. Returns 400 with a field-keyed
 * errors object when validation fails, otherwise calls next().
 *
 * Usage:
 *   const { validateTask } = require('../utils/validators');
 *   router.post('/', validate(validateTask), controller.create);
 */
function validate(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors && Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }
    next();
  };
}

module.exports = { validate };
