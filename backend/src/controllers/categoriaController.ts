import { Request, Response } from 'express';
import { getCategorias, createCategoria, deleteCategoria } from '../models/categoriaModels';
import { currentUserId } from '../utils/currentUser';

const ctx = (req: Request) => ({
  idUsuario: currentUserId(req),
  ip: req.ip ?? null,
});

export const getAllCategorias = async (_req: Request, res: Response) => {
  try {
    res.json(await getCategorias());
  } catch (error: any) {
    console.error('getAllCategorias:', error);
    res.status(500).json({ message: error.message || 'Error al obtener categorías' });
  }
};

export const addCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre requerido' });
    res.json(await createCategoria(nombre.trim(), ctx(req)));
  } catch (error: any) {
    console.error('addCategoria:', error);
    res.status(500).json({ message: error.message || 'Error al crear categoría' });
  }
};

export const removeCategoria = async (req: Request, res: Response) => {
  try {
    await deleteCategoria(Number(req.params.id), ctx(req));
    res.json({ message: 'Categoría eliminada' });
  } catch (error: any) {
    console.error('removeCategoria:', error);
    if (error.code === '23503') {
      return res.status(400).json({
        message: 'No se puede eliminar la categoría porque tiene productos asociados',
      });
    }
    res.status(500).json({ message: error.message || 'Error al eliminar categoría' });
  }
};