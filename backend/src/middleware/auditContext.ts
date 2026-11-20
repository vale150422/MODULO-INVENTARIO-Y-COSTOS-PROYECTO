import { Request, Response, NextFunction } from 'express';
import { auditStore } from '../database/index';
import { currentUserId } from '../utils/currentUser';

export const auditContext = (req: Request, _res: Response, next: NextFunction) => {
  const id = currentUserId(req);
  if (!id || Number.isNaN(id)) return next();
  auditStore.run({ idUsuario: id, ip: req.ip ?? null }, next);
};