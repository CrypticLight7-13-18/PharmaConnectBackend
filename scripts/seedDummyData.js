import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Medicine from "../models/medicineModel.js";
import Appointment from "../models/appointmentModel.js";
import Order from "../models/orderModel.js";
import bcrypt from "bcrypt";

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log("🔄 Clearing existing data…");
  await Promise.all([
    Patient.deleteMany(),
    Doctor.deleteMany(),
    Medicine.deleteMany(),
    Appointment.deleteMany(),
    Order.deleteMany(),
  ]);

  console.log("✨ Inserting dummy users…");
  const hash = async (pw) => await bcrypt.hash(pw, 12);

  const patients = await Patient.insertMany([
    {
      name: "John Doe",
      email: "john@example.com",
      password: await hash("password123"),
      passwordConfirm: await hash("password123"),
      dateOfBirth: new Date("1995-05-20"),
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: await hash("password123"),
      passwordConfirm: await hash("password123"),
      dateOfBirth: new Date("1990-09-15"),
    },
  ]);

  const doctors = await Doctor.insertMany([
    {
      name: "Dr. Strange",
      email: "strange@hospital.com",
      password: await hash("password123"),
      passwordConfirm: await hash("password123"),
      specialization: "Cardiology",
    },
    {
      name: "Dr. Watson",
      email: "watson@hospital.com",
      password: await hash("password123"),
      passwordConfirm: await hash("password123"),
      specialization: "General Medicine",
    },
  ]);

  console.log("💊 Inserting medicines…");
  const medicines = await Medicine.insertMany([
    {
      name: "Paracetamol 500mg",
      price: 40,
      shortDesc: "Pain reliever / fever reducer",
      image: "https://source.unsplash.com/200x160/?medicine",
      category: "OTC",
    },
    {
      name: "Amoxicillin 250mg",
      price: 120,
      shortDesc: "Broad-spectrum antibiotic",
      image: "https://source.unsplash.com/200x160/?capsule",
      category: "Antibiotic",
    },
    {
      name: "Vitamin C 500mg",
      price: 150,
      shortDesc: "Immunity booster",
      image: "https://source.unsplash.com/200x160/?vitamin",
      category: "Supplement",
    },
  ]);

  console.log("📅 Creating appointments…");
  const appointments = await Appointment.insertMany([
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
    },
    {
      patientId: patients[1]._id,
      doctorId: doctors[1]._id,
      appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // push appointment references
  await Promise.all([
    Patient.updateMany(
      {},
      { $set: { appointmentIds: appointments.map((a) => a._id) } }
    ),
    Doctor.updateOne(
      { _id: doctors[0]._id },
      { $set: { appointmentIds: [appointments[0]._id] } }
    ),
    Doctor.updateOne(
      { _id: doctors[1]._id },
      { $set: { appointmentIds: [appointments[1]._id] } }
    ),
  ]);

  console.log("🛒 Creating orders…");
  await Order.create({
    customerId: patients[0]._id,
    orderItems: [
      {
        medicineId: medicines[0]._id,
        quantity: 2,
        unitPrice: medicines[0].price,
      },
      {
        medicineId: medicines[2]._id,
        quantity: 1,
        unitPrice: medicines[2].price,
      },
    ],
    totalPrice: medicines[0].price * 2 + medicines[2].price,
    shippingAddress: "123 Main Street, Springfield",
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  console.log("✅ Dummy data seeded successfully");
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
