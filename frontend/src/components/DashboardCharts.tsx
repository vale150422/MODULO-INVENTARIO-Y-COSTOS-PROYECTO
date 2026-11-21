import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'https://modulo-inventario-y-costos-proyecto.onrender.com/api';

interface Alerta { id_producto: number; nombre: string; unidadmedida: string; stock_minimo: number | string; finca: string; saldo_cantidad: number | string; }
interface Dia { dia: string; entradas: number | string; salidas: number | string; }
interface Cat { categoria: string; valor: number | string; }

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const COMPACTO = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });
const COLORES = ['#4a7c3f', '#e06666', '#032406', '#b5492f', '#7a5aa6', '#2a9d8f', '#8a8a3a'];

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #cfe0b8', borderRadius: 14,
  padding: '18px 20px', color: '#2d4a1e',
};
const titulo: React.CSSProperties = { margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#2d4a1e' };

const DashboardCharts = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/kardex/dashboard`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || d.message || 'No se pudo cargar');
        setAlertas(d.productosBajoStock ?? []);
        setDias(d.movimientosPorDia ?? []);
        setCats(d.valorPorCategoria ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ ...card, marginTop: 16, color: '#991b1b' }}>{error}</div>;

  // ---- barras de 7 días ----
  const W = 560, H = 220, PAD = 36;
  const datos = dias.map((d) => ({ dia: d.dia, e: Number(d.entradas), s: Number(d.salidas) }));
  const max = Math.max(1, ...datos.flatMap((d) => [d.e, d.s]));
  const grupo = (W - PAD) / Math.max(1, datos.length);
  const alto = (v: number) => ((H - PAD - 10) * v) / max;

  // ---- dona por categoría ----
  const catsNum = cats.map((c) => ({ nombre: c.categoria, valor: Number(c.valor) }));
  const totalCats = catsNum.reduce((a, c) => a + c.valor, 0);
  const R = 60, C = 2 * Math.PI * R;
  let acumulado = 0;

  return (
    <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
      {/* Alertas */}
      <div style={card}>
        <h3 style={titulo}>Alertas de bajo stock</h3>
        {alertas.length === 0 ? (
          <p style={{ margin: 0, color: '#166534' }}>✓ Todos los insumos están por encima de su stock mínimo.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {alertas.map((a) => {
              const saldo = Number(a.saldo_cantidad);
              const agotado = saldo <= 0;
              return (
                <div key={a.id_producto} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: agotado ? '#fee2e2' : '#fef2f2',
                  border: `1px solid ${agotado ? '#fca5a5' : '#fecaca'}`,
                }}>
                  <div>
                    <strong>{a.nombre}</strong>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{a.finca}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13 }}>
                    <strong>{saldo} {a.unidadmedida}</strong> de {Number(a.stock_minimo)} mínimo
                    <div style={{ fontSize: 11, fontWeight: 700, color: agotado ? '#991b1b' : '#b91c1c' }}>
                      {agotado ? 'AGOTADO' : 'BAJO STOCK'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Barras */}
        <div style={card}>
          <h3 style={titulo}>Entradas vs. salidas (últimos 7 días)</h3>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
            {[0, 0.5, 1].map((f) => (
              <g key={f}>
                <line x1={PAD} x2={W} y1={H - PAD - alto(max * f)} y2={H - PAD - alto(max * f)} stroke="#e5e7eb" />
                <text x={PAD - 4} y={H - PAD - alto(max * f) + 4} fontSize="10" textAnchor="end" fill="#6b7280">
                  {COMPACTO.format(max * f)}
                </text>
              </g>
            ))}
            {datos.map((d, i) => {
              const x = PAD + i * grupo;
              const bw = grupo * 0.32;
              return (
                <g key={d.dia}>
                  <rect x={x + grupo * 0.12} y={H - PAD - alto(d.e)} width={bw} height={alto(d.e)} rx="3" fill="#4a7c3f">
                    <title>Entradas: {COP.format(d.e)}</title>
                  </rect>
                  <rect x={x + grupo * 0.12 + bw + 3} y={H - PAD - alto(d.s)} width={bw} height={alto(d.s)} rx="3" fill="#e06666">
                    <title>Salidas: {COP.format(d.s)}</title>
                  </rect>
                  <text x={x + grupo / 2} y={H - PAD + 16} fontSize="10" textAnchor="middle" fill="#6b7280">
                    {d.dia.slice(8, 10)}/{d.dia.slice(5, 7)}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 4 }}>
            <span><span style={{ color: '#4a7c3f' }}>■</span> Entradas</span>
            <span><span style={{ color: '#e06666' }}>■</span> Salidas</span>
          </div>
        </div>

        {/* Dona */}
        <div style={card}>
          <h3 style={titulo}>Valor del inventario por categoría</h3>
          {totalCats === 0 ? (
            <p style={{ margin: 0, color: '#6b7280' }}>Aún no hay inventario valorizado.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <svg viewBox="0 0 160 160" style={{ width: 160, height: 160 }}>
                {catsNum.map((c, i) => {
                  const len = (c.valor / totalCats) * C;
                  const el = (
                    <circle key={c.nombre} cx="80" cy="80" r={R} fill="none"
                      stroke={COLORES[i % COLORES.length]} strokeWidth="24"
                      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acumulado}
                      transform="rotate(-90 80 80)">
                      <title>{c.nombre}: {COP.format(c.valor)}</title>
                    </circle>
                  );
                  acumulado += len;
                  return el;
                })}
                <text x="80" y="78" textAnchor="middle" fontSize="11" fill="#6b7280">Total</text>
                <text x="80" y="94" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2d4a1e">
                  {COMPACTO.format(totalCats)}
                </text>
              </svg>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                {catsNum.map((c, i) => (
                  <div key={c.nombre}>
                    <span style={{ color: COLORES[i % COLORES.length] }}>■</span> {c.nombre} — <strong>{COP.format(c.valor)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;