import { useEffect, useState } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedorService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { usePageTitle } from '../../hooks/usePageTitle';
import './ProveedorPage.css';

const ProveedoresPage = () => {
  usePageTitle('Proveedor');
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [tipoProducto, setTipoProducto] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [nombreEditar, setNombreEditar] = useState('');
  const [nitEditar, setNitEditar] = useState('');
  const [tipoProductoEditar, setTipoProductoEditar] = useState('');
  const [ciudadEditar, setCiudadEditar] = useState('');
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [correoEditar, setCorreoEditar] = useState('');
  const { toasts, showToast, removeToast } = useToast();

  const cargarProveedores = async () => {
    try {
      const res = await getProveedores();
      setProveedores(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error(error);
      setProveedores([]);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !nit.trim() || !tipoProducto.trim() || !ciudad.trim() || !telefono.trim() || !correo.trim()) return;
    try {
      await createProveedor({ nombre, nit, tipo_producto: tipoProducto, ciudad, telefono, correo });
      showToast('Proveedor creado exitosamente', 'success');
      cerrarModal();
      cargarProveedores();
    } catch {
      showToast('Error al crear el proveedor', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteProveedor(id);
      showToast('Proveedor eliminado', 'warning');
      cargarProveedores();
    } catch {
      showToast('Error al eliminar el proveedor', 'error');
    }
  };

  const abrirEditar = (p: any) => {
    setProveedorSeleccionado(p);
    setNombreEditar(p.nombre);
    setNitEditar(p.nit);
    setTipoProductoEditar(p.tipo_producto);
    setCiudadEditar(p.ciudad);
    setTelefonoEditar(p.telefono);
    setCorreoEditar(p.correo);
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!nombreEditar.trim() || !nitEditar.trim() || !tipoProductoEditar.trim() || !ciudadEditar.trim() || !telefonoEditar.trim() || !correoEditar.trim()) return;
    try {
      await updateProveedor(proveedorSeleccionado.id_proveedor, {
        nombre: nombreEditar,
        nit: nitEditar,
        tipo_producto: tipoProductoEditar,
        ciudad: ciudadEditar,
        telefono: telefonoEditar,
        correo: correoEditar,
      });
      showToast('Proveedor actualizado correctamente', 'success');
      cerrarModalEditar();
      cargarProveedores();
    } catch {
      showToast('Error al actualizar el proveedor', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre('');
    setNit('');
    setTipoProducto('');
    setCiudad('');
    setTelefono('');
    setCorreo('');
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setProveedorSeleccionado(null);
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Proveedores</h1>
          <p className="pp-subtitle">Gestión de proveedores registrados</p>
        </div>
        <div className="pp-header-right">
          <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
            + Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* TARJETA STAT */}
      <div className="pp-stats-row">
        <div className="pp-stat-card">
          <span className="pp-stat-label">Total Proveedores</span>
          <span className="pp-stat-number">{proveedores.length}</span>
        </div>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header">
          <h2 className="pp-list-title">Lista de Proveedores</h2>
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Tipo Producto</th>
              <th>Ciudad</th>
              <th>Contacto</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={7} className="pp-empty-row">
                  No hay proveedores registrados aún.
                </td>
              </tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.id_proveedor}>
                  <td className="pp-td-nombre">{p.nombre}</td>
                  <td>{p.nit}</td>
                  <td><span className="pp-badge">{p.tipo_producto}</span></td>
                  <td>{p.ciudad}</td>
                  <td>
                    <div>{p.telefono}</div>
                    <div className="pp-td-correo">{p.correo}</div>
                  </td>
                  <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO') : '—'}</td>
                  <td className="pp-td-acciones">
                    <button className="pp-btn-editar" onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="pp-btn-eliminar" onClick={() => handleEliminar(p.id_proveedor)}>Eliminar</button>
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
                <h2 className="pp-modal-title">Nuevo Proveedor</h2>
                <p className="pp-modal-subtitle">Completa los campos para agregar un proveedor</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Agro Suministros S.A" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <label className="pp-label">NIT</label>
              <input className="pp-input" placeholder="Ej: 900123456-1" value={nit} onChange={(e) => setNit(e.target.value)} />
              <label className="pp-label">Tipo de Producto</label>
              <input className="pp-input" placeholder="Ej: Fertilizantes" value={tipoProducto} onChange={(e) => setTipoProducto(e.target.value)} />
              <label className="pp-label">Ciudad</label>
              <input className="pp-input" placeholder="Ej: Caicedonia" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@empresa.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
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
                <h2 className="pp-modal-title">Editar Proveedor</h2>
                <p className="pp-modal-subtitle">Modifica los campos del proveedor</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Agro Suministros S.A" value={nombreEditar} onChange={(e) => setNombreEditar(e.target.value)} />
              <label className="pp-label">NIT</label>
              <input className="pp-input" placeholder="Ej: 900123456-1" value={nitEditar} onChange={(e) => setNitEditar(e.target.value)} />
              <label className="pp-label">Tipo de Producto</label>
              <input className="pp-input" placeholder="Ej: Fertilizantes" value={tipoProductoEditar} onChange={(e) => setTipoProductoEditar(e.target.value)} />
              <label className="pp-label">Ciudad</label>
              <input className="pp-input" placeholder="Ej: Caicedonia" value={ciudadEditar} onChange={(e) => setCiudadEditar(e.target.value)} />
              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567" value={telefonoEditar} onChange={(e) => setTelefonoEditar(e.target.value)} />
              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@empresa.com" value={correoEditar} onChange={(e) => setCorreoEditar(e.target.value)} />
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

export default ProveedoresPage;