import { Request, Response } from 'express';
import { pool } from '../database/index';
import {
  getProductos as getProductosModel,
  getKardexByProducto,
  getLotesByProducto,
  registrarMovimientoModel,
  getReporteConsolidadoModel,
  getDashboardModel
} from '../models/kardexModels';

export const getProductos = async (_req: Request, res: Response) => {
  try {
    const data = await getProductosModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getKardex = async (req: Request, res: Response) => {
  try {
    const { id_producto } = req.params;
    const data = await getKardexByProducto(Number(id_producto));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Kardex' });
  }
};

export const getLotes = async (req: Request, res: Response) => {
  const { id_producto } = req.params;
  try {
    const result = await pool.query(`
      SELECT id_lote, cantidad, costo_unitario, factura, 
             fecha_entrada, fecha_vencimiento
      FROM kardex_lote
      WHERE id_producto = $1 AND cantidad > 0
      ORDER BY 
        CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
        fecha_vencimiento ASC,
        fecha_entrada ASC
    `, [id_producto]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener lotes' });
  }
};

export const registrarMovimiento = async (req: Request, res: Response) => {
  const { id_producto, tipo, cantidad, costo_unitario, detalle, id_finca, fecha_vencimiento } = req.body;
  const id_usuario = (req as any).user?.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ✅ Validar que el producto esté activo
    const productoResult = await client.query(
      'SELECT nombre, activo FROM producto WHERE id_producto = $1',
      [id_producto]
    );

    if (productoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Producto no encontrado' });
    }

    if (!productoResult.rows[0].activo) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `El producto "${productoResult.rows[0].nombre}" está inactivo y no permite movimientos`
      });
    }

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
        INSERT INTO kardex_lote 
          (id_producto, id_finca, cantidad, costo_unitario, factura, fecha_vencimiento)
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
    res.json({ success: true, kardex: kardexResult.rows[0] });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getReporteConsolidado = async (_req: Request, res: Response) => {
  try {
    const data = await getReporteConsolidadoModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const data = await getDashboardModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar dashboard' });
  }
};