import jwt from "jsonwebtoken";
import ms from "ms";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import AppError from "../utils/app-error.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import { Roles } from "../constants/enums.js";

/**
 * Creates a JWT token for a given user ID.
 * @param {string} id - The user ID to include in the token payload.
 * @returns {string} - The signed JWT token.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRY_TIME,
  });
};

/**
 * Creates and sends a JWT token as a cookie and user data in the response.
 * @param {Object} user - The user object to send in the response.
 * @param {number} statusCode - The HTTP status code for the response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const expiresInMS = ms(process.env.JWT_COOKIE_EXPIRY_TIME) * 1000;
  const cookieOptions = {
    expires: new Date(Date.now() + expiresInMS),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

/**
 * Logs in a user by verifying their email and password, then creates and sends a JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - Throws an error if email or password is missing, or if authentication fails.
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new AppError("Please enter email and password", 400));
  }

  let model;

  if (role === Roles.PATIENT) model = Patient;
  else if (role === Roles.DOCTOR) model = Doctor;
  else return next(new AppError("Invalid role specified", 400));

  const user = await model.findOne({ email }).select("+password");

  if (!user || !(await user.passwordVerification(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  createSendToken(user, 200, req, res);
});

/**
 * Signs up a new user and sends a JWT token as a response.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const signUp = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  let model;
  if (role === Roles.PATIENT) model = Patient;
  else if (role === Roles.DOCTOR) model = Doctor;
  else return next(new AppError("Invalid role specified", 400));

  const newUser = await model.create(req.body);
  createSendToken(newUser, 201, req, res);
});

/**
 * Logs out a user by clearing the JWT token cookie.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ status: "success" });
};
