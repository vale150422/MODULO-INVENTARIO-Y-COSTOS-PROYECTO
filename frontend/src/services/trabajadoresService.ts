const API = 'https://modulo-inventario-y-costos-proyecto.onrender.com/api/trabajadores';

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

export const getTrabajadores = async () => {
  const res = await fetch(API, { headers: headers() });
  return manejar(res);
};

export const createTrabajador = async (data: any) => {
  const res = await fetch(API, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  return manejar(res);
};

export const updateTrabajador = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
  return manejar(res);
};

export const deleteTrabajador = async (id: number) => {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: headers() });
  return manejar(res);
};