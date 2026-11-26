import * as https from 'https';
import { pool } from '../database/index';

/* ───────── Tipos ───────── */
export interface LoteAlerta {
  id_lote: number;
  producto: string;
  unidadmedida: string;
  finca: string;
  cantidad: number;
  costo_unitario: number;
  factura: string | null;
  fecha_vencimiento: string; // YYYY-MM-DD
  dias_restantes: number;
}

export interface StockBajo {
  id_producto: number;
  producto: string;
  unidadmedida: string;
  finca: string;
  stock_minimo: number;
  saldo_cantidad: number;
}

export interface Correo {
  id_correo: number;
  nombre: string;
  correo: string;
  activo: boolean;
}

export interface ResultadoEnvio {
  enviados: number;
  errores: string[];
  simulado?: boolean;
}

/* ───────── Consultas ───────── */
const HOY = `(NOW() AT TIME ZONE 'America/Bogota')::date`;

// Lotes con existencias que ya vencieron o vencen dentro de `dias` días
export const obtenerLotesPorVencer = async (dias: number): Promise<LoteAlerta[]> => {
  const r = await pool.query(
    `SELECT l.id_lote,
            p.nombre AS producto,
            p.unidadmedida,
            f.nombre AS finca,
            l.cantidad_disponible::float AS cantidad,
            l.costo_unitario::float AS costo_unitario,
            l.factura,
            to_char(l.fecha_vencimiento::date, 'YYYY-MM-DD') AS fecha_vencimiento,
            (l.fecha_vencimiento::date - ${HOY})::int AS dias_restantes
       FROM inventario.kardex_lote l
       JOIN inventario.producto p ON p.id_producto = l.id_producto
       JOIN public.finca f ON f.idfinca = p.id_finca
      WHERE l.cantidad_disponible > 0
        AND p.activo = true
        AND l.fecha_vencimiento IS NOT NULL
        AND l.fecha_vencimiento::date <= ${HOY} + $1::int
      ORDER BY l.fecha_vencimiento ASC, p.nombre ASC`,
    [dias]
  );
  return r.rows;
};

// Insumos con existencias que llegaron a su stock mínimo (los agotados no cuentan)
export const obtenerStockBajo = async (): Promise<StockBajo[]> => {
  const r = await pool.query(
    `SELECT p.id_producto,
            p.nombre AS producto,
            p.unidadmedida,
            f.nombre AS finca,
            p.stock_minimo::float AS stock_minimo,
            COALESCE(k.saldo_cantidad, 0)::float AS saldo_cantidad
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
      ORDER BY f.nombre, p.nombre`
  );
  return r.rows;
};

/* ───────── Destinatarios (correos) ───────── */
// Devuelve el correo en minúsculas, o '' si no es válido
export const normalizarCorreo = (raw: string): string => {
  const c = raw.trim().toLowerCase();
  if (c.length > 150) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) ? c : '';
};

export const obtenerCorreos = async (): Promise<Correo[]> => {
  const r = await pool.query(
    `SELECT id_correo, nombre, correo, activo
       FROM inventario.alerta_correo
      ORDER BY nombre ASC`
  );
  return r.rows;
};

export const agregarCorreo = async (nombre: string, correo: string): Promise<Correo> => {
  const r = await pool.query(
    `INSERT INTO inventario.alerta_correo (nombre, correo)
     VALUES ($1, $2)
     RETURNING id_correo, nombre, correo, activo`,
    [nombre, correo]
  );
  return r.rows[0];
};

export const cambiarEstadoCorreo = async (id: number, activo: boolean) => {
  await pool.query(
    'UPDATE inventario.alerta_correo SET activo = $1 WHERE id_correo = $2',
    [activo, id]
  );
};

export const eliminarCorreo = async (id: number) => {
  await pool.query('DELETE FROM inventario.alerta_correo WHERE id_correo = $1', [id]);
};

/* ───────── Envío (Brevo, por API HTTPS) ───────── */
const postJSON = (
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<{ status: number; texto: string }> =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      res => {
        let texto = '';
        res.on('data', (c: Buffer | string) => { texto += c.toString(); });
        res.on('end', () => resolve({ status: res.statusCode ?? 0, texto }));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('Tiempo de espera agotado al enviar el correo')));
    req.write(data);
    req.end();
  });

const enviarCorreo = async (
  destino: { nombre: string; correo: string },
  asunto: string,
  html: string
) => {
  const remitente = process.env.ALERTAS_REMITENTE ?? '';
  if (!remitente) throw new Error('Falta la variable ALERTAS_REMITENTE');

  const { status, texto } = await postJSON(
    'https://api.brevo.com/v3/smtp/email',
    { 'api-key': process.env.BREVO_API_KEY ?? '', Accept: 'application/json' },
    {
      sender: { name: process.env.ALERTAS_REMITENTE_NOMBRE || 'AgroGestión', email: remitente },
      to: [{ email: destino.correo, name: destino.nombre }],
      subject: asunto,
      htmlContent: html,
    }
  );

  if (status < 200 || status >= 300) {
    let detalle = texto;
    try { detalle = JSON.parse(texto).message ?? texto; } catch { /* texto plano */ }
    throw new Error(`Brevo respondió ${status}: ${detalle}`);
  }
};

/* ───────── Contenido del correo ───────── */
const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const fmtNum = (n: number) => Number(n).toLocaleString('es-CO');
const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

const TH = 'padding:8px;text-align:left;background:#dcebcc;color:#1e3d10;font-size:12px;';
const TD = 'padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#10281a;';

