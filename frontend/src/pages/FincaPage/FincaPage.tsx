import { useEffect, useState } from 'react';
import { getFincas, createFinca, updateFinca, deleteFinca } from '../../services/fincaService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { useAuth } from '../../hooks/useAuth';
import './FincaPage.css';

const FincasPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fincas, setFincas] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [fincaSeleccionada, setFincaSeleccionada] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [vereda, setVereda] = useState('');
  const [nombreEditar, setNombreEditar] = useState('');
  const [municipioEditar, setMunicipioEditar] = useState('');
  const [veredaEditar, setVeredaEditar] = useState('');
  const { toasts, showToast, removeToast } = useToast();

  const cargarFincas = async () => {
    try {
      const res = await getFincas();
      setFincas(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error(error);
      setFincas([]);
    }
  };

  useEffect(() => {
    cargarFincas();
  }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !municipio.trim() || !vereda.trim()) return;
    try {
      await createFinca({ nombre, municipio, vereda });
      showToast('Finca creada exitosamente', 'success');
      setNombre(''); setMunicipio(''); setVereda('');
      setModalAbierto(false);
      cargarFincas();
    } catch {
      showToast('Error al crear la finca', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteFinca(id);
      showToast('Finca eliminada', 'warning');
      cargarFincas();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar la finca', 'error');
    }
  };

  const abrirEditar = (f: any) => {
    setFincaSeleccionada(f);
    setNombreEditar(f.nombre);
    setMunicipioEditar(f.municipio);
    setVeredaEditar(f.vereda);
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!nombreEditar.trim() || !municipioEditar.trim() || !veredaEditar.trim()) return;
    try {
      await updateFinca(fincaSeleccionada.id_finca, {
        nombre: nombreEditar,
        municipio: municipioEditar,
        vereda: veredaEditar,
      });
      showToast('Finca actualizada correctamente', 'success');
      setModalEditarAbierto(false);
      setFincaSeleccionada(null);
      cargarFincas();
    } catch {
      showToast('Error al actualizar la finca', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre(''); setMunicipio(''); setVereda('');
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setFincaSeleccionada(null);
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Fincas</h1>
          <p className="pp-subtitle">
            {isAdmin ? 'Gestión de fincas registradas' : 'Fincas disponibles'}
          </p>
        </div>
        {/* Botón Nueva Finca solo para admin */}
        {isAdmin && (
          <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
            + Nueva Finca
          </button>
        )}
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header">
          <h2 className="pp-list-title">Lista de Fincas</h2>
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Municipio</th>
              <th>Vereda</th>
              <th>Fecha Creación</th>
              {/* Columna Acciones solo para admin */}
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {fincas.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="pp-empty-row">
                  No hay fincas registradas aún
                </td>
              </tr>
            ) : (
              fincas.map((f) => (
                <tr key={f.id_finca}>
                  <td className="pp-td-nombre">{f.nombre}</td>
                  <td>{f.municipio || '—'}</td>
                  <td>{f.vereda || '—'}</td>
                  <td>{f.created_at ? new Date(f.created_at).toLocaleDateString('es-CO') : '—'}</td>
                  {/* Botones solo para admin */}
                  {isAdmin && (
                    <td className="pp-td-acciones">
                      <button className="pp-btn-editar" onClick={() => abrirEditar(f)}>Editar</button>
                      <button className="pp-btn-eliminar" onClick={() => handleEliminar(f.id_finca)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR — solo admin llega aquí */}
      {modalAbierto && isAdmin && (
        <div className="pp-modal-overlay" onClick={cerrarModal}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Nueva Finca</h2>
                <p className="pp-modal-subtitle">Completa los campos para agregar una finca</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Miraflores"
                value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <label className="pp-label">Municipio</label>
              <input className="pp-input" placeholder="Ej: Caicedonia"
                value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
              <label className="pp-label">Vereda</label>
              <input className="pp-input" placeholder="Ej: La Esmeralda"
                value={vereda} onChange={(e) => setVereda(e.target.value)} />
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleCrear}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR — solo admin */}
      {modalEditarAbierto && isAdmin && (
        <div className="pp-modal-overlay" onClick={cerrarModalEditar}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Editar Finca</h2>
                <p className="pp-modal-subtitle">Modifica los campos de la finca</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Miraflores"
                value={nombreEditar} onChange={(e) => setNombreEditar(e.target.value)} />
              <label className="pp-label">Municipio</label>
              <input className="pp-input" placeholder="Ej: Caicedonia"
                value={municipioEditar} onChange={(e) => setMunicipioEditar(e.target.value)} />
              <label className="pp-label">Vereda</label>
              <input className="pp-input" placeholder="Ej: La Esmeralda"
                value={veredaEditar} onChange={(e) => setVeredaEditar(e.target.value)} />
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

export default FincasPage;