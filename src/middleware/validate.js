const ApiError = require("../utils/ApiError");

/**
 * Zod validation middleware
 * @param {ZodSchema} schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Attach validated values (optional but best practice)
      req.validated = parsed;

      next();
    } catch (err) {
      if (err.errors) {
        // Zod validation error
        const message = err.errors.map((e) => e.message).join(", ");
        return next(new ApiError(400, message, err.errors));
      }

      next(err);
    }
  };
};

module.exports = validate;
