import { AsyncLocalStorage } from 'async_hooks';
import pool from './connection';

export { pool };
export default pool;

export const auditStore = new AsyncLocalStorage<{ idUsuario: number; ip: string | null }>();

const rawQuery = pool.query.bind(pool) as any;

(pool as any).query = async (text: any, params?: any) => {
  const store = auditStore.getStore();
  if (!store) return rawQuery(text, params); // login y rutas sin usuario

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL search_path = inventario, public');
    await client.query(
      'SELECT public.fn_auditoria_contexto($1::int, $2::text, NULL, NULL, NULL, NULL)',
      [store.idUsuario, store.ip]
    );
    const result = await client.query(text, params);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};