import { Router } from 'express';
import {
  getVencimientos,
  enviarSMSManual,
  getTelefonos,
  addTelefono,
  toggleTelefono,
  deleteTelefono,
} from '../controllers/alertasController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/vencimientos',   getVencimientos);
router.post('/enviar-sms',    enviarSMSManual);

router.get('/telefonos',      getTelefonos);
router.post('/telefonos',     addTelefono);
router.patch('/telefonos/:id', toggleTelefono);
router.delete('/telefonos/:id', deleteTelefono);

export default router;