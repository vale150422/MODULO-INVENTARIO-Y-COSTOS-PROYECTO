import { pool } from '../database/connection';
import { enviarSMS, ResultadoSMS } from './smsService';


/* ───────────── Lotes por vencer ───────────── */

export interface LoteAlerta {
  id_lote: number;
  id_producto: number;
  producto: string;
  unidadmedida: string;
  finca: string;
  cantidad: number;
  costo_unitario: number;
  factura: string | null;
  fecha_vencimiento: string;
  dias_restantes: number;
}

export const obtenerLotesPorVencer = async (dias = 30): Promise<LoteAlerta[]> => {
  const result = await pool.query(
    `SELECT
       l.id_lote,
       p.id_producto,
       p.nombre AS producto,
       p.unidadmedida,
       f.nombre AS finca,
       l.cantidad,
       l.costo_unitario,
       l.factura,
       to_char(l.fecha_vencimiento, 'YYYY-MM-DD') AS fecha_vencimiento,
       (l.fecha_vencimiento::date - CURRENT_DATE) AS dias_restantes
     FROM kardex_lote l
     JOIN producto p ON p.id_producto = l.id_producto
     JOIN finca f ON f.id_finca = l.id_finca
     WHERE l.cantidad > 0
       AND l.fecha_vencimiento IS NOT NULL
       AND l.fecha_vencimiento <= CURRENT_DATE + $1::int
     ORDER BY l.fecha_vencimiento ASC`,
    [dias]
  );

  return result.rows.map((r: any) => ({
    ...r,
    cantidad: Number(r.cantidad),
    costo_unitario: Number(r.costo_unitario),
    dias_restantes: Number(r.dias_restantes),
  }));
};

export const construirMensaje = (lotes: LoteAlerta[]): string => {
  if (lotes.length === 0) return '';

  const vencidos = lotes.filter(l => l.dias_restantes < 0).length;
  const porVencer = lotes.length - vencidos;

  const lineas = [
    `AgroGestion - Alerta de insumos: ${vencidos} vencido(s), ${porVencer} por vencer.`,
  ];

  lotes.slice(0, 5).forEach(l => {
    const estado =
      l.dias_restantes < 0 ? 'VENCIDO'
      : l.dias_restantes === 0 ? 'vence HOY'
      : `vence en ${l.dias_restantes}d`;
    lineas.push(`${l.producto} (${l.finca}): ${l.cantidad} ${l.unidadmedida}, ${estado}`);
  });

  if (lotes.length > 5) lineas.push(`Y ${lotes.length - 5} mas. Revise el sistema.`);

  return lineas.join('\n');
};

/* ───────────── Números para alertas (los agrega el usuario) ───────────── */

export interface TelefonoAlerta {
  id_telefono: number;
  nombre: string;
  telefono: string;
  activo: boolean;
}

// Acepta "300 123 4567", "3001234567" o "+57 300 123 4567". Devuelve +573001234567
export const normalizarTelefono = (raw: string): string | null => {
  const digitos = (raw || '').replace(/\D/g, '');
  if (digitos.length === 10 && digitos.startsWith('3')) return '+57' + digitos;
  if (digitos.length === 12 && digitos.startsWith('573')) return '+' + digitos;
  return null;
};

export const obtenerTelefonos = async (): Promise<TelefonoAlerta[]> => {
  const result = await pool.query(
    `SELECT id_telefono, nombre, telefono, activo
     FROM alerta_telefono
     ORDER BY created_at ASC`
  );
  return result.rows;
};

export const agregarTelefono = async (nombre: string, telefono: string): Promise<TelefonoAlerta> => {
  const result = await pool.query(
    `INSERT INTO alerta_telefono (nombre, telefono)
     VALUES ($1, $2)
     RETURNING id_telefono, nombre, telefono, activo`,
    [nombre, telefono]
  );
  return result.rows[0];
};

export const cambiarEstadoTelefono = async (id: number, activo: boolean) => {
  await pool.query(
    'UPDATE alerta_telefono SET activo = $1 WHERE id_telefono = $2',
    [activo, id]
  );
};

export const eliminarTelefono = async (id: number) => {
  await pool.query('DELETE FROM alerta_telefono WHERE id_telefono = $1', [id]);
};

const obtenerDestinosActivos = async (): Promise<string[]> => {
  const result = await pool.query(
    'SELECT telefono FROM alerta_telefono WHERE activo = TRUE ORDER BY created_at ASC'
  );
  return result.rows.map((r: any) => r.telefono);
};

/* ───────────── Envío ───────────── */

export interface ResumenEnvio {
  total: number;
  mensaje: string;
  sinNumeros: boolean;
  resultado: ResultadoSMS | null;
}

// enviarSiVacio = true → también envía un SMS informativo cuando no hay insumos por vencer
// (se usa en el botón manual; la tarea de las 7:00 a.m. no lo usa para no gastar SMS a diario)
export const ejecutarAlertasSMS = async (enviarSiVacio = false): Promise<ResumenEnvio> => {
  const dias = Number(process.env.ALERT_DIAS || 15);
  const lotes = await obtenerLotesPorVencer(dias);

  if (lotes.length === 0 && !enviarSiVacio) {
    console.log('[Alertas] No hay insumos por vencer dentro del rango configurado. No se envió SMS.');
    return { total: 0, mensaje: '', sinNumeros: false, resultado: null };
  }

  const destinos = await obtenerDestinosActivos();
  if (destinos.length === 0) {
    console.log('[Alertas] No hay números activos registrados. No se envió SMS.');
    return { total: lotes.length, mensaje: '', sinNumeros: true, resultado: null };
  }

  const mensaje = lotes.length === 0
    ? `AgroGestion: No hay insumos por vencer en los proximos ${dias} dias.`
    : construirMensaje(lotes);

  const resultado = await enviarSMS(mensaje, destinos);
  return { total: lotes.length, mensaje, sinNumeros: false, resultado };
};