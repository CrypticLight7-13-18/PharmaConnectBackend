/**
 * Script to seed dummy chat data and assign all chat IDs to every patient and doctor in the database.
 *
 * - Connects to MongoDB using the connection string from environment variables.
 * - Deletes all existing chat documents.
 * - Inserts a set of predefined dummy chat documents.
 * - Updates all Patient and Doctor documents to reference the new chat IDs.
 * - Disconnects from the database after completion.
 *
 * Usage:
 *   node seedChatsAndAssign.js
 *
 * @module scripts/seedChatsAndAssign
 */

import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import dotenv from "dotenv";
dotenv.config();

const DUMMY_CHATS = [
  {
    title: "General Discussion",
    lastMessage: {
      role: "User",
      message: "Welcome to the chat!",
      timestamp: new Date(),
    },
    messageHistory: [
      { role: "User", message: "Welcome to the chat!", timestamp: new Date() },
    ],
  },
  {
    title: "Order Support",
    lastMessage: {
      role: "Assistant",
      message: "How can I help you with your order?",
      timestamp: new Date(),
    },
    messageHistory: [
      {
        role: "Assistant",
        message: "How can I help you with your order?",
        timestamp: new Date(),
      },
    ],
  },
  {
    title: "Prescription Help",
    lastMessage: {
      role: "User",
      message: "I need help with my prescription.",
      timestamp: new Date(),
    },
    messageHistory: [
      {
        role: "User",
        message: "I need help with my prescription.",
        timestamp: new Date(),
      },
    ],
  },
  {
    title: "Pharmacy Info",
    lastMessage: {
      role: "Assistant",
      message: "Our pharmacy is open 9am-9pm.",
      timestamp: new Date(),
    },
    messageHistory: [
      {
        role: "Assistant",
        message: "Our pharmacy is open 9am-9pm.",
        timestamp: new Date(),
      },
    ],
  },
  {
    title: "Feedback",
    lastMessage: {
      role: "User",
      message: "Great service!",
      timestamp: new Date(),
    },
    messageHistory: [
      { role: "User", message: "Great service!", timestamp: new Date() },
    ],
  },
];

/**
 * Seeds the database with dummy chats and assigns all chat IDs to every patient and doctor.
 * @async
 * @function seedChatsAndAssign
 * @returns {Promise<void>}
 */
async function seedChatsAndAssign() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Chat.deleteMany({});

  const createdChats = await Chat.insertMany(DUMMY_CHATS);
  const chatIds = createdChats.map((chat) => chat._id);

  await Patient.updateMany({}, { $set: { chatIds } });
  await Doctor.updateMany({}, { $set: { chatIds } });

  console.log("Dummy chats created and assigned to all users.");
  await mongoose.disconnect();
}

seedChatsAndAssign().catch((err) => {
  console.error(err);
  process.exit(1);
});
