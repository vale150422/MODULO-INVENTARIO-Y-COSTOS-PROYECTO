import { useEffect, useState } from 'react';
import { getTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador } from '../../services/trabajadoresService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { usePageTitle } from '../../hooks/usePageTitle';
import SearchBar from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import './TrabajadorPage.css';

interface ErroresCrear {
  nombre?: string; cedula?: string; cargo?: string;
  idFinca?: string; telefono?: string; correo?: string; modulos?: string;
}

interface ErroresEditar {
  nombreEditar?: string; cedulaEditar?: string; cargoEditar?: string;
  idFincaEditar?: string; telefonoEditar?: string; correoEditar?: string; modulosEditar?: string;
}

// Los códigos deben coincidir con public.modulo en la base de datos
const MODULOS = [
  { codigo: 'cultivo', nombre: 'Cultivos' },
  { codigo: 'inventario', nombre: 'Inventario' },
  { codigo: 'turismo', nombre: 'Turismo' },
];

const nombreModulo = (codigo: string) => MODULOS.find((m) => m.codigo === codigo)?.nombre ?? codigo;

const soloNumeros = (value: string) => value.replace(/\D/g, '');
const correoValido = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const toggleModulo = (lista: string[], codigo: string) =>
  lista.includes(codigo) ? lista.filter((c) => c !== codigo) : [...lista, codigo];

interface SelectorModulosProps {
  seleccionados: string[];
  onToggle: (codigo: string) => void;
  error?: string;
}

const SelectorModulos = ({ seleccionados, onToggle, error }: SelectorModulosProps) => (
  <>
    <label className="pp-label">Módulos a los que puede entrar</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginBottom: 4 }}>
      {MODULOS.map((m) => (
        <label key={m.codigo} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={seleccionados.includes(m.codigo)}
            onChange={() => onToggle(m.codigo)}
          />
          {m.nombre}
        </label>
      ))}
    </div>
    {error && <span className="pp-error">{error}</span>}
  </>
);

