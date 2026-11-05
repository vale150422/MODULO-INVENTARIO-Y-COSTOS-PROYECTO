import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../services/api';
import EscanerFactura from '../components/EscanerFactura';
import {
  Package, ClipboardList, Plus, X, RefreshCw,
  AlertTriangle, CheckCircle, Clock, Eye, Leaf
} from 'lucide-react';

type Unidad = 'GRS' | 'ML' | string;
type Tab = 'resumen' | 'insumos' | 'consolidado' | 'alertas' | 'historial';
type NivelAlerta = 'vencido' | 'urgente' | 'proximo' | 'agotado' | 'bajo';

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

interface Alerta {
  id: string;
  nivel: NivelAlerta;
  producto: Producto;
  detalle: string;
}

/* ───────── Utilidades ───────── */
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

const generarNumFactura = (): string => {
  const now = new Date();
  const fecha = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `FAC-${fecha}-${rand}`;
};

const STOCK_BAJO = 10; // mismo umbral que usa el Reporte Kardex

/* ───────── Colores (alto contraste, no dependen del modo claro/oscuro) ───────── */
const C = {
  card: '#ffffff',
  border: '#b9d3a3',
  text: '#10281a',
  muted: '#3f5f2f',
  head: '#dcebcc',
  zebra: '#f4f9ee',
  dark: '#1e3d10',
  green: '#15803d',
  red: '#b91c1c',
  gold: '#854d0e',
};

