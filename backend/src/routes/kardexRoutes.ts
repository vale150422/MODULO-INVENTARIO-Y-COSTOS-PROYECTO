import { Router } from 'express';
import multer from 'multer';
import {
  getProductos,
  getKardex,
  getLotes,
  registrarMovimiento,
  getReporteConsolidado,
  getDashboard,
  registrarEntradaFactura,
} from '../controllers/kardexController';
import { escanearFactura } from '../controllers/escaneo.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)),
});

router.get('/productos',          getProductos);
router.get('/reporte',            getReporteConsolidado);
router.get('/dashboard',          getDashboard);

router.post('/movimiento',        registrarMovimiento);
router.post('/escanear-factura',  upload.single('archivo'), escanearFactura);
router.post('/entrada-factura',   registrarEntradaFactura);

router.get('/:id_producto',       getKardex);
router.get('/:id_producto/lotes', getLotes);

export default router;