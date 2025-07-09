import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo;

beforeAll(async () => {
  // if there's an existing mongoose connection, close it first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // start in-memory mongo
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // connect mongoose to the in-memory mongo
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // provide test-safe env vars
  process.env.JWT_SECRET = "testsecret";
  process.env.JWT_COOKIE_EXPIRY_TIME = "7d";
  process.env.NODE_ENV = "test";

  // stripe requires an api key even in tests
  process.env.STRIPE_BACKEND_SECRET = "sk_test_dummy";
  process.env.FRONTEND_URL = "http://localhost:3000";
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});