import bcrypt from 'bcryptjs';
import pool from '../../config/db';

const cambiarPassword = async (req: any, res: any) => {
  try {
    const { actual, nueva } = req.body;

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    const validar = await bcrypt.compare(actual, usuario.password);

    if (!validar) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const nuevaHash = await bcrypt.hash(nueva, salt);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [nuevaHash, req.user.id]
    );

    res.json({ msg: 'Contraseña actualizada' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error servidor' });
  }
};

export default { cambiarPassword };