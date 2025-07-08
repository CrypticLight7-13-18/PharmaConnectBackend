import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import asyncHandler from "../utils/async-handler.utils.js";
import AppError from "../utils/app-error.utils.js";

/**
 * Retrieves a filtered, sorted, and paginated list of doctors based on query parameters.
 * Supports filtering by specialization, location, maximum fee, and search keyword.
 * Results can be sorted by fee or experience, and paginated.
 * @param {Object} req - The request object containing query parameters for filtering, sorting, and pagination.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getAllDoctors = asyncHandler(async (req, res, next) => {
  const {
    specialization,
    location,
    maxFee,
    search,
    sortBy,
    page = 1,
    limit = 100,
  } = req.query;

  let query = {};

  if (specialization) {
    query.specialization = specialization;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (maxFee) {
    query.consultationFee = { $lte: parseInt(maxFee) };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  let sort = {};
  switch (sortBy) {
    case "fee":
      sort = { consultationFee: 1 };
      break;
    case "experience":
      sort = { experience: -1 };
      break;
    default:
      sort = { experience: -1 };
  }

  const doctors = await Doctor.find(query)
    .select("-password -passwordConfirm -appointmentIds")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Doctor.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: doctors.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      doctors,
    },
  });
});

/**
 * Retrieves detailed information of a specific doctor by ID.
 * Excludes sensitive fields like password and password confirmation.
 * @param {Object} req - The request object containing the doctor ID in params.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the doctor is not found.
 */
export const getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id).select(
    "-password -passwordConfirm"
  );

  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doctor,
    },
  });
});

/**
 * Retrieves the availability slots for a doctor on a specified date.
 * Returns available time slots after excluding already booked appointments.
 * @param {Object} req - The request object containing the doctor ID in params and date in query.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the date is missing or the doctor is not found.
 */
export const getDoctorAvailability = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  const doctorId = req.params.id;

  if (!date) {
    return next(new AppError("Date is required", 400));
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  const dayOfWeek = new Date(date)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const availableSlots = doctor.availability[dayOfWeek] || [];

  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: new Date(date),
    status: { $ne: "Cancelled" },
  }).select("appointmentTime");

  const bookedTimes = bookedAppointments.map((apt) => apt.appointmentTime);
  const availableTimes = availableSlots.filter(
    (time) => !bookedTimes.includes(time)
  );

  res.status(200).json({
    status: "success",
    data: {
      availableSlots: availableTimes,
      totalSlots: availableSlots.length,
      bookedSlots: bookedTimes.length,
    },
  });
});
