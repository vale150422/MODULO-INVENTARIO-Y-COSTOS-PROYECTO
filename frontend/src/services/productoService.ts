// frontend/src/services/productoService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api';

// Todas las llamadas pasan por `api`, que agrega el token y la cabecera
// X-Finca-Id (finca activa del menú), así el backend filtra por finca.

export const getProductos = () => api<any>('/productos');

export const createProducto = (data: any) =>
  api<any>('/productos', { method: 'POST', body: JSON.stringify(data) });

export const updateProducto = (id: number, data: any) =>
  api<any>(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProducto = (id: number) =>
  api<any>(`/productos/${id}/inactivar`, { method: 'PATCH' });

export const reactivarProducto = (id: number) =>
  api<any>(`/productos/${id}/activar`, { method: 'PATCH' });