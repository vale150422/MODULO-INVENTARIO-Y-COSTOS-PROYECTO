import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection';

export const cambiarPassword = async (req: Request, res: Response) => {
  const { actual, nueva } = req.body;
  const id = (req as any).user?.id;
  try {
    const result = await pool.query(
      'SELECT password FROM usuario WHERE id_usuario = $1', [id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(actual, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(nueva, 10);
    await pool.query(
      'UPDATE usuario SET password = $1 WHERE id_usuario = $2', [hash, id]
    );
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE email = $1 AND activo = TRUE', [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, role: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        role: user.rol,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const registro = async (req: Request, res: Response) => {
  const { nombre, email, password, rol = 'empleado' } = req.body;
  try {
    const existe = await pool.query(
      'SELECT id_usuario FROM usuario WHERE email = $1', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, email, rol`,
      [nombre, email, hash, rol]
    );

    res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};