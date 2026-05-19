export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-2">Dashboard General</h1>
      <p className="text-sm text-[#8fae5a]">Bienvenido al sistema de inventario</p>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label:'Total Productos',  value:'0',  sub:'Sin productos aún',     color:'text-white'     },
          { label:'Bajo Stock',       value:'0',  sub:'Sin alertas',            color:'text-[#d4a843]' },
          { label:'Valor Inventario', value:'$0', sub:'Sin movimientos',        color:'text-white'     },
          { label:'Movimientos Hoy',  value:'0',  sub:'0 entradas · 0 salidas', color:'text-white'     },
        ].map(k => (
          <div key={k.label} className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
              {k.label}
            </p>
            <p className={`text-2xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            <p className="text-xs text-[#8fae5a] mt-1">{k.sub}</p>
          </div>
        ))}
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
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#8fae5a] text-xs">
                No hay movimientos registrados aún.
                <br/>Los movimientos aparecerán aquí cuando uses el módulo Kardex.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}