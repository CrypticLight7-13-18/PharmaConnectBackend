import express from 'express';
import * as medicineController from '../controllers/medicine.controller.js';
import { restrictTo } from '../middlewares/restrict.middleware.js';

const router = express.Router();

router.get('/', medicineController.getAllMedicines);
router.get('/search', medicineController.searchMedicines);
router.get('/:id', medicineController.getMedicineById);

router.use(restrictTo("admin"));

router.post('/',  medicineController.createMedicine);
router.put('/:id',  medicineController.updateMedicine);
router.delete('/:id',  medicineController.deleteMedicine);

export default router;
