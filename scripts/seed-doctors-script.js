/**
 * Script to seed dummy doctor data into the database.
 *
 * - Connects to MongoDB using the connection string from environment variables.
 * - Deletes all existing doctor documents.
 * - Inserts a predefined set of dummy doctor profiles with hashed passwords and availability.
 * - Disconnects from the database after completion.
 *
 * Usage:
 *   node seedDoctorData.js
 *
 * @module scripts/seedDoctorData
 */

import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import dotenv from "dotenv";
dotenv.config();

const dummyDoctors = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Cardiologist",
    location: "Koramangala, Bangalore",
    consultationFee: 800,
    experience: 15,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: [],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Dermatologist",
    location: "Indiranagar, Bangalore",
    consultationFee: 600,
    experience: 12,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
  {
    name: "Dr. Amit Patel",
    email: "amit@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Neurologist",
    location: "Whitefield, Bangalore",
    consultationFee: 1000,
    experience: 18,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
  {
    name: "Dr. Sunita Rao",
    email: "sunita@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Pediatrician",
    location: "Jayanagar, Bangalore",
    consultationFee: 500,
    experience: 10,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
  {
    name: "Dr. Vikram Singh",
    email: "vikram@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Orthopedic",
    location: "HSR Layout, Bangalore",
    consultationFee: 750,
    experience: 14,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
  {
    name: "Dr. Meera Iyer",
    email: "Meera@gmail.com",
    password: "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    passwordConfirm:
      "$2b$12$X/2uam64CqsXQUB9XGOMtOh0TBjrnPARN1XIQC33TT.xNGIFXdFu2",
    specialization: "Gynecologist",
    location: "BTM Layout, Bangalore",
    consultationFee: 700,
    experience: 16,
    availability: {
      monday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      tuesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      wednesday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      thursday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      friday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      saturday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
      sunday: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
  },
];

/**
 * Seeds the database with dummy doctor profiles.
 * Connects to MongoDB, deletes existing doctors, inserts new dummy data, and then disconnects.
 * @async
 * @function seedDoctorData
 * @returns {Promise<void>}
 */
const seedDoctorData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Doctor.deleteMany();
    await Doctor.insertMany(dummyDoctors);

    console.log("Dummy data inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDoctorData();
