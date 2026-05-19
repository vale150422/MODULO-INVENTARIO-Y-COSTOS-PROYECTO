import { useState } from 'react';

interface KardexRow {
  fecha: string; concepto: string; tipo: string;
  eq: number; ec: number; es: number;
  sq: number; sc: number; ss: number;
  bq: number; bc: number; bs: number;
}

const inicial: KardexRow[] = [
  { fecha:'01/04/26', concepto:'Saldo inicial', tipo:'',
    eq:100, ec:4500, es:450000, sq:0, sc:0, ss:0, bq:100, bc:4500, bs:450000 },
];

const fmt = (n: number) => n ? '$' + Math.round(n).toLocaleString('es-CO') : '—';
const hoy = () => new Date().toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'2-digit'});

export default function Kardex() {
  const [rows, setRows] = useState<KardexRow[]>(inicial);
  const [tipo, setTipo] = useState<'ENTRADA'|'SALIDA'>('ENTRADA');
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const last = rows[rows.length - 1];

  const agregar = () => {
    setError('');
    const qty = parseFloat(cantidad);
    const cost = parseFloat(costo);

    if (!concepto.trim()) return setError('Ingresa un concepto');
    if (!qty || qty <= 0) return setError('Cantidad inválida');
    if (!cost || cost <= 0) return setError('Costo inválido');

    const prev = rows[rows.length - 1];
    let newRow: KardexRow;

    if (tipo === 'ENTRADA') {
      const nuevoTotal = prev.bs + (qty * cost);
      const nuevaCant = prev.bq + qty;
      const nuevoProm = nuevoTotal / nuevaCant;
      newRow = {
        fecha: hoy(), concepto, tipo,
        eq: qty, ec: cost, es: qty * cost,
        sq: 0, sc: 0, ss: 0,
        bq: nuevaCant, bc: Math.round(nuevoProm), bs: Math.round(nuevoTotal),
      };
    } else {
      if (qty > prev.bq) return setError(`Stock insuficiente. Disponible: ${prev.bq}`);
      const costoSalida = prev.bc;
      const nuevaCant = prev.bq - qty;
      const nuevoTotal = prev.bs - (qty * costoSalida);
      newRow = {
        fecha: hoy(), concepto, tipo,
        eq: 0, ec: 0, es: 0,
        sq: qty, sc: costoSalida, ss: qty * costoSalida,
        bq: nuevaCant, bc: costoSalida, bs: Math.round(Math.max(0, nuevoTotal)),
      };
    }

    setRows([...rows, newRow]);
    setConcepto('');
    setCantidad('');
    setCosto('');
    setShowForm(false);
  };

  const eliminarUltimo = () => {
    if (rows.length <= 1) return;
    setRows(rows.slice(0, -1));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Módulo Kardex</h1>
          <p className="text-sm text-green-700 mt-1">Método Promedio Ponderado</p>
        </div>
        <div className="flex gap-2">
          {rows.length > 1 && (
            <button onClick={eliminarUltimo}
              className="px-4 py-2 bg-red-900/40 border border-red-900/60 text-red-400
                         rounded-lg text-sm hover:bg-red-900/60 transition-colors">
              ↩ Deshacer último
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm
                       font-semibold hover:bg-green-700 transition-colors">
            {showForm ? '✕ Cancelar' : '+ Nuevo movimiento'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-green-400 mb-4">Registrar movimiento</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-green-800 uppercase
                                tracking-widest mb-2">Tipo</label>
              <div className="flex gap-2">
                {(['ENTRADA','SALIDA'] as const).map(t => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                      ${tipo === t
                        ? t === 'ENTRADA'
                          ? 'bg-green-800 text-green-300'
                          : 'bg-red-900/60 text-red-300'
                        : 'bg-[#111c17] text-green-700 border border-[#264d35]'
                      }`}>
                    {t === 'ENTRADA' ? '↑ Entrada' : '↓ Salida'}
                  </button>
                ))}
              </div>
            </div>
            {/* Concepto */}
            <div>
              <label className="block text-xs font-semibold text-green-800 uppercase
                                tracking-widest mb-2">Concepto</label>
              <input value={concepto} onChange={e => setConcepto(e.target.value)}
                placeholder="Ej: Compra proveedor, Despacho..."
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-green-600 transition-colors"/>
            </div>
            {/* Cantidad */}
            <div>
              <label className="block text-xs font-semibold text-green-800 uppercase
                                tracking-widest mb-2">
                Cantidad {tipo === 'SALIDA' && (
                  <span className="text-yellow-500 normal-case ml-1">
                    (máx: {last.bq})
                  </span>
                )}
              </label>
              <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
                placeholder="0" min="1"
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-green-600 transition-colors font-mono"/>
            </div>
            {/* Costo */}
            <div>
              <label className="block text-xs font-semibold text-green-800 uppercase
                                tracking-widest mb-2">
                Costo unitario {tipo === 'SALIDA' && (
                  <span className="text-green-600 normal-case ml-1">
                    (promedio: ${last.bc.toLocaleString('es-CO')})
                  </span>
                )}
              </label>
              <input type="number" value={tipo === 'SALIDA' ? last.bc : costo}
                onChange={e => tipo === 'ENTRADA' && setCosto(e.target.value)}
                readOnly={tipo === 'SALIDA'}
                placeholder="0"
                className={`w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none font-mono transition-colors
                           ${tipo === 'SALIDA' ? 'opacity-60 cursor-not-allowed' : 'focus:border-green-600'}`}/>
              {tipo === 'SALIDA' && (
                <p className="text-xs text-green-800 mt-1">
                  En salidas se usa el costo promedio vigente automáticamente
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {cantidad && (tipo === 'ENTRADA' ? costo : true) && (
            <div className="bg-[#111c17] border border-[#264d35] rounded-lg p-3 mb-4">
              <p className="text-xs text-green-800 uppercase tracking-widest mb-2 font-semibold">
                Vista previa
              </p>
              <div className="flex gap-6 text-sm font-mono">
                <div>
                  <span className="text-green-800 text-xs">Subtotal: </span>
                  <span className="text-white">
                    ${(parseFloat(cantidad||'0') * (tipo === 'ENTRADA' ? parseFloat(costo||'0') : last.bc)).toLocaleString('es-CO')}
                  </span>
                </div>
                <div>
                  <span className="text-green-800 text-xs">Nuevo saldo: </span>
                  <span className="text-green-400">
                    {tipo === 'ENTRADA'
                      ? last.bq + parseFloat(cantidad||'0')
                      : last.bq - parseFloat(cantidad||'0')
                    } un.
                  </span>
                </div>
                {tipo === 'ENTRADA' && cantidad && costo && (
                  <div>
                    <span className="text-green-800 text-xs">Nuevo costo prom.: </span>
                    <span className="text-green-400">
                      ${Math.round((last.bs + parseFloat(cantidad)*parseFloat(costo)) /
                        (last.bq + parseFloat(cantidad))).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button onClick={agregar}
            className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold
                       hover:bg-green-600 transition-colors">
            Registrar movimiento
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Saldo Unidades',    value: last.bq.toString(),    color:'text-white'     },
          { label:'Costo Promedio',    value: fmt(last.bc),          color:'text-green-400' },
          { label:'Valor Total Saldo', value: fmt(last.bs),          color:'text-green-400' },
          { label:'Movimientos',       value: rows.length.toString(), color:'text-white'    },
        ].map(k => (
          <div key={k.label} className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-2">
              {k.label}
            </p>
            <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 overflow-x-auto">
        <h2 className="text-sm font-semibold text-green-400 mb-4">Historial Kardex</h2>
        <table className="w-full text-xs font-mono min-w-[900px]">
          <thead>
            <tr className="border-b border-[#264d35]">
              {['Fecha','Concepto','Tipo','E.Cant','E.Costo','E.Total',
                'S.Cant','S.Costo','S.Total','Sal.Cant','Sal.Costo','Sal.Total'].map(h => (
                <th key={h} className="text-right first:text-left pb-2 px-2
                                       text-green-800 uppercase tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#1a2e2244] hover:bg-[#111c17] transition-colors">
                <td className="py-2 px-2 text-green-800">{r.fecha}</td>
                <td className="py-2 px-2 text-white">{r.concepto}</td>
                <td className="py-2 px-2">
                  {r.tipo === 'ENTRADA' && <span className="px-2 py-0.5 bg-green-900/60 text-green-400 rounded text-[10px] font-semibold">ENTRADA</span>}
                  {r.tipo === 'SALIDA'  && <span className="px-2 py-0.5 bg-red-900/40 text-red-400 rounded text-[10px] font-semibold">SALIDA</span>}
                  {r.tipo === ''        && <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400 rounded text-[10px] font-semibold">INICIO</span>}
                </td>
                <td className="py-2 px-2 text-right text-green-400">{r.eq || '—'}</td>
                <td className="py-2 px-2 text-right text-green-300">{r.ec ? fmt(r.ec) : '—'}</td>
                <td className="py-2 px-2 text-right text-green-300">{r.es ? fmt(r.es) : '—'}</td>
                <td className="py-2 px-2 text-right text-red-400">{r.sq || '—'}</td>
                <td className="py-2 px-2 text-right text-red-300">{r.sc ? fmt(r.sc) : '—'}</td>
                <td className="py-2 px-2 text-right text-red-300">{r.ss ? fmt(r.ss) : '—'}</td>
                <td className="py-2 px-2 text-right text-white font-semibold">{r.bq}</td>
                <td className="py-2 px-2 text-right text-green-400 font-semibold">{fmt(r.bc)}</td>
                <td className="py-2 px-2 text-right text-green-400 font-semibold">{fmt(r.bs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}