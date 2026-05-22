import { Request, Response } from 'express';
import { getCategorias, createCategoria, deleteCategoria } from '../models/categoriaModels';

export const getAllCategorias = async (_req: Request, res: Response) => {
  try {
    const data = await getCategorias();
    res.json(data);
  } catch (error) {
    console.error('ERROR CATEGORIAS:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

export const addCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre requerido' });
    const data = await createCategoria(nombre.trim());
    res.json(data);
  } catch (error) {
    console.error('ERROR CREAR CATEGORIA:', error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

export const removeCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCategoria(Number(id));
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};