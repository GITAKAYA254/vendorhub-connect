import { errorResponse } from "../utils/response.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json(errorResponse("Resource not found"));
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json(errorResponse(message));
};
