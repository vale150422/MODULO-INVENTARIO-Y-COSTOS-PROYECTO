import { AsyncLocalStorage } from 'async_hooks';
import pool from './connection';

export { pool };
export default pool;

export const auditStore = new AsyncLocalStorage<{ idUsuario: number; ip: string | null }>();

(pool as any).query = async (text: any, params?: any) => {
  const store = auditStore.getStore();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL search_path = inventario, public');
    if (store) {
      await client.query(
        'SELECT public.fn_auditoria_contexto($1::int, $2::text, NULL, NULL, NULL, NULL)',
        [store.idUsuario, store.ip]
      );
    }
    const result = await client.query(text, params);
    await client.query('COMMIT');
    return result;
  } catch (e: any) {
    console.error('SQL error:', e.message, '|', String(text?.text ?? text).slice(0, 200));
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};