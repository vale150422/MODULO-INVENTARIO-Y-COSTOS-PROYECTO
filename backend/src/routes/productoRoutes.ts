import { Router } from 'express';
import {
  getAllProducts, addProduct, getProduct, editProduct,
  removeProduct, inactivarProductController, activarProductController
} from '../controllers/productoController';

const router = Router();

router.get('/',                getAllProducts);
router.get('/:id',             getProduct);
router.post('/',               addProduct);
router.put('/:id',             editProduct);
router.delete('/:id',          removeProduct);
router.patch('/:id/inactivar', inactivarProductController);
router.patch('/:id/activar',   activarProductController);

export default router;