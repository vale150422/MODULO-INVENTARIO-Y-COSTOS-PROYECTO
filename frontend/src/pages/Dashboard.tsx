export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-2">Dashboard General</h1>
      <p className="text-sm text-green-700">Bienvenido al sistema de inventario</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Productos', value: '248', sub: '↑ +12 este mes', color: 'text-white' },
          { label: 'Bajo Stock', value: '17', sub: '↑ +4 esta semana', color: 'text-yellow-400' },
          { label: 'Valor Inventario', value: '$84.2M', sub: '↑ +5.2%', color: 'text-white' },
          { label: 'Movimientos Hoy', value: '43', sub: '28 entradas · 15 salidas', color: 'text-white' },
        ].map((k) => (
          <div key={k.label}
            className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-2">
              {k.label}
            </p>
            <p className={`text-2xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            <p className="text-xs text-green-700 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Últimos movimientos */}
      <div className="mt-6 bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-green-400 mb-4">Últimos movimientos</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#264d35]">
              {['Fecha','Producto','Tipo','Cantidad','Costo Unit.','Total'].map(h => (
                <th key={h} className="text-left text-green-800 uppercase tracking-wider
                                       font-semibold pb-2 px-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { date:'15/05/26 09:42', prod:'Tornillo M8 Galv.', tipo:'ENTRADA', qty:500, cost:45 },
              { date:'15/05/26 09:18', prod:'Pintura Antiox. 1L', tipo:'SALIDA', qty:20, cost:18500 },
              { date:'15/05/26 08:55', prod:'Cable AWG 12', tipo:'ENTRADA', qty:30, cost:32000 },
            ].map((m, i) => (
              <tr key={i} className="border-b border-[#1a2e22] hover:bg-[#111c17]">
                <td className="py-2 px-2 font-mono text-green-800">{m.date}</td>
                <td className="py-2 px-2 text-white">{m.prod}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    m.tipo === 'ENTRADA'
                      ? 'bg-green-900/60 text-green-400'
                      : 'bg-red-900/40 text-red-400'
                  }`}>{m.tipo}</span>
                </td>
                <td className="py-2 px-2 font-mono text-green-300">{m.qty}</td>
                <td className="py-2 px-2 font-mono text-green-300">
                  ${m.cost.toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-2 font-mono text-green-400">
                  ${(m.qty * m.cost).toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}