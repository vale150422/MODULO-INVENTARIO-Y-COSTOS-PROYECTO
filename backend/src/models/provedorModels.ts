import { pool } from '../database';

export interface Proveedor {
  id_proveedor?: number;
  nombre: string;
  nit: string;
  tipo_producto: string;
  ciudad: string;
  telefono: string;
  correo: string;
}

export const getProveedores = async () => {
  const result = await pool.query(
    'SELECT * FROM proveedor ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getProveedorById = async (id: number) => {
  const result = await pool.query(
    'SELECT * FROM proveedor WHERE id_proveedor = $1',
    [id]
  );
  return result.rows[0];
};

export const createProveedor = async (proveedor: Proveedor) => {
  const { nombre, nit, tipo_producto, ciudad, telefono, correo } = proveedor;
  const result = await pool.query(
    `INSERT INTO proveedor (nombre, nit, tipo_producto, ciudad, telefono, correo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nombre, nit, tipo_producto, ciudad, telefono, correo]
  );
  return result.rows[0];
};

export const updateProveedor = async (id: number, proveedor: Proveedor) => {
  const { nombre, nit, tipo_producto, ciudad, telefono, correo } = proveedor;
  const result = await pool.query(
    `UPDATE proveedor
     SET nombre = $1, nit = $2, tipo_producto = $3, ciudad = $4, telefono = $5, correo = $6
     WHERE id_proveedor = $7
     RETURNING *`,
    [nombre, nit, tipo_producto, ciudad, telefono, correo, id]
  );
  return result.rows[0];
};

export const deleteProveedor = async (id: number) => {
  await pool.query(
    'DELETE FROM proveedor WHERE id_proveedor = $1',
    [id]
  );
};