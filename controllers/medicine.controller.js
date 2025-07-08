import Medicine from "../models/medicine.model.js";
import AppError from "../utils/app-error.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";

/**
 * Retrieves a paginated list of medicines, optionally filtered by category.
 * Results are sorted alphabetically by medicine name.
 * @param {Object} req - The request object containing query parameters for pagination and filtering.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getAllMedicines = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category } = req.query;
  const filter = category ? { category } : {};
  const medicines = await Medicine.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ name: 1 });

  const total = await Medicine.countDocuments(filter);

  res.json({
    success: true,
    data: medicines,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Retrieves a single medicine by its ID.
 * @param {Object} req - The request object containing the medicine ID in params.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the medicine is not found.
 */
export const getMedicineById = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new AppError("Medicine not found", 404));
  }

  res.json({
    success: true,
    data: medicine,
  });
});

/**
 * Searches for medicines based on query, category, and price range.
 * Supports text search on name and short description, filtering by category, and price range.
 * @param {Object} req - The request object containing search and filter parameters.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const searchMedicines = asyncHandler(async (req, res, next) => {
  const { q, category, minPrice, maxPrice } = req.query;

  let filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { shortDesc: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  const medicines = await Medicine.find(filter).sort({ name: 1 });

  res.json({
    success: true,
    data: medicines,
    count: medicines.length,
  });
});

/**
 * Creates a new medicine entry in the database.
 * @param {Object} req - The request object containing medicine details in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const createMedicine = asyncHandler(async (req, res, next) => {
  const { name, price, shortDesc, image, category } = req.body;

  const medicine = new Medicine({
    name,
    price,
    shortDesc,
    image,
    category,
  });

  const savedMedicine = await medicine.save();

  res.status(201).json({
    success: true,
    message: "Medicine created successfully",
    data: savedMedicine,
  });
});

/**
 * Updates an existing medicine's details by its ID.
 * @param {Object} req - The request object containing the medicine ID in params and updated data in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If the medicine is not found.
 */
export const updateMedicine = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!medicine) {
    return next(new AppError("Medicine not found", 404));
  }

  res.json({
    success: true,
    message: "Medicine updated successfully",
    data: medicine,
  });
});

/**
 * Deletes a medicine by its ID.
 * @param {Object} req - The request object containing the medicine ID in params.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const deleteMedicine = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: "Medicine not found",
    });
  }

  res.json({
    success: true,
    message: "Medicine deleted successfully",
  });
});
