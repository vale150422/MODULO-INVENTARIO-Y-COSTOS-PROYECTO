import { pool, auditStore } from '../database/index';
import { withAudit, AuditCtx } from '../database/audit';

export interface Producto {
  id_producto?: number;
  nombre: string;
  id_categoria: number;
  unidadMedida: string;
  id_finca: number;
  stock_minimo?: number;
}

const getCtx = (ctx?: AuditCtx): AuditCtx => {
  if (ctx?.idUsuario && !Number.isNaN(ctx.idUsuario)) return ctx;
  const s = auditStore.getStore();
  if (!s) throw new Error('No se pudo identificar al usuario para la auditoría');
  return { idUsuario: s.idUsuario, ip: s.ip };
};

const SELECT_PRODUCTO = `
  SELECT p.id_producto,
         p.nombre,
         p.unidadmedida,
         p.created_at,
         p.id_categoria,
         p.id_finca,
         p.activo,
         p.stock_minimo,
         c.nombre AS categoria_nombre,
         f.nombre AS finca_nombre
    FROM inventario.producto p
    LEFT JOIN inventario.categoria c ON c.id_categoria = p.id_categoria
    LEFT JOIN public.finca f ON f.idfinca = p.id_finca
`;

export const getProducts = async () => {
  const result = await pool.query(
    `${SELECT_PRODUCTO} ORDER BY p.activo DESC, p.nombre ASC`
  );
  return result.rows;
};

export const getProductById = async (id: number) => {
  const result = await pool.query(
    `${SELECT_PRODUCTO} WHERE p.id_producto = $1`, [id]
  );
  return result.rows[0];
};

export const createProduct = async (producto: Producto, ctx?: AuditCtx) => {
  const { nombre, id_categoria, unidadMedida, id_finca, stock_minimo = 10 } = producto;
  const id = await withAudit({ ...getCtx(ctx), modulo: 'INVENTARIO' }, async (client) => {
    const r = await client.query(
      `INSERT INTO inventario.producto (nombre, id_categoria, unidadmedida, id_finca, stock_minimo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_producto`,
      [nombre, id_categoria, unidadMedida, id_finca, stock_minimo]
    );
    return r.rows[0].id_producto;
  });
  return getProductById(id);
};

export const updateProduct = async (id: number, producto: Producto, ctx?: AuditCtx) => {
  const { nombre, id_categoria, unidadMedida, id_finca, stock_minimo = 10 } = producto;
  await withAudit({ ...getCtx(ctx), modulo: 'INVENTARIO' }, async (client) => {
    await client.query(
      `UPDATE inventario.producto
          SET nombre = $1, id_categoria = $2, unidadmedida = $3, id_finca = $4, stock_minimo = $5
        WHERE id_producto = $6`,
      [nombre, id_categoria, unidadMedida, id_finca, stock_minimo, id]
    );
  });
  return getProductById(id);
};

export const inactivarProduct = async (id: number, ctx?: AuditCtx) => {
  await withAudit(
    { ...getCtx(ctx), modulo: 'INVENTARIO', motivo: 'Insumo inactivado desde la aplicación' },
    async (client) => {
      await client.query('UPDATE inventario.producto SET activo = false WHERE id_producto = $1', [id]);
    }
  );
  return getProductById(id);
};

export const activarProduct = async (id: number, ctx?: AuditCtx) => {
  await withAudit(
    { ...getCtx(ctx), modulo: 'INVENTARIO', motivo: 'Insumo activado desde la aplicación' },
    async (client) => {
      await client.query('UPDATE inventario.producto SET activo = true WHERE id_producto = $1', [id]);
    }
  );
  return getProductById(id);
};