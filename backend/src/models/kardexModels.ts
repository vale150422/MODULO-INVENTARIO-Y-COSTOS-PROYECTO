import { pool } from '../database/index';

export interface Kardex {
  id_kardex?: number;
  id_producto: number;
  id_finca: number;
  id_usuario: number;
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
  saldo_cantidad: number;
  saldo_valor: number;
  detalle: string;
  fecha?: Date;
}

export const getProductos = async () => {
  const result = await pool.query(`
    SELECT 
      p.id_producto, p.nombre, p.unidadmedida,
      p.id_finca, p.stock_minimo,
      c.nombre as categoria, f.nombre as finca,
      COALESCE((
        SELECT k.saldo_cantidad 
        FROM kardex k 
        WHERE k.id_producto = p.id_producto 
        ORDER BY k.fecha DESC LIMIT 1
      ), 0) as saldo_cantidad,
      COALESCE((
        SELECT k.saldo_valor 
        FROM kardex k 
        WHERE k.id_producto = p.id_producto 
        ORDER BY k.fecha DESC LIMIT 1
      ), 0) as saldo_valor
    FROM producto p
    JOIN categoria c ON c.id_categoria = p.id_categoria
    JOIN finca f ON f.id_finca = p.id_finca
    ORDER BY p.nombre ASC
  `);
  return result.rows;
};

export const getKardexByProducto = async (id_producto: number) => {
  const result = await pool.query(`
    SELECT 
      k.id_kardex, k.tipo, k.cantidad, k.costo_unitario,
      k.total, k.saldo_cantidad, k.saldo_valor,
      k.detalle, k.fecha,
      u.nombre as usuario, p.nombre as producto,
      p.unidadmedida
    FROM kardex k
    JOIN producto p ON p.id_producto = k.id_producto
    JOIN usuario u ON u.id_usuario = k.id_usuario
    WHERE k.id_producto = $1
    ORDER BY k.fecha ASC
  `, [id_producto]);
  return result.rows;
};

