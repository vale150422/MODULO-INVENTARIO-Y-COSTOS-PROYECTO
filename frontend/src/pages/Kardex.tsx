import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

type Unidad = 'GRS' | 'ML' | string;

interface Lote {
  id_lote: number;
  cantidad: number;
  costo_unitario: number;
  factura: string;
  fecha_entrada: string;
  fecha_vencimiento: string | null;
}

interface Movimiento {
  id_kardex: number;
  fecha: string;
  detalle: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'INICIO';
  cantidad: number;
  costo_unitario: number;
  total: number;
  saldo_cantidad: number;
  saldo_valor: number;
  usuario: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  unidadmedida: Unidad;
  categoria: string;
  finca: string;
  id_finca: number;
  saldo_cantidad: number;
  saldo_valor: number;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO') + ' COP';
const fmtU = (n: number, u: string) => Number(n).toLocaleString('es-CO') + ' ' + u;

const parseCOP = (val: string): number => {
  const limpio = val.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(limpio) || 0;
};

const diasParaVencer = (fecha: string | null): number | null => {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vence = new Date(fecha);
  vence.setHours(0, 0, 0, 0);
  return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

export default function Kardex({ canEdit = true }: { canEdit?: boolean }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loadingProd, setLoadingProd] = useState(true);
  const [loadingMov, setLoadingMov] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [detalle, setDetalle] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');
  const [fechaVenc, setFechaVenc] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const producto = productos.find(p => p.id_producto === selectedId);
  const totalInventario = productos.reduce((acc, p) => acc + Number(p.saldo_valor), 0);

  const cargarLotes = useCallback(async (id: number) => {
    try {
      const data = await api.getLotes(id);
      setLotes(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarMovimientos = useCallback(async (id: number) => {
    setLoadingMov(true);
    try {
      const data = await api.getKardex(id);
      setMovimientos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMov(false);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    setLoadingProd(true);
    try {
      const data = await api.getKardexProductos();
      setProductos(data);
      if (data.length > 0) setSelectedId(prev => prev ?? data[0].id_producto);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProd(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedId) {
      void cargarMovimientos(selectedId);
      void cargarLotes(selectedId);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const registrar = async () => {
    setError('');
    const qty = parseCOP(cantidad);
    const cost = parseCOP(costo);
    if (!detalle.trim()) return setError('Ingresa un detalle');
    if (!qty || qty <= 0) return setError('Cantidad inválida');
    if (tipo === 'ENTRADA' && (!cost || cost <= 0)) return setError('Costo inválido');
    if (!producto) return;

    setSaving(true);
    try {
      await api.registrarMovimiento({
        id_producto: selectedId!,
        tipo,
        cantidad: qty,
        costo_unitario: tipo === 'SALIDA' ? 0 : cost,
        detalle,
        id_finca: producto.id_finca,
        fecha_vencimiento: fechaVenc || null,
      });
      await cargarProductos();
      await cargarMovimientos(selectedId!);
      await cargarLotes(selectedId!);
      setDetalle(''); setCantidad(''); setCosto(''); setFechaVenc('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingProd) return (
    <div className="p-6 flex items-center justify-center py-20">
      <p className="text-[#8fae5a]">Cargando inventario...</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Kardex PEPS</h1>
          <p className="text-sm text-[#8fae5a] mt-1">
            Primeras en Entrar — Primeras en Salir · Insumos Agrícolas
          </p>
          {!canEdit && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-900/40
                             text-blue-400 rounded text-[10px] font-semibold">
              👁 Modo visualización — solo lectura
            </span>
          )}
        </div>
        {canEdit && producto && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#4a7c3f] text-white rounded-lg text-sm
                       font-semibold hover:bg-[#3d6b2e] transition-colors">
            {showForm ? '✕ Cancelar' : '+ Movimiento'}
          </button>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24
                        bg-[#1a2e22] border border-[#264d35] rounded-xl mt-4">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-white font-semibold">No hay insumos registrados</p>
          <p className="text-sm text-[#8fae5a] mt-1">
            Registra productos desde el módulo Productos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Panel izquierdo */}
          <div className="col-span-1">
            <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-3">
                Insumos ({productos.length})
              </p>
              <div className="space-y-1">
                {productos.map(p => (
                  <button key={p.id_producto}
                    onClick={() => setSelectedId(p.id_producto)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all
                      ${selectedId === p.id_producto
                        ? 'bg-[#4a7c3f] text-white'
                        : 'text-[#c8d9a0] hover:bg-[#162a1e]'}`}>
                    <div className="font-semibold">{p.nombre}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {p.categoria} · {fmtU(p.saldo_cantidad, p.unidadmedida)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a2e22] border border-[#d4a843]/40 rounded-xl p-3">
              <p className="text-xs font-semibold text-[#d4a843] uppercase tracking-widest mb-3">
                Inventario consolidado
              </p>
              <p className="text-xs text-[#8fae5a] mb-1">Valor total (COP $):</p>
              <p className="text-lg font-bold text-[#d4a843] font-mono">
                {fmt(totalInventario)}
              </p>
              <div className="mt-3 space-y-1">
                {productos.map(p => (
                  <div key={p.id_producto} className="flex justify-between text-[10px]">
                    <span className="text-[#8fae5a] truncate">{p.nombre}</span>
                    <span className="text-white font-mono ml-2">{fmt(p.saldo_valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="col-span-3">
            {producto ? (
              <>
                {/* Info producto + lotes */}
                <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-semibold text-white">{producto.nombre}</h2>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#3d6b2e] text-[#c8d9a0] rounded text-[10px] font-semibold">
                          {producto.categoria}
                        </span>
                        <span className="px-2 py-0.5 bg-[#d4a843]/20 text-[#d4a843] rounded text-[10px] font-semibold">
                          {producto.unidadmedida}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded text-[10px] font-semibold">
                          MÉTODO PEPS
                        </span>
                        <span className="px-2 py-0.5 bg-[#3d6b2e] text-[#c8d9a0] rounded text-[10px]">
                          🌿 {producto.finca}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8fae5a]">Saldo actual</p>
                      <p className="text-xl font-bold text-white font-mono">
                        {fmtU(producto.saldo_cantidad, producto.unidadmedida)}
                      </p>
                      <p className="text-sm text-[#d4a843] font-mono">
                        {fmt(producto.saldo_valor)}
                      </p>
                    </div>
                  </div>

                  {/* Lotes FEFO */}
                  {lotes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#8fae5a] mb-2">
                        Lotes disponibles — orden FEFO (usar primero ↓):
                      </p>
                      <div className="space-y-2">
                        {lotes.map((l, i) => {
                          const dias = diasParaVencer(l.fecha_vencimiento);
                          const vencido  = dias !== null && dias < 0;
                          const urgente  = dias !== null && dias >= 0 && dias <= 15;
                          const proximo  = dias !== null && dias > 15 && dias <= 30;
                          // Es el primero que hay que usar:
                          // - si hay más de 1 lote → siempre el índice 0
                          // - si hay 1 solo lote con fecha de vencimiento → también lo marcamos
                          const esElPrimero = i === 0;

                          return (
                            <div key={l.id_lote}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs border
                                ${esElPrimero
                                  ? vencido
                                    ? 'bg-red-900/40 border-red-500'
                                    : urgente
                                      ? 'bg-orange-900/40 border-orange-400'
                                      : 'bg-[#1a3d1a] border-[#4a7c3f]'
                                  : 'bg-[#111c17] border-[#264d35]'}`}>

                              <div className="flex items-center gap-3">
                                {/* Número de lote */}
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center
                                                  text-[10px] font-bold flex-shrink-0
                                  ${esElPrimero ? 'bg-[#4a7c3f] text-white' : 'bg-[#264d35] text-[#8fae5a]'}`}>
                                  {i + 1}
                                </span>
                                <div>
                                  <span className="text-white font-mono font-semibold">
                                    {fmtU(l.cantidad, producto.unidadmedida)}
                                  </span>
                                  <span className="text-[#8fae5a] mx-1">@</span>
                                  <span className="text-[#d4a843] font-mono">{fmt(l.costo_unitario)}</span>
                                  <span className="text-[#8fae5a] ml-2 text-[10px]">
                                    Ingreso: {new Date(l.fecha_entrada).toLocaleDateString('es-CO')}
                                    {l.factura && ` · FAC: ${l.factura}`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Badge vencimiento */}
                                {l.fecha_vencimiento ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold
                                    ${vencido  ? 'bg-red-900/60 text-red-300'
                                    : urgente  ? 'bg-orange-900/60 text-orange-300'
                                    : proximo  ? 'bg-yellow-900/60 text-yellow-300'
                                               : 'bg-green-900/40 text-green-400'}`}>
                                    {vencido
                                      ? `⚠️ Vencido hace ${Math.abs(dias!)} días`
                                      : urgente
                                        ? `🔴 Vence en ${dias} días`
                                        : proximo
                                          ? `🟡 Vence en ${dias} días`
                                          : `✓ Vence ${new Date(l.fecha_vencimiento).toLocaleDateString('es-CO')}`}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#264d35] text-[#8fae5a]">
                                    Sin fecha venc.
                                  </span>
                                )}

                                {/* USAR PRIMERO — visible cuando hay 2+ lotes O cuando hay 1 lote con vencimiento */}
                                {esElPrimero && lotes.length > 1 && (
                                  <span className="px-2 py-0.5 bg-[#4a7c3f] text-white
                                                   rounded text-[10px] font-bold whitespace-nowrap">
                                    ← USAR PRIMERO
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulario movimiento */}
                {canEdit && showForm && (
                  <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-[#4a7c3f] mb-4">
                      Registrar movimiento — {producto.nombre}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Tipo */}
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a]
                                          uppercase tracking-widest mb-2">Tipo</label>
                        <div className="flex gap-2">
                          {(['ENTRADA', 'SALIDA'] as const).map(t => (
                            <button key={t} onClick={() => setTipo(t)}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                                ${tipo === t
                                  ? t === 'ENTRADA'
                                    ? 'bg-[#4a7c3f] text-white'
                                    : 'bg-red-900/60 text-red-300'
                                  : 'bg-[#111c17] text-[#8fae5a] border border-[#264d35]'}`}>
                              {t === 'ENTRADA' ? '↑ Entrada' : '↓ Salida'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detalle */}
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a]
                                          uppercase tracking-widest mb-2">
                          Detalle / Factura
                        </label>
                        <input value={detalle}
                          onChange={e => setDetalle(e.target.value)}
                          placeholder="Ej: Compra FAC#123"
                          className="w-full bg-[#111c17] border border-[#264d35] rounded-lg
                                     px-3 py-2 text-sm text-white outline-none focus:border-[#4a7c3f]" />
                      </div>

                      {/* Cantidad */}
                      <div>
                        <label className="block text-xs font-semibold text-[#8fae5a]
                                          uppercase tracking-widest mb-2">
                          Cantidad ({producto.unidadmedida})
                          {tipo === 'SALIDA' && (
                            <span className="text-[#d4a843] normal-case ml-1">
                              máx: {producto.saldo_cantidad}
                            </span>
                          )}
                        </label>
                        <input
                          type="text" inputMode="numeric" value={cantidad}
                          onChange={e => setCantidad(e.target.value.replace(/[^\d.]/g, ''))}
                          onBlur={e => {
                            const num = parseCOP(e.target.value);
                            if (!isNaN(num) && num > 0) setCantidad(String(num));
                          }}
                          placeholder="Ej: 10"
                          className="w-full bg-[#111c17] border border-[#264d35] rounded-lg
                                     px-3 py-2 text-sm text-white outline-none
                                     focus:border-[#4a7c3f] font-mono" />
                      </div>

                      {tipo === 'ENTRADA' ? (
                        <>
                          {/* Costo */}
                          <div>
                            <label className="block text-xs font-semibold text-[#8fae5a]
                                              uppercase tracking-widest mb-2">
                              Costo unitario ($/{producto.unidadmedida})
                            </label>
                            <input
                              type="text" inputMode="numeric" value={costo}
                              onChange={e => setCosto(e.target.value.replace(/[^\d.]/g, ''))}
                              onBlur={e => {
                                const num = parseCOP(e.target.value);
                                if (!isNaN(num) && num > 0) setCosto(String(num));
                              }}
                              placeholder="Ej: 5.000"
                              className="w-full bg-[#111c17] border border-[#264d35] rounded-lg
                                         px-3 py-2 text-sm text-white outline-none
                                         focus:border-[#4a7c3f] font-mono" />
                            <p className="text-[10px] text-[#8fae5a] mt-1">
                              Puedes escribir 5.000 o 5000
                            </p>
                          </div>

                          {/* Fecha vencimiento */}
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[#8fae5a]
                                              uppercase tracking-widest mb-2">
                              Fecha de vencimiento
                              <span className="normal-case text-[#264d35] ml-1">(opcional)</span>
                            </label>
                            <input
                              type="date" value={fechaVenc}
                              onChange={e => setFechaVenc(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-64 bg-[#111c17] border border-[#264d35] rounded-lg
                                         px-3 py-2 text-sm text-white outline-none
                                         focus:border-[#4a7c3f] [color-scheme:dark]" />
                            <p className="text-[10px] text-[#8fae5a] mt-1">
                              El lote que vence antes saldrá primero automáticamente (FEFO)
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="bg-[#111c17] border border-[#264d35] rounded-lg p-3">
                          <p className="text-xs text-[#8fae5a] mb-1">
                            Costo calculado automáticamente (FEFO)
                          </p>
                          <p className="text-xs text-[#d4a843]">
                            Se consume el lote que vence antes primero
                          </p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs mb-3 bg-red-900/20
                                    border border-red-900/40 rounded px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button onClick={registrar} disabled={saving}
                      className="px-6 py-2 bg-[#4a7c3f] text-white rounded-lg text-sm
                                 font-semibold hover:bg-[#3d6b2e] disabled:opacity-50 transition-colors">
                      {saving ? 'Guardando...' : 'Registrar movimiento'}
                    </button>
                  </div>
                )}

                {/* Historial */}
                <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-[#4a7c3f] mb-4">
                    Historial Kardex — PEPS · {producto.nombre}
                  </h3>
                  {loadingMov ? (
                    <p className="text-center text-[#8fae5a] text-xs py-8">Cargando movimientos...</p>
                  ) : movimientos.length === 0 ? (
                    <p className="text-center text-[#8fae5a] text-xs py-8">
                      Sin movimientos aún. Registra el inventario inicial.
                    </p>
                  ) : (
                    <table className="w-full text-xs font-mono min-w-[800px]">
                      <thead>
                        <tr className="border-b border-[#264d35]">
                          {['Fecha','Detalle','Usuario','Tipo',
                            'E.Cant','E.Costo','E.Total',
                            'S.Cant','S.Costo','S.Total',
                            'Sal.Cant','Sal.Total'].map(h => (
                            <th key={h}
                              className={`pb-2 px-2 text-[#8fae5a] uppercase text-[10px]
                                ${['Fecha','Detalle','Usuario','Tipo'].includes(h)
                                  ? 'text-left' : 'text-right'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.map((m) => (
                          <tr key={m.id_kardex}
                            className="border-b border-[#1a2e2244] hover:bg-[#111c17]">
                            <td className="py-2 px-2 text-[#8fae5a]">
                              {new Date(m.fecha).toLocaleDateString('es-CO')}
                            </td>
                            <td className="py-2 px-2 text-white">{m.detalle}</td>
                            <td className="py-2 px-2 text-[#8fae5a] text-[10px]">{m.usuario}</td>
                            <td className="py-2 px-2">
                              {m.tipo === 'ENTRADA' && (
                                <span className="px-2 py-0.5 bg-green-900/60 text-green-400
                                                 rounded text-[10px] font-semibold">ENTRADA</span>
                              )}
                              {m.tipo === 'SALIDA' && (
                                <span className="px-2 py-0.5 bg-red-900/40 text-red-400
                                                 rounded text-[10px] font-semibold">SALIDA</span>
                              )}
                              {m.tipo === 'INICIO' && (
                                <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400
                                                 rounded text-[10px] font-semibold">INICIO</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right text-green-400">
                              {m.tipo !== 'SALIDA' ? fmtU(m.cantidad, producto.unidadmedida) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-green-300">
                              {m.tipo !== 'SALIDA' ? fmt(m.costo_unitario) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-green-300">
                              {m.tipo !== 'SALIDA' ? fmt(m.total) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-red-400">
                              {m.tipo === 'SALIDA' ? fmtU(m.cantidad, producto.unidadmedida) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-red-300">
                              {m.tipo === 'SALIDA' ? fmt(m.costo_unitario) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-red-300">
                              {m.tipo === 'SALIDA' ? fmt(m.total) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-white font-semibold">
                              {fmtU(m.saldo_cantidad, producto.unidadmedida)}
                            </td>
                            <td className="py-2 px-2 text-right text-[#d4a843] font-semibold">
                              {fmt(m.saldo_valor)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#4a7c3f]">
                          <td colSpan={10}
                            className="py-2 px-2 text-right text-[#8fae5a] font-semibold
                                       text-xs uppercase tracking-widest">
                            Inventario Final:
                          </td>
                          <td className="py-2 px-2 text-right text-white font-bold">
                            {fmtU(producto.saldo_cantidad, producto.unidadmedida)}
                          </td>
                          <td className="py-2 px-2 text-right text-[#d4a843] font-bold">
                            {fmt(producto.saldo_valor)}
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