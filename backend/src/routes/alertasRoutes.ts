import { Router } from 'express';
import {
  getVencimientos,
  enviarCorreoManual,
  getCorreos,
  addCorreo,
  toggleCorreo,
  deleteCorreo,
} from '../controllers/alertasController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/vencimientos',      getVencimientos);
router.post('/enviar-correo',    enviarCorreoManual);

router.get('/correos',           getCorreos);
router.post('/correos',          addCorreo);
router.patch('/correos/:id',     toggleCorreo);
router.delete('/correos/:id',    deleteCorreo);

export default router;