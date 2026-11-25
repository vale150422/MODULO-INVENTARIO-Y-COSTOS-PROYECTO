// frontend/src/services/api.ts
// Helper único para hablar con el backend. Agrega solo:
//  - el token de sesión
//  - la finca activa (cabecera X-Finca-Id)
// Úsalo en TODOS los services (trabajadores, proveedores, kardex, reportes...).
const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://modulo-inventario-y-costos-proyecto.onrender.com/api';

export const CLAVE_FINCA_ACTIVA = 'finca:activa';

export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const headers = new Headers(opciones.headers);

  const token = localStorage.getItem('token'); // <- ajusta si guardas el token con otro nombre
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const finca = localStorage.getItem(CLAVE_FINCA_ACTIVA);
  if (finca) headers.set('X-Finca-Id', finca);

  if (opciones.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.error ?? cuerpo?.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}