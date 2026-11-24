import { pool } from '../database/index';

export interface Kardex {
  id_kardex?: number;
  id_producto: number;
  id_finca: number;
  id_usuario: number;
  id_usuario_recibe?: number | null;
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
  saldo_cantidad: number;
  saldo_valor: number;
  detalle: string;
  descripcion?: string | null;
  fecha?: Date;
}

export const getProductos = async () => {
  const result = await pool.query(`
    SELECT
      p.id_producto, p.nombre, p.unidadmedida,
      p.id_finca, p.stock_minimo,
      p.activo,
      c.nombre AS categoria, f.nombre AS finca,
      COALESCE((
        SELECT k.saldo_cantidad
          FROM inventario.kardex k
         WHERE k.id_producto = p.id_producto
         ORDER BY k.fecha DESC, k.id_kardex DESC LIMIT 1
      ), 0) AS saldo_cantidad,
      COALESCE((
        SELECT k.saldo_valor
          FROM inventario.kardex k
         WHERE k.id_producto = p.id_producto
         ORDER BY k.fecha DESC, k.id_kardex DESC LIMIT 1
      ), 0) AS saldo_valor
    FROM inventario.producto p
    JOIN inventario.categoria c ON c.id_categoria = p.id_categoria
    JOIN public.finca f ON f.idfinca = p.id_finca
    ORDER BY p.nombre ASC
  `);
  return result.rows;
};

// Movimientos del kardex de UNA finca
export const getKardexByFinca = async (id_finca: number) => {
  const result = await pool.query(`
    SELECT
      k.id_kardex, k.tipo, k.cantidad, k.costo_unitario,
      k.total, k.saldo_cantidad, k.saldo_valor,
      k.detalle, k.descripcion, k.fecha,
      u.nombre AS usuario, ur.nombre AS recibe, p.nombre AS producto,
      p.unidadmedida
    FROM inventario.kardex k
    JOIN inventario.producto p ON p.id_producto = k.id_producto
    JOIN public.usuario u ON u.id_usuario = k.id_usuario
    LEFT JOIN public.usuario ur ON ur.id_usuario = k.id_usuario_recibe
    WHERE k.id_finca = $1
    ORDER BY k.fecha DESC, k.id_kardex DESC
  `, [id_finca]);
  return result.rows;
};

// Personas a las que se les puede entregar un producto (lista desplegable "Entregar a")
export const getReceptoresModel = async () => {
  const result = await pool.query(`
    SELECT id_usuario, nombre, cargo, rol
      FROM inventario.v_receptores_kardex
     ORDER BY nombre ASC
  `);
  return result.rows;
};

export const getKardexByProducto = async (id_producto: number) => {
  const result = await pool.query(`
    SELECT
      k.id_kardex, k.tipo, k.cantidad, k.costo_unitario,
      k.total, k.saldo_cantidad, k.saldo_valor,
      k.detalle, k.descripcion, k.fecha,
      u.nombre AS usuario, ur.nombre AS recibe, p.nombre AS producto,
      p.unidadmedida
    FROM inventario.kardex k
    JOIN inventario.producto p ON p.id_producto = k.id_producto
    JOIN public.usuario u ON u.id_usuario = k.id_usuario
    LEFT JOIN public.usuario ur ON ur.id_usuario = k.id_usuario_recibe
    WHERE k.id_producto = $1
    ORDER BY k.fecha ASC, k.id_kardex ASC
  `, [id_producto]);
  return result.rows;
};

// "cantidad" es lo que entró; lo que queda por consumir es cantidad_disponible
export const getLotesByProducto = async (id_producto: number) => {
  const result = await pool.query(`
    SELECT id_lote, cantidad_disponible AS cantidad, costo_unitario, factura,
           fecha_entrada, fecha_vencimiento
      FROM inventario.kardex_lote
     WHERE id_producto = $1 AND cantidad_disponible > 0
     ORDER BY
       CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
       fecha_vencimiento ASC,
       fecha_entrada ASC
  `, [id_producto]);
  return result.rows;
};

