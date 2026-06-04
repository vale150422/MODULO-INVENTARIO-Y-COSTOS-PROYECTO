import { useEffect, useState } from 'react';
import { getCategorias, createCategoria, deleteCategoria } from '../../services/categoriaService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import { usePageTitle } from '../../hooks/usePageTitle';
import SearchBar from '../../components/search/SearchBar';
import { useSearch } from '../../hooks/useSearch';
import '../FincaPage/FincaPage.css';

interface ErroresCrear {
  nombre?: string;
}

const CategoriaPage = () => {
  usePageTitle('Categoria');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [errores, setErrores] = useState<ErroresCrear>({});
  const { toasts, showToast, removeToast } = useToast();
  const { query, setQuery, filtered } = useSearch(categorias, ['nombre']);

  const cargarCategorias = async () => {
    try {
      const res = await getCategorias();
      setCategorias(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const validar = (): boolean => {
    const e: ErroresCrear = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres';
    else if (/\d/.test(nombre)) e.nombre = 'El nombre no debe contener números';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleCrear = async () => {
    if (!validar()) return;
    try {
      await createCategoria(nombre.trim());
      showToast('Categoría creada exitosamente', 'success');
      cerrarModal();
      cargarCategorias();
    } catch {
      showToast('Error al crear la categoría', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteCategoria(id);
      showToast('Categoría eliminada', 'warning');
      cargarCategorias();
    } catch {
      showToast('Error al eliminar la categoría', 'error');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre('');
    setErrores({});
  };

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Categorías</h1>
          <p className="pp-subtitle">Gestión de categorías</p>
        </div>
        <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nueva Categoría
        </button>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="pp-list-title">Lista de Categorías</h2>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar categoría..."
            resultCount={filtered.length}
            totalCount={categorias.length}
          />
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="pp-empty-row">
                  {query ? `No se encontraron resultados para "${query}"` : 'No hay categorías registradas aún'}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id_categoria}>
                  <td className="pp-td-nombre">{c.nombre}</td>
                  <td>{c.created_at ? new Date(c.created_at).toLocaleDateString('es-CO') : '—'}</td>
                  <td className="pp-td-acciones">
                    <button className="pp-btn-eliminar" onClick={() => handleEliminar(c.id_categoria)}>
                      Eliminar
                    </button>
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
                <h2 className="pp-modal-title">Nueva Categoría</h2>
                <p className="pp-modal-subtitle">Ingresa el nombre de la categoría</p>
              </div>
            </div>
            <div className="pp-modal-body">
              <label className="pp-label">Nombre</label>
              <input
                className={`pp-input ${errores.nombre ? 'pp-input--error' : ''}`}
                placeholder="Ej: Fungicidas, fertilizantes, abonos, semillas, etc"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErrores({}); }}
                onKeyDown={(e) => e.key === 'Enter' && handleCrear()}
              />
              {errores.nombre && <span className="pp-error">{errores.nombre}</span>}
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="pp-btn-guardar" onClick={handleCrear}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default CategoriaPage;