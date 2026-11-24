// frontend/src/components/useKardex.ts
import { useCallback, useEffect, useState } from 'react';
import { getFincas, getKardexPorFinca } from './kardexService';
import type { Finca, Movimiento } from './kardexTipos';

const CLAVE = 'kardex:finca';

/** Lista de fincas y la finca elegida (se recuerda la última). */
export function useFincas() {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [fincaSel, setFincaSel] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const lista = await getFincas();
        if (cancelado) return;
        setFincas(lista);
        const guardada = Number(localStorage.getItem(CLAVE));
        setFincaSel(
          lista.find((f) => f.id_finca === guardada)?.id_finca ?? lista[0]?.id_finca ?? null,
        );
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const elegir = useCallback((id: number) => {
    setFincaSel(id);
    try {
      localStorage.setItem(CLAVE, String(id));
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  return { fincas, fincaSel, elegir, cargando, error };
}

/** Movimientos del kardex de UNA finca. */
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