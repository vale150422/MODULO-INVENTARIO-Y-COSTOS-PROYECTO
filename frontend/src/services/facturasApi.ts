/**
 * Llamadas para facturas adjuntas e info de insumos.
 * Archivo independiente para NO modificar services/api.ts.
 * Si tu app guarda el JWT con otro nombre, agrégalo a TOKEN_KEYS.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';
// Acepta VITE_API_URL con o sin "/api" al final
const ROOT = BASE.replace(/\/+$/, '').replace(/\/api$/, '');

const TOKEN_KEYS = ['token', 'authToken', 'jwt', 'access_token'];
const getToken = (): string | null => {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
};

export interface ProductoInfo {
  id_producto: number;
  agotado: boolean;
  primer_ingreso: string | null;
  ultimo_ingreso: string | null;
  ingresos: string[];
  facturas: string[];
}

async function leer(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

const auth = () => ({ Authorization: `Bearer ${getToken()}` });

export async function getProductosInfo(): Promise<ProductoInfo[]> {
  const res = await fetch(`${ROOT}/api/kardex/info/productos`, { headers: auth() });
  return leer(res);
}

export async function getFacturasAdjuntas(idProducto: number): Promise<string[]> {
  const res = await fetch(`${ROOT}/api/kardex/facturas-adjuntas/${idProducto}`, { headers: auth() });
  const data = await leer(res);
  return data.ids ?? [];
}

export async function subirFacturaArchivo(idKardex: number, file: File): Promise<void> {
  const fd = new FormData();
  fd.append('archivo', file);
  const res = await fetch(`${ROOT}/api/kardex/factura-archivo/${idKardex}`, {
    method: 'POST',
    headers: auth(), // sin Content-Type: el navegador lo define
    body: fd,
  });
  await leer(res);
}

export async function obtenerUrlFactura(idKardex: number): Promise<string> {
  const res = await fetch(`${ROOT}/api/kardex/factura-archivo/${idKardex}`, { headers: auth() });
  const data = await leer(res);
  return data.url;
}