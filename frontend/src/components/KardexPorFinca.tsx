// frontend/src/components/KardexPorFinca.tsx
// Ya no tiene selector propio: usa la finca activa de toda la app.
import { useFincaActiva } from '../context/useFincaActiva';
import { useKardexFinca } from './useKardex';

const verde = '#1f4d2b';
const columnas = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Saldo', 'Factura', 'Descripción', 'Entregado a', 'Registró'];

export default function KardexPorFinca() {
  const { fincaActiva } = useFincaActiva();
  const { movimientos, cargando, error, recargar } = useKardexFinca(fincaActiva?.id_finca ?? null);

  return (
    <section>
      <h2 style={{ color: verde }}>Kardex{fincaActiva ? ` — ${fincaActiva.nombre}` : ''}</h2>

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