// frontend/src/components/useKardex.ts
import { useCallback, useEffect, useState } from 'react';
import { getKardexPorFinca } from './kardexService';
import type { Movimiento } from './kardexTipos';

/** Movimientos del kardex de la finca indicada (la finca activa de la app). */
export function useKardexFinca(idFinca: number | null) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (idFinca == null) return;
    let cancelado = false; // evita mostrar la respuesta de una finca anterior
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const datos = await getKardexPorFinca(idFinca);
        if (!cancelado) setMovimientos(datos);
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
          setMovimientos([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [idFinca, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return {
    movimientos: idFinca == null ? [] : movimientos,
    cargando: idFinca == null ? false : cargando,
    error: idFinca == null ? null : error,
    recargar,
  };
}