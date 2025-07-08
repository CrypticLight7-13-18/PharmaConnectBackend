import express from "express";
import * as paymentController from "../controllers/payment.controller.js"

const router = express.Router();

router.post("/create-checkout-session", paymentController.createCheckoutSession);

router.get("/success/:sessionId", paymentController.handlePaymentSuccess);

export default router;