const estiloLote = (dias: number | null, primero: boolean) => {
  if (dias !== null && dias < 0) return { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', badge: '#b91c1c' };
  if (dias !== null && dias <= 15) return { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', badge: '#c2410c' };
  if (dias !== null && dias <= 30) return { bg: '#fef9c3', border: '#ca8a04', text: '#713f12', badge: '#a16207' };
  if (primero) return { bg: '#dcfce7', border: '#16a34a', text: '#14532d', badge: '#15803d' };
  return { bg: '#f4f9ee', border: '#b9d3a3', text: '#10281a', badge: '#3f5f2f' };
};

const etiquetaVenc = (fecha: string | null, dias: number | null): ReactNode => {
  if (!fecha || dias === null) return 'Sin fecha venc.';
  if (dias < 0) return <><AlertTriangle size={11} strokeWidth={2} /> Vencido hace {Math.abs(dias)} días</>;
  if (dias <= 30) return <><Clock size={11} strokeWidth={2} /> Vence en {dias} días</>;
  return <><CheckCircle size={11} strokeWidth={2} /> Vence {new Date(fecha).toLocaleDateString('es-CO')}</>;
};

const estiloAlerta: Record<NivelAlerta, { bg: string; border: string; text: string; badge: string; label: string; orden: number }> = {
  vencido: { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', badge: '#b91c1c', label: 'VENCIDO', orden: 0 },
  urgente: { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', badge: '#c2410c', label: 'VENCE EN ≤15 DÍAS', orden: 1 },
  agotado: { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', badge: '#991b1b', label: 'AGOTADO', orden: 2 },
  bajo: { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', badge: '#c2410c', label: 'STOCK BAJO', orden: 3 },
  proximo: { bg: '#fef9c3', border: '#ca8a04', text: '#713f12', badge: '#a16207', label: 'VENCE EN ≤30 DÍAS', orden: 4 },
};

const card: CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 16,
  color: C.text,
};

const lbl: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.muted,
  marginBottom: 6,
};

const inp: CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #7fa466',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  color: C.text,
  outline: 'none',
};

function Badge({ bg, color = '#ffffff', children }: { bg: string; color?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
      style={{ background: bg, color }}>
      {children}
    </span>
  );
}

const HEADERS = ['Fecha', 'Factura', 'Usuario', 'Tipo', 'E.Cant', 'E.Costo', 'E.Total',
  'S.Cant', 'S.Costo', 'S.Total', 'Sal.Cant', 'Sal.Total'];
const HEADERS_IZQ = ['Fecha', 'Factura', 'Usuario', 'Tipo'];

export default function Kardex({ canEdit = true }: { canEdit?: boolean }) {
  usePageTitle('Kardex');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [todosLotes, setTodosLotes] = useState<Record<number, Lote[]>>({});
  const [loadingProd, setLoadingProd] = useState(true);
  const [loadingMov, setLoadingMov] = useState(false);
  const [tab, setTab] = useState<Tab>('resumen');

  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [detalle, setDetalle] = useState('');
  const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');
  const [fechaVenc, setFechaVenc] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showFacturas, setShowFacturas] = useState(false);
  const [mostrarEscaner, setMostrarEscaner] = useState(false);

  const producto = productos.find(p => p.id_producto === selectedId);
  const totalInventario = productos.reduce((acc, p) => acc + Number(p.saldo_valor), 0);
  const facturasHistorial = Array.from(
    new Set(movimientos.map(m => m.detalle).filter(Boolean))
  );

  /* ───────── Carga de datos ───────── */
  const cargarLotes = useCallback(async (id: number) => {
    try {
      const data = await api.getLotes(id);
      setLotes(data);
    } catch (err) { console.error(err); }
  }, []);

  // Lotes de TODOS los insumos (para las alertas de vencimiento)
  const cargarTodosLotes = useCallback(async (prods: Producto[]) => {
    const mapa: Record<number, Lote[]> = {};
    await Promise.all(prods.map(async p => {
      try { mapa[p.id_producto] = await api.getLotes(p.id_producto); }
      catch { mapa[p.id_producto] = []; }
    }));
    setTodosLotes(mapa);
  }, []);

  const cargarMovimientos = useCallback(async (id: number) => {
    setLoadingMov(true);
    try {
      const data = await api.getKardex(id);
      setMovimientos(data);
    } catch (err) { console.error(err); }
    finally { setLoadingMov(false); }
  }, []);

  const cargarProductos = useCallback(async () => {
    setLoadingProd(true);
    try {
      const data = await api.getKardexProductos();
      setProductos(data);
      if (data.length > 0) setSelectedId(prev => prev ?? data[0].id_producto);
      void cargarTodosLotes(data);
    } catch (err) { console.error(err); }
    finally { setLoadingProd(false); }
  }, [cargarTodosLotes]);

  useEffect(() => { void cargarProductos(); }, []); // eslint-disable-line
  useEffect(() => {
    if (selectedId) {
      void cargarMovimientos(selectedId);
      void cargarLotes(selectedId);
    }
  }, [selectedId]); // eslint-disable-line

  /* ───────── Alertas (todos los insumos) ───────── */
  const alertas: Alerta[] = [];
  productos.forEach(p => {
    (todosLotes[p.id_producto] ?? []).forEach(l => {
      const d = diasParaVencer(l.fecha_vencimiento);
      if (d === null) return;
      const base = `${fmtU(l.cantidad, p.unidadmedida)}${l.factura ? ` · ${l.factura}` : ''}`;
      if (d < 0) alertas.push({ id: `v-${l.id_lote}`, nivel: 'vencido', producto: p, detalle: `Lote vencido hace ${Math.abs(d)} días — ${base}` });
      else if (d <= 15) alertas.push({ id: `u-${l.id_lote}`, nivel: 'urgente', producto: p, detalle: `Lote vence en ${d} días — ${base}` });
      else if (d <= 30) alertas.push({ id: `p-${l.id_lote}`, nivel: 'proximo', producto: p, detalle: `Lote vence en ${d} días — ${base}` });
    });
    const s = Number(p.saldo_cantidad);
    if (s <= 0) alertas.push({ id: `a-${p.id_producto}`, nivel: 'agotado', producto: p, detalle: 'Sin existencias disponibles' });
    else if (s < STOCK_BAJO) alertas.push({ id: `b-${p.id_producto}`, nivel: 'bajo', producto: p, detalle: `Quedan solo ${fmtU(s, p.unidadmedida)}` });
  });
  alertas.sort((a, b) => estiloAlerta[a.nivel].orden - estiloAlerta[b.nivel].orden);

  const estadoStock = (p: Producto): 'agotado' | 'bajo' | null => {
    const s = Number(p.saldo_cantidad);
    if (s <= 0) return 'agotado';
    if (s < STOCK_BAJO) return 'bajo';
    return null;
  };

  /* ───────── Acciones ───────── */
  const cambiarProducto = (id: number) => {
    setSelectedId(id);
    setShowFacturas(false);
    setShowForm(false);
    setMostrarEscaner(false);
  };

  const irAInsumo = (id: number) => {
    cambiarProducto(id);
    setTab('resumen');
  };

  const abrirForm = () => {
    if (!showForm) {
      setDetalle(generarNumFactura());
      setTipo('ENTRADA');
      setCantidad(''); setCosto(''); setFechaVenc('');
      setLoteSeleccionado(null); setError('');
      setMostrarEscaner(false);
    }
    setShowForm(!showForm);
    setShowFacturas(false);
  };

  const cambiarTipo = (t: 'ENTRADA' | 'SALIDA') => {
    setTipo(t);
    setLoteSeleccionado(null);
    setCantidad(''); setError('');
    if (t === 'SALIDA') setMostrarEscaner(false);
    if (t === 'SALIDA' && lotes.length > 0) setLoteSeleccionado(lotes[0]);
  };

  // Registra en el backend todos los productos detectados en una factura.
  const confirmarFactura = async (f: {
    numero_factura: string | null;
    id_proveedor: number | null;
    items: any[];
  }) => {
    if (!producto) throw new Error('Selecciona una finca antes de registrar la factura.');

    const respuesta = await fetch(
      `${import.meta.env.VITE_API_URL}/api/kardex/entrada-factura`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id_finca: producto.id_finca,
          id_proveedor: f.id_proveedor,
          factura_proveedor: f.numero_factura,
          items: f.items.map(it => ({
            id_producto: it.id_producto,
            numero_lote: it.numero_lote,
            fecha_vencimiento: it.fecha_vencimiento,
            cantidad: it.cantidad,
            costo_unitario: it.costo_unitario,
          })),
        }),
      }
    );

    const data = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      throw new Error(data.error || 'No fue posible registrar la factura.');
    }

    setMostrarEscaner(false);

    // Actualiza el inventario y la información del producto seleccionado.
    await cargarProductos();
    if (selectedId !== null) {
      await cargarMovimientos(selectedId);
      await cargarLotes(selectedId);
    }
  };

  const registrar = async () => {
    setError('');
    const qty = parseCOP(cantidad);
    const cost = parseCOP(costo);
    if (!detalle.trim()) return setError('Ingresa un número de factura');
    if (!qty || qty <= 0) return setError('Cantidad inválida');
    if (tipo === 'ENTRADA' && (!cost || cost <= 0)) return setError('Costo inválido');
    if (tipo === 'SALIDA' && !loteSeleccionado) return setError('Selecciona el lote a consumir');
    if (tipo === 'SALIDA' && qty > loteSeleccionado!.cantidad)
      return setError(`Stock insuficiente en este lote. Disponible: ${loteSeleccionado!.cantidad} ${producto?.unidadmedida}`);
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
      setLoteSeleccionado(null); setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ───────── Tabla de movimientos (se reutiliza en Resumen e Historial) ───────── */
  const tablaMovs = (lista: Movimiento[], p: Producto, conPie: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono min-w-[900px]"
        style={{ color: C.text, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: C.head }}>
            {HEADERS.map(h => (
              <th key={h}
                className={`py-2 px-2 uppercase text-[10px] ${HEADERS_IZQ.includes(h) ? 'text-left' : 'text-right'}`}
                style={{ color: C.dark, fontWeight: 800 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.map((m, idx) => (
            <tr key={m.id_kardex}
              style={{ background: idx % 2 ? C.zebra : '#ffffff', borderBottom: `1px solid ${C.border}` }}>
              <td className="py-2 px-2" style={{ color: C.muted }}>
                {new Date(m.fecha).toLocaleDateString('es-CO')}
              </td>
              <td className="py-2 px-2 font-bold" style={{ color: C.text }}>{m.detalle}</td>
              <td className="py-2 px-2 text-[10px]" style={{ color: C.muted }}>{m.usuario}</td>
              <td className="py-2 px-2">
                {m.tipo === 'ENTRADA' && <Badge bg="#166534">ENTRADA</Badge>}
                {m.tipo === 'SALIDA' && <Badge bg="#b91c1c">SALIDA</Badge>}
                {m.tipo === 'INICIO' && <Badge bg="#6b21a8">INICIO</Badge>}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: '#166534' }}>
                {m.tipo !== 'SALIDA' ? fmtU(m.cantidad, p.unidadmedida) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: '#166534' }}>
                {m.tipo !== 'SALIDA' ? fmt(m.costo_unitario) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: '#166534' }}>
                {m.tipo !== 'SALIDA' ? fmt(m.total) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: C.red }}>
                {m.tipo === 'SALIDA' ? fmtU(m.cantidad, p.unidadmedida) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: C.red }}>
                {m.tipo === 'SALIDA' ? fmt(m.costo_unitario) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-semibold" style={{ color: C.red }}>
                {m.tipo === 'SALIDA' ? fmt(m.total) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ color: C.text }}>
                {fmtU(m.saldo_cantidad, p.unidadmedida)}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ color: C.gold }}>
                {fmt(m.saldo_valor)}
              </td>
            </tr>
          ))}
        </tbody>
        {conPie && (
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.dark}`, background: C.head }}>
              <td colSpan={10} className="py-2 px-2 text-right font-bold uppercase text-xs"
                style={{ color: C.dark, letterSpacing: '0.08em' }}>
                Inventario Final:
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ color: C.text }}>
                {fmtU(p.saldo_cantidad, p.unidadmedida)}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ color: C.gold }}>
                {fmt(p.saldo_valor)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  if (loadingProd) return (
    <div className="p-6 flex items-center justify-center py-20">
      <p className="text-[#8fae5a]">Cargando inventario...</p>
    </div>
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'insumos', label: 'Insumos', count: productos.length },
    { id: 'consolidado', label: 'Inventario consolidado' },
    { id: 'alertas', label: 'Alertas', count: alertas.length },
    { id: 'historial', label: 'Historial completo' },
  ];

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Kardex PEPS</h1>
        <p className="text-sm text-[#8fae5a] mt-1">
          Primeras en Entrar — Primeras en Salir · Insumos Agrícolas
        </p>
        {!canEdit && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-semibold"
            style={{ background: '#1e40af', color: '#ffffff' }}>
            <Eye size={11} strokeWidth={1.75} /> Modo visualización — solo lectura
          </span>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 mt-4" style={card}>
          <Package size={48} strokeWidth={1.5} style={{ color: C.muted, marginBottom: 16 }} />
          <p className="font-semibold" style={{ color: C.text }}>No hay insumos registrados</p>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            Registra productos desde el módulo Productos
          </p>
        </div>
      ) : (
        <>
          {/* ═════════ BARRA SUPERIOR FIJA ═════════ */}
          {producto && (
            <div className="sticky top-0 z-30 mb-4"
              style={{ ...card, padding: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Selector + badges */}
                <div className="min-w-[260px] flex-1">
                  <label style={lbl}>Insumo seleccionado</label>
                  <select value={selectedId ?? ''}
                    onChange={e => cambiarProducto(Number(e.target.value))}
                    style={{ ...inp, fontWeight: 700, maxWidth: 420 }}>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre} — {p.categoria} · {fmtU(p.saldo_cantidad, p.unidadmedida)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge bg="#2d6a1e">{producto.categoria}</Badge>
                    <Badge bg="#854d0e">{producto.unidadmedida}</Badge>
                    <Badge bg="#15803d">MÉTODO PEPS</Badge>
                    <Badge bg="#1e3d10"><Leaf size={11} strokeWidth={2} /> {producto.finca}</Badge>
                  </div>
                </div>

                {/* Saldo actual */}
                <div className="text-right">
                  <p style={{ ...lbl, marginBottom: 2 }}>Saldo actual</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: C.text }}>
                    {fmtU(producto.saldo_cantidad, producto.unidadmedida)}
                  </p>
                  <p className="text-sm font-bold font-mono" style={{ color: C.gold }}>
                    {fmt(producto.saldo_valor)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  {movimientos.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => { setShowFacturas(!showFacturas); setShowForm(false); }}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                        style={{ background: C.dark, color: '#ffffff' }}>
                        <ClipboardList size={16} strokeWidth={1.75} />
                        Facturas ({facturasHistorial.length})
                      </button>
                      {showFacturas && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl overflow-hidden"
                          style={{ background: '#ffffff', border: `2px solid ${C.dark}`, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
                          <div className="px-3 py-2" style={{ background: C.head, borderBottom: `1px solid ${C.border}` }}>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.dark }}>
                              Historial de Facturas
                            </p>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {facturasHistorial.map((f, i) => {
                              const movsFac = movimientos.filter(m => m.detalle === f);
                              const lotesFac = lotes.filter(l => l.factura === f);
                              const diasMin = lotesFac
                                .map(l => diasParaVencer(l.fecha_vencimiento))
                                .filter((d): d is number => d !== null)
                                .sort((a, b) => a - b)[0];
                              const vencido = diasMin !== undefined && diasMin < 0;
                              const urgente = diasMin !== undefined && diasMin >= 0 && diasMin <= 15;
                              return (
                                <div key={i}
                                  className="px-3 py-2 flex items-center justify-between"
                                  style={{
                                    borderBottom: `1px solid ${C.border}`,
                                    background: vencido ? '#fee2e2' : urgente ? '#ffedd5' : '#ffffff',
                                  }}>
                                  <div>
                                    <p className="text-xs font-bold font-mono"
                                      style={{ color: vencido ? '#7f1d1d' : urgente ? '#7c2d12' : C.text }}>
                                      {f}
                                    </p>
                                    <p className="text-[10px]" style={{ color: C.muted }}>
                                      {movsFac.length} mov. · {movsFac.filter(m => m.tipo === 'ENTRADA').length} entradas
                                    </p>
                                  </div>
                                  {diasMin !== undefined && (
                                    <Badge bg={vencido ? '#b91c1c' : urgente ? '#c2410c' : '#3f5f2f'}>
                                      {vencido
                                        ? <><AlertTriangle size={10} strokeWidth={2} /> Vencida</>
                                        : urgente
                                          ? <><Clock size={10} strokeWidth={2} /> {diasMin}d</>
                                          : <><CheckCircle size={10} strokeWidth={2} /> {diasMin}d</>}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {canEdit && (
                    <button onClick={abrirForm}
                      className="px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                      style={{ background: showForm ? C.red : C.green, color: '#ffffff' }}>
                      {showForm
                        ? <><X size={16} strokeWidth={2} /> Cancelar</>
                        : <><Plus size={16} strokeWidth={2} /> Movimiento</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ FORMULARIO DE MOVIMIENTO (visible desde cualquier pestaña) ═════════ */}
          {canEdit && showForm && producto && (
            <div className="mb-4" style={{ ...card, border: `2px solid ${C.green}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.dark }}>
                Registrar movimiento — {producto.nombre}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">

                {/* Tipo */}
                <div>
                  <label style={lbl}>Tipo</label>
                  <div className="flex gap-2">
                    {(['ENTRADA', 'SALIDA'] as const).map(t => (
                      <button key={t} onClick={() => cambiarTipo(t)}
                        className="flex-1 py-2 rounded-lg text-sm font-bold"
                        style={tipo === t
                          ? { background: t === 'ENTRADA' ? '#166534' : '#b91c1c', color: '#ffffff', border: '2px solid transparent' }
                          : { background: '#ffffff', color: C.text, border: `2px solid ${C.border}` }}>
                        {t === 'ENTRADA' ? '↑ Entrada' : '↓ Salida'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Factura */}
                <div>
                  <label style={lbl}>N° Factura / Detalle</label>
                  <div className="flex gap-2">
                    <input value={detalle}
                      onChange={e => setDetalle(e.target.value)}
                      placeholder="Ej: FAC-20260526-001"
                      className="flex-1 font-mono"
                      style={inp} />
                    <button type="button" onClick={() => setDetalle(generarNumFactura())}
                      className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                      style={{ background: C.dark, color: '#ffffff' }}>
                      <RefreshCw size={12} strokeWidth={2} /> Auto
                    </button>
                  </div>
                </div>

                {/* SALIDA: selector de lote */}
                {tipo === 'SALIDA' && (
                  <div className="col-span-2">
                    <label style={lbl}>
                      Lote a consumir
                      <span style={{ textTransform: 'none', fontWeight: 400, marginLeft: 6 }}>
                        — selecciona cuál factura/lote saldrá
                      </span>
                    </label>
                    <div className="space-y-2">
                      {lotes.length === 0 ? (
                        <p className="text-xs rounded-lg px-3 py-2 font-semibold"
                          style={{ background: '#fee2e2', color: '#7f1d1d', border: '1px solid #dc2626' }}>
                          No hay lotes disponibles para este producto
                        </p>
                      ) : (
                        lotes.map((l, i) => {
                          const dias = diasParaVencer(l.fecha_vencimiento);
                          const est = estiloLote(dias, i === 0);
                          const sel = loteSeleccionado?.id_lote === l.id_lote;
                          return (
                            <button key={l.id_lote} type="button"
                              onClick={() => setLoteSeleccionado(l)}
                              className="w-full text-left rounded-lg px-3 py-2 text-xs flex items-center justify-between"
                              style={{
                                background: sel ? '#bbf7d0' : est.bg,
                                border: `1px solid ${sel ? '#15803d' : est.border}`,
                                boxShadow: sel ? '0 0 0 3px #15803d' : 'none',
                                color: est.text,
                              }}>
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                                  style={{ background: sel ? '#15803d' : est.badge, color: '#ffffff' }}>
                                  {i + 1}
                                </span>
                                <div>
                                  <span className="font-mono font-bold">
                                    {fmtU(l.cantidad, producto.unidadmedida)} disponibles
                                  </span>
                                  {l.factura && (
                                    <span className="ml-2 font-mono text-[11px] font-semibold">· {l.factura}</span>
                                  )}
                                  <span className="ml-2 text-[11px]">@ {fmt(l.costo_unitario)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge bg={est.badge}>{etiquetaVenc(l.fecha_vencimiento, dias)}</Badge>
                                {i === 0 && lotes.length > 1 && <Badge bg={C.dark}>← USAR PRIMERO</Badge>}
                                {sel && <CheckCircle size={16} strokeWidth={2} style={{ color: '#15803d' }} />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                    {loteSeleccionado && (
                      <p className="text-xs mt-2 font-bold flex items-center gap-1" style={{ color: '#166534' }}>
                        <CheckCircle size={12} strokeWidth={2} />
                        Lote seleccionado: {fmtU(loteSeleccionado.cantidad, producto.unidadmedida)} disponibles
                        {loteSeleccionado.factura && ` · ${loteSeleccionado.factura}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Cantidad */}
                <div>
                  <label style={lbl}>
                    Cantidad ({producto.unidadmedida})
                    {tipo === 'SALIDA' && loteSeleccionado && (
                      <span style={{ color: C.gold, textTransform: 'none', marginLeft: 6 }}>
                        máx: {loteSeleccionado.cantidad}
                      </span>
                    )}
                    {tipo === 'SALIDA' && !loteSeleccionado && (
                      <span style={{ color: C.red, textTransform: 'none', marginLeft: 6 }}>
                        — selecciona un lote primero
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
                    disabled={tipo === 'SALIDA' && !loteSeleccionado}
                    placeholder="Ej: 10"
                    className="font-mono"
                    style={{ ...inp, opacity: tipo === 'SALIDA' && !loteSeleccionado ? 0.5 : 1 }} />
                </div>

                {tipo === 'ENTRADA' ? (
                  <>
                    <div>
                      <label style={lbl}>Costo unitario ($/{producto.unidadmedida})</label>
                      <input
                        type="text" inputMode="numeric" value={costo}
                        onChange={e => setCosto(e.target.value.replace(/[^\d.]/g, ''))}
                        onBlur={e => {
                          const num = parseCOP(e.target.value);
                          if (!isNaN(num) && num > 0) setCosto(String(num));
                        }}
                        placeholder="Ej: 5.000"
                        className="font-mono"
                        style={inp} />
                      <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                        Puedes escribir 5.000 o 5000
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label style={lbl}>
                        Fecha de vencimiento
                        <span style={{ textTransform: 'none', fontWeight: 400, marginLeft: 6 }}>(opcional)</span>
                      </label>
                      <input
                        type="date" value={fechaVenc}
                        onChange={e => setFechaVenc(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ ...inp, width: 256 }} />
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg p-3" style={{ background: C.zebra, border: `1px solid ${C.green}` }}>
                    <p className="text-xs font-bold mb-1" style={{ color: C.text }}>
                      Costo calculado automáticamente (FEFO)
                    </p>
                    <p className="text-xs" style={{ color: C.muted }}>
                      Se descuenta del lote seleccionado arriba
                    </p>
                  </div>
                )}
              </div>

              {/* Escáner de factura: disponible únicamente para entradas */}
              {tipo === 'ENTRADA' && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setMostrarEscaner(v => !v)}
                    className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                    style={{
                      background: mostrarEscaner ? '#854d0e' : '#166534',
                      color: '#ffffff',
                    }}
                  >
                    📷 {mostrarEscaner ? 'Cerrar escáner' : 'Entrada con factura'}
                  </button>

                  {mostrarEscaner && producto && (
                    <div className="mt-3">
                      <EscanerFactura
                        idFinca={producto.id_finca}
                        productos={productos.filter(p => p.id_finca === producto.id_finca)}
                        onConfirmar={confirmarFactura}
                      />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs mb-3 rounded px-3 py-2 font-bold flex items-center gap-2"
                  style={{ background: C.red, color: '#ffffff' }}>
                  <AlertTriangle size={14} strokeWidth={2} /> {error}
                </p>
              )}

              <button onClick={registrar} disabled={saving}
                className="px-6 py-2 rounded-lg text-sm font-bold"
                style={{ background: C.green, color: '#ffffff', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Guardando...' : 'Registrar movimiento'}
              </button>
            </div>
          )}

          {/* ═════════ PESTAÑAS ═════════ */}
          <div className="flex gap-2 flex-wrap mb-4">
            {tabs.map(t => {
              const activa = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  style={activa
                    ? { background: C.dark, color: '#ffffff', border: `2px solid ${C.dark}` }
                    : { background: '#ffffff', color: C.text, border: `2px solid ${C.border}` }}>
                  {t.label}
                  {t.count !== undefined && (
                    <span className="px-1.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: t.id === 'alertas' && t.count > 0 ? C.red : activa ? '#ffffff' : C.head,
                        color: t.id === 'alertas' && t.count > 0 ? '#ffffff' : C.dark,
                      }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ═════════ PESTAÑA: RESUMEN ═════════ */}
          {tab === 'resumen' && producto && (
            <div className="space-y-4">
              {/* Lotes FEFO */}
              <div style={card}>
                <h3 className="text-sm font-bold mb-1" style={{ color: C.dark }}>
                  Lotes disponibles — orden FEFO
                </h3>
                <p className="text-xs mb-3" style={{ color: C.muted }}>
                  El lote que vence primero debe salir primero (usar primero ↓)
                </p>
                {lotes.length === 0 ? (
                  <p className="text-xs py-4 text-center" style={{ color: C.muted }}>
                    Este insumo no tiene lotes disponibles.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lotes.map((l, i) => {
                      const dias = diasParaVencer(l.fecha_vencimiento);
                      const est = estiloLote(dias, i === 0);
                      return (
                        <div key={l.id_lote}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                          style={{ background: est.bg, border: `1px solid ${est.border}`, color: est.text }}>
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ background: est.badge, color: '#ffffff' }}>
                              {i + 1}
                            </span>
                            <div>
                              <span className="font-mono font-bold">{fmtU(l.cantidad, producto.unidadmedida)}</span>
                              <span className="mx-1">@</span>
                              <span className="font-mono font-bold" style={{ color: C.gold }}>{fmt(l.costo_unitario)}</span>
                              <span className="ml-2 text-[11px]">
                                {new Date(l.fecha_entrada).toLocaleDateString('es-CO')}
                                {l.factura && ` · ${l.factura}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge bg={est.badge}>{etiquetaVenc(l.fecha_vencimiento, dias)}</Badge>
                            {i === 0 && lotes.length > 1 && <Badge bg={C.dark}>← USAR PRIMERO</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Últimos 5 movimientos */}
              <div style={card}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: C.dark }}>
                    Últimos 5 movimientos — {producto.nombre}
                  </h3>
                  {movimientos.length > 5 && (
                    <button onClick={() => setTab('historial')}
                      className="text-xs font-bold underline" style={{ color: C.green }}>
                      Ver historial completo ({movimientos.length}) →
                    </button>
                  )}
                </div>
                {loadingMov ? (
                  <p className="text-center text-xs py-8" style={{ color: C.muted }}>Cargando movimientos...</p>
                ) : movimientos.length === 0 ? (
                  <p className="text-center text-xs py-8" style={{ color: C.muted }}>
                    Sin movimientos aún. Registra el inventario inicial.
                  </p>
                ) : (
                  tablaMovs(movimientos.slice(-5).reverse(), producto, false)
                )}
              </div>
            </div>
          )}

          {/* ═════════ PESTAÑA: INSUMOS ═════════ */}
          {tab === 'insumos' && (
            <div style={card}>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.dark }}>
                Insumos ({productos.length})
              </h3>
              <p className="text-xs mb-4" style={{ color: C.muted }}>
                Haz clic en un insumo para ver sus lotes y movimientos.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {productos.map(p => {
                  const sel = p.id_producto === selectedId;
                  const est = estadoStock(p);
                  return (
                    <button key={p.id_producto} onClick={() => irAInsumo(p.id_producto)}
                      className="text-left rounded-xl p-3"
                      style={{
                        background: sel ? '#dcfce7' : '#ffffff',
                        border: `2px solid ${sel ? '#15803d' : C.border}`,
                        color: C.text,
                      }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold">{p.nombre}</p>
                        {est && (
                          <Badge bg={estiloAlerta[est].badge}>{estiloAlerta[est].label}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                        {p.categoria} · {p.finca}
                      </p>
                      <p className="text-lg font-bold font-mono mt-2">
                        {fmtU(p.saldo_cantidad, p.unidadmedida)}
                      </p>
                      <p className="text-xs font-bold font-mono" style={{ color: C.gold }}>
                        {fmt(p.saldo_valor)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═════════ PESTAÑA: INVENTARIO CONSOLIDADO ═════════ */}
          {tab === 'consolidado' && (
            <div className="space-y-4">
              <div style={{ ...card, border: `2px solid ${C.gold}` }}>
                <p style={lbl}>Inventario consolidado</p>
                <p className="text-xs mb-1" style={{ color: C.muted }}>Valor total (COP $):</p>
                <p className="text-3xl font-bold font-mono" style={{ color: C.gold }}>
                  {fmt(totalInventario)}
                </p>
              </div>

              <div style={card}>
                <h3 className="text-sm font-bold mb-3" style={{ color: C.dark }}>
                  Valor por insumo
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[600px]" style={{ color: C.text, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.head }}>
                        {['Insumo', 'Categoría', 'Finca', 'Cantidad', 'Valor', '% del total'].map((h, i) => (
                          <th key={h}
                            className={`py-2 px-3 uppercase text-[10px] ${i < 3 ? 'text-left' : 'text-right'}`}
                            style={{ color: C.dark, fontWeight: 800 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p, idx) => (
                        <tr key={p.id_producto}
                          style={{ background: idx % 2 ? C.zebra : '#ffffff', borderBottom: `1px solid ${C.border}` }}>
                          <td className="py-2 px-3 font-bold">{p.nombre}</td>
                          <td className="py-2 px-3" style={{ color: C.muted }}>{p.categoria}</td>
                          <td className="py-2 px-3" style={{ color: C.muted }}>{p.finca}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">
                            {fmtU(p.saldo_cantidad, p.unidadmedida)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: C.gold }}>
                            {fmt(p.saldo_valor)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono" style={{ color: C.muted }}>
                            {totalInventario > 0
                              ? ((Number(p.saldo_valor) / totalInventario) * 100).toFixed(1) + '%'
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${C.dark}`, background: C.head }}>
                        <td colSpan={4} className="py-2 px-3 text-right font-bold uppercase text-xs"
                          style={{ color: C.dark, letterSpacing: '0.08em' }}>
                          Total inventario:
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold" style={{ color: C.gold }}>
                          {fmt(totalInventario)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ PESTAÑA: ALERTAS ═════════ */}
          {tab === 'alertas' && (
            <div style={card}>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.dark }}>
                Alertas del inventario ({alertas.length})
              </h3>
              <p className="text-xs mb-4" style={{ color: C.muted }}>
                Lotes vencidos o por vencer (≤30 días) e insumos con stock bajo (menos de {STOCK_BAJO}) o agotados.
              </p>
              {alertas.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 rounded-lg"
                  style={{ background: '#dcfce7', border: '1px solid #16a34a' }}>
                  <CheckCircle size={32} strokeWidth={1.75} style={{ color: '#15803d', marginBottom: 4 }} />
                  <p className="text-sm font-bold" style={{ color: '#14532d' }}>Sin alertas</p>
                  <p className="text-xs" style={{ color: '#166534' }}>Todo el inventario está en orden.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alertas.map(a => {
                    const e = estiloAlerta[a.nivel];
                    return (
                      <div key={a.id}
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                        style={{ background: e.bg, border: `1px solid ${e.border}`, color: e.text }}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge bg={e.badge}>{e.label}</Badge>
                          <span className="text-sm font-bold">{a.producto.nombre}</span>
                          <span className="text-xs">{a.producto.categoria} · {a.producto.finca}</span>
                          <span className="text-xs font-semibold">{a.detalle}</span>
                        </div>
                        <button onClick={() => irAInsumo(a.producto.id_producto)}
                          className="px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                          style={{ background: C.dark, color: '#ffffff' }}>
                          Ver insumo
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════ PESTAÑA: HISTORIAL COMPLETO ═════════ */}
          {tab === 'historial' && producto && (
            <div style={card}>
              <h3 className="text-sm font-bold mb-3" style={{ color: C.dark }}>
                Historial Kardex — PEPS · {producto.nombre}
              </h3>
              {loadingMov ? (
                <p className="text-center text-xs py-8" style={{ color: C.muted }}>Cargando movimientos...</p>
              ) : movimientos.length === 0 ? (
                <p className="text-center text-xs py-8" style={{ color: C.muted }}>
                  Sin movimientos aún. Registra el inventario inicial.
                </p>
              ) : (
                tablaMovs(movimientos, producto, true)
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}