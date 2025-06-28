import mongoose from "mongoose";

const consultationReportSchema = new mongoose.Schema(
  {
    age: Number,
    weight: Number,
    height: Number,
    comments: String,
    diagnosis: { type: String, required: true },
    prescription: { type: String, required: true },
    submitType: { type: String, enum: ["draft", "final"], default: "final" },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    consultationReport: consultationReportSchema,
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
