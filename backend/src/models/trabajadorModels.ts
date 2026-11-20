import bcrypt from 'bcryptjs';
import { pool, auditStore } from '../database/index';
import { withAudit, AuditCtx } from '../database/audit';

export interface Trabajador {
  id_trabajador?: number;
  nombre: string;
  cedula: string;
  cargo: string;
  id_finca: number;
  telefono: string;
  correo: string;
  estado: string;
}

// Usuario que hace la acción: el que viene del controlador o, si no, el del contexto
const getCtx = (ctx?: AuditCtx): AuditCtx => {
  if (ctx?.idUsuario && !Number.isNaN(ctx.idUsuario)) return ctx;
  const s = auditStore.getStore();
  if (!s) throw new Error('No se pudo identificar al usuario para la auditoría');
  return { idUsuario: s.idUsuario, ip: s.ip };
};

// Un trabajador es un usuario con rol "trabajador". Si tiene varias fincas, se muestra la primera.
const SELECT_TRABAJADOR = `
  SELECT DISTINCT ON (u.id_usuario)
         u.id_usuario AS id_trabajador,
         u.nombre,
         u.identificacion AS cedula,
         u.cargo,
         u.telefono,
         u.email AS correo,
         CASE WHEN u.estado_registro = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
         u.created_at,
         f.idfinca AS id_finca,
         f.nombre AS finca_nombre
    FROM public.usuario u
    JOIN public.roles r ON r.id_roles = u.id_roles AND r.nombre = 'trabajador'
    LEFT JOIN public.usuario_finca uf ON uf.id_usuario = u.id_usuario
    LEFT JOIN public.finca f ON f.idfinca = uf.idfinca
`;

export const getTrabajadores = async () => {
  const result = await pool.query(`
    SELECT * FROM (
      ${SELECT_TRABAJADOR}
      ORDER BY u.id_usuario, uf.idusuario_finca
    ) t
    ORDER BY created_at DESC, id_trabajador DESC
  `);
  return result.rows;
};

export const getTrabajadorById = async (id: number) => {
  const result = await pool.query(
    `${SELECT_TRABAJADOR}
     WHERE u.id_usuario = $1
     ORDER BY u.id_usuario, uf.idusuario_finca`,
    [id]
  );
  return result.rows[0];
};

export const createTrabajador = async (t: Trabajador, ctx?: AuditCtx) => {
  const { nombre, cedula, cargo, id_finca, telefono, correo, estado } = t;
  if (!nombre || nombre.trim().split(/\s+/).length < 2) {
    throw new Error('Ingresa nombre y apellido del trabajador');
  }
  // La contraseña inicial es la cédula (el login también la acepta directamente)
  const hash = await bcrypt.hash(String(cedula).trim(), 10);
  const activo = String(estado ?? 'activo').toLowerCase() === 'activo' ? 1 : 0;

  const id = await withAudit({ ...getCtx(ctx), modulo: 'USUARIOS' }, async (client) => {
    const r = await client.query(
      `INSERT INTO public.usuario
         (nombre, email, password, identificacion, cargo, telefono, id_roles, estado_registro)
       VALUES ($1, $2, $3, $4, $5, $6,
               (SELECT id_roles FROM public.roles WHERE nombre = 'trabajador'), $7)
       RETURNING id_usuario`,
      [nombre.trim(), correo, hash, String(cedula).trim(), cargo, telefono, activo]
    );
    const idUsuario = r.rows[0].id_usuario;
    if (id_finca) {
      await client.query(
        'INSERT INTO public.usuario_finca (id_usuario, idfinca) VALUES ($1, $2)',
        [idUsuario, id_finca]
      );
    }
    return idUsuario;
  });
  return getTrabajadorById(id);
};

export const updateTrabajador = async (id: number, t: Trabajador, ctx?: AuditCtx) => {
  const { nombre, cedula, cargo, id_finca, telefono, correo, estado } = t;
  if (!nombre || nombre.trim().split(/\s+/).length < 2) {
    throw new Error('Ingresa nombre y apellido del trabajador');
  }
  const activo = String(estado ?? 'activo').toLowerCase() === 'activo' ? 1 : 0;

  await withAudit({ ...getCtx(ctx), modulo: 'USUARIOS' }, async (client) => {
    await client.query(
      `UPDATE public.usuario
          SET nombre = $1, identificacion = $2, cargo = $3, telefono = $4,
              email = $5, estado_registro = $6
        WHERE id_usuario = $7`,
      [nombre.trim(), String(cedula).trim(), cargo, telefono, correo, activo, id]
    );
    await client.query('DELETE FROM public.usuario_finca WHERE id_usuario = $1', [id]);
    if (id_finca) {
      await client.query(
        'INSERT INTO public.usuario_finca (id_usuario, idfinca) VALUES ($1, $2)',
        [id, id_finca]
      );
    }
  });
  return getTrabajadorById(id);
};

// No se borra: se desactiva
export const deleteTrabajador = async (id: number, ctx?: AuditCtx) => {
  await withAudit(
    { ...getCtx(ctx), modulo: 'USUARIOS', motivo: 'Desactivado desde la aplicación' },
    async (client) => {
      await client.query(
        'UPDATE public.usuario SET estado_registro = 0 WHERE id_usuario = $1',
        [id]
      );
    }
  );
};