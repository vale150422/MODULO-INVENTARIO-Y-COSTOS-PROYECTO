const API = 'http://localhost:3001/api/fincas';

export const getFincas = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createFinca = async (data: any) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateFinca = async (id: number, data: any) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteFinca = async (id: number) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message);
  }
};