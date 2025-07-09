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

  await request(app).post("/api/users/signup").send(userData);

  const loginRes = await request(app)
    .post("/api/users/login")
    .send({
      email: userData.email,
      password: userData.password,
      role: "patient",
    });

  const cookie = loginRes.headers["set-cookie"].find((c) =>
    c.startsWith("jwt")
  );
  return { cookie, userId: loginRes.body.user._id };
};
