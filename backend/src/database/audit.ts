import { PoolClient } from 'pg';
import { pool } from './index';

export interface AuditCtx {
  idUsuario: number;
  ip?: string | null;
  modulo?: string;
  motivo?: string | null;
}

export async function withAudit<T>(
  ctx: AuditCtx,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (!ctx.idUsuario || Number.isNaN(ctx.idUsuario)) {
    throw new Error('No se pudo identificar al usuario para la auditoría');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'SELECT public.fn_auditoria_contexto($1::int, $2::text, NULL, NULL, $3::text, $4::text)',
      [ctx.idUsuario, ctx.ip ?? null, ctx.modulo ?? null, ctx.motivo ?? null]
    );
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}