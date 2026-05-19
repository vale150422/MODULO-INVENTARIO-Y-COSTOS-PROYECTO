import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1', [email]
    );
    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.rol } });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};