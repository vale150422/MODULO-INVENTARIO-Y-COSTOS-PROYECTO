import { Router } from 'express';
import { getAllFincas, addFinca, getFinca, editFinca, removeFinca } from '../controllers/fincaControllers';

const router = Router();

router.get('/', getAllFincas);
router.get('/:id', getFinca);
router.post('/', addFinca);
router.put('/:id', editFinca);
router.delete('/:id', removeFinca);

export default router;