const TrabajadoresPage = () => {
  usePageTitle('Trabajadores');
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
  const [modulos, setModulos] = useState<string[]>([]);
  const [erroresCrear, setErroresCrear] = useState<ErroresCrear>({});
  const [estado] = useState('Activo');

  const [nombreEditar, setNombreEditar] = useState('');
  const [cedulaEditar, setCedulaEditar] = useState('');
  const [cargoEditar, setCargoEditar] = useState('');
  const [idFincaEditar, setIdFincaEditar] = useState('');
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [correoEditar, setCorreoEditar] = useState('');
  const [modulosEditar, setModulosEditar] = useState<string[]>([]);
  const [estadoEditar, setEstadoEditar] = useState('Activo');
  const [erroresEditar, setErroresEditar] = useState<ErroresEditar>({});

  const { toasts, showToast, removeToast } = useToast();
  const { query, setQuery, filtered } = useSearch(trabajadores, ['nombre', 'cedula', 'cargo', 'finca_nombre', 'telefono', 'correo']);

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
      const token = localStorage.getItem('token');
      const res = await fetch('https://modulo-inventario-y-costos-proyecto.onrender.com/api/fincas', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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

  const validarCrear = (): boolean => {
    const e: ErroresCrear = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (nombre.trim().split(/\s+/).length < 2) e.nombre = 'Escribe nombre y apellido';
    if (!cedula.trim()) e.cedula = 'La cédula es obligatoria';
    else if (cedula.length < 6) e.cedula = 'La cédula debe tener al menos 6 dígitos';
    if (!cargo.trim()) e.cargo = 'El cargo es obligatorio';
    if (!idFinca) e.idFinca = 'Selecciona una finca';
    if (!telefono.trim()) e.telefono = 'El teléfono es obligatorio';
    else if (telefono.length < 7) e.telefono = 'El teléfono debe tener al menos 7 dígitos';
    if (!correo.trim()) e.correo = 'El correo es obligatorio';
    else if (!correoValido(correo)) e.correo = 'Ingresa un correo válido (ej: correo@gmail.com)';
    if (modulos.length === 0) e.modulos = 'Selecciona al menos un módulo';
    setErroresCrear(e);
    return Object.keys(e).length === 0;
  };

  const validarEditar = (): boolean => {
    const e: ErroresEditar = {};
    if (!nombreEditar.trim()) e.nombreEditar = 'El nombre es obligatorio';
    else if (nombreEditar.trim().split(/\s+/).length < 2) e.nombreEditar = 'Escribe nombre y apellido';
    if (!cedulaEditar.trim()) e.cedulaEditar = 'La cédula es obligatoria';
    else if (cedulaEditar.length < 6) e.cedulaEditar = 'La cédula debe tener al menos 6 dígitos';
    if (!cargoEditar.trim()) e.cargoEditar = 'El cargo es obligatorio';
    if (!idFincaEditar) e.idFincaEditar = 'Selecciona una finca';
    if (!telefonoEditar.trim()) e.telefonoEditar = 'El teléfono es obligatorio';
    else if (telefonoEditar.length < 7) e.telefonoEditar = 'El teléfono debe tener al menos 7 dígitos';
    if (!correoEditar.trim()) e.correoEditar = 'El correo es obligatorio';
    else if (!correoValido(correoEditar)) e.correoEditar = 'Ingresa un correo válido (ej: correo@gmail.com)';
    if (modulosEditar.length === 0) e.modulosEditar = 'Selecciona al menos un módulo';
    setErroresEditar(e);
    return Object.keys(e).length === 0;
  };

  const handleCrear = async () => {
    if (!validarCrear()) return;
    try {
      await createTrabajador({ nombre, cedula, cargo, id_finca: Number(idFinca), telefono, correo, estado, modulos });
      showToast('Trabajador creado exitosamente', 'success');
      cerrarModal();
      cargarTrabajadores();
    } catch (error: any) {
      showToast(error.message || 'Error al crear el trabajador', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteTrabajador(id);
      showToast('Trabajador desactivado', 'warning');
      cargarTrabajadores();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar el trabajador', 'error');
    }
  };

  const abrirEditar = (t: any) => {
    setTrabajadorSeleccionado(t);
    setNombreEditar(t.nombre ?? ''); setCedulaEditar(t.cedula ?? '');
    setCargoEditar(t.cargo ?? ''); setIdFincaEditar(t.id_finca ? String(t.id_finca) : '');
    setTelefonoEditar(t.telefono ?? ''); setCorreoEditar(t.correo ?? '');
    setModulosEditar(Array.isArray(t.modulos) ? t.modulos : []);
    setEstadoEditar(t.estado ?? 'Activo'); setErroresEditar({});
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!validarEditar()) return;
    try {
      await updateTrabajador(trabajadorSeleccionado.id_trabajador, {
        nombre: nombreEditar, cedula: cedulaEditar, cargo: cargoEditar,
        id_finca: Number(idFincaEditar), telefono: telefonoEditar,
        correo: correoEditar, estado: estadoEditar, modulos: modulosEditar,
      });
      showToast('Trabajador actualizado correctamente', 'success');
      cerrarModalEditar();
      cargarTrabajadores();
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar el trabajador', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre(''); setCedula(''); setCargo('');
    setIdFinca(''); setTelefono(''); setCorreo('');
    setModulos([]);
    setErroresCrear({});
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setTrabajadorSeleccionado(null);
    setErroresEditar({});
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
        <div className="pp-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="pp-list-title">Lista de Trabajadores</h2>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, cédula, cargo..."
            resultCount={filtered.length}
            totalCount={trabajadores.length}
          />
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Finca</th>
              <th>Módulos</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="pp-empty-row">
                  {query ? `No se encontraron resultados para "${query}"` : 'No hay trabajadores registrados aún.'}
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id_trabajador}>
                  <td className="pp-td-nombre">{t.nombre}</td>
                  <td>{t.cedula || '—'}</td>
                  <td>{t.cargo ? <span className="pp-badge">{t.cargo}</span> : '—'}</td>
                  <td>{t.finca_nombre || '—'}</td>
                  <td>
                    {Array.isArray(t.modulos) && t.modulos.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {t.modulos.map((c: string) => (
                          <span key={c} className="pp-badge">{nombreModulo(c)}</span>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <div>{t.telefono || '—'}</div>
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
              <input className={`pp-input ${erroresCrear.nombre ? 'pp-input--error' : ''}`} placeholder="Ej: Juan Pérez" value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErroresCrear(prev => ({ ...prev, nombre: undefined })); }} />
              {erroresCrear.nombre && <span className="pp-error">{erroresCrear.nombre}</span>}

              <label className="pp-label">Cédula</label>
              <input className={`pp-input ${erroresCrear.cedula ? 'pp-input--error' : ''}`} placeholder="Ej: 1234567890" value={cedula} inputMode="numeric" maxLength={10}
                onChange={(e) => { setCedula(soloNumeros(e.target.value)); setErroresCrear(prev => ({ ...prev, cedula: undefined })); }} />
              {erroresCrear.cedula && <span className="pp-error">{erroresCrear.cedula}</span>}

              <label className="pp-label">Cargo</label>
              <input className={`pp-input ${erroresCrear.cargo ? 'pp-input--error' : ''}`} placeholder="Ej: Recolector" value={cargo}
                onChange={(e) => { setCargo(e.target.value); setErroresCrear(prev => ({ ...prev, cargo: undefined })); }} />
              {erroresCrear.cargo && <span className="pp-error">{erroresCrear.cargo}</span>}

              <label className="pp-label">Finca</label>
              <select className={`pp-input ${erroresCrear.idFinca ? 'pp-input--error' : ''}`} value={idFinca}
                onChange={(e) => { setIdFinca(e.target.value); setErroresCrear(prev => ({ ...prev, idFinca: undefined })); }}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>)}
              </select>
              {erroresCrear.idFinca && <span className="pp-error">{erroresCrear.idFinca}</span>}

              <label className="pp-label">Teléfono</label>
              <input className={`pp-input ${erroresCrear.telefono ? 'pp-input--error' : ''}`} placeholder="Ej: 3001234567" value={telefono} inputMode="numeric" maxLength={10}
                onChange={(e) => { setTelefono(soloNumeros(e.target.value)); setErroresCrear(prev => ({ ...prev, telefono: undefined })); }} />
              {erroresCrear.telefono && <span className="pp-error">{erroresCrear.telefono}</span>}

              <label className="pp-label">Correo</label>
              <input className={`pp-input ${erroresCrear.correo ? 'pp-input--error' : ''}`} placeholder="Ej: correo@gmail.com" value={correo}
                onChange={(e) => { setCorreo(e.target.value); setErroresCrear(prev => ({ ...prev, correo: undefined })); }} />
              {erroresCrear.correo && <span className="pp-error">{erroresCrear.correo}</span>}

              <SelectorModulos
                seleccionados={modulos}
                onToggle={(codigo) => {
                  setModulos((prev) => toggleModulo(prev, codigo));
                  setErroresCrear(prev => ({ ...prev, modulos: undefined }));
                }}
                error={erroresCrear.modulos}
              />
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleCrear}>Guardar</button>
            </div>
          </div>
        </div>
      )}

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
              <input className={`pp-input ${erroresEditar.nombreEditar ? 'pp-input--error' : ''}`} placeholder="Ej: Juan Pérez" value={nombreEditar}
                onChange={(e) => { setNombreEditar(e.target.value); setErroresEditar(prev => ({ ...prev, nombreEditar: undefined })); }} />
              {erroresEditar.nombreEditar && <span className="pp-error">{erroresEditar.nombreEditar}</span>}

              <label className="pp-label">Cédula</label>
              <input className={`pp-input ${erroresEditar.cedulaEditar ? 'pp-input--error' : ''}`} placeholder="Ej: 1234567890" value={cedulaEditar} inputMode="numeric" maxLength={10}
                onChange={(e) => { setCedulaEditar(soloNumeros(e.target.value)); setErroresEditar(prev => ({ ...prev, cedulaEditar: undefined })); }} />
              {erroresEditar.cedulaEditar && <span className="pp-error">{erroresEditar.cedulaEditar}</span>}

              <label className="pp-label">Cargo</label>
              <input className={`pp-input ${erroresEditar.cargoEditar ? 'pp-input--error' : ''}`} placeholder="Ej: Recolector" value={cargoEditar}
                onChange={(e) => { setCargoEditar(e.target.value); setErroresEditar(prev => ({ ...prev, cargoEditar: undefined })); }} />
              {erroresEditar.cargoEditar && <span className="pp-error">{erroresEditar.cargoEditar}</span>}

              <label className="pp-label">Finca</label>
              <select className={`pp-input ${erroresEditar.idFincaEditar ? 'pp-input--error' : ''}`} value={idFincaEditar}
                onChange={(e) => { setIdFincaEditar(e.target.value); setErroresEditar(prev => ({ ...prev, idFincaEditar: undefined })); }}>
                <option value="">Selecciona una finca</option>
                {fincas.map((f) => <option key={f.id_finca} value={f.id_finca}>{f.nombre}</option>)}
              </select>
              {erroresEditar.idFincaEditar && <span className="pp-error">{erroresEditar.idFincaEditar}</span>}

              <label className="pp-label">Teléfono</label>
              <input className={`pp-input ${erroresEditar.telefonoEditar ? 'pp-input--error' : ''}`} placeholder="Ej: 3001234567" value={telefonoEditar} inputMode="numeric" maxLength={10}
                onChange={(e) => { setTelefonoEditar(soloNumeros(e.target.value)); setErroresEditar(prev => ({ ...prev, telefonoEditar: undefined })); }} />
              {erroresEditar.telefonoEditar && <span className="pp-error">{erroresEditar.telefonoEditar}</span>}

              <label className="pp-label">Correo</label>
              <input className={`pp-input ${erroresEditar.correoEditar ? 'pp-input--error' : ''}`} placeholder="Ej: correo@gmail.com" value={correoEditar}
                onChange={(e) => { setCorreoEditar(e.target.value); setErroresEditar(prev => ({ ...prev, correoEditar: undefined })); }} />
              {erroresEditar.correoEditar && <span className="pp-error">{erroresEditar.correoEditar}</span>}

              <SelectorModulos
                seleccionados={modulosEditar}
                onToggle={(codigo) => {
                  setModulosEditar((prev) => toggleModulo(prev, codigo));
                  setErroresEditar(prev => ({ ...prev, modulosEditar: undefined }));
                }}
                error={erroresEditar.modulosEditar}
              />

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