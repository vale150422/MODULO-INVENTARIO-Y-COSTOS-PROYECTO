import { Request, Response } from 'express';
import { getFincas, createFinca, getFincaById, updateFinca, deleteFinca } from '../models/fincaModels';

// El login guarda el id del usuario en el token como "id"
const ctx = (req: Request) => ({
  idUsuario: Number((req as any).user?.id ?? (req as any).user?.id_usuario),
  ip: req.ip ?? null,
});

export const getAllFincas = async (_req: Request, res: Response) => {
  try {
    res.json(await getFincas());
  } catch (error) {
    console.error('getAllFincas:', error);
    res.status(500).json({ message: 'Error al obtener fincas' });
  }
};

export const addFinca = async (req: Request, res: Response) => {
  try {
    res.json(await createFinca(req.body, ctx(req)));
  } catch (error) {
    console.error('addFinca:', error);
    res.status(500).json({ message: 'Error al crear finca' });
  }
};

export const getFinca = async (req: Request, res: Response) => {
  try {
    res.json(await getFincaById(Number(req.params.id)));
  } catch (error) {
    console.error('getFinca:', error);
    res.status(500).json({ message: 'Error al obtener finca' });
  }
};

export const editFinca = async (req: Request, res: Response) => {
  try {
    res.json(await updateFinca(Number(req.params.id), req.body, ctx(req)));
  } catch (error) {
    console.error('editFinca:', error);
    res.status(500).json({ message: 'Error al actualizar finca' });
  }
};

export const removeFinca = async (req: Request, res: Response) => {
  try {
    await deleteFinca(Number(req.params.id), ctx(req));
    res.json({ message: 'Finca desactivada' });
  } catch (error: any) {
    console.error('removeFinca:', error);
    if (error.code === '23503') {
      res.status(400).json({ message: 'No se puede eliminar la finca porque tiene registros asociados' });
    } else {
      res.status(500).json({ message: 'Error al eliminar finca' });
    }
  }
};