import { useEffect, useState } from 'react';
import { getTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador } from '../../services/trabajadoresService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import './TrabajadorPage.css';

const TrabajadoresPage = () => {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [fincas, setFincas] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [cargo, setCargo] = useState('');
  const [idFinca, setIdFinca] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState('Activo');
  const [nombreEditar, setNombreEditar] = useState('');
  const [cedulaEditar, setCedulaEditar] = useState('');
  const [cargoEditar, setCargoEditar] = useState('');
  const [idFincaEditar, setIdFincaEditar] = useState('');
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [correoEditar, setCorreoEditar] = useState('');
  const [estadoEditar, setEstadoEditar] = useState('Activo');
  const { toasts, showToast, removeToast } = useToast();

  const activos = trabajadores.filter(t => t.estado === 'Activo').length;
  const inactivos = trabajadores.filter(t => t.estado === 'Inactivo').length;

  const cargarTrabajadores = async () => {
    try {
      const res = await getTrabajadores();
      setTrabajadores(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error(error);
      setTrabajadores([]);
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

  useEffect(() => {
    cargarTrabajadores();
    cargarFincas();
  }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !cedula.trim() || !cargo.trim() || !idFinca || !telefono.trim() || !correo.trim()) return;
    try {
      await createTrabajador({ nombre, cedula, cargo, id_finca: Number(idFinca), telefono, correo, estado });
      showToast('Trabajador creado exitosamente', 'success');
      cerrarModal();
      cargarTrabajadores();
    } catch {
      showToast('Error al crear el trabajador', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteTrabajador(id);
      showToast('Trabajador eliminado', 'warning');
      cargarTrabajadores();
    } catch {
      showToast('Error al eliminar el trabajador', 'error');
    }
  };

  const abrirEditar = (t: any) => {
    setTrabajadorSeleccionado(t);
    setNombreEditar(t.nombre);
    setCedulaEditar(t.cedula);
    setCargoEditar(t.cargo);
    setIdFincaEditar(String(t.id_finca));
    setTelefonoEditar(t.telefono);
    setCorreoEditar(t.correo);
    setEstadoEditar(t.estado);
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!nombreEditar.trim() || !cedulaEditar.trim() || !cargoEditar.trim() || !idFincaEditar || !telefonoEditar.trim() || !correoEditar.trim()) return;
    try {
      await updateTrabajador(trabajadorSeleccionado.id_trabajador, {
        nombre: nombreEditar,
        cedula: cedulaEditar,
        cargo: cargoEditar,
        id_finca: Number(idFincaEditar),
        telefono: telefonoEditar,
        correo: correoEditar,
        estado: estadoEditar,
      });
      showToast('Trabajador actualizado correctamente', 'success');
      cerrarModalEditar();
      cargarTrabajadores();
    } catch {
      showToast('Error al actualizar el trabajador', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre('');
    setCedula('');
    setCargo('');
    setIdFinca('');
    setTelefono('');
    setCorreo('');
    setEstado('Activo');
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setTrabajadorSeleccionado(null);
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Trabajadores</h1>
          <p className="pp-subtitle">Gestión de trabajadores registrados</p>
        </div>
        <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo Trabajador
        </button>
      </div>

      {/* CARDS ESTADÍSTICAS */}
      <div className="pp-stats">
        <div className="pp-stat-card">
          <p className="pp-stat-label">Total Trabajadores</p>
          <p className="pp-stat-value">{trabajadores.length}</p>
        </div>
        <div className="pp-stat-card">
          <p className="pp-stat-label">Activos</p>
          <p className="pp-stat-value pp-stat-value--activo">{activos}</p>
        </div>
        <div className="pp-stat-card">
          <p className="pp-stat-label">Inactivos</p>
          <p className="pp-stat-value">{inactivos}</p>
        </div>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header">
          <h2 className="pp-list-title">Lista de Trabajadores</h2>
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Finca</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.length === 0 ? (
              <tr>
                <td colSpan={7} className="pp-empty-row">
                  No hay trabajadores registrados aún.
                </td>
              </tr>
            ) : (
              trabajadores.map((t) => (
                <tr key={t.id_trabajador}>
                  <td className="pp-td-nombre">{t.nombre}</td>
                  <td>{t.cedula}</td>
                  <td><span className="pp-badge">{t.cargo}</span></td>
                  <td>{t.finca_nombre || '—'}</td>
                  <td>
                    <div>{t.telefono}</div>
                    <div className="pp-td-correo">{t.correo}</div>
                  </td>
                  <td>
                    <span className={`pp-estado ${t.estado === 'Activo' ? 'pp-estado--activo' : 'pp-estado--inactivo'}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="pp-td-acciones">
                    <button className="pp-btn-editar" onClick={() => abrirEditar(t)}>Editar</button>
                    <button className="pp-btn-eliminar" onClick={() => handleEliminar(t.id_trabajador)}>Eliminar</button>
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
                <h2 className="pp-modal-title">Nuevo Trabajador</h2>
                <p className="pp-modal-subtitle">Completa los campos para agregar un trabajador</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Juan Pérez" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <label className="pp-label">Cédula</label>
              <input className="pp-input" placeholder="Ej: 1234567890" value={cedula} onChange={(e) => setCedula(e.target.value)} />
              <label className="pp-label">Cargo</label>
              <input className="pp-input" placeholder="Ej: Recolector" value={cargo} onChange={(e) => setCargo(e.target.value)} />
              <label className="pp-label">Finca</label>
              <select className="pp-input" value={idFinca} onChange={(e) => setIdFinca(e.target.value)}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => (
                  <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>
                ))}
              </select>
              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@gmail.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              <label className="pp-label">Estado</label>
              <select className="pp-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
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
                <h2 className="pp-modal-title">Editar Trabajador</h2>
                <p className="pp-modal-subtitle">Modifica los campos del trabajador</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Juan Pérez" value={nombreEditar} onChange={(e) => setNombreEditar(e.target.value)} />
              <label className="pp-label">Cédula</label>
              <input className="pp-input" placeholder="Ej: 1234567890" value={cedulaEditar} onChange={(e) => setCedulaEditar(e.target.value)} />
              <label className="pp-label">Cargo</label>
              <input className="pp-input" placeholder="Ej: Recolector" value={cargoEditar} onChange={(e) => setCargoEditar(e.target.value)} />
              <label className="pp-label">Finca</label>
              <select className="pp-input" value={idFincaEditar} onChange={(e) => setIdFincaEditar(e.target.value)}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => (
                  <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>
                ))}
              </select>
              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567" value={telefonoEditar} onChange={(e) => setTelefonoEditar(e.target.value)} />
              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@gmail.com" value={correoEditar} onChange={(e) => setCorreoEditar(e.target.value)} />
              <label className="pp-label">Estado</label>
              <select className="pp-input" value={estadoEditar} onChange={(e) => setEstadoEditar(e.target.value)}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
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

export default TrabajadoresPage;