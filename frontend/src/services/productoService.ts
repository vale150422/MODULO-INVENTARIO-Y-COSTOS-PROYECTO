const API = 'http://localhost:3001/api/productos';

export const getProductos = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createProducto = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateProducto = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteProducto = async (id: number) => {
  await fetch(`${API}/${id}`, {
    method: 'DELETE'
  });
};