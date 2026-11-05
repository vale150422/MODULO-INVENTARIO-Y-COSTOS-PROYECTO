import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../database/index';

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const PROMPT = `Extrae los datos de esta factura o etiqueta de insumos agrícolas (Colombia).
Responde SOLO con JSON válido, sin texto adicional ni backticks, con esta forma:
{
  "proveedor": string|null,
  "nit_proveedor": string|null,
  "numero_factura": string|null,
  "fecha_factura": "YYYY-MM-DD"|null,
  "items": [{
    "descripcion": string,
    "numero_lote": string|null,
    "fecha_vencimiento": "YYYY-MM-DD"|null,
    "cantidad": number|null,
    "unidad": string|null,
    "costo_unitario": number|null
  }]
}
Reglas: no inventes datos; si un campo no aparece o no es legible, usa null.
Las fechas en Colombia suelen venir DD/MM/AAAA. Los valores en pesos van como número, sin símbolos ni separadores de miles.
El costo_unitario es el valor por unidad, no el total de la línea.`;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ');

// Busca el producto del catálogo que más coincida con la descripción de la factura
function buscarProducto(
  desc: string,
  productos: { id_producto: number; nombre: string }[]
): number | null {
  const tokens = new Set(norm(desc).split(/\s+/).filter(t => t.length > 2));
  let mejor: { id: number; score: number } | null = null;

  for (const p of productos) {
    const pt = norm(p.nombre).split(/\s+/).filter(t => t.length > 2);
    if (!pt.length) continue;
    const score = pt.filter(t => tokens.has(t)).length / pt.length;
    if (score > (mejor?.score ?? 0)) mejor = { id: p.id_producto, score };
  }
  return mejor && mejor.score >= 0.5 ? mejor.id : null;
}

export const escanearFactura = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Falta la imagen o el PDF' });
    }

    const base64 = req.file.buffer.toString('base64');
    const esPdf = req.file.mimetype === 'application/pdf';

    const archivo: any = esPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: req.file.mimetype, data: base64 } };

    const resp = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: [archivo, { type: 'text', text: PROMPT }] }],
    });

    const texto = resp.content
      .map((b: any) => (b.type === 'text' ? b.text : ''))
      .join('');

    let data: any;
    try {
      data = JSON.parse(texto.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(422).json({
        error: 'No se pudo interpretar el documento. Intenta con una foto más clara y completa.',
      });
    }

    // Productos activos de la finca para emparejar
    const idFinca = req.query.id_finca ? Number(req.query.id_finca) : null;
    const { rows: productos } = await pool.query(
      `SELECT id_producto, nombre FROM producto
       WHERE activo = true AND ($1::int IS NULL OR id_finca = $1)`,
      [idFinca]
    );

    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const iso = /^\d{4}-\d{2}-\d{2}$/;

    const items = (data.items ?? []).map((it: any) => {
      const advertencias: string[] = [];

      if (!it.numero_lote) advertencias.push('No se detectó el lote');

      if (!it.fecha_vencimiento) {
        advertencias.push('No se detectó la fecha de vencimiento');
      } else if (!iso.test(it.fecha_vencimiento) || isNaN(Date.parse(it.fecha_vencimiento))) {
        advertencias.push('Fecha de vencimiento ilegible');
        it.fecha_vencimiento = null;
      } else if (it.fecha_vencimiento < hoy) {
        advertencias.push('⚠ El producto ya está VENCIDO');
      }

      if (!it.cantidad || it.cantidad <= 0) advertencias.push('Cantidad no válida');
      if (!it.costo_unitario || it.costo_unitario <= 0) advertencias.push('Costo unitario no válido');

      const id_producto = buscarProducto(it.descripcion ?? '', productos);
      if (!id_producto) advertencias.push('No coincide con ningún producto del catálogo: selecciónalo');

      return { ...it, id_producto, advertencias };
    });

    // Proveedor por NIT (opcional)
    let id_proveedor: number | null = null;
    if (data.nit_proveedor) {
      const p = await pool.query(
        `SELECT id_proveedor FROM proveedor
         WHERE regexp_replace(nit, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
         LIMIT 1`,
        [data.nit_proveedor]
      );
      id_proveedor = p.rows[0]?.id_proveedor ?? null;
    }

    // Aviso de factura duplicada
    let facturaDuplicada = false;
    if (data.numero_factura) {
      const dup = await pool.query(
        `SELECT 1 FROM kardex_lote
         WHERE factura_proveedor = $1 AND id_proveedor IS NOT DISTINCT FROM $2
         LIMIT 1`,
        [data.numero_factura, id_proveedor]
      );
      facturaDuplicada = !!dup.rowCount;
    }

    res.json({ ...data, items, id_proveedor, facturaDuplicada });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'No se pudo leer el documento. Intenta con una foto más clara.',
    });
  }
};