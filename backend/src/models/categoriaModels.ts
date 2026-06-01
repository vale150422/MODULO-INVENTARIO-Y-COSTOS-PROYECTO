import { pool } from '../database/index';

export const getCategorias = async () => {
  const result = await pool.query('SELECT * FROM categoria ORDER BY nombre');
  return result.rows;
};

export const createCategoria = async (nombre: string) => {
  const result = await pool.query(
    'INSERT INTO categoria (nombre) VALUES ($1) RETURNING *',
    [nombre]
  );
  return result.rows[0];
};

export const deleteCategoria = async (id: number) => {
  await pool.query('DELETE FROM categoria WHERE id_categoria = $1', [id]);
};