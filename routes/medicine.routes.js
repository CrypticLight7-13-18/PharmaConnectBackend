/**
 * Express router for medicine-related routes.
 * Maps HTTP endpoints to medicine controller functions for listing, searching, retrieving, creating, updating, and deleting medicines.
 * Applies role-based access control for admin-only operations.
 *
 * Routes:
 * - GET    /api/medicines/         : Get all medicines (paginated, public)
 * - GET    /api/medicines/search   : Search medicines by query, category, or price range (public)
 * - GET    /api/medicines/:id      : Get a single medicine by ID (public)
 * - POST   /api/medicines/         : Create a new medicine (admin only)
 * - PUT    /api/medicines/:id      : Update a medicine by ID (admin only)
 * - DELETE /api/medicines/:id      : Delete a medicine by ID (admin only)
 *
 * Middleware:
 * - restrictTo("admin")            : Restricts POST, PUT, and DELETE routes to admin users only
 *
 * @module routes/medicine
 */

import express from "express";
import * as medicineController from "../controllers/medicine.controller.js";
import { restrictTo } from "../middlewares/restrict.middleware.js";

const router = express.Router();

/**
 * @route GET /api/medicines/
 * @desc Retrieves a paginated list of all medicines.
 * @access Public
 */
router.get("/", medicineController.getAllMedicines);

/**
 * @route GET /api/medicines/search
 * @desc Searches medicines by query, category, or price range.
 * @access Public
 */
router.get("/search", medicineController.searchMedicines);

/**
 * @route GET /api/medicines/:id
 * @desc Retrieves a single medicine by its ID.
 * @access Public
 */
router.get("/:id", medicineController.getMedicineById);

// Restrict the following routes to admin users only
router.use(restrictTo("admin"));

/**
 * @route POST /api/medicines/
 * @desc Creates a new medicine entry.
 * @access Private (admin only)
 */
router.post("/", medicineController.createMedicine);

/**
 * @route PUT /api/medicines/:id
 * @desc Updates an existing medicine by its ID.
 * @access Private (admin only)
 */
router.put("/:id", medicineController.updateMedicine);

/**
 * @route DELETE /api/medicines/:id
 * @desc Deletes a medicine by its ID.
 * @access Private (admin only)
 */
router.delete("/:id", medicineController.deleteMedicine);

export default router;
