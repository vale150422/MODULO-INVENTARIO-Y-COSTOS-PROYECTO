// frontend/src/context/useFincaActiva.ts
import { useContext } from 'react';
import { FincaActivaContext } from './fincaActivaContext';

export function useFincaActiva() {
  const ctx = useContext(FincaActivaContext);
  if (!ctx) throw new Error('useFincaActiva debe usarse dentro de <FincaActivaProvider>');
  return ctx;
}