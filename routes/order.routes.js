/**
 * Express router for order-related routes.
 * Maps HTTP endpoints to order controller functions for creating, retrieving, updating, and cancelling orders.
 * Applies role-based access control for admin-only operations.
 *
 * Routes:
 * - POST   /api/orders/             : Create a new order (public/authenticated)
 * - GET    /api/orders/user/:userId : Get all orders for a specific user (public/authenticated)
 * - GET    /api/orders/:id          : Get a single order by ID (public/authenticated)
 * - PATCH  /api/orders/:id/cancel   : Cancel an order by ID (public/authenticated)
 * - GET    /api/orders/             : Get all orders (admin only)
 * - PATCH  /api/orders/:id/status   : Update order status by ID (admin only)
 *
 * Middleware:
 * - restrictTo("admin")             : Restricts GET all orders and status update routes to admin users only
 *
 * @module routes/order
 */

import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { restrictTo } from "../middlewares/restrict.middleware.js";

const router = express.Router();

/**
 * @route POST /api/orders/
 * @desc Creates a new order.
 * @access Public (authenticated)
 */
router.post("/", orderController.createOrder);

/**
 * @route GET /api/orders/user/:userId
 * @desc Retrieves all orders for a specific user.
 * @access Public (authenticated)
 */
router.get("/user/:userId", orderController.getUserOrders);

/**
 * @route GET /api/orders/:id
 * @desc Retrieves a single order by its ID.
 * @access Public (authenticated)
 */
router.get("/:id", orderController.getOrderById);

/**
 * @route PATCH /api/orders/:id/cancel
 * @desc Cancels an order by its ID.
 * @access Public (authenticated)
 */
router.patch("/:id/cancel", orderController.cancelOrder);

// Restrict the following routes to admin users only
router.use(restrictTo("admin"));

/**
 * @route GET /api/orders/
 * @desc Retrieves all orders in the system.
 * @access Private (admin only)
 */
router.get("/", orderController.getAllOrders);

/**
 * @route PATCH /api/orders/:id/status
 * @desc Updates the status of an order by its ID.
 * @access Private (admin only)
 */
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
