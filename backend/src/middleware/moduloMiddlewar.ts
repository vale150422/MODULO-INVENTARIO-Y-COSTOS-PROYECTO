import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/index';
import { currentUserId } from '../utils/currentUser';

// Deja pasar solo a quien tenga asignado el módulo (los administradores entran a todos).
// Consulta la base en cada petición: si el administrador le quita el módulo a alguien,
// el bloqueo es inmediato, aunque esa persona ya tenga la sesión abierta.
// Debe ir DESPUÉS de authenticate.
export const requireModulo = (codigo: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idUsuario = currentUserId(req);
      if (!idUsuario || Number.isNaN(idUsuario)) {
        return res.status(401).json({ error: 'Sesión inválida. Cierra sesión y vuelve a entrar.' });
      }

      const r = await pool.query(
        `SELECT 1
           FROM public.v_usuario_modulos
          WHERE id_usuario = $1 AND codigo = $2
          LIMIT 1`,
        [idUsuario, codigo]
      );

      if (!r.rowCount) {
        return res.status(403).json({
          error: 'No tienes acceso a este módulo. Pídele al administrador que te lo asigne.',
          codigo: 'MODULO_NO_ASIGNADO',
        });
      }
      next();
    } catch (error: any) {
      console.error('requireModulo:', error);
      res.status(500).json({ error: 'No se pudo verificar el acceso al módulo' });
    }
  };