// frontend/src/components/KardexPorFinca.tsx
import { useMemo } from 'react';
import { useFincas, useKardexFinca } from './useKardex';
import type { Finca } from './kardexTipos';

const verde = '#1f4d2b';

/* --------------------------- botones de finca --------------------------- */
function FincaSelector({
  fincas,
  fincaSel,
  onElegir,
}: {
  fincas: Finca[];
  fincaSel: number | null;
  onElegir: (id: number) => void;
}) {
  // Si dos fincas se llaman igual, se agrega el id para distinguirlas.
  const repetidos = useMemo(() => {
    const conteo = new Map<string, number>();
    fincas.forEach((f) => conteo.set(f.nombre, (conteo.get(f.nombre) ?? 0) + 1));
    return conteo;
  }, [fincas]);

  return (
    <div role="group" aria-label="Seleccionar finca" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {fincas.map((f) => {
        const activa = f.id_finca === fincaSel;
        const etiqueta = (repetidos.get(f.nombre) ?? 0) > 1 ? `${f.nombre} (#${f.id_finca})` : f.nombre;
        return (
          <button
            key={f.id_finca}
            type="button"
            aria-pressed={activa}
            title={f.ubicacion ?? undefined}
            onClick={() => onElegir(f.id_finca)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: `1px solid ${verde}`,
              background: activa ? verde : '#fff',
              color: activa ? '#fff' : verde,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- página kardex ---------------------------- */
const columnas = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Saldo', 'Factura', 'Descripción', 'Entregado a', 'Registró'];

export default function KardexPorFinca() {
  const { fincas, fincaSel, elegir, cargando: cargandoFincas, error: errorFincas } = useFincas();
  const { movimientos, cargando, error, recargar } = useKardexFinca(fincaSel);
  const fincaActual = fincas.find((f) => f.id_finca === fincaSel);

  if (cargandoFincas) return <p>Cargando fincas…</p>;
  if (errorFincas) return <p role="alert">No se pudieron cargar las fincas: {errorFincas}</p>;
  if (fincas.length === 0) return <p>No hay fincas registradas.</p>;

  return (
    <section>
      <h2 style={{ color: verde }}>Kardex{fincaActual ? ` — ${fincaActual.nombre}` : ''}</h2>
      <FincaSelector fincas={fincas} fincaSel={fincaSel} onElegir={elegir} />

      {error && <p role="alert">No se pudo cargar el kardex: {error}</p>}
      {cargando && <p>Cargando movimientos…</p>}
      {!cargando && !error && movimientos.length === 0 && <p>Esta finca aún no tiene movimientos.</p>}

      {movimientos.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columnas.map((t) => (
                  <th key={t} style={{ textAlign: 'left', padding: 8, color: verde }}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id_kardex} style={{ borderTop: '1px solid #ddd' }}>
                  <td style={{ padding: 8 }}>{new Date(m.fecha).toLocaleString('es-CO')}</td>
                  <td style={{ padding: 8 }}>{m.producto}</td>
                  <td style={{ padding: 8 }}>{m.tipo}</td>
                  <td style={{ padding: 8 }}>{m.cantidad} {m.unidadmedida ?? ''}</td>
                  <td style={{ padding: 8 }}>{m.saldo_cantidad} {m.unidadmedida ?? ''}</td>
                  <td style={{ padding: 8 }}>{m.detalle ?? ''}</td>
                  <td style={{ padding: 8 }}>{m.descripcion ?? ''}</td>
                  <td style={{ padding: 8 }}>{m.recibe ?? ''}</td>
                  <td style={{ padding: 8 }}>{m.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" onClick={recargar} style={{ marginTop: 12 }}>
        Actualizar
      </button>
    </section>
  );
}