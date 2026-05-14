import { Router } from 'express';
import { getAllTrabajadores, getTrabajador, addTrabajador, editTrabajador, removeTrabajador } from '../controllers/trabajadorControllers';

const router = Router();

router.get('/', getAllTrabajadores);
router.get('/:id', getTrabajador);
router.post('/', addTrabajador);
router.put('/:id', editTrabajador);
router.delete('/:id', removeTrabajador);

export default router;