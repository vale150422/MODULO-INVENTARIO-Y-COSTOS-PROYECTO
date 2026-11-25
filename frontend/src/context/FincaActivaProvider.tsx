// frontend/src/context/FincaActivaProvider.tsx
// Ponlo en el layout PROTEGIDO (el que tiene el menú), no en main.tsx:
// así las fincas se cargan después de iniciar sesión, cuando ya hay token.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CLAVE_FINCA_ACTIVA } from '../services/api';
import { getFincas, type Finca } from '../services/fincasService';
import { FincaActivaContext } from './fincaActivaContext';

export function FincaActivaProvider({ children }: { children: ReactNode }) {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [idActiva, setIdActiva] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const lista = await getFincas();
        if (cancelado) return;
        const guardada = Number(localStorage.getItem(CLAVE_FINCA_ACTIVA));
        const inicial = lista.find((f) => f.id_finca === guardada)?.id_finca ?? lista[0]?.id_finca ?? null;
        // Se guarda ANTES de renderizar las páginas, para que su primera petición ya lleve la finca
        if (inicial != null) localStorage.setItem(CLAVE_FINCA_ACTIVA, String(inicial));
        else localStorage.removeItem(CLAVE_FINCA_ACTIVA);
        setFincas(lista);
        setIdActiva(inicial);
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

  const seleccionar = useCallback((idFinca: number) => {
    localStorage.setItem(CLAVE_FINCA_ACTIVA, String(idFinca));
    setIdActiva(idFinca);
  }, []);

  const valor = useMemo(
    () => ({
      fincas,
      fincaActiva: fincas.find((f) => f.id_finca === idActiva) ?? null,
      seleccionar,
    }),
    [fincas, idActiva, seleccionar],
  );

  if (cargando) return <p>Cargando fincas…</p>;
  if (error) return <p role="alert">No se pudieron cargar las fincas: {error}</p>;
  if (fincas.length === 0) {
    return <p>No tienes fincas asignadas. Pídele al administrador que te asigne una.</p>;
  }

  return <FincaActivaContext.Provider value={valor}>{children}</FincaActivaContext.Provider>;
}