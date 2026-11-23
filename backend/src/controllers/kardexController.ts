import { Request, Response } from 'express';
import { pool } from '../database/index';
import {
  getProductos as getProductosModel,
  getKardexByProducto,
  getReceptoresModel,
  getReporteConsolidadoModel,
  getDashboardModel
} from '../models/kardexModels';
import { currentUserId } from '../utils/currentUser';

export const getProductos = async (_req: Request, res: Response) => {
  try {
    res.json(await getProductosModel());
  } catch (error: any) {
    console.error('getProductos:', error);
    res.status(500).json({ error: error.message || 'Error al obtener productos' });
  }
};

// Lista desplegable "Entregar a"
export const getReceptores = async (_req: Request, res: Response) => {
  try {
    res.json(await getReceptoresModel());
  } catch (error: any) {
    console.error('getReceptores:', error);
    res.status(500).json({ error: error.message || 'Error al obtener las personas receptoras' });
  }
};

export const getKardex = async (req: Request, res: Response) => {
  try {
    res.json(await getKardexByProducto(Number(req.params.id_producto)));
  } catch (error: any) {
    console.error('getKardex:', error);
    res.status(500).json({ error: error.message || 'Error al obtener Kardex' });
  }
};

export const getLotes = async (req: Request, res: Response) => {
  const { id_producto } = req.params;
  try {
    const result = await pool.query(`
      SELECT id_lote, cantidad_disponible AS cantidad, costo_unitario, factura,
             fecha_entrada, fecha_vencimiento,
             numero_lote, factura_proveedor
        FROM inventario.kardex_lote
       WHERE id_producto = $1 AND cantidad_disponible > 0
       ORDER BY
         CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
         fecha_vencimiento ASC,
         fecha_entrada ASC
    `, [id_producto]);
    res.json(result.rows);
  } catch (error: any) {
    console.error('getLotes:', error);
    res.status(500).json({ error: error.message || 'Error al obtener lotes' });
  }
};

