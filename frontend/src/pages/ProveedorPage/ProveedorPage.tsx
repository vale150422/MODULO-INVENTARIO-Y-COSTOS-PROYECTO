import { useEffect, useState, KeyboardEvent } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedorService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { usePageTitle } from '../../hooks/usePageTitle';
import SearchBar from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import './ProveedorPage.css';

const parseTags = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  const str = String(raw).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {}
  if (str.includes(',')) return str.split(',').map((s) => s.trim()).filter(Boolean);
  return str.split(/\s+/).map((s) => s.trim()).filter(Boolean);
};

const serializeTags = (tags: string[]): string => JSON.stringify(tags);
const soloNumeros = (value: string) => value.replace(/\D/g, '');
const correoValido = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const nitValido = (value: string) => /^[0-9]{6,15}(-[0-9])?$/.test(value.trim());

const PRODUCTOS_SUGERIDOS = [
  'Fertilizantes', 'Fungicidas', 'Herbicidas', 'Insecticidas',
  'Abonos', 'Semillas', 'Plaguicidas', 'Correctivos de suelo',
  'Equipos agrícolas', 'Mangueras y riego', 'Empaques',
];

interface ErroresForm {
  nombre?: string; nit?: string; tipoProducto?: string;
  ciudad?: string; telefono?: string; correo?: string;
}

interface TagInputProps {
  tags: string[]; onChange: (tags: string[]) => void;
  placeholder?: string; hasError?: boolean;
}

