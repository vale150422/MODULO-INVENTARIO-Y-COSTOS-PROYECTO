import { AsyncLocalStorage } from 'async_hooks';
import pool from './connection';

export { pool };
export default pool;

export const auditStore = new AsyncLocalStorage<{ idUsuario: number; ip: string | null }>();

const originalConnect = (pool as any).connect.bind(pool);

// Cada conexión que se pida al pool: al abrir una transacción (BEGIN) se fija el
// esquema inventario y, si hay un usuario en la petición, el contexto de auditoría.
(pool as any).connect = async (...args: any[]) => {
  if (args.length && typeof args[0] === 'function') return originalConnect(...args);

  const client = await originalConnect();
  if (client.__patched) return client;
  client.__patched = true;

  const originalQuery = client.query.bind(client) as any;

  client.query = async (text: any, params?: any) => {
    const sql = typeof text === 'string' ? text : text?.text;
    let result;
    try {
      result = await originalQuery(text, params);
    } catch (e: any) {
      console.error('SQL error:', e.message, '|', String(sql ?? '').slice(0, 200));
      throw e;
    }

    if (typeof sql === 'string' && /^\s*(BEGIN|START TRANSACTION)\b/i.test(sql)) {
      await originalQuery('SET LOCAL search_path = inventario, public');
      const store = auditStore.getStore();
      if (store) {
        await originalQuery(
          'SELECT public.fn_auditoria_contexto($1::int, $2::text, NULL, NULL, NULL, NULL)',
          [store.idUsuario, store.ip]
        );
      }
    }
    return result;
  };

  return client;
};

// pool.query ahora siempre corre dentro de una transacción con esquema y auditoría
(pool as any).query = async (text: any, params?: any) => {
  const client = await (pool as any).connect();
  try {
    await client.query('BEGIN');
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