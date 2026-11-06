import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const databaseUrl = process.env.DATABASE_URL?.trim();

console.log('📦 Configuración de PostgreSQL');
console.log('DATABASE_URL existe:', !!databaseUrl);

if (!databaseUrl) {
  throw new Error('❌ DATABASE_URL no está definida');
}

// Diagnóstico: muestra con qué usuario y host se conecta (sin la contraseña)
try {
  const u = new URL(databaseUrl);
  console.log(
    'DB usuario:', u.username,
    '| host:', u.hostname,
    '| puerto:', u.port,
    '| largo contraseña:', u.password.length
  );
} catch {
  console.log('❌ DATABASE_URL tiene un formato inválido (revisa símbolos especiales en la contraseña)');
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