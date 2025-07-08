/**
 * Express router for payment-related routes.
 * Handles Stripe checkout session creation and payment success callbacks.
 *
 * Routes:
 * - POST /api/payment/create-checkout-session : Creates a Stripe checkout session for an order.
 * - GET  /api/payment/success/:sessionId       : Handles payment success callback from Stripe.
 *
 * @module routes/payment
 */

import express from "express";
import * as paymentController from "../controllers/payment.controller.js";

const router = express.Router();

/**
 * @route POST /api/payment/create-checkout-session
 * @desc Creates a Stripe checkout session for the provided order data.
 * @access Public (or authenticated depending on middleware usage)
 */
router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession
);

/**
 * @route GET /api/payment/success/:sessionId
 * @desc Handles the post-payment success callback from Stripe.
 * @access Public (or authenticated depending on middleware usage)
 */
router.get("/success/:sessionId", paymentController.handlePaymentSuccess);

export default router;
