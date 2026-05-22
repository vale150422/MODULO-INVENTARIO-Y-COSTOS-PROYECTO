import { Router } from 'express';
import { getAllCategorias, addCategoria, removeCategoria } from '../controllers/categoriaController';

const router = Router();
router.get('/', getAllCategorias);
router.post('/', addCategoria);
router.delete('/:id', removeCategoria);

export default router;