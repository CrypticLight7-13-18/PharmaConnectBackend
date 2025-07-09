import mongoose from "mongoose";
import { OrderStatus, PaymentStatus } from "../constants/enums.js";

/**
 * Mongoose schema for OrderItem subdocuments.
 * Represents an individual item in an order, referencing a Medicine and including quantity and unit price.
 *
 * @typedef {Object} OrderItem
 * @property {mongoose.ObjectId} medicineId - Reference to the Medicine model.
 * @property {number} quantity - Quantity of the medicine ordered.
 * @property {number} unitPrice - Unit price of the medicine at the time of order.
 */
const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: [true, "Please provide a medicine ID!"],
  },
  quantity: {
    type: Number,
    required: [true, "Please provide a quantity!"],
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: [true, "Please provide a unit price!"],
    min: [0, "Unit price cannot be negative"],
  },
});

/**
 * Mongoose schema for Order documents.
 * Represents an order placed by a customer, containing order items, total price, status, delivery info, and payment details.
 *
 * Fields:
 * - customerId: Reference to the Patient/Customer (required)
 * - orderItems: Array of OrderItem subdocuments (required)
 * - totalPrice: Total price of the order (required, non-negative)
 * - orderStatus: Status of the order ('pending', 'delivered', 'cancelled'; default: 'pending')
 * - paymentStatus: Payment status ('paid' or 'pending')
 * - deliveryDate: Expected delivery date (required)
 * - shippingAddress: Shipping address for the order (required)
 * - stripeSessionId: Stripe session ID for payment tracking (optional)
 * - createdAt: Timestamp of creation (auto-generated)
 * - updatedAt: Timestamp of last update (auto-generated)
 *
 * @typedef {Object} Order
 * @property {mongoose.ObjectId} customerId - Reference to the Patient/Customer model.
 * @property {OrderItem[]} orderItems - Array of order items.
 * @property {number} totalPrice - Total price of the order.
 * @property {'pending' | 'delivered' | 'cancelled'} [orderStatus='pending'] - Status of the order.
 * @property {'paid' | 'pending'} [paymentStatus] - Payment status of the order.
 * @property {Date} deliveryDate - Expected delivery date.
 * @property {string} shippingAddress - Shipping address for the order.
 * @property {string} [stripeSessionId] - Stripe session ID for payment tracking.
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Last update timestamp.
 */
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide a customer ID!"],
    },
    orderItems: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: [true, "Please provide a total price!"],
      min: [0, "Total price cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
    },
    deliveryDate: {
      type: Date,
      required: [true, "Please provide a delivery date!"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Please provide a shipping address!"],
    },
    stripeSessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
