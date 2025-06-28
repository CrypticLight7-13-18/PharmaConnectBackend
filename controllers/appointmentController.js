import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get appointments relevant to current user
export const getAppointments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user.role === "doctor") {
    // Doctor: fetch appointments without a report (incomplete)
    filter = { doctorId: req.user._id, consultationReport: { $exists: false } };
  } else {
    // Patient: fetch all their appointments
    filter = { patientId: req.user._id };
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email")
    .populate("doctorId", "name email")
    .sort({ appointmentDate: 1 });

  // For doctor, build pastReports for each appointment
  if (req.user.role === "doctor") {
    const withReports = await Promise.all(
      appointments.map(async (appt) => {
        const past = await Appointment.find({
          patientId: appt.patientId._id,
          doctorId: req.user._id,
          consultationReport: { $exists: true, $ne: null },
        })
          .select("consultationReport appointmentDate")
          .populate("doctorId", "name");

        const pastReports = past.map((p) => ({
          date: p.appointmentDate,
          diagnosis: p.consultationReport?.diagnosis,
          doctor: p.doctorId.name,
        }));

        return { ...appt.toObject(), pastReports };
      })
    );
    return res.status(200).json({ success: true, data: withReports });
  }

  res.status(200).json({ success: true, data: appointments });
});

// Create a new appointment (patient booking)
export const createAppointment = catchAsync(async (req, res, next) => {
  const { doctorId, appointmentDate } = req.body;
  if (!doctorId || !appointmentDate) {
    return next(new AppError("doctorId and appointmentDate are required", 400));
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    appointmentDate,
  });

  // Also store reference in patient and doctor documents (optional)
  await Patient.findByIdAndUpdate(req.user._id, {
    $addToSet: { appointmentIds: appointment._id },
  });
  await Doctor.findByIdAndUpdate(doctorId, {
    $addToSet: { appointmentIds: appointment._id },
  });

  res
    .status(201)
    .json({ success: true, message: "Appointment booked", data: appointment });
});

// Doctor adds a consultation report and marks completed
export const addConsultationReport = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { consultationReport } = req.body;
  if (!consultationReport) {
    return next(new AppError("consultationReport data required", 400));
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (String(appointment.doctorId) !== String(req.user._id)) {
    return next(new AppError("Not authorized to edit this appointment", 403));
  }

  appointment.consultationReport = consultationReport;
  appointment.status = "completed";

  await appointment.save();

  res
    .status(200)
    .json({ success: true, message: "Report added", data: appointment });
});
