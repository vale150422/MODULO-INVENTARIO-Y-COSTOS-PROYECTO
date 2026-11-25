// frontend/src/context/fincaActivaContext.ts
import { createContext } from 'react';
import type { Finca } from '../services/fincasService';

export interface FincaActivaValor {
  fincas: Finca[];
  fincaActiva: Finca | null;
  seleccionar: (idFinca: number) => void;
}

export const FincaActivaContext = createContext<FincaActivaValor | null>(null);