import { useEffect, useState } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedorService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { usePageTitle } from '../../hooks/usePageTitle';
import './ProveedorPage.css';

// Productos agrícolas comunes para sugerir
const PRODUCTOS_SUGERIDOS = [
  'Fertilizantes', 'Fungicidas', 'Herbicidas', 'Insecticidas',
  'Abonos', 'Semillas', 'Plaguicidas', 'Correctivos de suelo',
  'Equipos agrícolas', 'Mangueras y riego', 'Empaques', 'Otros',
];

interface ProductoTag {
  id: number;
  nombre: string;
}

const parseTags = (str: string): ProductoTag[] =>
  str ? str.split(',').map((s, i) => ({ id: i + 1, nombre: s.trim() })).filter(t => t.nombre) : [];

const tagsToString = (tags: ProductoTag[]): string =>
  tags.map(t => t.nombre).join(', ');

// Componente selector de productos con tags
function SelectorProductos({
  tags, setTags
}: { tags: ProductoTag[]; setTags: (t: ProductoTag[]) => void }) {
  const [input, setInput] = useState('');
  const [showSug, setShowSug] = useState(false);

  const agregar = (nombre: string) => {
    const limpio = nombre.trim();
    if (!limpio) return;
    if (tags.some(t => t.nombre.toLowerCase() === limpio.toLowerCase())) return;
    setTags([...tags, { id: Date.now(), nombre: limpio }]);
    setInput('');
    setShowSug(false);
  };

  const eliminar = (id: number) => setTags(tags.filter(t => t.id !== id));

  const sugeridas = PRODUCTOS_SUGERIDOS.filter(s =>
    s.toLowerCase().includes(input.toLowerCase()) &&
    !tags.some(t => t.nombre.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      {/* Tags actuales */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(t => (
            <span key={t.id}
              className="inline-flex items-center gap-1 px-2 py-0.5
                         bg-[#2d4a1e] text-white text-xs rounded-full border border-[#4a7c3f]">
              {t.nombre}
              <button onClick={() => eliminar(t.id)}
                className="text-[#8fae5a] hover:text-red-400 font-bold ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Input con sugerencias */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            className="pp-input flex-1"
            placeholder="Ej: Fertilizantes — escribe y presiona Enter"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSug(true); }}
            onFocus={() => setShowSug(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); agregar(input); }
              if (e.key === 'Escape') setShowSug(false);
            }}
          />
          <button type="button"
            onClick={() => agregar(input)}
            className="px-3 py-1 bg-[#4a7c3f] text-white rounded text-xs font-semibold hover:bg-[#3d6b2e]">
            + Agregar
          </button>
        </div>

        {/* Dropdown sugerencias */}
        {showSug && sugeridas.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1
                          bg-[#1a2e22] border border-[#4a7c3f] rounded-lg shadow-xl overflow-hidden">
            {sugeridas.map(s => (
              <button key={s} type="button"
                onClick={() => agregar(s)}
                className="w-full text-left px-3 py-2 text-xs text-white
                           hover:bg-[#4a7c3f] transition-colors border-b border-[#264d35] last:border-0">
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] text-[#8fae5a] mt-1">
        Puedes agregar varios productos. Escribe y presiona Enter o haz clic en + Agregar.
      </p>
    </div>
  );
}

const ProveedoresPage = () => {
  usePageTitle('Proveedor');
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null);

  // Campos crear
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [tags, setTags] = useState<ProductoTag[]>([]);
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  // Campos editar
  const [nombreEditar, setNombreEditar] = useState('');
  const [nitEditar, setNitEditar] = useState('');
  const [tagsEditar, setTagsEditar] = useState<ProductoTag[]>([]);
  const [ciudadEditar, setCiudadEditar] = useState('');
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [correoEditar, setCorreoEditar] = useState('');

  const { toasts, showToast, removeToast } = useToast();

  const cargarProveedores = async () => {
    try {
      const res = await getProveedores();
      setProveedores(Array.isArray(res) ? res : res?.data || []);
    } catch { setProveedores([]); }
  };

  useEffect(() => { cargarProveedores(); }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !nit.trim() || tags.length === 0 || !ciudad.trim() || !telefono.trim() || !correo.trim()) {
      showToast('Completa todos los campos y agrega al menos un producto', 'error');
      return;
    }
    try {
      await createProveedor({
        nombre, nit,
        tipo_producto: tagsToString(tags),
        ciudad, telefono, correo,
      });
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
    setTagsEditar(parseTags(p.tipo_producto));
    setCiudadEditar(p.ciudad);
    setTelefonoEditar(p.telefono);
    setCorreoEditar(p.correo);
    setModalEditarAbierto(true);
  };

  const handleEditar = async () => {
    if (!nombreEditar.trim() || !nitEditar.trim() || tagsEditar.length === 0 ||
        !ciudadEditar.trim() || !telefonoEditar.trim() || !correoEditar.trim()) {
      showToast('Completa todos los campos', 'error');
      return;
    }
    try {
      await updateProveedor(proveedorSeleccionado.id_proveedor, {
        nombre: nombreEditar, nit: nitEditar,
        tipo_producto: tagsToString(tagsEditar),
        ciudad: ciudadEditar, telefono: telefonoEditar, correo: correoEditar,
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
    setNombre(''); setNit(''); setTags([]); setCiudad(''); setTelefono(''); setCorreo('');
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
        <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo Proveedor
        </button>
      </div>

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
              <th>Productos que provee</th>
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
                  <td>
                    {/* Muestra cada producto como badge */}
                    <div className="flex flex-wrap gap-1">
                      {parseTags(p.tipo_producto).map(t => (
                        <span key={t.id} className="pp-badge">{t.nombre}</span>
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

      {/* MODAL CREAR */}
      {modalAbierto && (
        <div className="pp-modal-overlay" onClick={cerrarModal}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}
               style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Nuevo Proveedor</h2>
                <p className="pp-modal-subtitle">Completa los campos para agregar un proveedor</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Agro Suministros S.A"
                value={nombre} onChange={e => setNombre(e.target.value)} />

              <label className="pp-label">NIT</label>
              <input className="pp-input" placeholder="Ej: 900123456-1"
                value={nit} onChange={e => setNit(e.target.value)} />

              <label className="pp-label">Productos que provee</label>
              <SelectorProductos tags={tags} setTags={setTags} />

              <label className="pp-label" style={{ marginTop: '12px' }}>Ciudad</label>
              <input className="pp-input" placeholder="Ej: Caicedonia"
                value={ciudad} onChange={e => setCiudad(e.target.value)} />

              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567"
                value={telefono} onChange={e => setTelefono(e.target.value)} />

              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@empresa.com"
                value={correo} onChange={e => setCorreo(e.target.value)} />
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
          <div className="pp-modal" onClick={e => e.stopPropagation()}
               style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="pp-modal-header">
              <div>
                <h2 className="pp-modal-title">Editar Proveedor</h2>
                <p className="pp-modal-subtitle">Modifica los campos del proveedor</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input className="pp-input" placeholder="Ej: Agro Suministros S.A"
                value={nombreEditar} onChange={e => setNombreEditar(e.target.value)} />

              <label className="pp-label">NIT</label>
              <input className="pp-input" placeholder="Ej: 900123456-1"
                value={nitEditar} onChange={e => setNitEditar(e.target.value)} />

              <label className="pp-label">Productos que provee</label>
              <SelectorProductos tags={tagsEditar} setTags={setTagsEditar} />

              <label className="pp-label" style={{ marginTop: '12px' }}>Ciudad</label>
              <input className="pp-input" placeholder="Ej: Caicedonia"
                value={ciudadEditar} onChange={e => setCiudadEditar(e.target.value)} />

              <label className="pp-label">Teléfono</label>
              <input className="pp-input" placeholder="Ej: 3001234567"
                value={telefonoEditar} onChange={e => setTelefonoEditar(e.target.value)} />

              <label className="pp-label">Correo</label>
              <input className="pp-input" placeholder="Ej: correo@empresa.com"
                value={correoEditar} onChange={e => setCorreoEditar(e.target.value)} />
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