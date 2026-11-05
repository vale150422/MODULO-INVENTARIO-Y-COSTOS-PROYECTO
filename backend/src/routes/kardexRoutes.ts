import { Router } from 'express';
import { getProductos, getKardex, getLotes, registrarMovimiento, getReporteConsolidado, getDashboard } from '../controllers/kardexController';
import { authenticate } from '../middleware/authMiddleware';
// Arriba, con los demás imports:
import multer from 'multer';
import { escanearFactura } from '../controllers/escaneo.controller';
import { registrarEntradaFactura } from '../controllers/kardex.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)),
});

// Junto a tus otras rutas POST. Usa el MISMO middleware de autenticación
// que ya usas en '/movimiento' (aquí lo llamé `auth`, cámbialo por el tuyo):
router.post('/escanear-factura', auth, upload.single('archivo'), escanearFactura);
router.post('/entrada-factura', auth, registrarEntradaFactura);
const router = Router();
router.use(authenticate);

router.get('/productos',          getProductos);
router.get('/reporte',            getReporteConsolidado);
router.get('/dashboard',          getDashboard);
router.post('/movimiento',        registrarMovimiento);
router.get('/:id_producto',       getKardex);
router.get('/:id_producto/lotes', getLotes);


export default router;