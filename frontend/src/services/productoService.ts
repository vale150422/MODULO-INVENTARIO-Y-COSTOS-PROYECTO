const API = 'http://localhost:3001/api/productos';

const getToken = () => localStorage.getItem('token');
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const getProductos = async () => {
  const res = await fetch(API, { headers: headers() });
  return res.json();
};

export const createProducto = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProducto = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProducto = async (id: number) => {
  const res = await fetch(`${API}/${id}/inactivar`, {
    method: 'PATCH',
    headers: headers(),
  });
  return res.json();
};

export const reactivarProducto = async (id: number) => {
  const res = await fetch(`${API}/${id}/activar`, {
    method: 'PATCH',
    headers: headers(),
  });
  return res.json();
};