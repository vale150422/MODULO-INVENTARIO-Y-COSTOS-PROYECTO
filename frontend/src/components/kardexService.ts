// frontend/src/components/kardexService.ts
import { api } from '../services/api';
import type { Movimiento } from './kardexTipos';

export const getKardexPorFinca = (idFinca: number) =>
  api<Movimiento[]>(`/kardex/finca/${idFinca}`);