// src/components/FincaActivaSelector.tsx
// Va dentro del Sidebar: siempre visible, en todas las páginas.
import { MapPin } from 'lucide-react';
import { useFincaActiva } from '../context/useFincaActiva';

export default function FincaActivaSelector() {
  const { fincas, fincaActiva, seleccionar } = useFincaActiva();

  return (
    <div>
      <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest px-1 pb-1.5">
        Finca activa
      </p>

      {fincas.length <= 1 ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#3d6b2e] text-sm text-[#f5f0e0]">
          <MapPin size={14} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{fincaActiva?.nombre}</span>
        </div>
      ) : (
        <select
          value={fincaActiva?.id_finca ?? ''}
          onChange={(e) => seleccionar(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-[#3d6b2e] border border-[#4a7c3f]
                     text-sm text-[#f5f0e0] focus:outline-none focus:border-[#d4a843] cursor-pointer"
        >
          {fincas.map((f) => (
            <option key={f.id_finca} value={f.id_finca}>
              {f.nombre}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}