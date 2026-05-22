const Usuario = require('../models/Usuario')

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: {
        exclude: ['password']
      }
    })

    res.json(usuario)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: 'Error servidor'
    })
  }
}

module.exports = {
  obtenerPerfil
}