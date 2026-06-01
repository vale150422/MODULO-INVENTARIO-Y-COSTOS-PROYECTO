import { pool } from '../database/index';

export interface Trabajador {
  id_trabajador?: number;
  nombre: string;
  cedula: string;
  cargo: string;
  id_finca: number;
  telefono: string;
  correo: string;
  estado: string;
}

export const getTrabajadores = async () => {
  const result = await pool.query(`
    SELECT 
      t.id_trabajador,
      t.nombre,
      t.cedula,
      t.cargo,
      t.telefono,
      t.correo,
      t.estado,
      t.created_at,
      t.id_finca,
      f.nombre AS finca_nombre
    FROM trabajador t
    LEFT JOIN finca f ON t.id_finca = f.id_finca
    ORDER BY t.created_at DESC
  `);
  return result.rows;
};

export const getTrabajadorById = async (id: number) => {
  const result = await pool.query(
    'SELECT * FROM trabajador WHERE id_trabajador = $1',
    [id]
  );
  return result.rows[0];
};

export const createTrabajador = async (trabajador: Trabajador) => {
  const { nombre, cedula, cargo, id_finca, telefono, correo, estado } = trabajador;
  const result = await pool.query(
    `INSERT INTO trabajador (nombre, cedula, cargo, id_finca, telefono, correo, estado)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [nombre, cedula, cargo, id_finca, telefono, correo, estado]
  );
  return result.rows[0];
};

export const updateTrabajador = async (id: number, trabajador: Trabajador) => {
  const { nombre, cedula, cargo, id_finca, telefono, correo, estado } = trabajador;
  const result = await pool.query(
    `UPDATE trabajador
     SET nombre = $1, cedula = $2, cargo = $3, id_finca = $4, telefono = $5, correo = $6, estado = $7
     WHERE id_trabajador = $8
     RETURNING *`,
    [nombre, cedula, cargo, id_finca, telefono, correo, estado, id]
  );
  return result.rows[0];
};

export const deleteTrabajador = async (id: number) => {
  await pool.query(
    'DELETE FROM trabajador WHERE id_trabajador = $1',
    [id]
  );
};