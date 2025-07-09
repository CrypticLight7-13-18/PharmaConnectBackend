import mongoose from "mongoose";
import { AppointmentStatus } from "../constants/enums.js";

/**
 * Mongoose schema for Appointment documents.
 * Represents an appointment between a patient and a doctor, including scheduling, status, fee, and optional consultation report.
 *
 * Fields:
 * - patientId: Reference to the Patient (required)
 * - doctorId: Reference to the Doctor (required)
 * - appointmentDate: Date of appointment (must be in the future, required)
 * - appointmentTime: Time of appointment (required)
 * - status: Status of the appointment (default: "Pending")
 * - consultationFee: Fee for the consultation (required)
 * - consultationReport: Optional report with patient and diagnosis details
 * - createdAt: Timestamp of creation (auto-generated)
 * - updatedAt: Timestamp of last update (auto-generated)
 *
 * Includes a pre-save hook to ensure appointmentDate is a Date object.
 *
 * @typedef {Object} Appointment
 * @property {mongoose.ObjectId} patientId - Reference to the Patient.
 * @property {mongoose.ObjectId} doctorId - Reference to the Doctor.
 * @property {Date} appointmentDate - Date of the appointment (must be in the future).
 * @property {String} appointmentTime - Time of the appointment.
 * @property {String} status - Status of the appointment.
 * @property {Number} consultationFee - Consultation fee amount.
 * @property {Object} consultationReport - Optional report with details (name, age, weight, height, comments, diagnosis, prescription).
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Update timestamp.
 */
const appointmentSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide patient Id"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Please provide doctor Id"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Please select date of appointment"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Appointment date must be in the future",
      },
    },
    appointmentTime: {
      type: String,
      required: [true, "Please select time of appointment"],
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },
    consultationReport: {
      name: {
        type: String,
      },
      age: Number,
      weight: Number,
      height: Number,
      comments: String,
      diagnosis: {
        type: String,
      },
      prescription: {
        type: String,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.appointmentDate = new Date(this.appointmentDate);
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
