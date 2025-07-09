import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import Medicine from "../models/medicine.model.js";
import { createTestUserAndLogin } from "./helpers.js";

describe("Order API", () => {
  it("creates an order successfully", async () => {
    const { cookie, userId } = await createTestUserAndLogin();

    // Insert medicine
    const med = await Medicine.create({
      name: "Paracetamol",
      shortDesc: "Pain relief",
      price: 10,
      image: "http://example.com/img.png",
      category: "Painkiller",
    });

    const cart = [{ id: med._id.toString(), qty: 2, price: 10 }];

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ cart, address: "123 Main St", deliveryDate: "2025-01-01" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("totalPrice", 20);
    expect(res.body.data).toHaveProperty("customerId", userId);
  });
});
