/**
 * Express router for user authentication and profile management routes.
 * Maps HTTP endpoints to authentication and user controller functions for login, signup, logout, and profile operations.
 * Applies authentication middleware to protect profile-related routes.
 *
 * Routes:
 * - POST   /api/users/login     : Log in a user
 * - POST   /api/users/signup    : Register a new user
 * - GET    /api/users/logout    : Log out a user
 * - GET    /api/users/me        : Get current user's basic profile data (protected)
 * - GET    /api/users/profile   : Get current user's complete profile data with populated references (protected)
 * - PATCH  /api/users/updateMe  : Update the current user's profile (protected)
 *
 * Middleware:
 * - protect                    : Ensures authentication for all routes after its application
 *
 * @module routes/user
 */

import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as userController from "../controllers/user.controller.js";
import { loginSchema, signUpSchema } from "../validations/auth.validation.js";
import { validate } from "../middlewares/validate.middleware.js";
import protect from "../middlewares/protect.middleware.js";

const router = express.Router();

/**
 * @route POST /api/users/login
 * @desc Log in a user.
 * @access Public
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route POST /api/users/signup
 * @desc Register a new user.
 * @access Public
 */
router.post("/signup", validate(signUpSchema), authController.signUp);

/**
 * @route GET /api/users/logout
 * @desc Log out a user.
 * @access Private
 */
router.get("/logout", authController.logout);

// Middleware to protect all routes below
router.use(protect);

/**
 * @route GET /api/users/me
 * @desc Get current user's basic profile data.
 * @access Private
 */
router.get("/me", userController.getMe);

/**
 * @route GET /api/users/profile
 * @desc Get current user's complete profile data with populated references.
 * @access Private
 */
router.get("/profile", userController.getUserProfileData);

/**
 * @route PATCH /api/users/updateMe
 * @desc Update the current user's profile.
 * @access Private
 */
router.patch("/updateMe", userController.updateMe);

export default router;
