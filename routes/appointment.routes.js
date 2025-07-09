/**
 * Express router for appointment-related routes.
 * Maps HTTP endpoints to controller functions with appropriate access restrictions.
 *
 * Routes:
 * - POST   /api/appointments/         : Create a new appointment (patients only)
 * - DELETE /api/appointments/:id      : Delete an appointment by ID (patients only)
 * - PATCH  /api/appointments/:id      : Update an appointment by ID (patients only)
 * - GET    /api/appointments/         : Get all appointments for the authenticated user (patient or doctor)
 * - PATCH  /api/appointments/:id/report : Update appointment report/status (doctors only)
 *
 * @module routes/appointment
 */

import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { restrictTo } from "../middlewares/restrict.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validations/appointment.validation.js";
import { Roles } from "../constants/enums.js";

const router = express.Router();

/**
 * @route POST /api/appointments/
 * @desc Creates an appointment.
 * @access Private (patients only)
 */
router.post(
  "/",
  restrictTo(Roles.PATIENT),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

/**
 * @route DELETE /api/appointments/:id
 * @desc Deletes an appointment by given ID.
 * @access Private (patients only)
 */
router.delete(
  "/:id",
  restrictTo(Roles.PATIENT),
  appointmentController.deleteAppointment
);

/**
 * @route PATCH /api/appointments/:id
 * @desc Updates an appointment by given ID.
 * @access Private (patients only)
 */
router.patch(
  "/:id",
  restrictTo(Roles.PATIENT),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

/**
 * @route GET /api/appointments/
 * @desc Gets all appointments of the authenticated user (patient or doctor).
 * @access Private
 */
router.get("/", appointmentController.getAllAppointments);

/**
 * @route PATCH /api/appointments/:id/report
 * @desc Updates appointment status and uploads a report (doctors only).
 * @access Private (doctors only)
 */
router.patch(
  "/:id/report",
  restrictTo(Roles.DOCTOR),
  appointmentController.updateAppointmentReport
);

export default router;
