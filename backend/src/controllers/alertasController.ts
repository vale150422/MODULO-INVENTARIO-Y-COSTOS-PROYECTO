import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  obtenerLotesPorVencer,
  ejecutarAlertasCorreo,
  obtenerCorreos,
  agregarCorreo,
  cambiarEstadoCorreo,
  eliminarCorreo,
  normalizarCorreo,
} from '../services/alertasService';

const esAdmin = (req: AuthRequest, res: Response): boolean => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Solo el administrador puede hacer esta acción' });
    return false;
  }
  return true;
};

export const getVencimientos = async (req: Request, res: Response) => {
  try {
    const dias = Math.min(Math.max(Number(req.query.dias) || 30, 1), 365);
    const lotes = await obtenerLotesPorVencer(dias);
    res.json(lotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alertas de vencimiento' });
  }
};

export const enviarCorreoManual = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    const dias = Math.min(Math.max(Number(req.body?.dias) || 30, 1), 365);
    const resumen = await ejecutarAlertasCorreo(true, dias);
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar las alertas' });
  }
};

export const getCorreos = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    res.json(await obtenerCorreos());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los correos' });
  }
};

export const addCorreo = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;

  const nombre = String(req.body.nombre || '').trim();
  const correo = normalizarCorreo(String(req.body.correo || ''));

  if (!nombre) return res.status(400).json({ error: 'Ingresa un nombre' });
  if (!correo) {
    return res.status(400).json({
      error: 'Correo inválido. Escríbelo completo, ej: administrador@gmail.com',
    });
  }

  try {
    const nuevo = await agregarCorreo(nombre, correo);
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ese correo ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el correo' });
  }
};

export const toggleCorreo = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    await cambiarEstadoCorreo(Number(req.params.id), Boolean(req.body.activo));
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el correo' });
  }
};

export const deleteCorreo = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    await eliminarCorreo(Number(req.params.id));
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el correo' });
  }
};