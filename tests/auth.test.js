import { describe, it, expect, beforeAll } from "vitest";
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
  // Create user once before all tests
  beforeAll(async () => {
    // Clean up any existing user with this email first
    try {
      await request(app).post("/api/users/signup").send(userData);
    } catch (error) {
      // User might already exist, that's okay
    }
  });

  it("should sign up a new user", async () => {
    // Use a different email for this test to avoid conflicts
    const newUserData = {
      ...userData,
      email: "auth-signup@example.com",
    };
    
    const res = await request(app).post("/api/users/signup").send(newUserData);
    
    if (res.status !== 201) {
      console.error("Signup failed:", res.status, res.text);
    }
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login existing user", async () => {
    // First ensure the user exists (ignore if already exists)
    const signupRes = await request(app).post("/api/users/signup").send({
      ...userData,
      email: "auth-login@example.com",
    });
    
    console.log("Signup response:", signupRes.status);
    
    // If signup failed with 400, user might already exist, that's okay
    if (signupRes.status !== 201 && signupRes.status !== 400) {
      console.error("Unexpected signup error:", signupRes.status, signupRes.text);
    }

    // Small delay to ensure user is saved
    await new Promise(resolve => setTimeout(resolve, 100));

    // Then try to login
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "auth-login@example.com",
        password: userData.password,
        role: "patient",
      });

    if (res.status !== 200) {
      console.error("Login failed:", res.status, res.text);
    }

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ 
        email: "auth-login@example.com", 
        password: "wrongpass", 
        role: "patient" 
      });

    expect(res.status).toBe(401);
  });
});
