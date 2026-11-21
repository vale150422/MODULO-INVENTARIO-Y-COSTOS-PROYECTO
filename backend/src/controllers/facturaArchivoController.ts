import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/index';

const SECRET = process.env.JWT_SECRET || 'secret123';

// GET /api/kardex/info/productos
// Estado de cada insumo (agotado = inactivo), fechas de ingreso y facturas
export const getProductosInfo = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto,
             (COALESCE(p.activo, true) = false) AS agotado,
             MIN(k.fecha) FILTER (WHERE k.tipo = 'ENTRADA') AS primer_ingreso,
             MAX(k.fecha) FILTER (WHERE k.tipo = 'ENTRADA') AS ultimo_ingreso,
             COALESCE(array_agg(DISTINCT k.fecha) FILTER (WHERE k.tipo = 'ENTRADA'), '{}') AS ingresos,
             COALESCE((
               SELECT array_agg(DISTINCT f)
                 FROM (
                   SELECT l.factura::text AS f FROM kardex_lote l WHERE l.id_producto = p.id_producto
                   UNION
                   SELECT l.factura_proveedor::text FROM kardex_lote l WHERE l.id_producto = p.id_producto
                 ) x
                WHERE f IS NOT NULL AND btrim(f) <> ''
             ), '{}') AS facturas
        FROM producto p
        LEFT JOIN kardex k ON k.id_producto = p.id_producto
       GROUP BY p.id_producto, p.activo
       ORDER BY p.id_producto
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('getProductosInfo:', error);
    res.status(500).json({ error: error?.message || 'Error al obtener información de insumos' });
  }
};

// GET /api/kardex/facturas-adjuntas/:id_producto
// Devuelve los id_kardex del producto que tienen factura adjunta
export const getFacturasAdjuntas = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT fa.id_kardex::text AS id
         FROM factura_archivo fa
         JOIN kardex k ON k.id_kardex = fa.id_kardex
        WHERE k.id_producto = $1`,
      [Number(req.params.id_producto)]
    );
    res.json({ ids: result.rows.map((r: any) => r.id) });
  } catch (error: any) {
    console.error('getFacturasAdjuntas:', error);
    res.status(500).json({ error: error?.message || 'Error al obtener facturas adjuntas' });
  }
};

// POST /api/kardex/factura-archivo/:id_kardex  (campo "archivo")
export const subirFacturaArchivo = async (req: Request, res: Response) => {
  const idKardex = Number(req.params.id_kardex);
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: 'Archivo no válido. Usa JPG, PNG, WEBP o PDF (máx. 8 MB)' });
  }
  try {
    const existe = await pool.query('SELECT 1 FROM kardex WHERE id_kardex = $1', [idKardex]);
    if (existe.rowCount === 0) {
      return res.status(404).json({ error: 'El movimiento no existe' });
    }
    await pool.query(
      `INSERT INTO factura_archivo (id_kardex, nombre, mime, datos)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_kardex) DO UPDATE
         SET nombre = EXCLUDED.nombre,
             mime = EXCLUDED.mime,
             datos = EXCLUDED.datos,
             created_at = now()`,
      [idKardex, file.originalname, file.mimetype, file.buffer]
    );
    res.json({ message: 'Factura adjuntada' });
  } catch (error: any) {
    console.error('subirFacturaArchivo:', error);
    res.status(500).json({ error: error?.message || 'Error al adjuntar la factura' });
  }
};

// GET /api/kardex/factura-archivo/:id_kardex
// Devuelve un enlace temporal (5 minutos) para abrir la factura
export const obtenerUrlFactura = async (req: Request, res: Response) => {
  const idKardex = Number(req.params.id_kardex);
  try {
    const existe = await pool.query('SELECT 1 FROM factura_archivo WHERE id_kardex = $1', [idKardex]);
    if (existe.rowCount === 0) {
      return res.status(404).json({ error: 'Este movimiento no tiene factura adjunta' });
    }
    const t = jwt.sign({ k: idKardex }, SECRET, { expiresIn: '5m' });
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol).split(',')[0].trim();
    const url = `${proto}://${req.get('host')}/api/kardex/factura-archivo/${idKardex}/ver?t=${encodeURIComponent(t)}`;
    res.json({ url });
  } catch (error: any) {
    console.error('obtenerUrlFactura:', error);
    res.status(500).json({ error: error?.message || 'Error al obtener la factura' });
  }
};

// GET /api/kardex/factura-archivo/:id_kardex/ver?t=...
// Muestra el archivo. No usa la cabecera Authorization porque se abre en una pestaña nueva;
// en su lugar valida el enlace temporal.
export const verFacturaArchivo = async (req: Request, res: Response) => {
  const idKardex = Number(req.params.id_kardex);
  try {
    const payload: any = jwt.verify(String(req.query.t || ''), SECRET);
    if (Number(payload.k) !== idKardex) throw new Error('Enlace no válido');
  } catch {
    return res.status(401).send('El enlace de la factura no es válido o ya expiró. Vuelve a abrirla desde el Kardex.');
  }
  try {
    const result = await pool.query(
      'SELECT nombre, mime, datos FROM factura_archivo WHERE id_kardex = $1',
      [idKardex]
    );
    const f = result.rows[0];
    if (!f) return res.status(404).send('Factura no encontrada');
    const nombre = String(f.nombre || 'factura').replace(/[^\w.\- ]/g, '_');
    res.setHeader('Content-Type', f.mime);
    res.setHeader('Content-Disposition', `inline; filename="${nombre}"`);
    res.send(f.datos);
  } catch (error) {
    console.error('verFacturaArchivo:', error);
    res.status(500).send('Error al abrir la factura');
  }
};