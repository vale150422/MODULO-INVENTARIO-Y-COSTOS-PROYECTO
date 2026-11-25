// frontend/src/services/fincaService.ts
import { api } from './api';

export interface Finca {
  id_finca: number;
  nombre: string;
  municipio?: string | null;
  vereda?: string | null;
  created_at?: string | null;
}

export interface FincaEntrada {
  nombre: string;
  municipio: string;
  vereda: string;
}

function normalizar(f: Record<string, unknown>): Finca {
  return {
    id_finca: Number(f.id_finca ?? f.idfinca ?? f.id),
    nombre: String(f.nombre),
    municipio: f.municipio ? String(f.municipio) : null,
    vereda: f.vereda ? String(f.vereda) : null,
    created_at: f.created_at ? String(f.created_at) : null,
  };
}

// /fincas ya filtra por usuario en el backend (admin: todas; trabajador: las suyas).
export async function getFincas(): Promise<Finca[]> {
  const res = await api<Array<Record<string, unknown>> | { data: Array<Record<string, unknown>> }>('/fincas');
  const filas = Array.isArray(res) ? res : res?.data ?? [];
  return filas.map(normalizar);
}

export async function createFinca(datos: FincaEntrada): Promise<Finca> {
  const fila = await api<Record<string, unknown>>('/fincas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  return normalizar(fila);
}

export async function updateFinca(idFinca: number, datos: FincaEntrada): Promise<Finca> {
  const fila = await api<Record<string, unknown>>(`/fincas/${idFinca}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
  return normalizar(fila);
}

export async function deleteFinca(idFinca: number): Promise<void> {
  await api<unknown>(`/fincas/${idFinca}`, { method: 'DELETE' });
}