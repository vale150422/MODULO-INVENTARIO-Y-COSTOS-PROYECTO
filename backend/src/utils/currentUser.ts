import { Request } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret123';

// Saca el token de la cabecera Authorization ("Bearer xxx" o solo "xxx")
const getToken = (req: Request): string => {
  const header = String(req.headers.authorization || '').trim();
  if (!header) return '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : header;
};

// Devuelve el id del usuario logueado, sin importar cómo lo guarde el middleware
export const currentUserId = (req: Request): number => {
  const r = req as any;
  const fromReq = r.user?.id ?? r.user?.id_usuario ?? r.usuario?.id ?? r.userId;
  if (fromReq) return Number(fromReq);

  const token = getToken(req);
  if (!token) return NaN;
  try {
    const payload: any = jwt.verify(token, SECRET);
    return Number(payload.id ?? payload.id_usuario);
  } catch {
    return NaN;
  }
};

// Explica por qué no se pudo identificar al usuario (solo para depurar)
export const debugAuth = (req: Request): string => {
  const token = getToken(req);
  if (!token) return 'sin cabecera Authorization';
  try {
    const p: any = jwt.verify(token, SECRET);
    return 'token válido, campos: ' + Object.keys(p).join(', ');
  } catch (e: any) {
    return 'token inválido: ' + e.message;
  }
};