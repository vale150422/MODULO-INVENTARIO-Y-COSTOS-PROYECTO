import { Router } from 'express';
import { login, registro, cambiarPassword } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login',             login);
router.post('/registro',          registro);
router.patch('/cambiar-password', authenticate, cambiarPassword);

export default router;