const TagInput = ({ tags, onChange, placeholder = 'Ej: Fertilizantes', hasError }: TagInputProps) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };
  const removeTag = (index: number) => onChange(tags.filter((_, i) => i !== index));
  const toggleSuggestion = (producto: string) => {
    if (tags.includes(producto)) onChange(tags.filter((t) => t !== producto));
    else onChange([...tags, producto]);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    else if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags.length - 1);
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const suggestions = input.trim()
    ? PRODUCTOS_SUGERIDOS.filter(p => p.toLowerCase().includes(input.toLowerCase()) && !tags.includes(p))
    : PRODUCTOS_SUGERIDOS;

  return (
    <div className="pp-tag-field">
      <div
        className={`pp-tag-input-wrapper${hasError ? ' pp-input--error' : ''}`}
        onClick={() => { setShowSuggestions(true); (document.querySelector('.pp-tag-input') as HTMLInputElement)?.focus(); }}
      >
        {tags.map((tag, i) => (
          <span key={i} className="pp-tag-chip">
            {tag}
            <button type="button" className="pp-tag-remove"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }} aria-label={`Eliminar ${tag}`}>×</button>
          </span>
        ))}
        <input className="pp-tag-input" value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown} onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : 'Buscar o agregar…'} />
      </div>
      {showSuggestions && (
        <div className="pp-suggestions-box">
          <p className="pp-suggestions-label">Productos sugeridos</p>
          <div className="pp-suggestions-grid">
            {suggestions.map((producto) => {
              const selected = tags.includes(producto);
              return (
                <button key={producto} type="button"
                  className={`pp-suggestion-item${selected ? ' pp-suggestion-selected' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); toggleSuggestion(producto); }}>
                  <span className="pp-suggestion-check">{selected ? '✓' : ''}</span>{producto}
                </button>
              );
            })}
          </div>
          {input.trim() && !PRODUCTOS_SUGERIDOS.some(p => p.toLowerCase() === input.toLowerCase()) && (
            <button type="button" className="pp-suggestion-custom"
              onMouseDown={(e) => { e.preventDefault(); addTag(input); }}>
              + Agregar "{input.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface FormModalProps {
  isEdit: boolean; onClose: () => void; onSave: () => void;
  nombre: string; setNombre: (v: string) => void;
  nit: string; setNit: (v: string) => void;
  tipoProductoTags: string[]; setTipoProductoTags: (v: string[]) => void;
  ciudad: string; setCiudad: (v: string) => void;
  telefono: string; setTelefono: (v: string) => void;
  correo: string; setCorreo: (v: string) => void;
  errores: ErroresForm; limpiarError: (campo: keyof ErroresForm) => void;
}

const FormModal = ({
  isEdit, onClose, onSave, nombre, setNombre, nit, setNit,
  tipoProductoTags, setTipoProductoTags, ciudad, setCiudad,
  telefono, setTelefono, correo, setCorreo, errores, limpiarError,
}: FormModalProps) => (
  <div className="pp-modal-overlay" onClick={onClose}>
    <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
      <div className="pp-modal-header">
        <h2 className="pp-modal-title">{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <p className="pp-modal-subtitle">
          {isEdit ? 'Modifica los campos del proveedor' : 'Completa los campos para agregar un proveedor'}
        </p>
      </div>
      <div className="pp-modal-body">
        <label className="pp-label">Nombre</label>
        <input className={`pp-input ${errores.nombre ? 'pp-input--error' : ''}`}
          placeholder="Ej: Agro Suministros S.A" value={nombre}
          onChange={(e) => { setNombre(e.target.value); limpiarError('nombre'); }} />
        {errores.nombre && <span className="pp-error">{errores.nombre}</span>}

        <label className="pp-label">NIT</label>
        <input className={`pp-input ${errores.nit ? 'pp-input--error' : ''}`}
          placeholder="Ej: 900123456-1" value={nit} inputMode="numeric"
          onChange={(e) => { setNit(e.target.value); limpiarError('nit'); }} />
        {errores.nit && <span className="pp-error">{errores.nit}</span>}

        <div className="pp-label-row">
          <label className="pp-label">Productos que provee</label>
          <span className="pp-label-hint">Escribe y presiona Enter</span>
        </div>
        <TagInput tags={tipoProductoTags}
          onChange={(v) => { setTipoProductoTags(v); limpiarError('tipoProducto'); }}
          placeholder="Ej: Fertilizantes" hasError={!!errores.tipoProducto} />
        {errores.tipoProducto && <span className="pp-error">{errores.tipoProducto}</span>}

        <label className="pp-label">Ciudad</label>
        <input className={`pp-input ${errores.ciudad ? 'pp-input--error' : ''}`}
          placeholder="Ej: Caicedonia" value={ciudad}
          onChange={(e) => { setCiudad(e.target.value); limpiarError('ciudad'); }} />
        {errores.ciudad && <span className="pp-error">{errores.ciudad}</span>}

        <label className="pp-label">Teléfono</label>
        <input className={`pp-input ${errores.telefono ? 'pp-input--error' : ''}`}
          placeholder="Ej: 3001234567" value={telefono} inputMode="numeric" maxLength={10}
          onChange={(e) => { setTelefono(soloNumeros(e.target.value)); limpiarError('telefono'); }} />
        {errores.telefono && <span className="pp-error">{errores.telefono}</span>}

        <label className="pp-label">Correo</label>
        <input className={`pp-input ${errores.correo ? 'pp-input--error' : ''}`}
          placeholder="Ej: correo@empresa.com" value={correo}
          onChange={(e) => { setCorreo(e.target.value); limpiarError('correo'); }} />
        {errores.correo && <span className="pp-error">{errores.correo}</span>}
      </div>
      <div className="pp-modal-footer">
        <button className="pp-btn-cancelar" onClick={onClose}>Cancelar</button>
        <button className="pp-btn-guardar" onClick={onSave}>
          {isEdit ? 'Guardar cambios' : 'Guardar'}
        </button>
      </div>
    </div>
  </div>
);

const ProveedoresPage = () => {
  usePageTitle('Proveedor');
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null);

  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [tipoProductoTags, setTipoProductoTags] = useState<string[]>([]);
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [erroresCrear, setErroresCrear] = useState<ErroresForm>({});

  const [nombreEditar, setNombreEditar] = useState('');
  const [nitEditar, setNitEditar] = useState('');
  const [tipoProductoTagsEditar, setTipoProductoTagsEditar] = useState<string[]>([]);
  const [ciudadEditar, setCiudadEditar] = useState('');
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [correoEditar, setCorreoEditar] = useState('');
  const [erroresEditar, setErroresEditar] = useState<ErroresForm>({});

  const { toasts, showToast, removeToast } = useToast();
  const { query, setQuery, filtered } = useSearch(proveedores, ['nombre', 'nit', 'ciudad', 'telefono', 'correo']);

  const cargarProveedores = async () => {
    try {
      const res = await getProveedores();
      setProveedores(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error(error);
      setProveedores([]);
    }
  };

  useEffect(() => { cargarProveedores(); }, []);

  const validar = (fields: { nombre: string; nit: string; tipoProductoTags: string[]; ciudad: string; telefono: string; correo: string }): ErroresForm => {
    const e: ErroresForm = {};
    if (!fields.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (fields.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!fields.nit.trim()) e.nit = 'El NIT es obligatorio';
    else if (!nitValido(fields.nit)) e.nit = 'Formato inválido (Ej: 900123456-1)';
    if (fields.tipoProductoTags.length === 0) e.tipoProducto = 'Agrega al menos un producto';
    if (!fields.ciudad.trim()) e.ciudad = 'La ciudad es obligatoria';
    else if (fields.ciudad.trim().length < 3) e.ciudad = 'La ciudad debe tener al menos 3 caracteres';
    if (!fields.telefono.trim()) e.telefono = 'El teléfono es obligatorio';
    else if (fields.telefono.length < 7) e.telefono = 'El teléfono debe tener al menos 7 dígitos';
    if (!fields.correo.trim()) e.correo = 'El correo es obligatorio';
    else if (!correoValido(fields.correo)) e.correo = 'Ingresa un correo válido (ej: correo@empresa.com)';
    return e;
  };

  const limpiarErrorCrear = (campo: keyof ErroresForm) =>
    setErroresCrear(prev => ({ ...prev, [campo]: undefined }));
  const limpiarErrorEditar = (campo: keyof ErroresForm) =>
    setErroresEditar(prev => ({ ...prev, [campo]: undefined }));

  const validarDuplicados = (fields: { nit: string; telefono: string; correo: string }, excludeId?: number): ErroresForm => {
    const e: ErroresForm = {};
    const lista = excludeId ? proveedores.filter(p => p.id_proveedor !== excludeId) : proveedores;
    if (lista.some(p => p.nit === fields.nit.trim())) e.nit = 'Este NIT ya está registrado';
    if (lista.some(p => p.telefono === fields.telefono.trim())) e.telefono = 'Este teléfono ya está registrado';
    if (lista.some(p => p.correo.toLowerCase() === fields.correo.trim().toLowerCase())) e.correo = 'Este correo ya está registrado';
    return e;
  };

  const handleCrear = async () => {
    const e = { ...validar({ nombre, nit, tipoProductoTags, ciudad, telefono, correo }), ...validarDuplicados({ nit, telefono, correo }) };
    if (Object.keys(e).length > 0) { setErroresCrear(e); return; }
    try {
      await createProveedor({ nombre, nit, tipo_producto: serializeTags(tipoProductoTags), ciudad, telefono, correo });
      showToast('Proveedor creado exitosamente', 'success');
      cerrarModal(); cargarProveedores();
    } catch { showToast('Error al crear el proveedor', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteProveedor(id);
      showToast('Proveedor eliminado', 'warning');
      cargarProveedores();
    } catch { showToast('Error al eliminar el proveedor', 'error'); }
  };

  const abrirEditar = (p: any) => {
    setProveedorSeleccionado(p);
    setNombreEditar(p.nombre); setNitEditar(p.nit);
    setTipoProductoTagsEditar(parseTags(p.tipo_producto));
    setCiudadEditar(p.ciudad); setTelefonoEditar(p.telefono); setCorreoEditar(p.correo);
    setErroresEditar({}); setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    const e = {
      ...validar({ nombre: nombreEditar, nit: nitEditar, tipoProductoTags: tipoProductoTagsEditar, ciudad: ciudadEditar, telefono: telefonoEditar, correo: correoEditar }),
      ...validarDuplicados({ nit: nitEditar, telefono: telefonoEditar, correo: correoEditar }, proveedorSeleccionado.id_proveedor),
    };
    if (Object.keys(e).length > 0) { setErroresEditar(e); return; }
    try {
      await updateProveedor(proveedorSeleccionado.id_proveedor, {
        nombre: nombreEditar, nit: nitEditar,
        tipo_producto: serializeTags(tipoProductoTagsEditar),
        ciudad: ciudadEditar, telefono: telefonoEditar, correo: correoEditar,
      });
      showToast('Proveedor actualizado correctamente', 'success');
      cerrarModalEditar(); cargarProveedores();
    } catch { showToast('Error al actualizar el proveedor', 'error'); }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre(''); setNit(''); setTipoProductoTags([]); setCiudad(''); setTelefono(''); setCorreo('');
    setErroresCrear({});
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false); setProveedorSeleccionado(null); setErroresEditar({});
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Proveedores</h1>
          <p className="pp-subtitle">Gestión de proveedores registrados</p>
        </div>
        <div className="pp-header-right">
          <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>+ Nuevo Proveedor</button>
        </div>
      </div>

      <div className="pp-stats-row">
        <div className="pp-stat-card">
          <span className="pp-stat-label">Total Proveedores</span>
          <span className="pp-stat-number">{proveedores.length}</span>
        </div>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="pp-list-title">Lista de Proveedores</h2>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, NIT, ciudad..."
            resultCount={filtered.length}
            totalCount={proveedores.length}
          />
        </div>
        <div className="pp-table-scroll">
          <table className="pp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIT</th>
                <th>Productos que provee</th>
                <th>Ciudad</th>
                <th>Contacto</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="pp-empty-row">
                  {query ? `No se encontraron resultados para "${query}"` : 'No hay proveedores registrados aún.'}
                </td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id_proveedor}>
                    <td className="pp-td-nombre">{p.nombre}</td>
                    <td>{p.nit}</td>
                    <td>
                      <div className="pp-badge-group">
                        {parseTags(p.tipo_producto).map((tag, i) => (
                          <span key={i} className="pp-badge">{tag}</span>
                        ))}
                      </div>
                    </td>
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
      </div>

      {modalAbierto && (
        <FormModal isEdit={false} onClose={cerrarModal} onSave={handleCrear}
          nombre={nombre} setNombre={setNombre} nit={nit} setNit={setNit}
          tipoProductoTags={tipoProductoTags} setTipoProductoTags={setTipoProductoTags}
          ciudad={ciudad} setCiudad={setCiudad} telefono={telefono} setTelefono={setTelefono}
          correo={correo} setCorreo={setCorreo} errores={erroresCrear} limpiarError={limpiarErrorCrear} />
      )}
      {modalEditarAbierto && (
        <FormModal isEdit={true} onClose={cerrarModalEditar} onSave={handleEditar}
          nombre={nombreEditar} setNombre={setNombreEditar} nit={nitEditar} setNit={setNitEditar}
          tipoProductoTags={tipoProductoTagsEditar} setTipoProductoTags={setTipoProductoTagsEditar}
          ciudad={ciudadEditar} setCiudad={setCiudadEditar} telefono={telefonoEditar} setTelefono={setTelefonoEditar}
          correo={correoEditar} setCorreo={setCorreoEditar} errores={erroresEditar} limpiarError={limpiarErrorEditar} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ProveedoresPage;