// backend/src/middleware/validationMiddleware.js
export default (schemas) => {
  

  // Ensure schemas is always an array
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

  return (req, res, next) => {
    const payload = req.body;
    let lastError = null;

    for (const schema of schemaArray) {
      if (!schema || typeof schema.validate !== "function") {
        return res
          .status(500)
          .json({ error: "Invalid schema provided to validation middleware" });
      }

      const { error, value } = schema.validate(payload, { abortEarly: false });

      if (!error) {
        req.validatedBody = value;
        return next();
      }

      lastError = error;
    }

    // Return validation errors
    return res.status(400).json({
      error: "Validation failed",
      details: lastError.details.map((d) => d.message),
    });
  };
};
