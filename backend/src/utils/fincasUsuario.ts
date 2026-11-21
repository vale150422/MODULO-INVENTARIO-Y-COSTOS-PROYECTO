import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/index';
import { currentUserId } from './currentUser';

const SECRET = process.env.JWT_SECRET || 'secret123';

// Rol del usuario logueado ('admin' o 'empleado'), leído del token
export const currentUserRole = (req: Request): string => {
  const r = req as any;
  if (r.user?.role) return String(r.user.role);
  const header = String(req.headers.authorization || '').trim();
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : header;
  if (!token) return '';
  try {
    const payload: any = jwt.verify(token, SECRET);
    return String(payload.role || '');
  } catch {
    return '';
  }
};

export const esAdmin = (req: Request): boolean => currentUserRole(req) === 'admin';

// Fincas que el usuario puede ver.
//   null  → administrador: ve todas
//   [...] → trabajador: solo las asignadas en usuario_finca (puede ser [] si no tiene ninguna)
export const fincasPermitidas = async (req: Request): Promise<number[] | null> => {
  if (esAdmin(req)) return null;
  const id = currentUserId(req);
  if (!id || Number.isNaN(id)) return [];
  const result = await pool.query(
    `SELECT uf.idfinca
       FROM public.usuario_finca uf
       JOIN public.finca f ON f.idfinca = uf.idfinca
      WHERE uf.id_usuario = $1 AND f.estado_registro = 1`,
    [id]
  );
  return result.rows.map((r: any) => Number(r.idfinca));
};

// ¿El usuario puede ver/mover este insumo? (según la finca del insumo)
export const puedeVerProducto = async (req: Request, idProducto: number): Promise<boolean> => {
  const fincas = await fincasPermitidas(req);
  if (fincas === null) return true;
  const result = await pool.query(
    'SELECT 1 FROM inventario.producto WHERE id_producto = $1 AND id_finca = ANY($2::int[])',
    [idProducto, fincas]
  );
  return (result.rowCount ?? 0) > 0;
};

// ¿El usuario puede ver este movimiento del kardex?
export const puedeVerKardex = async (req: Request, idKardex: number): Promise<boolean> => {
  const fincas = await fincasPermitidas(req);
  if (fincas === null) return true;
  const result = await pool.query(
    `SELECT 1 FROM inventario.kardex k
       JOIN inventario.producto p ON p.id_producto = k.id_producto
      WHERE k.id_kardex = $1 AND p.id_finca = ANY($2::int[])`,
    [idKardex, fincas]
  );
  return (result.rowCount ?? 0) > 0;
};

export const SIN_PERMISO_FINCA = 'No tienes acceso a esta finca';