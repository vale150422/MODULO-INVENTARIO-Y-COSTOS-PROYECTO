const API = 'http://localhost:3001/api/proveedores';

export const getProveedores = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createProveedor = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateProveedor = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteProveedor = async (id: number) => {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
};