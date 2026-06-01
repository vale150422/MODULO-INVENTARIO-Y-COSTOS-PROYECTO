import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.log('Error de conexión:', err));

export default pool;