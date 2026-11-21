import { Request, Response } from 'express';
import { getFincas, createFinca, getFincaById, updateFinca, deleteFinca } from '../models/fincaModels';
import { currentUserId } from '../utils/currentUser';
import { fincasPermitidas, SIN_PERMISO_FINCA } from '../utils/fincasUsuario';

// Identifica al usuario a partir del token (igual que en productos y categorías)
const ctx = (req: Request) => ({
  idUsuario: currentUserId(req),
  ip: req.ip ?? null,
});

// El administrador ve todas; el trabajador solo las que tiene asignadas
export const getAllFincas = async (req: Request, res: Response) => {
  try {
    res.json(await getFincas(await fincasPermitidas(req)));
  } catch (error) {
    console.error('getAllFincas:', error);
    res.status(500).json({ message: 'Error al obtener fincas' });
  }
};

export const addFinca = async (req: Request, res: Response) => {
  try {
    res.json(await createFinca(req.body, ctx(req)));
  } catch (error: any) {
    console.error('addFinca:', error);
    res.status(500).json({ message: error?.message || 'Error al crear finca' });
  }
};

export const getFinca = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const fincas = await fincasPermitidas(req);
    if (fincas !== null && !fincas.includes(id)) {
      return res.status(403).json({ message: SIN_PERMISO_FINCA });
    }
    res.json(await getFincaById(id));
  } catch (error) {
    console.error('getFinca:', error);
    res.status(500).json({ message: 'Error al obtener finca' });
  }
};

export const editFinca = async (req: Request, res: Response) => {
  try {
    res.json(await updateFinca(Number(req.params.id), req.body, ctx(req)));
  } catch (error: any) {
    console.error('editFinca:', error);
    res.status(500).json({ message: error?.message || 'Error al actualizar finca' });
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