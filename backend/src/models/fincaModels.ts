import { pool } from '../database/index';
import { withAudit, AuditCtx } from '../database/audit';

export interface Finca {
  id_finca?: number;
  nombre: string;
  municipio?: string;
  vereda?: string;
  ubicacion?: string;
}

const COLS = `
  idfinca AS id_finca,
  nombre,
  ubicacion,
  municipio,
  vereda,
  created_at,
  (estado_registro = 1) AS activa
`;

// fincas = null → todas (administrador); fincas = [ids] → solo esas (trabajador)
export const getFincas = async (fincas: number[] | null = null) => {
  if (fincas === null) {
    const result = await pool.query(
      `SELECT ${COLS} FROM public.finca WHERE estado_registro = 1 ORDER BY idfinca`
    );
    return result.rows;
  }
  const result = await pool.query(
    `SELECT ${COLS} FROM public.finca
      WHERE estado_registro = 1 AND idfinca = ANY($1::int[])
      ORDER BY idfinca`,
    [fincas]
  );
  return result.rows;
};

export const getFincaById = async (id: number) => {
  const result = await pool.query(
    `SELECT ${COLS} FROM public.finca WHERE idfinca = $1`,
    [id]
  );
  return result.rows[0];
};

export const createFinca = async (finca: Finca, ctx: AuditCtx) => {
  const { nombre, municipio, vereda, ubicacion } = finca;
  return withAudit({ ...ctx, modulo: 'FINCAS' }, async (client) => {
    const result = await client.query(
      `INSERT INTO public.finca (nombre, ubicacion, municipio, vereda)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLS}`,
      [nombre, ubicacion ?? null, municipio ?? null, vereda ?? null]
    );
    return result.rows[0];
  });
};

export const updateFinca = async (id: number, finca: Finca, ctx: AuditCtx) => {
  const { nombre, municipio, vereda, ubicacion } = finca;
  return withAudit({ ...ctx, modulo: 'FINCAS' }, async (client) => {
    const result = await client.query(
      `UPDATE public.finca
          SET nombre = $1,
              ubicacion = COALESCE($2, ubicacion),
              municipio = $3,
              vereda = $4
        WHERE idfinca = $5
        RETURNING ${COLS}`,
      [nombre, ubicacion ?? null, municipio ?? null, vereda ?? null, id]
    );
    return result.rows[0];
  });
};

// Ya no se borra físicamente: se desactiva (estado_registro = 0).
export const deleteFinca = async (id: number, ctx: AuditCtx) => {
  await withAudit(
    { ...ctx, modulo: 'FINCAS', motivo: ctx.motivo ?? 'Desactivada desde la aplicación' },
    async (client) => {
      await client.query(
        'UPDATE public.finca SET estado_registro = 0 WHERE idfinca = $1',
        [id]
      );
    }
  );
};