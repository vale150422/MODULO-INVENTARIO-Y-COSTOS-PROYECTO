import { motion } from 'framer-motion'
import { MdEdit, MdDelete, MdEye } from 'react-icons/md'
import Badge from '../ui/Badge'

export default function TableProductos({ productos, onEdit, onDelete, onView, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">No hay productos para mostrar</p>
      </div>
    )
  }

  const getStockStatus = (stock, stockMinimo) => {
    if (stock <= 0) return { variant: 'red', label: 'Agotado' }
    if (stock <= stockMinimo) return { variant: 'yellow', label: 'Bajo Stock' }
    return { variant: 'emerald', label: 'En Stock' }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="overflow-x-auto"
    >
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nombre</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Categoría</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Precio</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {productos.map((producto, index) => {
            const status = getStockStatus(producto.stock, producto.stockMinimo)
            return (
              <motion.tr
                key={producto.id}
                variants={rowVariants}
                className="hover:bg-slate-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 truncate">{producto.nombre}</div>
                  <div className="text-xs text-slate-500">{producto.sku}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{producto.categoria}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{producto.stock}</div>
                  <div className="text-xs text-slate-500">Mín: {producto.stockMinimo}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">${producto.precio.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onView(producto)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Ver"
                    >
                      <MdEye size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(producto)}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <MdEdit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(producto)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <MdDelete size={18} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </motion.div>
  )
}
