import { pool, auditStore } from '../database/index';
import { withAudit, AuditCtx } from '../database/audit';

// Usuario que hace la acción: el del controlador o, si no, el del contexto de la petición
const getCtx = (ctx?: AuditCtx): AuditCtx => {
  if (ctx?.idUsuario && !Number.isNaN(ctx.idUsuario)) return ctx;
  const s = auditStore.getStore();
  if (!s) throw new Error('No se pudo identificar al usuario para la auditoría');
  return { idUsuario: s.idUsuario, ip: s.ip };
};

export const getCategorias = async () => {
  const result = await pool.query('SELECT * FROM inventario.categoria ORDER BY nombre');
  return result.rows;
};

export const createCategoria = async (nombre: string, ctx?: AuditCtx) => {
  return withAudit({ ...getCtx(ctx), modulo: 'INVENTARIO' }, async (client) => {
    const result = await client.query(
      'INSERT INTO inventario.categoria (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    return result.rows[0];
  });
};

// Esta tabla no tiene estado: se elimina. Si tiene productos, la base lo impide (error 23503).
export const deleteCategoria = async (id: number, ctx?: AuditCtx) => {
  await withAudit({ ...getCtx(ctx), modulo: 'INVENTARIO' }, async (client) => {
    await client.query('DELETE FROM inventario.categoria WHERE id_categoria = $1', [id]);
  });
};