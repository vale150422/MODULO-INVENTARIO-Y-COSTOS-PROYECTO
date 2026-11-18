import { Request, Response, NextFunction } from 'express';
import { auditStore } from '../database/index';

export const auditContext = (req: Request, _res: Response, next: NextFunction) => {
  const u = (req as any).user;
  if (!u?.id) return next();
  auditStore.run({ idUsuario: Number(u.id), ip: req.ip ?? null }, next);
};