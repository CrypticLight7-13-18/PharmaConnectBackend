import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from "../controllers/orderController.js";
import { restrictTo } from "../controllers/authController.js";
//import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
//router.use(authenticateToken);

// Customer routes
router.post("/", createOrder);
router.get("/user/:userId", getUserOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

// Admin routes (doctor)
router.get("/", restrictTo("doctor"), getAllOrders);
router.patch("/:id/status", restrictTo("doctor"), updateOrderStatus);

export default router;
