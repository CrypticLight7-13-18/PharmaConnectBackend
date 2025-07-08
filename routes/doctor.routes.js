/**
 * Express router for doctor-related routes.
 * Maps HTTP endpoints to doctor controller functions for listing doctors, retrieving a single doctor, and checking availability.
 *
 * Routes:
 * - GET /api/doctors                  : Get all doctors with optional filtering and pagination
 * - GET /api/doctors/:id              : Get a single doctor by ID
 * - GET /api/doctors/:id/availability : Get doctor's availability for a specific date
 *
 * @module routes/doctor
 */

import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors with optional filtering and pagination.
 * @access  Public
 */
router.get("/", doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get a single doctor by ID.
 * @access  Public
 */
router.get("/:id", doctorController.getDoctor);

/**
 * @route   GET /api/doctors/:id/availability
 * @desc    Get doctor's availability for a specific date.
 * @access  Public
 */
router.get("/:id/availability", doctorController.getDoctorAvailability);

export default router;
