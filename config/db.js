import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Uses environment variable MONGO_URI for the connection string.
 * Logs a success message on successful connection, or logs an error and exits the process on failure.
 * @async
 * @function connectDB
 * @returns {Promise<void>} - Resolves when the connection is established.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
};

export default connectDB;
