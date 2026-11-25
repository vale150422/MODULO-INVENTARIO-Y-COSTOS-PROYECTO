// frontend/src/components/FincaActivaSelector.tsx
// Ponlo en la barra superior o el menú lateral: siempre visible, en todas las páginas.
import { useFincaActiva } from '../context/useFincaActiva';

export default function FincaActivaSelector() {
  const { fincas, fincaActiva, seleccionar } = useFincaActiva();

  if (fincas.length <= 1) {
    return <span style={{ fontWeight: 600 }}>Finca: {fincaActiva?.nombre}</span>;
  }

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
      Finca
      <select
        value={fincaActiva?.id_finca ?? ''}
        onChange={(e) => seleccionar(Number(e.target.value))}
        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1f4d2b' }}
      >
        {fincas.map((f) => (
          <option key={f.id_finca} value={f.id_finca}>
            {f.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}