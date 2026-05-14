const API = 'http://localhost:3001/api/trabajadores';

export const getTrabajadores = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createTrabajador = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateTrabajador = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteTrabajador = async (id: number) => {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
};