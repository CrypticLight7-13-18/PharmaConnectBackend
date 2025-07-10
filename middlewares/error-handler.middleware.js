import AppError from "../utils/app-error.utils.js";

/**
 * Handles database CastError and returns a formatted AppError.
 * @param {Object} err - The error object.
 * @returns {AppError} - Formatted AppError instance.
 */
const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path} : ${err.value}`, 400);

/**
 * Handles duplicate field value errors and returns a formatted AppError.
 * @param {Object} err - The error object.
 * @returns {AppError} - Formatted AppError instance.
 */
const handleDuplicateNameFieldErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handles validation errors and returns a formatted AppError.
 * @param {Object} err - The error object.
 * @returns {AppError} - Formatted AppError instance.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT errors and returns a formatted AppError.
 * @returns {AppError} - Formatted AppError instance.
 */
const handleJWTError = () =>
  new AppError("Invalid token, please login again", 401);

/**
 * Handles expired token errors and returns a formatted AppError.
 * @returns {AppError} - Formatted AppError instance.
 */
const handleTokenExpiredError = () =>
  new AppError("Your session is expired. Please login again.", 401);

const buildErrorPayload = (err, includeStack = false) => {
  const payload = {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
  };
  if (includeStack) payload.stack = err.stack;
  return payload;
};

const sendError = (err, req, res) => {
  // If API request, respond with JSON
  if (req.originalUrl.startsWith("/api")) {
    const isDev =
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

    // Determine if error is operational; unknown errors shouldn't expose details in prod
    const payload = buildErrorPayload(err, isDev);
    if (!err.isOperational && !isDev) {
      payload.message = "Something went wrong!";
    }
    // console.log(err)
    return res.status(err.statusCode).json({ success: false, error: payload });
  }

  // Non-API route: render error page (unchanged behaviour)
  res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

/**
 * Global error handling middleware.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Internal Server Error";

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateNameFieldErrorDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendError(error, req, res);
  } else {
    // development or test
    sendError(err, req, res);
  }

  next();
};
