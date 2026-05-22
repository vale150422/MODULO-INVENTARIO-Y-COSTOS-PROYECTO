import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener todos los productos con su último saldo
export const getProductos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_producto, p.nombre, p.unidadmedida,
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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener kardex de un producto (PEPS)
export const getKardex = async (req: Request, res: Response) => {
  const { id_producto } = req.params;
  try {
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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener Kardex' });
  }
};

// Obtener lotes disponibles (para PEPS)
export const getLotes = async (req: Request, res: Response) => {
  const { id_producto } = req.params;
  try {
    const result = await pool.query(`
      SELECT id_lote, cantidad, costo_unitario, factura, fecha_entrada
      FROM kardex_lote
      WHERE id_producto = $1 AND cantidad > 0
      ORDER BY fecha_entrada ASC
    `, [id_producto]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener lotes' });
  }
};

// Registrar movimiento PEPS
export const registrarMovimiento = async (req: Request, res: Response) => {
  const { id_producto, tipo, cantidad, costo_unitario, detalle, id_finca } = req.body;
  const id_usuario = (req as any).user?.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener saldo actual
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

      // Agregar lote PEPS
      await client.query(`
        INSERT INTO kardex_lote (id_producto, id_finca, cantidad, costo_unitario, factura)
        VALUES ($1, $2, $3, $4, $5)
      `, [id_producto, id_finca, cantidad, costo_unitario, detalle]);

    } else {
      // SALIDA — consumir lotes PEPS (más antiguos primero)
      if (cantidad > saldoActual.saldo_cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${saldoActual.saldo_cantidad}`);
      }

      // Obtener lotes ordenados por fecha (PEPS)
      const lotesResult = await client.query(`
        SELECT id_lote, cantidad, costo_unitario
        FROM kardex_lote
        WHERE id_producto = $1 AND cantidad > 0
        ORDER BY fecha_entrada ASC
      `, [id_producto]);

      let restante = cantidad;
      let costoTotal = 0;

      for (const lote of lotesResult.rows) {
        if (restante <= 0) break;
        const consumir = Math.min(lote.cantidad, restante);
        costoTotal += consumir * lote.costo_unitario;
        restante -= consumir;

        // Actualizar lote
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

    // Insertar en kardex
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
    res.json({ success: true, kardex: kardexResult.rows[0] });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Reporte consolidado
export const getReporteConsolidado = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_producto, p.nombre, p.unidadmedida,
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

    const totalInventario = result.rows.reduce(
      (acc: number, r: any) => acc + Number(r.saldo_valor), 0
    );

    const costoVentas = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM kardex WHERE tipo = 'SALIDA'
    `);

    res.json({
      productos: result.rows,
      totalInventario,
      costoVentas: costoVentas.rows[0].total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};