export const getLotesByProducto = async (id_producto: number) => {
  const result = await pool.query(`
    SELECT id_lote, cantidad, costo_unitario, factura, fecha_entrada, fecha_vencimiento
    FROM kardex_lote
    WHERE id_producto = $1 AND cantidad > 0
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
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  detalle: string;
  fecha_vencimiento?: string | null;
}) => {
  const { id_producto, id_finca, id_usuario, tipo, cantidad, costo_unitario, detalle, fecha_vencimiento } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const saldoResult = await client.query(`
      SELECT saldo_cantidad, saldo_valor 
      FROM kardex 
      WHERE id_producto = $1 
      ORDER BY fecha DESC LIMIT 1
    `, [id_producto]);

    const saldoActual = saldoResult.rows[0] || { saldo_cantidad: 0, saldo_valor: 0 };
    let nuevaSaldoCant: number;
    let nuevaSaldoValor: number;
    let total: number;
    let costoFinal = costo_unitario;

    if (tipo === 'ENTRADA' || tipo === 'INICIO') {
      total = cantidad * costo_unitario;
      nuevaSaldoCant = Number(saldoActual.saldo_cantidad) + cantidad;
      nuevaSaldoValor = Number(saldoActual.saldo_valor) + total;

      await client.query(`
        INSERT INTO kardex_lote (id_producto, id_finca, cantidad, costo_unitario, factura, fecha_vencimiento)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id_producto, id_finca, cantidad, costo_unitario, detalle, fecha_vencimiento || null]);

    } else {
      if (cantidad > saldoActual.saldo_cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${saldoActual.saldo_cantidad}`);
      }

      const lotesResult = await client.query(`
        SELECT id_lote, cantidad, costo_unitario
        FROM kardex_lote
        WHERE id_producto = $1 AND cantidad > 0
        ORDER BY
          CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
          fecha_vencimiento ASC,
          fecha_entrada ASC
      `, [id_producto]);

      let restante = cantidad;
      let costoTotal = 0;

      for (const lote of lotesResult.rows) {
        if (restante <= 0) break;
        const consumir = Math.min(lote.cantidad, restante);
        costoTotal += consumir * lote.costo_unitario;
        restante -= consumir;

        await client.query(`
          UPDATE kardex_lote 
          SET cantidad = cantidad - $1 
          WHERE id_lote = $2
        `, [consumir, lote.id_lote]);
      }

      total = costoTotal;
      costoFinal = Math.round(costoTotal / cantidad);
      nuevaSaldoCant = Number(saldoActual.saldo_cantidad) - cantidad;
      nuevaSaldoValor = Number(saldoActual.saldo_valor) - costoTotal;
    }

    const kardexResult = await client.query(`
      INSERT INTO kardex 
        (id_producto, id_finca, id_usuario, tipo, cantidad, 
         costo_unitario, total, saldo_cantidad, saldo_valor, detalle)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      id_producto, id_finca, id_usuario, tipo,
      cantidad, costoFinal, total,
      nuevaSaldoCant, Math.max(0, nuevaSaldoValor),
      detalle
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
      c.nombre as categoria, f.nombre as finca,
      COALESCE(k.saldo_cantidad, 0) as saldo_cantidad,
      COALESCE(k.saldo_valor, 0) as saldo_valor,
      COALESCE(k.costo_unitario, 0) as costo_unitario
    FROM producto p
    JOIN categoria c ON c.id_categoria = p.id_categoria
    JOIN finca f ON f.id_finca = p.id_finca
    LEFT JOIN LATERAL (
      SELECT saldo_cantidad, saldo_valor, costo_unitario
      FROM kardex
      WHERE id_producto = p.id_producto
      ORDER BY fecha DESC LIMIT 1
    ) k ON TRUE
    ORDER BY c.nombre, p.nombre
  `);

  const totalInventario = productosResult.rows.reduce(
    (acc: number, r: any) => acc + Number(r.saldo_valor), 0
  );

  const costoVentas = await pool.query(`
    SELECT COALESCE(SUM(total), 0) as total
    FROM kardex WHERE tipo = 'SALIDA'
  `);

  const movimientos = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE tipo = 'ENTRADA' OR tipo = 'INICIO') as entradas,
      COUNT(*) FILTER (WHERE tipo = 'SALIDA') as salidas
    FROM kardex
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
  const totalProductos = await pool.query('SELECT COUNT(*) FROM producto WHERE activo = true');

  const valorInventario = await pool.query(`
    SELECT COALESCE(SUM(k.saldo_valor), 0) as total
    FROM (
      SELECT DISTINCT ON (id_producto) saldo_valor
      FROM kardex ORDER BY id_producto, fecha DESC
    ) k
  `);

  const movimientosHoy = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE tipo = 'ENTRADA') as entradas,
      COUNT(*) FILTER (WHERE tipo = 'SALIDA') as salidas
    FROM kardex
    WHERE DATE(fecha) = CURRENT_DATE
  `);

  const ultimosMovimientos = await pool.query(`
    SELECT 
      k.fecha, p.nombre as producto, k.tipo,
      k.cantidad, k.costo_unitario, k.total,
      p.unidadmedida
    FROM kardex k
    JOIN producto p ON p.id_producto = k.id_producto
    ORDER BY k.fecha DESC LIMIT 10
  `);

  // ✅ Usa stock_minimo de cada producto en vez de hardcodear 10
  const bajoStock = await pool.query(`
    SELECT COUNT(*) FROM (
      SELECT DISTINCT ON (k.id_producto) k.saldo_cantidad, p.stock_minimo
      FROM kardex k
      JOIN producto p ON p.id_producto = k.id_producto
      WHERE p.activo = true
      ORDER BY k.id_producto, k.fecha DESC
    ) sub
    WHERE sub.saldo_cantidad < sub.stock_minimo
  `);

  return {
    totalProductos: Number(totalProductos.rows[0].count),
    valorInventario: Number(valorInventario.rows[0].total),
    movimientosHoy: {
      entradas: Number(movimientosHoy.rows[0].entradas),
      salidas: Number(movimientosHoy.rows[0].salidas),
    },
    ultimosMovimientos: ultimosMovimientos.rows,
    bajoStock: Number(bajoStock.rows[0].count),
  };
};