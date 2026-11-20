import { Request, Response } from 'express';
import { getTrabajadores, getTrabajadorById, createTrabajador, updateTrabajador, deleteTrabajador } from '../models/trabajadorModels';
import { currentUserId, debugAuth } from '../utils/currentUser';

// Usuario que hace la acción, tomado del token
const ctx = (req: Request) => ({
  idUsuario: currentUserId(req),
  ip: req.ip ?? null,
});

// Convierte errores de la base en mensajes entendibles
const mensajeError = (error: any, porDefecto: string) => {
  if (error?.code === '23505') {
    if (String(error.constraint).includes('identificacion')) return 'Ya existe un usuario con esa cédula';
    return 'Ya existe un usuario con ese correo';
  }
  if (error?.code === '23503') return 'La finca seleccionada no existe';
  return error?.message || porDefecto;
};

export const getAllTrabajadores = async (_req: Request, res: Response) => {
  try {
    res.json(await getTrabajadores());
  } catch (error: any) {
    console.error('getAllTrabajadores:', error);
    res.status(500).json({ message: mensajeError(error, 'Error al obtener trabajadores') });
  }
};

export const getTrabajador = async (req: Request, res: Response) => {
  try {
    res.json(await getTrabajadorById(Number(req.params.id)));
  } catch (error: any) {
    console.error('getTrabajador:', error);
    res.status(500).json({ message: mensajeError(error, 'Error al obtener trabajador') });
  }
};

export const addTrabajador = async (req: Request, res: Response) => {
  try {
    res.json(await createTrabajador(req.body, ctx(req)));
  } catch (error: any) {
    console.error('addTrabajador:', error);
    res.status(500).json({
      message: mensajeError(error, 'Error al crear trabajador') + ' [' + debugAuth(req) + ']'
    });
  }
};

export const editTrabajador = async (req: Request, res: Response) => {
  try {
    res.json(await updateTrabajador(Number(req.params.id), req.body, ctx(req)));
  } catch (error: any) {
    console.error('editTrabajador:', error);
    res.status(500).json({
      message: mensajeError(error, 'Error al actualizar trabajador') + ' [' + debugAuth(req) + ']'
    });
  }
};

export const removeTrabajador = async (req: Request, res: Response) => {
  try {
    await deleteTrabajador(Number(req.params.id), ctx(req));
    res.json({ message: 'Trabajador desactivado' });
  } catch (error: any) {
    console.error('removeTrabajador:', error);
    res.status(500).json({
      message: mensajeError(error, 'Error al eliminar trabajador') + ' [' + debugAuth(req) + ']'
    });
  }
};