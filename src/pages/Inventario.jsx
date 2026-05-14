import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import { MdAdd, MdRefresh } from 'react-icons/md'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import FilterBar from '../components/inventory/FilterBar'
import TableProductos from '../components/inventory/TableProductos'
import FormProducto from '../components/inventory/FormProducto'
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto } from '../services/inventarioService'

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [viewProducto, setViewProducto] = useState(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productosData, categoriasData] = await Promise.all([
          getProductos(),
          getCategorias(),
        ])
        setProductos(productosData || [])
        setCategorias(categoriasData || [])
      } catch (error) {
        console.error(error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Aplicar filtros
  const filteredProductos = productos.filter((producto) => {
    const matchSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchCategoria = !categoria || producto.categoriaId === parseInt(categoria)

    let matchEstado = true
    if (estado === 'agotado') {
      matchEstado = producto.stock <= 0
    } else if (estado === 'bajo') {
      matchEstado = producto.stock > 0 && producto.stock <= producto.stockMinimo
    } else if (estado === 'normal') {
      matchEstado = producto.stock > producto.stockMinimo
    }

    return matchSearch && matchCategoria && matchEstado
  })

  const handleCreateClick = () => {
    setSelectedProducto(null)
    setModalOpen(true)
  }

  const handleEditClick = (producto) => {
    setSelectedProducto(producto)
    setModalOpen(true)
  }

  const handleViewClick = (producto) => {
    setViewProducto(producto)
    setViewModalOpen(true)
  }

  const handleDeleteClick = async (producto) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      text: `¿Está seguro que desea eliminar "${producto.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    })

    if (result.isConfirmed) {
      try {
        await deleteProducto(producto.id)
        setProductos((prev) => prev.filter((p) => p.id !== producto.id))
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El producto ha sido eliminado correctamente',
          timer: 2000,
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error,
        })
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      setSearching(true)
      if (selectedProducto) {
        // Actualizar
        const response = await updateProducto(selectedProducto.id, formData)
        setProductos((prev) =>
          prev.map((p) => (p.id === selectedProducto.id ? response : p))
        )
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El producto ha sido actualizado correctamente',
          timer: 2000,
        })
      } else {
        // Crear
        const response = await createProducto(formData)
        setProductos((prev) => [response, ...prev])
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'El producto ha sido creado correctamente',
          timer: 2000,
        })
      }
      setModalOpen(false)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
      })
    } finally {
      setSearching(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await getProductos()
      setProductos(data || [])
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al recargar los datos',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoria('')
    setEstado('')
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-600 mt-2">Gestión de productos agrícolas</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            icon={MdRefresh}
            onClick={handleRefresh}
            size="lg"
          >
            Recargar
          </Button>
          <Button
            variant="primary"
            icon={MdAdd}
            onClick={handleCreateClick}
            size="lg"
          >
            Nuevo Producto
          </Button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants}>
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoria={categoria}
          onCategoriaChange={setCategoria}
          estado={estado}
          onEstadoChange={setEstado}
          categorias={categorias}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="card-base p-4 text-center">
          <p className="text-slate-600 text-sm font-medium">Total de Productos</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">{productos.length}</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-slate-600 text-sm font-medium">Productos Mostrados</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{filteredProductos.length}</p>
        </div>
        <div className="card-base p-4 text-center">
          <p className="text-slate-600 text-sm font-medium">Bajo Stock</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {productos.filter((p) => p.stock <= p.stockMinimo).length}
          </p>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div variants={itemVariants} className="card-base p-6">
        <TableProductos
          productos={filteredProductos}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onView={handleViewClick}
          loading={loading}
        />
      </motion.div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="xl"
      >
        <FormProducto
          producto={selectedProducto}
          categorias={categorias}
          onSubmit={handleFormSubmit}
          loading={searching}
        />
      </Modal>

      {/* Modal Ver */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Detalles del Producto"
        size="lg"
      >
        {viewProducto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Nombre</p>
                <p className="text-lg font-semibold text-slate-900">{viewProducto.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">SKU</p>
                <p className="text-lg font-semibold text-slate-900">{viewProducto.sku}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Categoría</p>
                <p className="text-lg font-semibold text-slate-900">{viewProducto.categoria}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Precio</p>
                <p className="text-lg font-semibold text-emerald-600">${viewProducto.precio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Stock</p>
                <p className="text-lg font-semibold text-slate-900">{viewProducto.stock}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Stock Mínimo</p>
                <p className="text-lg font-semibold text-slate-900">{viewProducto.stockMinimo}</p>
              </div>
            </div>
            {viewProducto.descripcion && (
              <div>
                <p className="text-sm text-slate-600 mb-2">Descripción</p>
                <p className="text-slate-700">{viewProducto.descripcion}</p>
              </div>
            )}
          </motion.div>
        )}
      </Modal>
    </motion.div>
  )
}
