const { Pool } = require('pg');

// Solo cargar dotenv en local, no en producción
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('Conectado a PostgreSQL'))
    .catch(err => console.log('Error de conexión:', err));

module.exports = pool;