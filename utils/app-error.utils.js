/**
 * Custom error class for handling application-specific errors.
 * Extends the built-in Error class to include HTTP status code and operational error flag.
 *
 * @class AppError
 * @extends Error
 *
 * @param {string} message - The error message describing the problem.
 * @param {number} statusCode - The HTTP status code representing the error.
 *
 * @property {number} statusCode - The HTTP status code for the error.
 * @property {string} status - "fail" for 4xx errors, "error" for 5xx errors.
 * @property {boolean} isOperational - Indicates if the error is operational (trusted).
 *
 * @example
 * throw new AppError("Resource not found", 404);
 */
export default class AppError extends Error {
  /**
   * Creates an instance of AppError.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code representing the error.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Captures the stack trace for debugging, excluding this constructor.
    Error.captureStackTrace(this, this.constructor);
  }
}
