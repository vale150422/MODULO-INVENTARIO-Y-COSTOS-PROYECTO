import { useEffect, useState } from 'react';

interface Producto {
  id_producto: number;
  nombre: string;
  unidadmedida: string;
  categoria: string;
  finca: string;
  saldo_cantidad: number;
  saldo_valor: number;
  costo_unitario: number;
}

interface ReporteData {
  productos: Producto[];
  totalInventario: number;
  costoVentas: number;
  totalEntradas: number;
  totalSalidas: number;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export default function ReporteKardex() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/kardex/reporte', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message || 'No se pudo conectar al servidor'))
      .finally(() => setLoading(false));
  }, []);

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

      <div id="reporte-print" className="bg-white text-[#2d4a1e] rounded-xl p-8">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#2d4a1e]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4a843] bg-[#f5f0e0]">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2d4a1e]">AgroGestión</h2>
              <p className="text-sm text-[#6b8c3e]">Sistema de Inventario Agrícola</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#2d4a1e]">REPORTE KARDEX</p>
            <p className="text-sm text-[#6b8c3e]">Método: PEPS</p>
            <p className="text-xs text-[#6b8c3e]">Fecha: {new Date().toLocaleDateString('es-CO')}</p>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-[#6b8c3e] animate-pulse">Cargando reporte...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-semibold">{error}</p>
            <p className="text-sm text-[#6b8c3e] mt-1">Verifica que el backend esté corriendo</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Resumen ejecutivo */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-[10px] text-green-700 uppercase font-semibold tracking-wider">
                  Valor Inventario
                </p>
                <p className="text-base font-bold text-green-700 mt-1">
                  {fmt(data.totalInventario)}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-[10px] text-red-700 uppercase font-semibold tracking-wider">
                  Costo Ventas
                </p>
                <p className="text-base font-bold text-red-700 mt-1">
                  {fmt(Number(data.costoVentas))}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-[10px] text-blue-700 uppercase font-semibold tracking-wider">
                  Entradas
                </p>
                <p className="text-base font-bold text-blue-700 mt-1">
                  {data.totalEntradas} mov.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <p className="text-[10px] text-orange-700 uppercase font-semibold tracking-wider">
                  Salidas
                </p>
                <p className="text-base font-bold text-orange-700 mt-1">
                  {data.totalSalidas} mov.
                </p>
              </div>
            </div>

            {/* Tabla de productos */}
            {data.productos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-[#2d4a1e] font-semibold">No hay productos registrados</p>
              </div>
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#2d4a1e] text-white">
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-left">Finca</th>
                    <th className="px-3 py-2 text-right">Saldo Cant.</th>
                    <th className="px-3 py-2 text-right">Costo Unit.</th>
                    <th className="px-3 py-2 text-right">Saldo Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((p, i) => (
                    <tr key={p.id_producto}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 border-b border-gray-100 font-medium">{p.nombre}</td>
                      <td className="px-3 py-2 border-b border-gray-100 text-[#6b8c3e]">{p.categoria}</td>
                      <td className="px-3 py-2 border-b border-gray-100 text-[#6b8c3e]">{p.finca}</td>
                      <td className="px-3 py-2 border-b border-gray-100 text-right font-mono">
                        {Number(p.saldo_cantidad).toLocaleString('es-CO')} {p.unidadmedida}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100 text-right font-mono">
                        {fmt(p.costo_unitario)}
                      </td>
                      <td className={`px-3 py-2 border-b border-gray-100 text-right font-mono font-bold
                        ${Number(p.saldo_cantidad) < 10 ? 'text-red-600' : 'text-[#2d4a1e]'}`}>
                        {fmt(p.saldo_valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f5f0e0] font-bold">
                    <td colSpan={5} className="px-3 py-2 text-right text-[#2d4a1e]">
                      TOTAL INVENTARIO:
                    </td>
                    <td className="px-3 py-2 text-right text-[#2d4a1e] font-mono">
                      {fmt(data.totalInventario)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Nota bajo stock */}
            {data.productos.some(p => Number(p.saldo_cantidad) < 10) && (
              <p className="text-xs text-red-500 mt-3">
                ⚠️ Los productos en <span className="font-bold">rojo</span> tienen stock bajo (menos de 10 unidades)
              </p>
            )}
          </>
        )}

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-[#c8d9a0] flex justify-between text-xs text-[#6b8c3e]">
          <span>AgroGestión — Sistema de Inventario PEPS</span>
          <span>Generado: {new Date().toLocaleString('es-CO')}</span>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #reporte-print, #reporte-print * { visibility: visible; }
          #reporte-print {
            position: absolute; left: 0; top: 0;
            width: 100%; border-radius: 0; padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}