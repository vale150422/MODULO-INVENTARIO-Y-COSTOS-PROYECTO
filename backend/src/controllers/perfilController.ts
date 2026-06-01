import pool from '../database/index';

const obtenerPerfil = async (req: any, res: any) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Error servidor' });
  }
};

export default { obtenerPerfil };