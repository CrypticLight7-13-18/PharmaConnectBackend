/**
 * Express main API router for the application.
 * Aggregates and mounts all feature-specific routers and applies global middleware.
 *
 * Structure:
 * - Imports routers for users, payments, chats, appointments, doctors, medicines, and orders.
 * - Applies authentication middleware to all protected routes.
 * - Registers a global error handler at the end.
 *
 * Routes:
 * - /users         : User-related routes (registration, authentication, profile, etc.)
 * - /payment       : Payment and Stripe checkout routes
 * - /chat          : Chat-related routes (protected)
 * - /appointments  : Appointment management routes (protected)
 * - /doctors       : Doctor listing and profile routes (protected)
 * - /medicines     : Medicine catalog routes (protected)
 * - /orders        : Order management routes (protected)
 *
 * Middleware:
 * - protect        : Ensures authentication for all routes after its application
 * - errorHandler   : Handles errors globally for all routes
 *
 * @module routes/index
 */

import chatRouter from "./chat.routes.js";
import appointmentRouter from "./appointment.routes.js";
import doctorsRouter from "./doctor.routes.js";
import userRouter from "./user.routes.js";
import medicineRouter from "./medicine.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import protect from "../middlewares/protect.middleware.js";

import express from "express";
import errorHandler from "../middlewares/error-handler.middleware.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/payment", paymentRoutes);
router.use(protect);
router.use("/chat", chatRouter);
router.use("/appointments", appointmentRouter);
router.use("/doctors", doctorsRouter);
router.use("/medicines", medicineRouter);
router.use("/orders", orderRoutes);

router.use(errorHandler);

export default router;
