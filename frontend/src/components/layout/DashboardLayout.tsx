import React from 'react';
import { useFincaActiva } from '../../context/useFincaActiva';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { fincaActiva } = useFincaActiva();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* El key hace que, al cambiar de finca, la página actual se vuelva a montar
          y recargue todos sus datos con la finca nueva */}
      <div key={fincaActiva?.id_finca ?? 'sin-finca'}>{children}</div>
    </div>
  );
}