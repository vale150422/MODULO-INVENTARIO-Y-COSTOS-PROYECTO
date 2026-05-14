import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { MdSave } from 'react-icons/md'

export default function FormProducto({ producto, categorias = [], onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    descripcion: '',
    categoriaId: '',
    stock: 0,
    stockMinimo: 0,
    precio: 0,
    unidadMedida: 'kg',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        sku: producto.sku || '',
        descripcion: producto.descripcion || '',
        categoriaId: producto.categoriaId || '',
        stock: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 0,
        precio: producto.precio || 0,
        unidadMedida: producto.unidadMedida || 'kg',
      })
    }
  }, [producto])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido'
    if (!formData.sku) newErrors.sku = 'El SKU es requerido'
    if (!formData.categoriaId) newErrors.categoriaId = 'La categoría es requerida'
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo'
    if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('stock') || name.includes('precio') ? parseFloat(value) || 0 : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Nombre */}
      <Input
        label="Nombre del Producto"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        error={errors.nombre}
        required
        placeholder="Ej: Fertilizante NPK"
      />

      {/* SKU */}
      <Input
        label="SKU (Código)"
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        error={errors.sku}
        required
        placeholder="Ej: FER-001"
      />

      {/* Descripción */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción del producto..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
          rows="3"
        />
      </motion.div>

      {/* Categoría */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          name="categoriaId"
          value={formData.categoriaId}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaId && <p className="mt-1 text-sm text-red-500">{errors.categoriaId}</p>}
      </motion.div>

      {/* Stock y Stock Mínimo */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Actual"
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          error={errors.stock}
          required
        />
        <Input
          label="Stock Mínimo"
          type="number"
          name="stockMinimo"
          value={formData.stockMinimo}
          onChange={handleChange}
          required
        />
      </div>

      {/* Precio y Unidad */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio Unitario ($)"
          type="number"
          step="0.01"
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          error={errors.precio}
          required
        />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block text-sm font-medium text-slate-700 mb-2">Unidad de Medida</label>
          <select
            name="unidadMedida"
            value={formData.unidadMedida}
            onChange={handleChange}
            className="input-field"
          >
            <option value="kg">Kilogramos (kg)</option>
            <option value="lt">Litros (lt)</option>
            <option value="uni">Unidades</option>
            <option value="m">Metros (m)</option>
            <option value="m2">Metros cuadrados (m²)</option>
          </select>
        </motion.div>
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 pt-4"
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={MdSave}
          loading={loading}
          className="flex-1"
        >
          {producto ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </motion.div>
    </motion.form>
  )
}
