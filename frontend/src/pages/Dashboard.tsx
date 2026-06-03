import { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export default function Dashboard() {
  usePageTitle('Dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 flex items-center justify-center py-20">
      <p className="text-[#8fae5a]">Cargando dashboard...</p>
    </div>
  );

  const entradas = data?.movimientosHoy?.entradas ?? 0;
  const salidas = data?.movimientosHoy?.salidas ?? 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-2">Dashboard General</h1>
      <p className="text-sm text-[#8fae5a]">Bienvenido al sistema de inventario</p>

      <div className="grid grid-cols-4 gap-4 mt-6">

        {/* Total Productos */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#4a9e4a] rounded-t-xl" />
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Total Productos
          </p>
          <p className="text-3xl font-semibold font-mono text-white">
            {data?.totalProductos ?? 0}
          </p>
          <p className="text-xs text-[#8fae5a] mt-1">
            {data?.totalProductos > 0 ? 'Productos registrados' : 'Sin productos aún'}
          </p>
        </div>

        {/* Bajo Stock */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl
            ${data?.bajoStock > 0 ? 'bg-red-500' : 'bg-[#c8871a]'}`} />
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Bajo Stock
          </p>
          <p className={`text-3xl font-semibold font-mono
            ${data?.bajoStock > 0 ? 'text-red-400' : 'text-[#d4a843]'}`}>
            {data?.bajoStock ?? 0}
          </p>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2 py-0.5 rounded-full
            ${data?.bajoStock > 0
              ? 'bg-red-900/40 text-red-400'
              : 'bg-[#1e3d1e] text-[#6abf6a]'}`}>
            {data?.bajoStock > 0 ? '⚠ Requieren atención' : '✓ Sin alertas'}
          </span>
        </div>

        {/* Valor Inventario */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2d7ab5] rounded-t-xl" />
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Valor Inventario
          </p>
          <p className="text-3xl font-semibold font-mono text-white">
            {fmt(data?.valorInventario ?? 0)}
          </p>
          <p className="text-xs text-[#8fae5a] mt-1">
            {data?.valorInventario > 0 ? 'Valor total PEPS' : 'Sin movimientos'}
          </p>
        </div>

        {/* Movimientos Hoy */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2a8f7a] rounded-t-xl" />
          <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
            Movimientos Hoy
          </p>
          <p className="text-3xl font-semibold font-mono text-white">
            {entradas + salidas}
          </p>
          <p className="text-xs text-[#8fae5a] mt-1">
            {entradas} entradas · {salidas} salidas
          </p>
        </div>

      </div>

      <div className="mt-6 bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4">Últimos movimientos</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#264d35]">
              {['Fecha','Producto','Tipo','Cantidad','Costo Unit.','Total'].map(h => (
                <th key={h} className="text-left text-[#8fae5a] uppercase tracking-wider
                                       font-semibold pb-2 px-2 text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data?.ultimosMovimientos?.length ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8fae5a] text-xs">
                  No hay movimientos registrados aún.
                  <br/>Los movimientos aparecerán aquí cuando uses el módulo Kardex.
                </td>
              </tr>
            ) : (
              data.ultimosMovimientos.map((m: any, i: number) => (
                <tr key={i} className="border-b border-[#1a2e2244] hover:bg-[#111c17]">
                  <td className="py-2 px-2 text-[#8fae5a]">
                    {new Date(m.fecha).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-2 px-2 text-white font-semibold">{m.producto}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold
                      ${m.tipo === 'ENTRADA'
                        ? 'bg-green-900/60 text-green-400'
                        : 'bg-red-900/40 text-red-400'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-white font-mono">
                    {Number(m.cantidad).toLocaleString('es-CO')} {m.unidadmedida}
                  </td>
                  <td className="py-2 px-2 text-white font-mono">{fmt(m.costo_unitario)}</td>
                  <td className="py-2 px-2 text-[#d4a843] font-mono font-semibold">
                    {fmt(m.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}