import { useState } from 'react';

type Categoria = 'SEMILLAS' | 'FERTILIZANTES' | 'HERBICIDAS' | 'FUNGICIDAS' | 'CALES';
type Unidad = 'GRS' | 'ML';

interface Lote {
  fecha: string;
  cantidad: number;
  costoUnitario: number;
  factura: string;
}

interface Movimiento {
  id: number;
  fecha: string;
  detalle: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'INICIO';
  cantidad: number;
  costoUnitario: number;
  total: number;
  saldoCantidad: number;
  saldoValor: number;
  lotes?: { cantidad: number; costo: number; total: number }[];
}

interface Producto {
  id: number;
  nombre: string;
  categoria: Categoria;
  unidad: Unidad;
  movimientos: Movimiento[];
  lotes: Lote[];
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const fmtU = (n: number, u: string) => n.toLocaleString('es-CO') + ' ' + u;
const hoy = () => new Date().toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'2-digit'});

export default function Kardex() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNuevoProd, setShowNuevoProd] = useState(false);
  const [tipo, setTipo] = useState<'ENTRADA'|'SALIDA'>('ENTRADA');
  const [detalle, setDetalle] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');
  const [error, setError] = useState('');

  const [npNombre, setNpNombre] = useState('');
  const [npCategoria, setNpCategoria] = useState<Categoria>('SEMILLAS');
  const [npUnidad, setNpUnidad] = useState<Unidad>('GRS');
  const [npCantidad, setNpCantidad] = useState('');
  const [npCosto, setNpCosto] = useState('');

  const producto = productos.find(p => p.id === selectedId);
  const saldoCant = producto?.movimientos[producto.movimientos.length - 1]?.saldoCantidad ?? 0;
  const saldoValor = producto?.movimientos[producto.movimientos.length - 1]?.saldoValor ?? 0;

  const aplicarMovimiento = () => {
    setError('');
    if (!producto) return;
    const qty = parseFloat(cantidad);
    const cost = parseFloat(costo);
    if (!detalle.trim()) return setError('Ingresa un detalle');
    if (!qty || qty <= 0) return setError('Cantidad inválida');
    if (tipo === 'ENTRADA' && (!cost || cost <= 0)) return setError('Costo inválido');

    setProductos(prev => prev.map(p => {
      if (p.id !== selectedId) return p;
      const lastMov = p.movimientos[p.movimientos.length - 1];
      let newMov: Movimiento;
      let newLotes = [...p.lotes];

      if (tipo === 'ENTRADA') {
        const total = qty * cost;
        newLotes.push({ fecha: hoy(), cantidad: qty, costoUnitario: cost, factura: detalle });
        newMov = {
          id: p.movimientos.length + 1,
          fecha: hoy(), detalle, tipo: 'ENTRADA',
          cantidad: qty, costoUnitario: cost, total,
          saldoCantidad: lastMov.saldoCantidad + qty,
          saldoValor: lastMov.saldoValor + total,
        };
      } else {
        if (qty > lastMov.saldoCantidad) {
          setError(`Stock insuficiente. Disponible: ${lastMov.saldoCantidad} ${p.unidad}`);
          return p;
        }
        let restante = qty;
        let costoTotal = 0;
        const lotesConsumidos: { cantidad: number; costo: number; total: number }[] = [];

        newLotes = p.lotes.map(lote => {
          if (restante <= 0) return lote;
          const consumir = Math.min(lote.cantidad, restante);
          lotesConsumidos.push({ cantidad: consumir, costo: lote.costoUnitario, total: consumir * lote.costoUnitario });
          costoTotal += consumir * lote.costoUnitario;
          restante -= consumir;
          return { ...lote, cantidad: lote.cantidad - consumir };
        }).filter(l => l.cantidad > 0);

        newMov = {
          id: p.movimientos.length + 1,
          fecha: hoy(), detalle, tipo: 'SALIDA',
          cantidad: qty, costoUnitario: Math.round(costoTotal / qty), total: costoTotal,
          saldoCantidad: lastMov.saldoCantidad - qty,
          saldoValor: lastMov.saldoValor - costoTotal,
          lotes: lotesConsumidos,
        };
      }

      return { ...p, lotes: newLotes, movimientos: [...p.movimientos, newMov] };
    }));

    setDetalle(''); setCantidad(''); setCosto(''); setShowForm(false);
  };

  const agregarProducto = () => {
    if (!npNombre.trim()) return;
    const qty = parseFloat(npCantidad);
    const cost = parseFloat(npCosto);
    const newP: Producto = {
      id: Date.now(), nombre: npNombre, categoria: npCategoria, unidad: npUnidad,
      lotes: qty > 0 ? [{ fecha: hoy(), cantidad: qty, costoUnitario: cost, factura: 'INVEN INICIAL' }] : [],
      movimientos: qty > 0 ? [{
        id:1, fecha:hoy(), detalle:'Inventario Inicial', tipo:'INICIO',
        cantidad:qty, costoUnitario:cost, total:qty*cost,
        saldoCantidad:qty, saldoValor:qty*cost
      }] : []
    };
    setProductos(prev => [...prev, newP]);
    setSelectedId(newP.id);
    setNpNombre(''); setNpCantidad(''); setNpCosto('');
    setShowNuevoProd(false);
  };

  const totalInventario = productos.reduce((acc, p) => {
    const last = p.movimientos[p.movimientos.length - 1];
    return acc + (last?.saldoValor ?? 0);
  }, 0);

  const categorias: Categoria[] = ['SEMILLAS','FERTILIZANTES','HERBICIDAS','FUNGICIDAS','CALES'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Kardex PEPS</h1>
          <p className="text-sm text-[#8fae5a] mt-1">
            Primeras en Entrar — Primeras en Salir · Insumos Agrícolas
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNuevoProd(!showNuevoProd)}
            className="px-4 py-2 bg-[#d4a843] text-[#2d4a1e] rounded-lg text-sm
                       font-semibold hover:opacity-90 transition-opacity">
            + Nuevo producto
          </button>
          {producto && (
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[#4a7c3f] text-white rounded-lg text-sm
                         font-semibold hover:bg-[#3d6b2e] transition-colors">
              {showForm ? '✕ Cancelar' : '+ Movimiento'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario nuevo producto */}
      {showNuevoProd && (
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#d4a843] mb-4">Registrar nuevo insumo</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">Nombre</label>
              <input value={npNombre} onChange={e => setNpNombre(e.target.value)}
                placeholder="Ej: Fungicida Amistar"
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-[#4a7c3f]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">Categoría</label>
              <select value={npCategoria} onChange={e => setNpCategoria(e.target.value as Categoria)}
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-[#4a7c3f]">
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">Unidad</label>
              <select value={npUnidad} onChange={e => setNpUnidad(e.target.value as Unidad)}
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-[#4a7c3f]">
                <option value="GRS">GRS (Gramos — polvos)</option>
                <option value="ML">ML (Mililitros — líquidos)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
                Inventario inicial ({npUnidad})
              </label>
              <input type="number" value={npCantidad} onChange={e => setNpCantidad(e.target.value)}
                placeholder="0"
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-[#4a7c3f] font-mono"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">Costo unitario ($)</label>
              <input type="number" value={npCosto} onChange={e => setNpCosto(e.target.value)}
                placeholder="0"
                className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                           text-sm text-white outline-none focus:border-[#4a7c3f] font-mono"/>
            </div>
          </div>
          <button onClick={agregarProducto}
            className="px-6 py-2 bg-[#d4a843] text-[#2d4a1e] rounded-lg text-sm font-semibold hover:opacity-90">
            Crear producto
          </button>
        </div>
      )}

      {/* Sin productos */}
      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24
                        bg-[#1a2e22] border border-[#264d35] rounded-xl mt-4">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-white font-semibold">No hay insumos registrados</p>
          <p className="text-sm text-[#8fae5a] mt-1">
            Haz clic en "+ Nuevo producto" para comenzar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Lista productos */}
          <div className="col-span-1">
            <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-3">
                Insumos ({productos.length})
              </p>
              <div className="space-y-1">
                {productos.map(p => {
                  const last = p.movimientos[p.movimientos.length - 1];
                  return (
                    <button key={p.id} onClick={() => setSelectedId(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all
                        ${selectedId === p.id
                          ? 'bg-[#4a7c3f] text-white'
                          : 'text-[#c8d9a0] hover:bg-[#162a1e]'
                        }`}>
                      <div className="font-semibold">{p.nombre}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {p.categoria} · {fmtU(last?.saldoCantidad ?? 0, p.unidad)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Consolidado */}
            <div className="bg-[#1a2e22] border border-[#d4a843]/40 rounded-xl p-3">
              <p className="text-xs font-semibold text-[#d4a843] uppercase tracking-widest mb-3">
                Inventario consolidado
              </p>
              <p className="text-xs text-[#8fae5a] mb-1">Total en pesos:</p>
              <p className="text-lg font-bold text-[#d4a843] font-mono">{fmt(totalInventario)}</p>
              <div className="mt-3 space-y-1">
                {productos.map(p => {
                  const last = p.movimientos[p.movimientos.length - 1];
                  return (
                    <div key={p.id} className="flex justify-between text-[10px]">
                      <span className="text-[#8fae5a] truncate">{p.nombre}</span>
                      <span className="text-white font-mono ml-2">{fmt(last?.saldoValor ?? 0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kardex producto */}
          <div className="col-span-3">
            {producto ? (
              <>
                {/* Info producto */}
                <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-semibold text-white">{producto.nombre}</h2>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-[#3d6b2e] text-[#c8d9a0] rounded text-[10px] font-semibold">
                          {producto.categoria}
                        </span>
                        <span className="px-2 py-0.5 bg-[#d4a843]/20 text-[#d4a843] rounded text-[10px] font-semibold">
                          {producto.unidad === 'GRS' ? 'GRAMOS (polvos)' : 'MILILITROS (líquidos)'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded text-[10px] font-semibold">
                          MÉTODO PEPS
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8fae5a]">Saldo actual</p>
                      <p className="text-xl font-bold text-white font-mono">
                        {fmtU(saldoCant, producto.unidad)}
                      </p>
                      <p className="text-sm text-[#d4a843] font-mono">{fmt(saldoValor)}</p>
                    </div>
                  </div>
                  {producto.lotes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#8fae5a] mb-2">
                        Lotes disponibles (orden PEPS):
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {producto.lotes.map((l, i) => (
                          <div key={i} className="bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-[#8fae5a]">Lote {i+1}: </span>
                            <span className="text-white font-mono">{fmtU(l.cantidad, producto.unidad)}</span>
                            <span className="text-[#8fae5a] mx-1">@</span>
                            <span className="text-[#d4a843] font-mono">{fmt(l.costoUnitario)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulario movimiento */}
                {showForm && (
                  <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-[#4a7c3f] mb-4">
                      Registrar movimiento — {producto.nombre}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">Tipo</label>
                        <div className="flex gap-2">
                          {(['ENTRADA','SALIDA'] as const).map(t => (
                            <button key={t} onClick={() => setTipo(t)}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                                ${tipo === t
                                  ? t === 'ENTRADA' ? 'bg-[#4a7c3f] text-white' : 'bg-red-900/60 text-red-300'
                                  : 'bg-[#111c17] text-[#8fae5a] border border-[#264d35]'
                                }`}>
                              {t === 'ENTRADA' ? '↑ Entrada' : '↓ Salida'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
                          Detalle / Factura
                        </label>
                        <input value={detalle} onChange={e => setDetalle(e.target.value)}
                          placeholder="Ej: Compra FAC#123, Venta FAC#456"
                          className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                                     text-sm text-white outline-none focus:border-[#4a7c3f]"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
                          Cantidad ({producto.unidad})
                          {tipo === 'SALIDA' && (
                            <span className="text-[#d4a843] normal-case ml-1">máx: {saldoCant}</span>
                          )}
                        </label>
                        <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
                          placeholder="0" min="1"
                          className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                                     text-sm text-white outline-none focus:border-[#4a7c3f] font-mono"/>
                      </div>
                      {tipo === 'ENTRADA' ? (
                        <div>
                          <label className="block text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">
                            Costo unitario ($/{producto.unidad})
                          </label>
                          <input type="number" value={costo} onChange={e => setCosto(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                                       text-sm text-white outline-none focus:border-[#4a7c3f] font-mono"/>
                        </div>
                      ) : (
                        <div className="bg-[#111c17] border border-[#264d35] rounded-lg p-3">
                          <p className="text-xs text-[#8fae5a] mb-1">En PEPS el costo se calcula automáticamente</p>
                          <p className="text-xs text-[#d4a843]">Se consumen los lotes más antiguos primero</p>
                        </div>
                      )}
                    </div>
                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                    <button onClick={aplicarMovimiento}
                      className="px-6 py-2 bg-[#4a7c3f] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6b2e]">
                      Registrar
                    </button>
                  </div>
                )}

                {/* Tabla Kardex */}
                <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-[#4a7c3f] mb-4">
                    Historial Kardex — PEPS · {producto.nombre}
                  </h3>
                  {producto.movimientos.length === 0 ? (
                    <p className="text-center text-[#8fae5a] text-xs py-8">
                      Sin movimientos aún. Registra el inventario inicial.
                    </p>
                  ) : (
                    <table className="w-full text-xs font-mono min-w-[800px]">
                      <thead>
                        <tr className="border-b border-[#264d35]">
                          {['Fecha','Detalle','Tipo','E.Cant','E.Costo','E.Total',
                            'S.Cant','S.Costo','S.Total','Sal.Cant','Sal.Total'].map(h => (
                            <th key={h} className={`pb-2 px-2 text-[#8fae5a] uppercase text-[10px]
                              ${h==='Fecha'||h==='Detalle'||h==='Tipo' ? 'text-left' : 'text-right'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {producto.movimientos.map((m, i) => (
                          <tr key={i} className="border-b border-[#1a2e2244] hover:bg-[#111c17]">
                            <td className="py-2 px-2 text-[#8fae5a]">{m.fecha}</td>
                            <td className="py-2 px-2 text-white">{m.detalle}</td>
                            <td className="py-2 px-2">
                              {m.tipo === 'ENTRADA' && <span className="px-2 py-0.5 bg-green-900/60 text-green-400 rounded text-[10px] font-semibold">ENTRADA</span>}
                              {m.tipo === 'SALIDA'  && <span className="px-2 py-0.5 bg-red-900/40 text-red-400 rounded text-[10px] font-semibold">SALIDA</span>}
                              {m.tipo === 'INICIO'  && <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400 rounded text-[10px] font-semibold">INICIO</span>}
                            </td>
                            <td className="py-2 px-2 text-right text-green-400">{m.tipo !== 'SALIDA' ? fmtU(m.cantidad, producto.unidad) : '—'}</td>
                            <td className="py-2 px-2 text-right text-green-300">{m.tipo !== 'SALIDA' ? fmt(m.costoUnitario) : '—'}</td>
                            <td className="py-2 px-2 text-right text-green-300">{m.tipo !== 'SALIDA' ? fmt(m.total) : '—'}</td>
                            <td className="py-2 px-2 text-right text-red-400">{m.tipo === 'SALIDA' ? fmtU(m.cantidad, producto.unidad) : '—'}</td>
                            <td className="py-2 px-2 text-right text-red-300">{m.tipo === 'SALIDA' ? fmt(m.costoUnitario) : '—'}</td>
                            <td className="py-2 px-2 text-right text-red-300">{m.tipo === 'SALIDA' ? fmt(m.total) : '—'}</td>
                            <td className="py-2 px-2 text-right text-white font-semibold">{fmtU(m.saldoCantidad, producto.unidad)}</td>
                            <td className="py-2 px-2 text-right text-[#d4a843] font-semibold">{fmt(m.saldoValor)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#4a7c3f]">
                          <td colSpan={9} className="py-2 px-2 text-right text-[#8fae5a] font-semibold
                                                      text-xs uppercase tracking-widest">
                            Inventario Final:
                          </td>
                          <td className="py-2 px-2 text-right text-white font-bold">
                            {fmtU(saldoCant, producto.unidad)}
                          </td>
                          <td className="py-2 px-2 text-right text-[#d4a843] font-bold">
                            {fmt(saldoValor)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center bg-[#1a2e22]
                              border border-[#264d35] rounded-xl py-20">
                <p className="text-[#8fae5a] text-sm">Selecciona un insumo de la lista</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}