import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { createTestUserAndLogin } from "./helpers.js";

// tests/chat.test.js
vi.mock("stripe", () => {
  return { default: class { checkout = { sessions: { create: async ()=>({id:"x"}) } } } };
});

// Mock genAI to avoid network
vi.mock("../utils/ai-client.utils.js", () => ({
  default: {
    getGenerativeModel: () => ({
      generateContent: async () => ({ response: { text: () => "mock" } }),
    }),
  },
}));

describe("Chat API", () => {
  it("creates a new chat", async () => {
    const { cookie } = await createTestUserAndLogin();

    const res = await request(app)
      .post("/api/chat")
      .set("Cookie", cookie)
      .send({ title: "Health", systemMessage: "Hello" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("title", "Health");
  });
});
