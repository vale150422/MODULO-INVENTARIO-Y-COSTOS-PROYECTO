import { useEffect, useState } from 'react';
import { api } from '../services/api';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export default function Reportes() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReporteKardex()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 flex items-center justify-center py-20">
      <p className="text-[#8fae5a]">Cargando reporte...</p>
    </div>
  );

  const productos = data?.productos ?? [];
  const totalInventario = data?.totalInventario ?? 0;
  const costoVentas = data?.costoVentas ?? 0;

  const totalEntradas = data?.totalEntradas ?? 0;
  const totalSalidas = data?.totalSalidas ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Reportes e Informes</h1>
        <p className="text-sm text-[#8fae5a] mt-1">Análisis de inventario · Método PEPS</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Total Entradas
          </p>
          <p className="text-xl font-semibold font-mono text-green-400">
            {totalEntradas} mov
          </p>
        </div>
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Total Salidas
          </p>
          <p className="text-xl font-semibold font-mono text-red-400">
            {totalSalidas} mov
          </p>
        </div>
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Valor Inventario
          </p>
          <p className="text-xl font-semibold font-mono text-[#d4a843]">
            {fmt(totalInventario)}
          </p>
        </div>
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Costo de Ventas
          </p>
          <p className="text-xl font-semibold font-mono text-white">
            {fmt(costoVentas)}
          </p>
        </div>
      </div>

      <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4">
          Informe de Inventario Final — Cuenta 1405 Materias Primas
        </h2>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[#264d35]">
              {['Categoría','Insumo','Cantidad','Unidad','Costo Unit.','Valor Total'].map(h => (
                <th key={h} className={`pb-2 px-2 text-[#8fae5a] uppercase text-[10px]
                  ${h === 'Categoría' || h === 'Insumo' ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8fae5a] text-xs">
                  No hay productos en el inventario.
                </td>
              </tr>
            ) : (
              productos.map((p: any) => (
                <tr key={p.id_producto}
                  className="border-b border-[#1a2e2244] hover:bg-[#111c17]">
                  <td className="py-2 px-2 text-[#8fae5a]">{p.categoria}</td>
                  <td className="py-2 px-2 text-white font-semibold">{p.nombre}</td>
                  <td className="py-2 px-2 text-right text-white">
                    {Number(p.saldo_cantidad).toLocaleString('es-CO')}
                  </td>
                  <td className="py-2 px-2 text-right text-[#8fae5a]">{p.unidadmedida}</td>
                  <td className="py-2 px-2 text-right text-white">{fmt(p.costo_unitario)}</td>
                  <td className="py-2 px-2 text-right text-[#d4a843] font-semibold">
                    {fmt(p.saldo_valor)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#4a7c3f]">
              <td colSpan={5} className="py-2 px-2 text-right text-[#8fae5a] font-semibold
                                         uppercase tracking-widest text-[10px]">
                Total Inventario (Cta 1405):
              </td>
              <td className="py-2 px-2 text-right text-[#d4a843] font-bold text-sm">
                {fmt(totalInventario)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4">
          Costo de Ventas — Asiento Contable
        </h2>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[#264d35]">
              {['Cuenta','Descripción','Debe','Haber'].map(h => (
                <th key={h} className={`pb-2 px-2 text-[#8fae5a] text-[10px] uppercase
                  ${h === 'Cuenta' || h === 'Descripción' ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#1a2e2244]">
              <td className="py-2 px-2 text-[#d4a843]">613501</td>
              <td className="py-2 px-2 text-white">Costo de Ventas</td>
              <td className="py-2 px-2 text-right text-green-400">{fmt(costoVentas)}</td>
              <td className="py-2 px-2 text-right text-[#8fae5a]">—</td>
            </tr>
            <tr>
              <td className="py-2 px-2 text-[#d4a843]">143501</td>
              <td className="py-2 px-2 text-white">Mercancías no fabricadas por la empresa</td>
              <td className="py-2 px-2 text-right text-[#8fae5a]">—</td>
              <td className="py-2 px-2 text-right text-red-400">{fmt(costoVentas)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}