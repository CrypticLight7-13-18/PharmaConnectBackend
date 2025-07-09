import Order from "../models/order.model.js";
import Medicine from "../models/medicine.model.js";
import AppError from "../utils/app-error.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import { OrderStatus } from "../constants/enums.js";

/**
 * Creates a new order for the authenticated user.
 * Validates each item in the cart, calculates the total price, and saves the order with shipping details.
 * @param {Object} req - The request object containing user info and order details (cart, address, deliveryDate).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If any medicine in the cart is not found.
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  const customerId = req.user._id;
  const { cart, address, deliveryDate } = req.body;

  let totalPrice = 0;
  const validatedItems = [];

  for (const item of cart) {
    const medicine = await Medicine.findById(item.id);

    if (!medicine) {
      return next(new AppError(`Medicine with ID ${item.id} not found`, 404));
    }

    totalPrice += medicine.price * item.qty;
    validatedItems.push({
      medicineId: medicine._id,
      quantity: item.qty,
      unitPrice: medicine.price,
    });
  }

  const order = new Order({
    customerId,
    orderItems: validatedItems,
    totalPrice,
    shippingAddress: address,
    deliveryDate:
      deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const savedOrder = await order.save();

  await savedOrder.populate("orderItems.medicineId", "name price");

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: savedOrder,
  });
});

/**
 * Retrieves a specific order by its ID, including customer and medicine details.
 * @param {Object} req - The request object containing the order ID in params.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the order is not found.
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("customerId", "name email")
    .populate("orderItems.medicineId", "name price image");

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * Retrieves all orders for a specific user, with optional pagination and status filtering.
 * @param {Object} req - The request object containing user ID in params and query parameters for pagination/status.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  let filter = { customerId: userId };
  if (status) {
    filter.orderStatus = status;
  }

  const orders = await Order.find(filter)
    .populate("orderItems.medicineId", "name price image")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Retrieves all orders in the system, with optional pagination and status filtering.
 * @param {Object} req - The request object containing query parameters for pagination and status.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  let filter = {};
  if (status) {
    filter.orderStatus = status;
  }

  const orders = await Order.find(filter)
    .populate("customerId", "name email")
    .populate("orderItems.medicineId", "name price")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Updates the status of an order (e.g., pending, delivered, cancelled).
 * @param {Object} req - The request object containing the order ID in params and new status in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the order is not found or status is invalid.
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = Object.values(OrderStatus);

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status },
    { new: true }
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

/**
 * Cancels an order if it is not already delivered or cancelled.
 * @param {Object} req - The request object containing the order ID in params.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the order is not found, already delivered, or already cancelled.
 */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.orderStatus === OrderStatus.DELIVERED) {
    return next(new AppError("Cannot cancel delivered order", 400));
  }

  if (order.orderStatus === OrderStatus.CANCELLED) {
    return next(new AppError("Order Already cancelled", 400));
  }

  order.orderStatus = OrderStatus.CANCELLED;
  await order.save();

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});
