import { Router } from 'express';
import { getProductos, getKardex, getLotes, registrarMovimiento, getReporteConsolidado, getDashboard } from '../controllers/kardexController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/productos',          getProductos);
router.get('/reporte',            getReporteConsolidado);
router.get('/dashboard',          getDashboard);
router.post('/movimiento',        registrarMovimiento);
router.get('/:id_producto',       getKardex);
router.get('/:id_producto/lotes', getLotes);


export default router;