import { Router } from 'express';
import {
  getProductos,
  getKardex,
  getLotes,
  registrarMovimiento,
  getReporteConsolidado
} from '../controllers/kardexController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/productos',          getProductos);
router.get('/reporte',            getReporteConsolidado);
router.get('/:id_producto',       getKardex);
router.get('/:id_producto/lotes', getLotes);
router.post('/movimiento',        registrarMovimiento);

export default router;