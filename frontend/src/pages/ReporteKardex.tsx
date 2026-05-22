import { useRef } from 'react';

export default function ReporteKardex() {
  const printRef = useRef<HTMLDivElement>(null);

  const imprimir = () => window.print();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reporte Kardex</h1>
          <p className="text-sm text-[#8fae5a] mt-1">Método PEPS · Insumos Agrícolas</p>
        </div>
        <button onClick={imprimir}
          className="px-6 py-2 bg-[#d4a843] text-[#2d4a1e] rounded-lg text-sm
                     font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
          🖨️ Imprimir / Exportar PDF
        </button>
      </div>

      <div ref={printRef} id="reporte-print"
        className="bg-white text-[#2d4a1e] rounded-xl p-8">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 pb-4
                        border-b-2 border-[#2d4a1e]">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain"/>
            <div>
              <h2 className="text-xl font-bold text-[#2d4a1e]">AgroGestión</h2>
              <p className="text-sm text-[#6b8c3e]">Sistema de Inventario Agrícola</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#2d4a1e]">REPORTE KARDEX</p>
            <p className="text-sm text-[#6b8c3e]">Método: PEPS</p>
            <p className="text-xs text-[#6b8c3e]">
              Fecha: {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        {/* Sin datos */}
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#2d4a1e] font-semibold">
            No hay movimientos registrados aún
          </p>
          <p className="text-sm text-[#6b8c3e] mt-1">
            Registra movimientos en el módulo Kardex para generar el reporte
          </p>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-[#c8d9a0] flex justify-between text-xs text-[#6b8c3e]">
          <span>AgroGestión — Sistema de Inventario</span>
          <span>Generado: {new Date().toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #reporte-print, #reporte-print * { visibility: visible; }
          #reporte-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}