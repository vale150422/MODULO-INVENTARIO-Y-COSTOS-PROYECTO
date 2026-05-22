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

  async registro(nombre: string, email: string, password: string) {
    const r = await fetch(`${BASE}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, rol: 'empleado' }),
    });
    if (!r.ok) {
      const data = await r.json();
      throw new Error(data.error || 'Error al registrar');
    }
    return r.json();
  },

  // KARDEX
  async getKardexProductos() {
    const r = await fetch(`${BASE}/kardex/productos`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar productos');
    return r.json();
  },

  async getKardex(id_producto: number) {
    const r = await fetch(`${BASE}/kardex/${id_producto}`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar Kardex');
    return r.json();
  },

  async getLotes(id_producto: number) {
    const r = await fetch(`${BASE}/kardex/${id_producto}/lotes`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar lotes');
    return r.json();
  },

  async registrarMovimiento(data: {
    id_producto: number; tipo: string; cantidad: number;
    costo_unitario: number; detalle: string; id_finca: number;
  }) {
    const r = await fetch(`${BASE}/kardex/movimiento`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error || 'Error al registrar');
    }
    return r.json();
  },

  async getReporteKardex() {
    const r = await fetch(`${BASE}/kardex/reporte`, { headers: getHeaders() });
    if (!r.ok) throw new Error('Error al cargar reporte');
    return r.json();
  },
  async getDashboard() {
  const r = await fetch(`${BASE}/kardex/dashboard`, { headers: getHeaders() });
  if (!r.ok) throw new Error('Error al cargar dashboard');
  return r.json();
  },
};