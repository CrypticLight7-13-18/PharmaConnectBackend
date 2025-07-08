import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { restrictTo } from "../middlewares/restrict.middleware.js";

const router = express.Router();

router.post("/", orderController.createOrder);
router.get("/user/:userId", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/cancel", orderController.cancelOrder);

router.use(restrictTo("admin"));

router.get("/", orderController.getAllOrders);
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
