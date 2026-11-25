// frontend/src/services/trabajadoresService.ts
// Ahora usa api(): agrega solo el token y la finca activa (X-Finca-Id).
import { api } from './api';

export const getTrabajadores = () => api<any>('/trabajadores');

export const createTrabajador = (data: any) =>
  api<any>('/trabajadores', { method: 'POST', body: JSON.stringify(data) });

export const updateTrabajador = (id: number, data: any) =>
  api<any>(`/trabajadores/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTrabajador = (id: number) =>
  api<any>(`/trabajadores/${id}`, { method: 'DELETE' });