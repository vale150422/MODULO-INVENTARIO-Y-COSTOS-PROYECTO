import { Request, Response } from 'express';
import { getFincas, createFinca, getFincaById, updateFinca, deleteFinca } from '../models/fincaModels';

export const getAllFincas = async (_req: Request, res: Response) => {
  try {
    const data = await getFincas();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener fincas' });
  }
};

export const addFinca = async (req: Request, res: Response) => {
  try {
    const newFinca = await createFinca(req.body);
    res.json(newFinca);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear finca' });
  }
};

export const getFinca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getFincaById(Number(id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener finca' });
  }
};

export const editFinca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateFinca(Number(id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar finca' });
  }
};

export const removeFinca = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFinca(Number(id));
    res.json({ message: 'Finca eliminada' });
  } catch (error: any) {
    if (error.code === '23503') {
      res.status(400).json({ message: 'No se puede eliminar la finca porque tiene productos asociados' });
    } else {
      res.status(500).json({ message: 'Error al eliminar finca' });
    }
  }
};