import { useEffect, useState } from 'react';
import { getFincas, createFinca, updateFinca, deleteFinca } from '../../services/fincaService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import SearchBar from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import './FincaPage.css';

interface ErroresCrear {
  nombre?: string;
  municipio?: string;
  vereda?: string;
}

interface ErroresEditar {
  nombreEditar?: string;
  municipioEditar?: string;
  veredaEditar?: string;
}

const soloTexto = (value: string) =>
  /\d/.test(value) ? 'Este campo no debe contener números' : undefined;

const FincasPage = () => {
  usePageTitle('Fincas');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fincas, setFincas] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [fincaSeleccionada, setFincaSeleccionada] = useState<any>(null);

  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [vereda, setVereda] = useState('');
  const [erroresCrear, setErroresCrear] = useState<ErroresCrear>({});

  const [nombreEditar, setNombreEditar] = useState('');
  const [municipioEditar, setMunicipioEditar] = useState('');
  const [veredaEditar, setVeredaEditar] = useState('');
  const [erroresEditar, setErroresEditar] = useState<ErroresEditar>({});

  const { toasts, showToast, removeToast } = useToast();
  const { query, setQuery, filtered } = useSearch(fincas, ['nombre', 'municipio', 'vereda']);

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

  const validarCrear = (): boolean => {
    const e: ErroresCrear = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!municipio.trim()) e.municipio = 'El municipio es obligatorio';
    else if (municipio.trim().length < 3) e.municipio = 'El municipio debe tener al menos 3 caracteres';
    else if (soloTexto(municipio)) e.municipio = soloTexto(municipio);
    if (!vereda.trim()) e.vereda = 'La vereda es obligatoria';
    else if (vereda.trim().length < 3) e.vereda = 'La vereda debe tener al menos 3 caracteres';
    else if (soloTexto(vereda)) e.vereda = soloTexto(vereda);
    setErroresCrear(e);
    return Object.keys(e).length === 0;
  };

  const validarEditar = (): boolean => {
    const e: ErroresEditar = {};
    if (!nombreEditar.trim()) e.nombreEditar = 'El nombre es obligatorio';
    else if (nombreEditar.trim().length < 3) e.nombreEditar = 'El nombre debe tener al menos 3 caracteres';
    if (!municipioEditar.trim()) e.municipioEditar = 'El municipio es obligatorio';
    else if (municipioEditar.trim().length < 3) e.municipioEditar = 'El municipio debe tener al menos 3 caracteres';
    else if (soloTexto(municipioEditar)) e.municipioEditar = soloTexto(municipioEditar);
    if (!veredaEditar.trim()) e.veredaEditar = 'La vereda es obligatoria';
    else if (veredaEditar.trim().length < 3) e.veredaEditar = 'La vereda debe tener al menos 3 caracteres';
    else if (soloTexto(veredaEditar)) e.veredaEditar = soloTexto(veredaEditar);
    setErroresEditar(e);
    return Object.keys(e).length === 0;
  };

  const handleCrear = async () => {
    if (!validarCrear()) return;
    try {
      await createFinca({ nombre, municipio, vereda });
      showToast('Finca creada exitosamente', 'success');
      cerrarModal();
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
    setErroresEditar({});
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!validarEditar()) return;
    try {
      await updateFinca(fincaSeleccionada.id_finca, {
        nombre: nombreEditar,
        municipio: municipioEditar,
        vereda: veredaEditar,
      });
      showToast('Finca actualizada correctamente', 'success');
      cerrarModalEditar();
      cargarFincas();
    } catch {
      showToast('Error al actualizar la finca', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre('');
    setMunicipio('');
    setVereda('');
    setErroresCrear({});
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setFincaSeleccionada(null);
    setErroresEditar({});
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
        {isAdmin && (
          <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
            + Nueva Finca
          </button>
        )}
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="pp-list-title">Lista de Fincas</h2>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, municipio, vereda..."
            resultCount={filtered.length}
            totalCount={fincas.length}
          />
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Municipio</th>
              <th>Vereda</th>
              <th>Fecha Creación</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="pp-empty-row">
                  {query ? `No se encontraron resultados para "${query}"` : 'No hay fincas registradas aún'}
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.id_finca}>
                  <td className="pp-td-nombre">{f.nombre}</td>
                  <td>{f.municipio || '—'}</td>
                  <td>{f.vereda || '—'}</td>
                  <td>{f.created_at ? new Date(f.created_at).toLocaleDateString('es-CO') : '—'}</td>
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
              <input
                className={`pp-input ${erroresCrear.nombre ? 'pp-input--error' : ''}`}
                placeholder="Ej: Miraflores"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErroresCrear(prev => ({ ...prev, nombre: undefined })); }}
              />
              {erroresCrear.nombre && <span className="pp-error">{erroresCrear.nombre}</span>}

              <label className="pp-label">Municipio</label>
              <input
                className={`pp-input ${erroresCrear.municipio ? 'pp-input--error' : ''}`}
                placeholder="Ej: Caicedonia"
                value={municipio}
                onChange={(e) => { setMunicipio(e.target.value); setErroresCrear(prev => ({ ...prev, municipio: undefined })); }}
              />
              {erroresCrear.municipio && <span className="pp-error">{erroresCrear.municipio}</span>}

              <label className="pp-label">Vereda</label>
              <input
                className={`pp-input ${erroresCrear.vereda ? 'pp-input--error' : ''}`}
                placeholder="Ej: La Esmeralda"
                value={vereda}
                onChange={(e) => { setVereda(e.target.value); setErroresCrear(prev => ({ ...prev, vereda: undefined })); }}
              />
              {erroresCrear.vereda && <span className="pp-error">{erroresCrear.vereda}</span>}
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleCrear}>Guardar</button>
            </div>
          </div>
        </div>
      )}

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
              <input
                className={`pp-input ${erroresEditar.nombreEditar ? 'pp-input--error' : ''}`}
                placeholder="Ej: Miraflores"
                value={nombreEditar}
                onChange={(e) => { setNombreEditar(e.target.value); setErroresEditar(prev => ({ ...prev, nombreEditar: undefined })); }}
              />
              {erroresEditar.nombreEditar && <span className="pp-error">{erroresEditar.nombreEditar}</span>}

              <label className="pp-label">Municipio</label>
              <input
                className={`pp-input ${erroresEditar.municipioEditar ? 'pp-input--error' : ''}`}
                placeholder="Ej: Caicedonia"
                value={municipioEditar}
                onChange={(e) => { setMunicipioEditar(e.target.value); setErroresEditar(prev => ({ ...prev, municipioEditar: undefined })); }}
              />
              {erroresEditar.municipioEditar && <span className="pp-error">{erroresEditar.municipioEditar}</span>}

              <label className="pp-label">Vereda</label>
              <input
                className={`pp-input ${erroresEditar.veredaEditar ? 'pp-input--error' : ''}`}
                placeholder="Ej: La Esmeralda"
                value={veredaEditar}
                onChange={(e) => { setVeredaEditar(e.target.value); setErroresEditar(prev => ({ ...prev, veredaEditar: undefined })); }}
              />
              {erroresEditar.veredaEditar && <span className="pp-error">{erroresEditar.veredaEditar}</span>}
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