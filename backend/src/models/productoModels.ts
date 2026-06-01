import { pool } from '../database/index';

export interface Producto {
  id_producto?: number;
  nombre: string;
  id_categoria: number;
  unidadMedida: string;
  id_finca: number;
  stock_minimo?: number;
}

export const getProducts = async () => {
  const result = await pool.query(`
    SELECT 
      p.id_producto,
      p.nombre,
      p.unidadmedida,
      p.created_at,
      p.id_categoria,
      p.id_finca,
      p.activo,
      p.stock_minimo,
      c.nombre AS categoria_nombre,
      f.nombre AS finca_nombre
    FROM producto p
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN finca f ON p.id_finca = f.id_finca
    ORDER BY p.activo DESC, p.nombre ASC
  `);
  return result.rows;
};

export const getProductById = async (id: number) => {
  const result = await pool.query(
    'SELECT * FROM producto WHERE id_producto = $1', [id]
  );
  return result.rows[0];
};

export const createProduct = async (producto: Producto) => {
  const { nombre, id_categoria, unidadMedida, id_finca, stock_minimo = 10 } = producto;
  const result = await pool.query(
    `INSERT INTO producto (nombre, id_categoria, "unidadmedida", id_finca, stock_minimo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, id_categoria, unidadMedida, id_finca, stock_minimo]
  );
  return result.rows[0];
};

export const updateProduct = async (id: number, producto: Producto) => {
  const { nombre, id_categoria, unidadMedida, id_finca, stock_minimo = 10 } = producto;
  const result = await pool.query(
    `UPDATE producto 
     SET nombre = $1, id_categoria = $2, "unidadmedida" = $3, id_finca = $4, stock_minimo = $5
     WHERE id_producto = $6
     RETURNING *`,
    [nombre, id_categoria, unidadMedida, id_finca, stock_minimo, id]
  );
  return result.rows[0];
};

export const inactivarProduct = async (id: number) => {
  const result = await pool.query(
    `UPDATE producto SET activo = false WHERE id_producto = $1 RETURNING *`, [id]
  );
  return result.rows[0];
};

export const activarProduct = async (id: number) => {
  const result = await pool.query(
    `UPDATE producto SET activo = true WHERE id_producto = $1 RETURNING *`, [id]
  );
  return result.rows[0];
};