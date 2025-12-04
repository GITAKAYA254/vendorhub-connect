import { errorResponse } from "../utils/response.js";

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const result = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    req.body = result.body ?? req.body;
    req.params = result.params ?? req.params;
    req.query = result.query ?? req.query;
    next();
  } catch (err) {
    const message = err.errors?.[0]?.message || "Validation failed";
    res.status(400).json(errorResponse(message));
  }
};
