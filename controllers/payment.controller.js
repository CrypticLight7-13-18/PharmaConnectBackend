import AppError from "../utils/app-error.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import Stripe from "stripe";
import Order from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_BACKEND_SECRET);
const FRONTEND_URL = process.env.FRONTEND_URL;

export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { orderData } = req.body;
    const paymentMethodTypes = ["card"];
    
    let lineItems = [];
    
    if (orderData && orderData.cart && orderData.cart.length > 0) {
        lineItems = orderData.cart.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                    description: item.description || `Medicine: ${item.name}`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.qty || 1,
        }));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      mode: "payment",
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
      metadata: {
        orderId: orderData?.orderId || "",
        address: orderData?.address || "",
        orderTotal: orderData?.total?.toString() || "",
        customerEmail: orderData?.customerEmail || "",
      },
    });

    res.send({ id: session.id });
  }
);

export const handlePaymentSuccess = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          orderStatus: "confirmed",
          paymentStatus: "paid",
          stripeSessionId: sessionId,
        });
      }

      res.json({
        success: true,
        message: "Payment successful",
        orderId: orderId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  });