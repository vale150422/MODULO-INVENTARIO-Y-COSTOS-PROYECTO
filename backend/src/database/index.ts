import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('🟢 Base de datos conectada'))
  .catch((err: any) => console.error('🔴 Error al conectar a la BD:', err));