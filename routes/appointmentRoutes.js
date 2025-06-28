import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  getAppointments,
  createAppointment,
  addConsultationReport,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.use(protect);

// Get appointments for current user (doctor or patient)
router.get("/", getAppointments);

// Patients can create bookings
router.post("/", restrictTo("patient"), createAppointment);

// Doctor adds report to appointment
router.put("/:id/report", restrictTo("doctor"), addConsultationReport);

export default router;
