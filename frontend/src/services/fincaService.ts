// frontend/src/services/fincasService.ts
import { api } from './api';

export interface Finca {
  id_finca: number;
  nombre: string;
  ubicacion?: string | null;
}

// /fincas ya filtra por usuario en el backend (admin: todas; trabajador: las suyas).
export async function getFincas(): Promise<Finca[]> {
  const filas = await api<Array<Record<string, unknown>>>('/fincas');
  return filas.map((f) => ({
    id_finca: Number(f.id_finca ?? f.idfinca ?? f.id),
    nombre: String(f.nombre),
    ubicacion: f.ubicacion ? String(f.ubicacion) : null,
  }));
}