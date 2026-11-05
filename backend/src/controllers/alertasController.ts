import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  obtenerLotesPorVencer,
  ejecutarAlertasSMS,
  obtenerTelefonos,
  agregarTelefono,
  cambiarEstadoTelefono,
  eliminarTelefono,
  normalizarTelefono,
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

export const enviarSMSManual = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    const resumen = await ejecutarAlertasSMS();
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar las alertas' });
  }
};

export const getTelefonos = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    res.json(await obtenerTelefonos());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los números' });
  }
};

export const addTelefono = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;

  const nombre = String(req.body.nombre || '').trim();
  const telefono = normalizarTelefono(String(req.body.telefono || ''));

  if (!nombre) return res.status(400).json({ error: 'Ingresa un nombre' });
  if (!telefono) {
    return res.status(400).json({
      error: 'Número inválido. Usa un celular colombiano de 10 dígitos, ej: 300 123 4567',
    });
  }

  try {
    const nuevo = await agregarTelefono(nombre, telefono);
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ese número ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el número' });
  }
};

export const toggleTelefono = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    await cambiarEstadoTelefono(Number(req.params.id), Boolean(req.body.activo));
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el número' });
  }
};

export const deleteTelefono = async (req: AuthRequest, res: Response) => {
  if (!esAdmin(req, res)) return;
  try {
    await eliminarTelefono(Number(req.params.id));
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el número' });
  }
};