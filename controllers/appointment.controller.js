import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import AppError from "../utils/app-error.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import { Roles, AppointmentStatus } from "../constants/enums.js";

/**
 * Creates a new appointment for a patient with a doctor.
 * Checks for doctor existence and slot availability, then creates and links the appointment.
 * @param {Object} req - The request object containing appointment details and authenticated user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the doctor is not found or the slot is already booked.
 */
export const createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, appointmentDate, appointmentTime } = req.body;
  const patientId = req.user._id;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return next(new AppError("Doctor not found", 404));

  const existingAppointment = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $ne: AppointmentStatus.CANCELLED },
  });

  if (existingAppointment)
    return next(new AppError("This time slot is already booked", 406));

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    consultationFee: doctor.consultationFee,
  });

  await Patient.findByIdAndUpdate(patientId, {
    $push: { appointmentIds: appointment._id },
  });

  await Doctor.findByIdAndUpdate(doctorId, {
    $push: { appointmentIds: appointment._id },
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("doctorId", "name specialization location")
    .populate("patientId", "name email");

  res.status(201).json({
    status: "success",
    data: {
      appointment: populatedAppointment,
    },
  });
});

/**
 * Retrieves all appointments for the authenticated user (patient or doctor).
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getAllAppointments = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let query = {};

  if (userRole === Roles.PATIENT) query.patientId = userId;
  else if (userRole === Roles.DOCTOR) query.doctorId = userId;

  const appointments = await Appointment.find(query)
    .populate("doctorId", "name specialization location consultationFee")
    .populate("patientId", "name email dateOfBirth")
    .sort({ appointmentDate: -1 });

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

/**
 * Retrieves a specific appointment by ID if the user is the patient or doctor involved.
 * @param {Object} req - The request object containing the appointment ID and user info.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the appointment is not found or access is denied.
 */
export const getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("doctorId")
    .populate("patientId");

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  const userId = req.user._id;

  if (
    appointment.patientId._id.toString() !== userId ||
    appointment.doctorId._id.toString() !== userId
  )
    return next(
      new AppError("You do not have access to this appointment", 403)
    );

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

/**
 * Updates the date or time of an existing appointment.
 * Only the patient who created the appointment can update it, and only if it's pending.
 * Checks for slot conflicts before updating.
 * @param {Object} req - The request object containing update data and user info.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the appointment is not found, not owned by the user, not pending, or the slot is booked.
 */
export const updateAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentDate, appointmentTime } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (appointment.patientId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only update your own appointments", 400));
  }

  if (appointment.status !== AppointmentStatus.PENDING) {
    return next(new AppError("Only pending appointments can be updated", 400));
  }

  if (appointmentDate || appointmentTime) {
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: new Date(appointmentDate || appointment.appointmentDate),
      appointmentTime: appointmentTime || appointment.appointmentTime,
      status: { $ne: AppointmentStatus.CANCELLED },
      _id: { $ne: appointment._id },
    });

    if (existingAppointment) {
      return next(new AppError("This time slot is already booked", 400));
    }
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
      ...(appointmentTime && { appointmentTime }),
    },
    { new: true, runValidators: true }
  ).populate("doctorId", "name specialization location consultationFee");

  res.status(200).json({
    status: "success",
    data: {
      appointment: updatedAppointment,
    },
  });
});

/**
 * Cancels an appointment by marking its status as "Cancelled".
 * Only the patient who created the appointment can cancel it.
 * @param {Object} req - The request object containing the appointment ID and user info.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the appointment is not found or not owned by the user.
 */
export const deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (appointment.patientId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only access your own appointments", 403));
  }

  appointment.status = AppointmentStatus.CANCELLED;
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment cancelled successfully",
  });
});

/**
 * Updates the consultation report and marks the appointment as "Completed".
 * Only the doctor who owns the appointment can update the report.
 * @param {Object} req - The request object containing the report and user info.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the appointment is not found or not owned by the doctor.
 */
export const updateAppointmentReport = asyncHandler(async (req, res, next) => {
  const { consultationReport } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only access your own appointments", 403));
  }

  appointment.status = "Completed";
  if (consultationReport) {
    appointment.consultationReport = consultationReport;
  }

  await appointment.save();

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});
