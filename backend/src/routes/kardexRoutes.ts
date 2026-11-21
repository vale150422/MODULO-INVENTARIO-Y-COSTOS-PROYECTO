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
import {
  getProductosInfo,
  getFacturasAdjuntas,
  subirFacturaArchivo,
  obtenerUrlFactura,
  verFacturaArchivo,
} from '../controllers/facturaArchivoController';

const router = Router();

// Va antes de authenticate: se abre en pestaña nueva y valida su propio enlace temporal
router.get('/factura-archivo/:id_kardex/ver', verFacturaArchivo);

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

// Facturas adjuntas e información de insumos (las usa facturasApi.ts del frontend)
router.get('/info/productos',                 getProductosInfo);
router.get('/facturas-adjuntas/:id_producto', getFacturasAdjuntas);
router.post('/factura-archivo/:id_kardex',    upload.single('archivo'), subirFacturaArchivo);
router.get('/factura-archivo/:id_kardex',     obtenerUrlFactura);

router.get('/:id_producto',       getKardex);
router.get('/:id_producto/lotes', getLotes);

export default router;