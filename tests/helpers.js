import request from "supertest";
import { app } from "../index.js";

export const createTestUserAndLogin = async () => {
  const userData = {
    userName: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: "patient",
    dateOfBirth: "1990-01-01",
  };

  // Create user
  const signupRes = await request(app).post("/api/users/signup").send(userData);
  
  if (signupRes.status !== 201) {
    throw new Error(`Signup failed with status ${signupRes.status}: ${signupRes.text}`);
  }

  // Login user
  const loginRes = await request(app)
    .post("/api/users/login")
    .send({
      email: userData.email,
      password: userData.password,
      role: "patient",
    });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed with status ${loginRes.status}: ${loginRes.text}`);
  }

  // Find JWT cookie if it exists
  let cookie = null;
  if (loginRes.headers["set-cookie"]) {
    cookie = loginRes.headers["set-cookie"].find((c) =>
      c.startsWith("jwt")
    );
  }

  return { 
    cookie, 
    userId: loginRes.body.user?._id || loginRes.body.data?.user?._id,
    token: loginRes.body.token || loginRes.body.data?.token
  };
};
