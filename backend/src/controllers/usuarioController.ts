const bcrypt = require('bcryptjs')
const Usuario = require('../models/Usuario')

const cambiarPassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body

    const usuario = await Usuario.findByPk(req.user.id)

    const validar = await bcrypt.compare(actual, usuario.password)

    if (!validar) {
      return res.status(400).json({
        msg: 'Contraseña incorrecta'
      })
    }

    const salt = await bcrypt.genSalt(10)

    usuario.password = await bcrypt.hash(nueva, salt)

    await usuario.save()

    res.json({
      msg: 'Contraseña actualizada'
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: 'Error servidor'
    })
  }
}

module.exports = {
  cambiarPassword
}