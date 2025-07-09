import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";

const userData = {
  userName: "Test User",
  email: "auth@example.com",
  password: "password123",
  confirmPassword: "password123",
  role: "patient",
  dateOfBirth: "1990-01-01",
};

describe("Auth API", () => {
  it("should sign up a new user", async () => {
    const res = await request(app).post("/api/users/signup").send(userData);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login existing user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: userData.email,
        password: userData.password,
        role: "patient",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: userData.email, password: "wrongpass", role: "patient" });

    expect(res.status).toBe(401);
  });
});
