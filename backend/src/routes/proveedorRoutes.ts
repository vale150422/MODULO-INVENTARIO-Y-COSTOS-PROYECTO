import { Router } from 'express';
import { getAllProveedores, getProveedor, addProveedor, editProveedor, removeProveedor } from '../controllers/provedorControllers';

const router = Router();

router.get('/', getAllProveedores);
router.get('/:id', getProveedor);
router.post('/', addProveedor);
router.put('/:id', editProveedor);
router.delete('/:id', removeProveedor);

export default router;