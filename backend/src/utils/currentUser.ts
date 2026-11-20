import { Request } from 'express';
import jwt from 'jsonwebtoken';

// Devuelve el id del usuario logueado, sin importar cómo lo guarde el middleware
export const currentUserId = (req: Request): number => {
  const r = req as any;
  const fromReq = r.user?.id ?? r.user?.id_usuario ?? r.usuario?.id ?? r.userId;
  if (fromReq) return Number(fromReq);

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return NaN;
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    return Number(payload.id);
  } catch {
    return NaN;
  }
};