import { Router } from 'express';
import { getAllProducts, addProduct, getProduct, editProduct, removeProduct } from '../controllers/productoController';
const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', addProduct);
router.put('/:id', editProduct);
router.delete('/:id', removeProduct);

export default router;