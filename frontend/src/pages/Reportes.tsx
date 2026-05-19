export default function Reportes() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Reportes e Informes</h1>
        <p className="text-sm text-[#8fae5a] mt-1">
          Análisis de inventario · Método PEPS
        </p>
      </div>

      {/* KPIs vacíos */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Entradas',   value:'0 mov',  color:'text-green-400' },
          { label:'Total Salidas',    value:'0 mov',  color:'text-red-400'   },
          { label:'Valor Inventario', value:'$0',     color:'text-[#d4a843]' },
          { label:'Costo de Ventas',  value:'$0',     color:'text-white'     },
        ].map(k => (
          <div key={k.label} className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
              {k.label}
            </p>
            <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Mensaje sin datos */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 flex flex-col
                        items-center justify-center py-16">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-white font-semibold text-sm">Sin datos aún</p>
          <p className="text-xs text-[#8fae5a] mt-1 text-center">
            La gráfica de movimientos aparecerá<br/>cuando registres entradas y salidas
          </p>
        </div>
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 flex flex-col
                        items-center justify-center py-16">
          <div className="text-4xl mb-3">🥧</div>
          <p className="text-white font-semibold text-sm">Sin categorías aún</p>
          <p className="text-xs text-[#8fae5a] mt-1 text-center">
            El gráfico por categoría aparecerá<br/>cuando registres insumos en el Kardex
          </p>
        </div>
      </div>

      {/* Tabla inventario vacía */}
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
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#8fae5a] text-xs">
                No hay productos registrados en el inventario.
                <br/>Registra insumos desde el módulo Kardex.
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#4a7c3f]">
              <td colSpan={5} className="py-2 px-2 text-right text-[#8fae5a] font-semibold
                                         uppercase tracking-widest text-[10px]">
                Total Inventario (Cta 1405):
              </td>
              <td className="py-2 px-2 text-right text-[#d4a843] font-bold text-sm">$0</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Asiento contable vacío */}
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
              <td className="py-2 px-2 text-right text-[#8fae5a]">$0</td>
              <td className="py-2 px-2 text-right text-[#8fae5a]">—</td>
            </tr>
            <tr>
              <td className="py-2 px-2 text-[#d4a843]">143501</td>
              <td className="py-2 px-2 text-white">Mercancías no fabricadas por la empresa</td>
              <td className="py-2 px-2 text-right text-[#8fae5a]">—</td>
              <td className="py-2 px-2 text-right text-[#8fae5a]">$0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}