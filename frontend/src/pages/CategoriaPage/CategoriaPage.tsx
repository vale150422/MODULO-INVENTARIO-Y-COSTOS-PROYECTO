import { useEffect, useState } from 'react';
import { getCategorias, createCategoria, deleteCategoria } from '../../services/categoriaService';
import { useToast } from '../../components/toast/useToast';
import ToastContainer from '../../components/toast/ToastContainer';
import '../FincaPage/FincaPage.css';

const CategoriaPage = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const { toasts, showToast, removeToast } = useToast();

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

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    try {
      await createCategoria(nombre.trim());
      showToast('Categoría creada exitosamente', 'success');
      setNombre('');
      setModalAbierto(false);
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

  return (
    <div className="pp-root">
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Categorías</h1>
          <p className="pp-subtitle">Gestión de categorías de productos</p>
        </div>
        <button className="pp-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nueva Categoría
        </button>
      </div>

      <div className="pp-table-wrapper">
        <div className="pp-table-header">
          <h2 className="pp-list-title">Lista de Categorías</h2>
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
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={3} className="pp-empty-row">
                  No hay categorías registradas aún
                </td>
              </tr>
            ) : (
              categorias.map((c) => (
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
        <div className="pp-modal-overlay" onClick={() => setModalAbierto(false)}>
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
                className="pp-input"
                placeholder="Ej: Café, Plátano, Cítricos..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCrear()}
              />
            </div>
            <div className="pp-modal-footer">
              <button className="pp-btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
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