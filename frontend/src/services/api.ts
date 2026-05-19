const BASE = 'http://localhost:3001/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async login(email: string, password: string) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error('Credenciales incorrectas');
    return r.json();
  },

  async getDashboard() {
    const r = await fetch(`${BASE}/dashboard`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar dashboard');
    return r.json();
  },

  async getKardex(productId: number) {
    const r = await fetch(`${BASE}/kardex/${productId}`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar Kardex');
    return r.json();
  },

  async registrarMovimiento(data: {
    producto_id: number; tipo: 'ENTRADA' | 'SALIDA';
    cantidad: number; costo_unitario: number; concepto: string;
  }) {
    const r = await fetch(`${BASE}/kardex/movimiento`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error('Error al registrar movimiento');
    return r.json();
  },
};