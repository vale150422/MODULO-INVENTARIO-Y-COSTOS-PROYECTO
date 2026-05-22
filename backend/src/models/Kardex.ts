const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Kardex = db.define('kardex', {
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_movimiento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_anterior: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_nuevo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observacion: {
    type: DataTypes.TEXT
  }
})

module.exports = Kardex