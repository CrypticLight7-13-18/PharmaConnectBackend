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

router.use(errorHandler)

export default router;
