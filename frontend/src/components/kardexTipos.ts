// frontend/src/components/kardexTipos.ts
// Coincide con lo que devuelve getKardexByFinca en el backend
export interface Movimiento {
  id_kardex: number;
  fecha: string;
  producto: string;
  unidadmedida: string | null;
  tipo: string; // ENTRADA | SALIDA | INICIO
  cantidad: number | string;
  costo_unitario: number | string;
  total: number | string;
  saldo_cantidad: number | string;
  saldo_valor: number | string;
  detalle: string | null; // factura
  descripcion: string | null;
  usuario: string; // quien registró
  recibe: string | null; // a quién se entregó
}