const API = 'https://modulo-inventario-y-costos-proyecto.onrender.com/api/categorias';

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Si el servidor responde con error, lo lanza con el mensaje real
const manejar = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Error en el servidor');
  return data;
};

export const getCategorias = async () => {
  const res = await fetch(API, { headers: headers() });
  return manejar(res);
};

export const createCategoria = async (nombre: string) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ nombre }),
  });
  return manejar(res);
};

export const deleteCategoria = async (id: number) => {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: headers() });
  return manejar(res);
};