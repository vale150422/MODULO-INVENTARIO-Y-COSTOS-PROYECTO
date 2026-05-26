import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, reactivarProducto } from '../../services/productoService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { getCategorias } from '../../services/categoriaService';
import "./ProductoPage.css";
import { usePageTitle } from '../../hooks/usePageTitle';

const UNIDADES = ['kg', 'unidad', 'litro', 'arroba', 'bulto'];

const ProductosPage = () => {
   usePageTitle('Productos');
  const [productos, setProductos] = useState<any[]>([]);
  const [fincas, setFincas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [idFinca, setIdFinca] = useState('');
  const [nombreEditar, setNombreEditar] = useState('');
  const [idCategoriaEditar, setIdCategoriaEditar] = useState('');
  const [unidadMedidaEditar, setUnidadMedidaEditar] = useState('');
  const [idFincaEditar, setIdFincaEditar] = useState('');
  const { toasts, showToast, removeToast } = useToast();

  const cargarProductos = async () => {
    try {
      const res = await getProductos();
      setProductos(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error(error);
      setProductos([]);
    }
  };

  const cargarFincas = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fincas');
      const data = await res.json();
      setFincas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await getCategorias();
      setCategorias(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarFincas();
    cargarCategorias();
  }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !idCategoria || !unidadMedida || !idFinca) return;
    try {
      await createProducto({ nombre, id_categoria: Number(idCategoria), unidadMedida, id_finca: Number(idFinca) });
      showToast('Producto creado exitosamente', 'success');
      setNombre(''); setIdCategoria(''); setUnidadMedida(''); setIdFinca('');
      setModalAbierto(false);
      cargarProductos();
    } catch {
      showToast('Error al crear el producto', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteProducto(id);
      showToast('Producto inactivado', 'warning');
      cargarProductos();
    } catch {
      showToast('Error al inactivar el producto', 'error');
    }
  };

  const handleActivar = async (id: number) => {
    try {
      await reactivarProducto(id);
      showToast('Producto activado', 'success');
      cargarProductos();
    } catch {
      showToast('Error al activar el producto', 'error');
    }
  };

  const abrirEditar = (p: any) => {
    setProductoSeleccionado(p);
    setNombreEditar(p.nombre);
    setIdCategoriaEditar(String(p.id_categoria));
    setUnidadMedidaEditar(p.unidadmedida);
    setIdFincaEditar(String(p.id_finca));
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!nombreEditar.trim() || !idCategoriaEditar || !unidadMedidaEditar || !idFincaEditar) return;
    try {
      await updateProducto(productoSeleccionado.id_producto, {
        nombre: nombreEditar,
        id_categoria: Number(idCategoriaEditar),
        unidadMedida: unidadMedidaEditar,
        id_finca: Number(idFincaEditar),
      });
      showToast('Producto actualizado correctamente', 'success');
      setModalEditarAbierto(false);
      setProductoSeleccionado(null);
      cargarProductos();
    } catch {
      showToast('Error al actualizar el producto', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre(''); setIdCategoria(''); setUnidadMedida(''); setIdFinca('');
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Productos</h1>
          <p className="pp-subtitle">Gestión del inventario agrícola</p>
        </div>
        <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo Producto
        </button>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header">
          <h2 className="pp-list-title">Lista de Productos</h2>
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Finca</th>
              <th>Fecha Creación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="pp-empty-row">
                  No hay productos registrados aún
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id_producto} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td className="pp-td-nombre">{p.nombre}</td>
                  <td><span className="pp-badge">{p.categoria_nombre || '—'}</span></td>
                  <td>{p.unidadmedida}</td>
                  <td>{p.finca_nombre || '—'}</td>
                  <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO') : '—'}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: p.activo ? '#dcfce7' : '#fee2e2',
                      color: p.activo ? '#166534' : '#991b1b',
                    }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="pp-td-acciones">
                    <button className="pp-btn-editar"
                      onClick={() => abrirEditar(p)}
                      disabled={!p.activo}
                      style={{ opacity: p.activo ? 1 : 0.4, cursor: p.activo ? 'pointer' : 'not-allowed' }}>
                      Editar
                    </button>
                    {p.activo ? (
                      <button className="pp-btn-eliminar"
                        onClick={() => handleEliminar(p.id_producto)}>
                        Inactivar
                      </button>
                    ) : (
                      <button className="pp-btn-activar"
                        onClick={() => handleActivar(p.id_producto)}>
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {modalAbierto && (
        <div className="pp-modal-overlay" onClick={cerrarModal}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Nuevo Producto</h2>
                <p className="pp-modal-subtitle">Completa los campos para agregar un producto</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Café Pergamino"
                value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <label className="pp-label">Categoría</label>
              <select className="pp-input" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
              <label className="pp-label">Unidad de medida</label>
              <select className="pp-input" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}>
                <option value="">Selecciona una unidad</option>
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <label className="pp-label">Finca</label>
              <select className="pp-input" value={idFinca} onChange={(e) => setIdFinca(e.target.value)}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => (
                  <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>
                ))}
              </select>
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleCrear}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditarAbierto && (
        <div className="pp-modal-overlay" onClick={cerrarModalEditar}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Editar Producto</h2>
                <p className="pp-modal-subtitle">Modifica los campos del producto</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Café Pergamino"
                value={nombreEditar} onChange={(e) => setNombreEditar(e.target.value)} />
              <label className="pp-label">Categoría</label>
              <select className="pp-input" value={idCategoriaEditar} onChange={(e) => setIdCategoriaEditar(e.target.value)}>
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
              <label className="pp-label">Unidad de medida</label>
              <select className="pp-input" value={unidadMedidaEditar} onChange={(e) => setUnidadMedidaEditar(e.target.value)}>
                <option value="">Selecciona una unidad</option>
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <label className="pp-label">Finca</label>
              <select className="pp-input" value={idFincaEditar} onChange={(e) => setIdFincaEditar(e.target.value)}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => (
                  <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>
                ))}
              </select>
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModalEditar}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleEditar}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ProductosPage;