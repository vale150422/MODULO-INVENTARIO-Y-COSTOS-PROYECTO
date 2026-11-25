// frontend/src/services/api.ts
// Helper único para hablar con el backend. Agrega solo:
//  - el token de sesión
//  - la finca activa (cabecera X-Finca-Id)
// Se puede usar de dos formas:
//  - api<T>('/ruta', opciones)      -> función genérica (services nuevos)
//  - api.getKardex(id), api.login() -> métodos (páginas existentes)
const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://modulo-inventario-y-costos-proyecto.onrender.com/api';

// Algunas páginas (p. ej. AlertasPage) importan BASE directamente.
export const BASE: string = API_URL;

export const CLAVE_FINCA_ACTIVA = 'finca:activa';

async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
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

export interface MovimientoEntrada {
  id_producto: number;
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  detalle?: string | null;
  descripcion?: string | null;
  id_lote?: number | null;
  id_usuario_recibe?: number | null;
  id_finca?: number;
  fecha_vencimiento?: string | null;
}

// Los métodos devuelven `any` igual que la versión anterior, para que las
// páginas (Kardex, Dashboard, Reportes, useAuth) sigan compilando sin cambios.
/* eslint-disable @typescript-eslint/no-explicit-any */
const metodos = {
  async login(email: string, password: string): Promise<any> {
    try {
      return await peticion<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Credenciales incorrectas');
    }
  },

  async registro(nombre: string, email: string, password: string): Promise<any> {
    return peticion<any>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password, rol: 'empleado' }),
    });
  },

  // DASHBOARD  (!) ruta supuesta: confirma que exista en el backend
  async getDashboard(): Promise<any> {
    return peticion<any>('/dashboard');
  },

  // KARDEX
  async getKardexProductos(): Promise<any> {
    return peticion<any>('/kardex/productos');
  },

  async getKardex(id_producto: number): Promise<any> {
    return peticion<any>(`/kardex/${id_producto}`);
  },

  async getLotes(id_producto: number): Promise<any> {
    return peticion<any>(`/kardex/${id_producto}/lotes`);
  },

  async registrarMovimiento(data: MovimientoEntrada): Promise<any> {
    return peticion<any>('/kardex/movimiento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReporteKardex(): Promise<any> {
    return peticion<any>('/kardex/reporte');
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// `api` sigue siendo la función genérica, pero ahora también trae los métodos.
export const api = Object.assign(peticion, metodos);