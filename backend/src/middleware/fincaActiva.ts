// backend/src/middleware/fincaActiva.ts
// Lee la cabecera X-Finca-Id, valida que el usuario tenga permiso sobre esa finca
// y deja el resultado en res.locals.idFinca (number | null).
//
// Úsalo DESPUÉS del middleware que identifica al usuario, en las rutas de los
// módulos que se filtran por finca (kardex, trabajadores, proveedores, productos,
// alertas...). NO lo uses en authRoutes ni en fincaRoutes (esas necesitan ver
// todas las fincas).
import { Request, Response, NextFunction } from 'express';
import { fincasPermitidas, SIN_PERMISO_FINCA } from '../utils/fincasUsuario';

export const fincaActiva = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const crudo = req.get('x-finca-id');
    if (!crudo) {
      res.locals.idFinca = null; // sin finca elegida: se mantiene el comportamiento anterior
      return next();
    }

    const idFinca = Number(crudo);
    if (!Number.isInteger(idFinca)) {
      return res.status(400).json({ error: 'Finca inválida' });
    }

    const permitidas = await fincasPermitidas(req); // null = administrador (todas)
    if (permitidas !== null && !permitidas.includes(idFinca)) {
      return res.status(403).json({ error: SIN_PERMISO_FINCA });
    }

    res.locals.idFinca = idFinca;
    next();
  } catch (error: any) {
    console.error('fincaActiva:', error);
    res.status(500).json({ error: 'No se pudo validar la finca activa' });
  }
};