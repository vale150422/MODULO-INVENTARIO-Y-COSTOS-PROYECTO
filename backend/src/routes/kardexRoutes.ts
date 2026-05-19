import { Router } from 'express';
import { getKardexByProduct, registrarMovimiento } from '../controllers/kardexController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);
router.get('/:productId', getKardexByProduct);
router.post('/movimiento', registrarMovimiento);
export default router;