export const registrarMovimiento = async (req: Request, res: Response) => {
  const { id_producto, tipo, id_finca, fecha_vencimiento, id_lote } = req.body;
  const cantidad = Number(req.body.cantidad);
  const costo_unitario = Number(req.body.costo_unitario);
  let detalle: string = (req.body.detalle ?? '').toString().trim(); // N° de factura
  const descripcion: string | null = (req.body.descripcion ?? '').toString().trim() || null;
  const id_usuario = currentUserId(req);

  // A quién se le entrega el producto: solo aplica en SALIDA y es obligatorio
  const idRecibe: number | null = tipo === 'SALIDA' ? Number(req.body.id_usuario_recibe) : null;

  if (!id_usuario || Number.isNaN(id_usuario)) {
    return res.status(401).json({ error: 'Sesión inválida. Cierra sesión y vuelve a entrar.' });
  }
  if (!(cantidad > 0)) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
  }
  if (tipo === 'SALIDA' && !Number.isInteger(idRecibe)) {
    return res.status(400).json({ error: 'Selecciona a quién se le entrega el producto' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validar que el producto esté activo
    const productoResult = await client.query(
      'SELECT nombre, activo FROM inventario.producto WHERE id_producto = $1 FOR UPDATE',
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

    // La persona que recibe debe existir y estar activa
    if (tipo === 'SALIDA') {
      const receptor = await client.query(
        'SELECT 1 FROM public.usuario WHERE id_usuario = $1 AND estado_registro = 1',
        [idRecibe]
      );
      if (!receptor.rowCount) {
        throw new Error('La persona que recibe el producto no existe o está inactiva');
      }
    }

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

      // Si el usuario eligió un lote, se consume ESE lote; si no, el más próximo a vencer
      const lotesResult = id_lote
        ? await client.query(`
            SELECT id_lote, cantidad_disponible, costo_unitario, factura
              FROM inventario.kardex_lote
             WHERE id_lote = $1 AND id_producto = $2 AND cantidad_disponible > 0
             FOR UPDATE
          `, [id_lote, id_producto])
        : await client.query(`
            SELECT id_lote, cantidad_disponible, costo_unitario, factura
              FROM inventario.kardex_lote
             WHERE id_producto = $1 AND cantidad_disponible > 0
             ORDER BY
               CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
               fecha_vencimiento ASC,
               fecha_entrada ASC
             FOR UPDATE
          `, [id_producto]);

      if (id_lote && (lotesResult.rows.length === 0 || Number(lotesResult.rows[0].cantidad_disponible) < cantidad)) {
        throw new Error('Stock insuficiente en el lote seleccionado');
      }

      let restante = cantidad;
      let costoTotal = 0;
      const facturasUsadas: string[] = [];
      const usados: number[] = [];

      for (const lote of lotesResult.rows) {
        if (restante <= 0) break;
        const consumir = Math.min(Number(lote.cantidad_disponible), restante);
        costoTotal += consumir * Number(lote.costo_unitario);
        restante = Math.round((restante - consumir) * 100) / 100;
        usados.push(lote.id_lote);
        if (lote.factura && !facturasUsadas.includes(lote.factura)) facturasUsadas.push(lote.factura);

        // Se descuenta de lo disponible; "cantidad" (lo que entró) no se toca
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

      // En una SALIDA la factura es la del lote (o lotes) que se consumió
      detalle = facturasUsadas.join(', ');
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
    res.json({ success: true, kardex: kardexResult.rows[0] });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('registrarMovimiento:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Registra todos los ítems de una factura escaneada en UNA sola transacción
// (si uno falla, no se guarda ninguno)
export const registrarEntradaFactura = async (req: Request, res: Response) => {
  const { id_finca, id_proveedor, factura_proveedor, items } = req.body;
  const id_usuario = currentUserId(req);

  if (!id_usuario || Number.isNaN(id_usuario)) {
    return res.status(401).json({ error: 'Sesión inválida. Cierra sesión y vuelve a entrar.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La factura no tiene ítems' });
  }

  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (factura_proveedor) {
      const dup = await client.query(
        `SELECT 1 FROM inventario.kardex_lote
          WHERE factura_proveedor = $1 AND id_proveedor IS NOT DISTINCT FROM $2
          LIMIT 1`,
        [factura_proveedor, id_proveedor ?? null]
      );
      if (dup.rowCount) {
        throw new Error(`La factura ${factura_proveedor} de este proveedor ya fue registrada`);
      }
    }

    const registrados = [];

    for (let i = 0; i < items.length; i++) {
      const n = i + 1;
      const { id_producto, numero_lote, fecha_vencimiento } = items[i];
      const cantidad = Number(items[i].cantidad);
      const costo = Number(items[i].costo_unitario);

      if (!id_producto) throw new Error(`Ítem ${n}: falta seleccionar el producto`);
      if (!(cantidad > 0)) throw new Error(`Ítem ${n}: la cantidad debe ser mayor a 0`);
      if (!(costo > 0)) throw new Error(`Ítem ${n}: el costo unitario debe ser mayor a 0`);
      if (fecha_vencimiento) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_vencimiento)) {
          throw new Error(`Ítem ${n}: fecha de vencimiento inválida`);
        }
        if (fecha_vencimiento < hoy) {
          throw new Error(`Ítem ${n}: el producto ya está vencido (${fecha_vencimiento})`);
        }
      }

      const prod = await client.query(
        'SELECT nombre, activo FROM inventario.producto WHERE id_producto = $1 FOR UPDATE',
        [id_producto]
      );
      if (!prod.rows.length) throw new Error(`Ítem ${n}: producto no encontrado`);
      if (!prod.rows[0].activo) {
        throw new Error(`Ítem ${n}: el producto "${prod.rows[0].nombre}" está inactivo`);
      }

      // Desempate por id_kardex: dentro de una transacción todas las filas
      // comparten la misma hora, así que ordenar solo por fecha no es confiable
      const saldoRes = await client.query(
        `SELECT saldo_cantidad, saldo_valor FROM inventario.kardex
          WHERE id_producto = $1
          ORDER BY fecha DESC, id_kardex DESC LIMIT 1`,
        [id_producto]
      );
      const saldo = saldoRes.rows[0] || { saldo_cantidad: 0, saldo_valor: 0 };

      const total = cantidad * costo;
      const nuevoSaldoCant = Number(saldo.saldo_cantidad) + cantidad;
      const nuevoSaldoValor = Number(saldo.saldo_valor) + total;
      const detalle = `Factura ${factura_proveedor ?? 'S/N'}${numero_lote ? ` · Lote ${numero_lote}` : ''}`;

      const lote = await client.query(
        `INSERT INTO inventario.kardex_lote
           (id_producto, id_finca, cantidad, costo_unitario, factura,
            fecha_vencimiento, numero_lote, factura_proveedor, id_proveedor)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id_lote`,
        [id_producto, id_finca, cantidad, costo, detalle,
         fecha_vencimiento || null, numero_lote || null,
         factura_proveedor || null, id_proveedor || null]
      );

      const k = await client.query(
        `INSERT INTO inventario.kardex
           (id_producto, id_finca, id_usuario, tipo, cantidad,
            costo_unitario, total, saldo_cantidad, saldo_valor, detalle, id_lote)
         VALUES ($1,$2,$3,'ENTRADA',$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [id_producto, id_finca, id_usuario, cantidad, costo, total,
         nuevoSaldoCant, nuevoSaldoValor, detalle, lote.rows[0].id_lote]
      );
      registrados.push(k.rows[0]);
    }

    await client.query('COMMIT');
    res.json({ success: true, registrados });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('registrarEntradaFactura:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getReporteConsolidado = async (_req: Request, res: Response) => {
  try {
    res.json(await getReporteConsolidadoModel());
  } catch (error: any) {
    console.error('getReporteConsolidado:', error);
    res.status(500).json({ error: error.message || 'Error al generar reporte' });
  }
};

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    res.json(await getDashboardModel());
  } catch (error: any) {
    console.error('getDashboard:', error);
    res.status(500).json({ error: error.message || 'Error al cargar dashboard' });
  }
};