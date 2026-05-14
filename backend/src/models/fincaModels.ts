import { pool } from '../database';

export interface Finca {
  id_finca?: number;
  nombre: string;
  municipio: string;
  vereda: string;
}

export const getFincas = async () => {
  const result = await pool.query(`
    SELECT 
      id_finca,
      nombre,
      municipio,
      vereda,
      created_at
    FROM finca
  `);
  return result.rows;
};

export const getFincaById = async (id: number) => {
  const result = await pool.query(
    'SELECT * FROM finca WHERE id_finca = $1',
    [id]
  );
  return result.rows[0];
};

export const createFinca = async (finca: Finca) => {
  const { nombre, municipio, vereda } = finca;
  const result = await pool.query(
    `INSERT INTO finca (nombre, municipio, vereda)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombre, municipio, vereda]
  );
  return result.rows[0];
};

export const updateFinca = async (id: number, finca: Finca) => {
  const { nombre, municipio, vereda } = finca;
  const result = await pool.query(
    `UPDATE finca 
     SET nombre = $1, municipio = $2, vereda = $3
     WHERE id_finca = $4
     RETURNING *`,
    [nombre, municipio, vereda, id]
  );
  return result.rows[0];
};

export const deleteFinca = async (id: number) => {
  await pool.query(
    'DELETE FROM finca WHERE id_finca = $1',
    [id]
  );
};