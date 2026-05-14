import { motion } from 'framer-motion'
import { MdFilterList, MdClear } from 'react-icons/md'
import { SearchInput } from '../ui/Input'
import Button from '../ui/Button'

export default function FilterBar({
  searchTerm,
  onSearchChange,
  categoria,
  onCategoriaChange,
  estado,
  onEstadoChange,
  categorias = [],
  onClearFilters,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-6 mb-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <MdFilterList size={24} className="text-primary-600" />
        <h3 className="text-lg font-semibold text-slate-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-2">
          <SearchInput
            placeholder="Buscar por nombre, SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <motion.select
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="input-field"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </motion.select>

        {/* Estado */}
        <motion.select
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los estados</option>
          <option value="agotado">Agotado</option>
          <option value="bajo">Bajo Stock</option>
          <option value="normal">En Stock</option>
        </motion.select>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || categoria || estado) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            icon={MdClear}
            onClick={onClearFilters}
          >
            Limpiar filtros
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
