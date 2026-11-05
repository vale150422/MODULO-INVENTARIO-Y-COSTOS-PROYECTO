
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const databaseUrl = process.env.DATABASE_URL;

console.log('📦 Configuración de PostgreSQL');
console.log('DATABASE_URL existe:', !!databaseUrl);

if (!databaseUrl) {
  throw new Error('❌ DATABASE_URL no está definida');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  max: 10
});

pool.on('connect', () => {
  console.log('✅ Conectado a Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error PostgreSQL:', err.message);
});

export default pool;
