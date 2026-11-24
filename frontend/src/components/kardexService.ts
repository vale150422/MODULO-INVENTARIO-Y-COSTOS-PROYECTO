// frontend/src/components/kardexService.ts
// Llamadas a TU backend. Si ya tienes un helper o instancia de axios con el
// token (como en trabajadoresService.ts), úsalo aquí en lugar de `pedir`.
import type { Finca, Movimiento } from './kardexTipos';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function pedir<T>(ruta: string): Promise<T> {
  const token = localStorage.getItem('token'); // <- ajusta al nombre que uses
  const res = await fetch(`${API_URL}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.error ?? cuerpo?.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// /fincas ya filtra por usuario en el backend (admin: todas; trabajador: las suyas).
// Se normaliza el id porque la tabla usa "idfinca".
export async function getFincas(): Promise<Finca[]> {
  const filas = await pedir<Array<Record<string, unknown>>>('/fincas');
  return filas.map((f) => ({
    id_finca: Number(f.id_finca ?? f.idfinca ?? f.id),
    nombre: String(f.nombre),
    ubicacion: f.ubicacion ? String(f.ubicacion) : null,
  }));
}

export const getKardexPorFinca = (idFinca: number) =>
  pedir<Movimiento[]>(`/kardex/finca/${idFinca}`); // <- ajusta si montaste la ruta en otro prefijo