import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/index';
import { withAudit } from '../database/audit';
import { MODULO_INVENTARIO } from '../middleware/moduloMiddlewar';

const SECRET = process.env.JWT_SECRET || 'secret123';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.password, u.identificacion,
              r.nombre AS rol
         FROM public.usuario u
         JOIN public.roles r ON r.id_roles = u.id_roles
        WHERE lower(u.email) = lower($1)
          AND u.estado_registro = 1`,
      [String(email).trim()]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    let valid = await bcrypt.compare(password, user.password);

    // Trabajadores: también pueden entrar con su número de cédula
    if (!valid && user.rol === 'trabajador' && user.identificacion) {
      valid = String(password).trim() === String(user.identificacion).trim();
    }
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    // Si tu frontend espera otros nombres de rol (por ejemplo 'admin'), cámbialo aquí:
    
    const role = user.rol === 'administrador' ? 'admin' : 'empleado';

    // Los trabajadores solo entran si tienen asignado el módulo de inventario
    if (role !== 'admin') {
      const acceso = await pool.query(
        `SELECT 1 FROM public.v_usuario_modulos
          WHERE id_usuario = $1 AND codigo = $2
          LIMIT 1`,
        [user.id_usuario, MODULO_INVENTARIO]
      );
      if (!acceso.rowCount) {
        return res.status(403).json({
          error: 'No tienes acceso al módulo de inventario. Pídele al administrador que te lo asigne.',
          codigo: 'MODULO_NO_ASIGNADO',
        });
      }
    }

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, role, nombre: user.nombre },
      SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email, role }
    });
  } catch (error) {
    console.error('login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Requiere que lo ejecute un usuario ya autenticado (la auditoría necesita saber quién crea).
export const registro = async (req: Request, res: Response) => {
  const { nombre, email, password, rol = 'trabajador', identificacion } = req.body;
  const actor = Number((req as any).user?.id);
  try {
    const existe = await pool.query(
      'SELECT 1 FROM public.usuario WHERE lower(email) = lower($1)', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);

    const user = await withAudit(
      { idUsuario: actor, ip: req.ip, modulo: 'USUARIOS' },
      async (client) => {
        const r = await client.query(
          `INSERT INTO public.usuario (nombre, email, password, identificacion, id_roles)
           VALUES ($1, $2, $3, $4,
                   (SELECT id_roles FROM public.roles WHERE nombre = $5))
           RETURNING id_usuario, nombre, email`,
          [nombre, email, hash, identificacion ?? null, rol]
        );
        return r.rows[0];
      }
    );
    res.status(201).json({ message: 'Usuario creado', user: { ...user, rol } });
  } catch (error) {
    console.error('registro:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const cambiarPassword = async (req: Request, res: Response) => {
  const { actual, nueva } = req.body;
  const id = Number((req as any).user?.id);
  try {
    const result = await pool.query(
      'SELECT password FROM public.usuario WHERE id_usuario = $1 AND estado_registro = 1', [id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(actual, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(nueva, 10);
    await withAudit(
      { idUsuario: id, ip: req.ip, modulo: 'USUARIOS', motivo: 'Cambio de contraseña' },
      async (client) => {
        await client.query(
          'UPDATE public.usuario SET password = $1 WHERE id_usuario = $2', [hash, id]
        );
      }
    );
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('cambiarPassword:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};