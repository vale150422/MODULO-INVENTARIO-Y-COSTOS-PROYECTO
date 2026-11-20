const API = 'https://modulo-inventario-y-costos-proyecto.onrender.com/api/productos';

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const manejar = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Error en el servidor');
  return data;
};

export const getProductos = async () => {
  const res = await fetch(API, { headers: headers() });
  return manejar(res);
};

export const createProducto = async (data: any) => {
  const res = await fetch(API, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  return manejar(res);
};

export const updateProducto = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
  return manejar(res);
};

export const deleteProducto = async (id: number) => {
  const res = await fetch(`${API}/${id}/inactivar`, { method: 'PATCH', headers: headers() });
  return manejar(res);
};

export const reactivarProducto = async (id: number) => {
  const res = await fetch(`${API}/${id}/activar`, { method: 'PATCH', headers: headers() });
  return manejar(res);
};