export const registrarMovimientoModel = async (data: {
  id_producto: number;
  id_finca: number;
  id_usuario: number;
  id_usuario_recibe?: number | null;
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  detalle: string;
  descripcion?: string | null;
  fecha_vencimiento?: string | null;
  ip?: string | null; // IP de quien registra (para la auditoría)
}) => {
  const { id_producto, id_finca, id_usuario, tipo, fecha_vencimiento } = data;
  const detalle = data.detalle;
  const descripcion = (data.descripcion ?? '').toString().trim() || null;
  const cantidad = Number(data.cantidad);
  const costo_unitario = Number(data.costo_unitario);
  const idRecibe = tipo === 'SALIDA' ? (data.id_usuario_recibe ?? null) : null;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // La base unificada exige el contexto de auditoría en cada transacción que escribe
    await client.query(
      `SELECT public.fn_auditoria_contexto($1, $2, NULL, NULL, 'INVENTARIO', $3)`,
      [id_usuario, data.ip ?? null, descripcion || detalle || null]
    );

    const saldoResult = await client.query(`
      SELECT saldo_cantidad, saldo_valor
        FROM inventario.kardex
       WHERE id_producto = $1
       ORDER BY fecha DESC, id_kardex DESC LIMIT 1
    `, [id_producto]);

    const saldoActual = saldoResult.rows[0] || { saldo_cantidad: 0, saldo_valor: 0 };
    let nuevaSaldoCant: number;
    let nuevaSaldoValor: number;
    let total: number;
    let costoFinal = costo_unitario;
    let idLoteKardex: number | null = null;

    if (tipo === 'ENTRADA' || tipo === 'INICIO') {
      total = cantidad * costo_unitario;
      nuevaSaldoCant = Number(saldoActual.saldo_cantidad) + cantidad;
      nuevaSaldoValor = Number(saldoActual.saldo_valor) + total;

      const lote = await client.query(`
        INSERT INTO inventario.kardex_lote
          (id_producto, id_finca, cantidad, costo_unitario, factura, fecha_vencimiento)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_lote
      `, [id_producto, id_finca, cantidad, costo_unitario, detalle, fecha_vencimiento || null]);
      idLoteKardex = lote.rows[0].id_lote;

    } else {
      if (cantidad > Number(saldoActual.saldo_cantidad)) {
        throw new Error(`Stock insuficiente. Disponible: ${saldoActual.saldo_cantidad}`);
      }

      const lotesResult = await client.query(`
        SELECT id_lote, cantidad_disponible, costo_unitario
          FROM inventario.kardex_lote
         WHERE id_producto = $1 AND cantidad_disponible > 0
         ORDER BY
           CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
           fecha_vencimiento ASC,
           fecha_entrada ASC
         FOR UPDATE
      `, [id_producto]);

      let restante = cantidad;
      let costoTotal = 0;
      const usados: number[] = [];

      for (const lote of lotesResult.rows) {
        if (restante <= 0) break;
        const consumir = Math.min(Number(lote.cantidad_disponible), restante);
        costoTotal += consumir * Number(lote.costo_unitario);
        restante = Math.round((restante - consumir) * 100) / 100;
        usados.push(lote.id_lote);

        await client.query(`
          UPDATE inventario.kardex_lote
             SET cantidad_disponible = cantidad_disponible - $1
           WHERE id_lote = $2
        `, [consumir, lote.id_lote]);
      }

      if (restante > 0) throw new Error('Stock insuficiente en los lotes disponibles');

      total = costoTotal;
      costoFinal = Math.round(costoTotal / cantidad);
      nuevaSaldoCant = Number(saldoActual.saldo_cantidad) - cantidad;
      nuevaSaldoValor = Number(saldoActual.saldo_valor) - costoTotal;
      idLoteKardex = usados.length === 1 ? usados[0] : null;
    }

    const kardexResult = await client.query(`
      INSERT INTO inventario.kardex
        (id_producto, id_finca, id_usuario, tipo, cantidad,
         costo_unitario, total, saldo_cantidad, saldo_valor, detalle, descripcion, id_lote,
         id_usuario_recibe)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      id_producto, id_finca, id_usuario, tipo,
      cantidad, costoFinal, total,
      nuevaSaldoCant, Math.max(0, nuevaSaldoValor),
      detalle, descripcion, idLoteKardex, idRecibe
    ]);

    await client.query('COMMIT');
    return kardexResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getReporteConsolidadoModel = async () => {
  const productosResult = await pool.query(`
    SELECT
      p.id_producto, p.nombre, p.unidadmedida,
      p.stock_minimo,
      c.nombre AS categoria, f.nombre AS finca,
      COALESCE(k.saldo_cantidad, 0) AS saldo_cantidad,
      COALESCE(k.saldo_valor, 0) AS saldo_valor,
      COALESCE(k.costo_unitario, 0) AS costo_unitario
    FROM inventario.producto p
    JOIN inventario.categoria c ON c.id_categoria = p.id_categoria
    JOIN public.finca f ON f.idfinca = p.id_finca
    LEFT JOIN LATERAL (
      SELECT saldo_cantidad, saldo_valor, costo_unitario
        FROM inventario.kardex
       WHERE id_producto = p.id_producto
       ORDER BY fecha DESC, id_kardex DESC LIMIT 1
    ) k ON TRUE
    ORDER BY c.nombre, p.nombre
  `);

  const totalInventario = productosResult.rows.reduce(
    (acc: number, r: any) => acc + Number(r.saldo_valor), 0
  );

  const costoVentas = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS total
      FROM inventario.kardex WHERE tipo = 'SALIDA'
  `);

  const movimientos = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE tipo = 'ENTRADA' OR tipo = 'INICIO') AS entradas,
      COUNT(*) FILTER (WHERE tipo = 'SALIDA') AS salidas
    FROM inventario.kardex
  `);

  return {
    productos: productosResult.rows,
    totalInventario,
    costoVentas: costoVentas.rows[0].total,
    totalEntradas: Number(movimientos.rows[0].entradas),
    totalSalidas: Number(movimientos.rows[0].salidas),
  };
};

export const getDashboardModel = async () => {
  const totalProductos = await pool.query(
    'SELECT COUNT(*) FROM inventario.producto WHERE activo = true'
  );

  const valorInventario = await pool.query(`
    SELECT COALESCE(SUM(k.saldo_valor), 0) AS total
    FROM (
      SELECT DISTINCT ON (id_producto) saldo_valor
        FROM inventario.kardex
       ORDER BY id_producto, fecha DESC, id_kardex DESC
    ) k
  `);

  const movimientosHoy = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE tipo = 'ENTRADA') AS entradas,
      COUNT(*) FILTER (WHERE tipo = 'SALIDA') AS salidas
    FROM inventario.kardex
    WHERE DATE(fecha) = CURRENT_DATE
  `);

  const ultimosMovimientos = await pool.query(`
    SELECT
      k.fecha, p.nombre AS producto, k.tipo,
      k.cantidad, k.costo_unitario, k.total,
      p.unidadmedida
    FROM inventario.kardex k
    JOIN inventario.producto p ON p.id_producto = k.id_producto
    ORDER BY k.fecha DESC, k.id_kardex DESC LIMIT 10
  `);

  // Alerta cuando hay existencias y el saldo es menor O IGUAL al stock mínimo.
  // Un insumo agotado (saldo 0) no es alerta de stock mínimo.
  const productosBajoStock = await pool.query(`
    SELECT p.id_producto, p.nombre, p.unidadmedida, p.stock_minimo,
           f.nombre AS finca,
           COALESCE(k.saldo_cantidad, 0) AS saldo_cantidad
      FROM inventario.producto p
      JOIN public.finca f ON f.idfinca = p.id_finca
      LEFT JOIN LATERAL (
        SELECT saldo_cantidad
          FROM inventario.kardex
         WHERE id_producto = p.id_producto
         ORDER BY fecha DESC, id_kardex DESC LIMIT 1
      ) k ON TRUE
     WHERE p.activo = true
       AND COALESCE(k.saldo_cantidad, 0) > 0
       AND COALESCE(k.saldo_cantidad, 0) <= p.stock_minimo
     ORDER BY COALESCE(k.saldo_cantidad, 0) ASC, p.nombre
  `);

  // Entradas y salidas (en pesos) de los últimos 7 días
  const movimientosPorDia = await pool.query(`
    SELECT to_char(d.dia, 'YYYY-MM-DD') AS dia,
           COALESCE(SUM(k.total) FILTER (WHERE k.tipo IN ('ENTRADA','INICIO')), 0) AS entradas,
           COALESCE(SUM(k.total) FILTER (WHERE k.tipo = 'SALIDA'), 0) AS salidas
      FROM generate_series(
             (CURRENT_DATE - 6)::timestamp, CURRENT_DATE::timestamp, interval '1 day'
           ) AS d(dia)
      LEFT JOIN inventario.kardex k ON DATE(k.fecha) = d.dia::date
     GROUP BY d.dia
     ORDER BY d.dia
  `);

  // Valor del inventario por categoría
  const valorPorCategoria = await pool.query(`
    SELECT c.nombre AS categoria, COALESCE(SUM(k.saldo_valor), 0) AS valor
      FROM inventario.producto p
      JOIN inventario.categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN LATERAL (
        SELECT saldo_valor
          FROM inventario.kardex
         WHERE id_producto = p.id_producto
         ORDER BY fecha DESC, id_kardex DESC LIMIT 1
      ) k ON TRUE
     WHERE p.activo = true
     GROUP BY c.nombre
    HAVING COALESCE(SUM(k.saldo_valor), 0) > 0
     ORDER BY valor DESC
  `);

  return {
    totalProductos: Number(totalProductos.rows[0].count),
    valorInventario: Number(valorInventario.rows[0].total),
    movimientosHoy: {
      entradas: Number(movimientosHoy.rows[0].entradas),
      salidas: Number(movimientosHoy.rows[0].salidas),
    },
    ultimosMovimientos: ultimosMovimientos.rows,
    bajoStock: productosBajoStock.rows.length,
    productosBajoStock: productosBajoStock.rows,
    movimientosPorDia: movimientosPorDia.rows,
    valorPorCategoria: valorPorCategoria.rows,
  };
};