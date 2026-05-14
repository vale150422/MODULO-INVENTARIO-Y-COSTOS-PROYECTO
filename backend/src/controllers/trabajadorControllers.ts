import { Request, Response } from 'express';
import { getTrabajadores, getTrabajadorById, createTrabajador, updateTrabajador, deleteTrabajador } from '../models/trabajadorModels';

export const getAllTrabajadores = async (_req: Request, res: Response) => {
  try {
    const data = await getTrabajadores();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener trabajadores' });
  }
};

export const getTrabajador = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getTrabajadorById(Number(id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener trabajador' });
  }
};

export const addTrabajador = async (req: Request, res: Response) => {
  try {
    const newTrabajador = await createTrabajador(req.body);
    res.json(newTrabajador);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear trabajador' });
  }
};

export const editTrabajador = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateTrabajador(Number(id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar trabajador' });
  }
};

export const removeTrabajador = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteTrabajador(Number(id));
    res.json({ message: 'Trabajador eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar trabajador' });
  }
};