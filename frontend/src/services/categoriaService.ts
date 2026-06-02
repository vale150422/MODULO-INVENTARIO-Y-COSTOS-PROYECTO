const API = 'https://modulo-inventario-y-costos-proyecto.onrender.com/api/categorias';

export const getCategorias = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createCategoria = async (nombre: string) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  return res.json();
};

export const deleteCategoria = async (id: number) => {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
};