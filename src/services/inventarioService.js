import API from '../api/axios'

// Productos
export const getProductos = async (filters = {}) => {
  try {
    const response = await API.get('/productos', { params: filters })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener productos'
  }
}

export const getProductoById = async (id) => {
  try {
    const response = await API.get(`/productos/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener producto'
  }
}

export const createProducto = async (data) => {
  try {
    const response = await API.post('/productos', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al crear producto'
  }
}

export const updateProducto = async (id, data) => {
  try {
    const response = await API.put(`/productos/${id}`, data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar producto'
  }
}

export const deleteProducto = async (id) => {
  try {
    const response = await API.delete(`/productos/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al eliminar producto'
  }
}

// Categorías
export const getCategorias = async () => {
  try {
    const response = await API.get('/categorias')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener categorías'
  }
}

// Movimientos
export const getMovimientos = async (filters = {}) => {
  try {
    const response = await API.get('/movimientos', { params: filters })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener movimientos'
  }
}

export const createMovimiento = async (data) => {
  try {
    const response = await API.post('/movimientos', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Error al crear movimiento'
  }
}
