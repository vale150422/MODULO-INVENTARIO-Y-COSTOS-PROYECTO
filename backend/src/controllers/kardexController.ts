import { Request, Response } from 'express';
import { pool } from '../database/connection';

// Obtener Kardex de un producto (método promedio ponderado)
export const getKardexByProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        m.id, m.fecha, m.tipo, m.cantidad, m.costo_unitario,
        m.concepto, p.nombre as producto
      FROM movimientos m
      JOIN productos p ON p.id = m.producto_id
      WHERE m.producto_id = $1
      ORDER BY m.fecha ASC
    `, [productId]);

    // Calcular saldo acumulado con promedio ponderado
    let saldoCant = 0, saldoTotal = 0;
    const kardex = result.rows.map((row: any) => {
      const subtotal = row.cantidad * row.costo_unitario;
      let costoPromedio = 0, saldoValor = 0;

      if (row.tipo === 'ENTRADA') {
        saldoCant += row.cantidad;
        saldoTotal += subtotal;
        costoPromedio = saldoTotal / saldoCant;
        saldoValor = saldoTotal;
      } else if (row.tipo === 'SALIDA') {
        costoPromedio = saldoCant > 0 ? saldoTotal / saldoCant : 0;
        saldoCant -= row.cantidad;
        saldoTotal -= row.cantidad * costoPromedio;
        saldoValor = saldoTotal;
      }

      return {
        ...row,
        subtotal: row.tipo !== 'SALDO_INICIAL' ? subtotal : 0,
        saldo_cantidad: saldoCant,
        costo_promedio: Math.round(costoPromedio),
        saldo_valor: Math.round(Math.max(0, saldoTotal)),
      };
    });

    res.json(kardex);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Kardex' });
  }
};

// Registrar movimiento y actualizar Kardex
export const registrarMovimiento = async (req: Request, res: Response) => {
  const { producto_id, tipo, cantidad, costo_unitario, concepto } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar stock disponible para salidas
    if (tipo === 'SALIDA') {
      const stock = await client.query(
        'SELECT stock_actual FROM productos WHERE id = $1', [producto_id]
      );
      if (stock.rows[0]?.stock_actual < cantidad) {
        throw new Error('Stock insuficiente');
      }
    }

    // Insertar movimiento
    await client.query(`
      INSERT INTO movimientos (producto_id, tipo, cantidad, costo_unitario, concepto, fecha)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [producto_id, tipo, cantidad, costo_unitario, concepto]);

    // Actualizar stock del producto
    const delta = tipo === 'ENTRADA' ? cantidad : -cantidad;
    await client.query(
      'UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2',
      [delta, producto_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Movimiento registrado' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};