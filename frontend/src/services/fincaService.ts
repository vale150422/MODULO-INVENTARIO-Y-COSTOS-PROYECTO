const API = 'https://modulo-inventario-y-costos-proyecto.onrender.com/api/fincas';

// Envía el token del usuario logueado (el backend lo necesita para la auditoría)
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

export const getFincas = async () => {
  const res = await fetch(API, { headers: headers() });
  return manejar(res);
};

export const createFinca = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return manejar(res);
};

export const updateFinca = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return manejar(res);
};

export const deleteFinca = async (id: number) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  return manejar(res);
};