const estadoVenc = (d: number) =>
  d < 0 ? `Vencido hace ${Math.abs(d)} d` : d === 0 ? 'Vence hoy' : `${d} días`;

const construirHtml = (lotes: LoteAlerta[], bajos: StockBajo[], dias: number) => {
  const vencidos = lotes.filter(l => l.dias_restantes < 0).length;
  const valorRiesgo = lotes.reduce((a, l) => a + l.cantidad * l.costo_unitario, 0);

  const seccionLotes = lotes.length === 0 ? '' : `
    <h3 style="color:#1e3d10;margin:24px 0 8px;">Lotes vencidos o por vencer (≤ ${dias} días)</h3>
    <table style="border-collapse:collapse;width:100%;">
      <tr>
        <th style="${TH}">Insumo</th><th style="${TH}">Finca</th><th style="${TH}">Factura</th>
        <th style="${TH}">Cantidad</th><th style="${TH}">Vence</th><th style="${TH}">Estado</th>
        <th style="${TH}">Valor</th>
      </tr>
      ${lotes.map(l => `
        <tr>
          <td style="${TD}"><b>${esc(l.producto)}</b></td>
          <td style="${TD}">${esc(l.finca)}</td>
          <td style="${TD}">${esc(l.factura || '—')}</td>
          <td style="${TD}">${fmtNum(l.cantidad)} ${esc(l.unidadmedida)}</td>
          <td style="${TD}">${fmtFecha(l.fecha_vencimiento)}</td>
          <td style="${TD}color:${l.dias_restantes <= 7 ? '#b91c1c' : '#10281a'};font-weight:bold;">
            ${esc(estadoVenc(l.dias_restantes))}
          </td>
          <td style="${TD}">${fmtCOP(l.cantidad * l.costo_unitario)}</td>
        </tr>`).join('')}
    </table>
    <p style="font-size:13px;color:#3f5f2f;">
      Vencidos: <b>${vencidos}</b> · Valor en riesgo: <b>${fmtCOP(valorRiesgo)}</b>
    </p>`;

  const seccionBajos = bajos.length === 0 ? '' : `
    <h3 style="color:#1e3d10;margin:24px 0 8px;">Insumos en stock mínimo</h3>
    <table style="border-collapse:collapse;width:100%;">
      <tr>
        <th style="${TH}">Insumo</th><th style="${TH}">Finca</th>
        <th style="${TH}">Quedan</th><th style="${TH}">Mínimo</th>
      </tr>
      ${bajos.map(b => `
        <tr>
          <td style="${TD}"><b>${esc(b.producto)}</b></td>
          <td style="${TD}">${esc(b.finca)}</td>
          <td style="${TD}color:#b91c1c;font-weight:bold;">${fmtNum(b.saldo_cantidad)} ${esc(b.unidadmedida)}</td>
          <td style="${TD}">${fmtNum(b.stock_minimo)} ${esc(b.unidadmedida)}</td>
        </tr>`).join('')}
    </table>`;

  const sinAlertas = lotes.length + bajos.length === 0
    ? `<p style="font-size:14px;color:#166534;">No hay lotes por vencer ni insumos en stock mínimo. Todo en orden.</p>`
    : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:0 auto;color:#10281a;">
      <div style="background:#1e3d10;color:#ffffff;padding:16px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">AgroGestión · Alertas de inventario</h2>
      </div>
      <div style="padding:16px 20px;border:1px solid #b9d3a3;border-top:none;border-radius:0 0 8px 8px;">
        ${sinAlertas}${seccionLotes}${seccionBajos}
        <p style="font-size:11px;color:#6b7280;margin-top:24px;">
          Mensaje automático del sistema de inventario. Puedes pausar o quitar tu correo
          desde la página de Alertas.
        </p>
      </div>
    </div>`;
};

/* ───────── Orquestador (lo usan el cron y el botón manual) ───────── */
export const ejecutarAlertasCorreo = async (manual = false, dias = 30) => {
  const [lotes, bajos, correos] = await Promise.all([
    obtenerLotesPorVencer(dias),
    obtenerStockBajo(),
    obtenerCorreos(),
  ]);

  const total = lotes.length + bajos.length;
  const destinatarios = correos.filter(c => c.activo);
  const vacio: ResultadoEnvio = { enviados: 0, errores: [] };

  if (destinatarios.length === 0) {
    return { sinCorreos: true, total, resultado: vacio };
  }

  // El cron no molesta si no hay nada que avisar; el botón manual sí envía
  if (total === 0 && !manual) {
    console.log('[Alertas] Sin alertas, no se envía correo');
    return { omitido: true, total, resultado: vacio };
  }

  if (!process.env.BREVO_API_KEY) {
    console.warn('[Alertas] Falta BREVO_API_KEY: envío simulado');
    return { total, resultado: { ...vacio, simulado: true } as ResultadoEnvio };
  }

  const asunto = total === 0
    ? 'AgroGestión: sin alertas de inventario'
    : `AgroGestión: ${total} alerta(s) de inventario`;
  const html = construirHtml(lotes, bajos, dias);

  const envios = await Promise.allSettled(
    destinatarios.map(d => enviarCorreo({ nombre: d.nombre, correo: d.correo }, asunto, html))
  );

  const resultado: ResultadoEnvio = { enviados: 0, errores: [] };
  envios.forEach((e, i) => {
    if (e.status === 'fulfilled') resultado.enviados++;
    else resultado.errores.push(`${destinatarios[i].correo}: ${e.reason?.message ?? 'error'}`);
  });

  console.log(`[Alertas] Correos enviados: ${resultado.enviados}/${destinatarios.length}`);
  return { total, resultado };
};