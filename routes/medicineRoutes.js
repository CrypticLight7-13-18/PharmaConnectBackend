import express from "express";
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
} from "../controllers/medicineController.js";
import { restrictTo } from "../controllers/authController.js";
//import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get("/", getAllMedicines);
router.get("/search", searchMedicines);
router.get("/:id", getMedicineById);

// Protected routes (doctor acts as admin)
router.post("/", restrictTo("doctor"), createMedicine);
router.put("/:id", restrictTo("doctor"), updateMedicine);
router.delete("/:id", restrictTo("doctor"), deleteMedicine);

export default router;
