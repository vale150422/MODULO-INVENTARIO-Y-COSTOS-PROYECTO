import { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
const API = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/alertas`;

interface LoteAlerta {
  id_lote: number;
  producto: string;
  unidadmedida: string;
  finca: string;
  cantidad: number;
  costo_unitario: number;
  factura: string | null;
  fecha_vencimiento: string;
  dias_restantes: number;
}

interface Telefono {
  id_telefono: number;
  nombre: string;
  telefono: string;
  activo: boolean;
}


const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// +573001234567 → +57 300 123 4567
const fmtTel = (t: string) =>
  t.startsWith('+57') && t.length === 13
    ? `+57 ${t.slice(3, 6)} ${t.slice(6, 9)} ${t.slice(9)}`
    : t;

const estado = (d: number) => {
  if (d < 0)   return { texto: `Vencido hace ${Math.abs(d)} d`, clase: 'bg-red-900/40 text-red-400' };
  if (d === 0) return { texto: 'Vence hoy',                      clase: 'bg-red-900/40 text-red-400' };
  if (d <= 7)  return { texto: `${d} días`,                      clase: 'bg-orange-900/40 text-orange-400' };
  return           { texto: `${d} días`,                         clase: 'bg-yellow-900/40 text-yellow-500' };
};

type Aviso = { tipo: 'ok' | 'info' | 'error'; texto: string } | null;

export default function AlertasPage() {
  usePageTitle('Alertas');
  const { user } = useAuth();
  const esAdmin = user?.role === 'admin';

  // Alertas
  const [lotes, setLotes] = useState<LoteAlerta[]>([]);
  const [dias, setDias] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<Aviso>(null);

  // Números
  const [telefonos, setTelefonos] = useState<Telefono[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errTel, setErrTel] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/vencimientos?dias=${dias}`, { headers: headers() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setLotes(await res.json());
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const cargarTelefonos = async () => {
    try {
      const res = await fetch(`${API}/telefonos`, { headers: headers() });
      if (res.ok) setTelefonos(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [dias]);
  useEffect(() => { if (esAdmin) cargarTelefonos(); /* eslint-disable-next-line */ }, [esAdmin]);

  const agregarTelefono = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrTel('');
    setGuardando(true);
    try {
      const res = await fetch(`${API}/telefonos`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nombre, telefono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setNombre('');
      setTelefono('');
      cargarTelefonos();
    } catch (e: any) {
      setErrTel(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (t: Telefono) => {
    await fetch(`${API}/telefonos/${t.id_telefono}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ activo: !t.activo }),
    });
    cargarTelefonos();
  };

  const eliminar = async (t: Telefono) => {
    if (!window.confirm(`¿Eliminar a ${t.nombre} (${fmtTel(t.telefono)}) de las alertas?`)) return;
    await fetch(`${API}/telefonos/${t.id_telefono}`, { method: 'DELETE', headers: headers() });
    cargarTelefonos();
  };

  const enviarSMS = async () => {
    setEnviando(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/enviar-sms`, { method: 'POST', headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');

      if (data.total === 0) {
        setMsg({ tipo: 'info', texto: 'No hay insumos por vencer dentro del rango configurado. No se envió SMS.' });
      } else if (data.sinNumeros) {
        setMsg({ tipo: 'error', texto: 'Hay insumos por vencer, pero no tienes números activos. Agrega uno abajo.' });
      } else if (data.resultado?.simulado) {
        setMsg({ tipo: 'info', texto: 'Twilio no está configurado: el mensaje se mostró en la consola del backend (modo simulación).' });
      } else if (data.resultado?.errores?.length) {
        setMsg({ tipo: 'error', texto: `Enviado a ${data.resultado.enviados}. Fallaron: ${data.resultado.errores.join(' | ')}` });
      } else {
        setMsg({ tipo: 'ok', texto: `SMS enviado a ${data.resultado.enviados} número(s).` });
      }
    } catch (e: any) {
      setMsg({ tipo: 'error', texto: e.message });
    } finally {
      setEnviando(false);
    }
  };

  const vencidos = lotes.filter(l => l.dias_restantes < 0);
  const criticos = lotes.filter(l => l.dias_restantes >= 0 && l.dias_restantes <= 7);
  const proximos = lotes.filter(l => l.dias_restantes > 7);
  const valorRiesgo = lotes.reduce((a, l) => a + l.cantidad * l.costo_unitario, 0);
  const activos = telefonos.filter(t => t.activo).length;

  const kpis = [
    { label: 'Vencidos',                 value: vencidos.length, color: 'text-red-400' },
    { label: 'Vencen en ≤ 7 días',       value: criticos.length, color: 'text-orange-400' },
    { label: `Vencen en ≤ ${dias} días`, value: proximos.length, color: 'text-yellow-500' },
    { label: 'Valor en riesgo',          value: fmt(valorRiesgo), color: 'text-[#d4a843]' },
  ];

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">🔔 Alertas de Vencimiento</h1>
          <p className="text-sm text-[#8fae5a] mt-1">
            Lotes de insumos vencidos o próximos a vencer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dias}
            onChange={e => setDias(Number(e.target.value))}
            className="bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#4a7c3f]">
            <option value={7}>Próximos 7 días</option>
            <option value={15}>Próximos 15 días</option>
            <option value={30}>Próximos 30 días</option>
            <option value={60}>Próximos 60 días</option>
            <option value={90}>Próximos 90 días</option>
          </select>
          {esAdmin && (
            <button
              onClick={enviarSMS}
              disabled={enviando}
              className="px-4 py-2 bg-[#d4a843] text-[#2d4a1e] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {enviando ? 'Enviando...' : '📲 Enviar SMS ahora'}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
          msg.tipo === 'ok'    ? 'text-green-400 bg-green-900/20 border-green-900/40' :
          msg.tipo === 'error' ? 'text-red-400 bg-red-900/20 border-red-900/40' :
                                 'text-blue-400 bg-blue-900/20 border-blue-900/40'
        }`}>
          {msg.texto}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest mb-2">{k.label}</p>
            <p className={`text-2xl font-semibold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de lotes */}
      <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4 overflow-x-auto mb-6">
        <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4">Lotes en alerta</h2>

        {loading ? (
          <p className="text-center text-[#8fae5a] text-xs py-10 animate-pulse">Cargando alertas...</p>
        ) : error ? (
          <p className="text-center text-red-400 text-xs py-10">{error}</p>
        ) : lotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-white font-semibold">Sin alertas</p>
            <p className="text-sm text-[#8fae5a] mt-1">
              No hay insumos vencidos ni próximos a vencer en los próximos {dias} días
            </p>
          </div>
        ) : (
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[#264d35]">
                {['Producto', 'Finca', 'Factura / Detalle', 'Cantidad', 'Vence', 'Estado', 'Valor'].map(h => (
                  <th key={h}
                    className={`pb-2 px-2 text-[#8fae5a] uppercase text-[10px] tracking-wider
                      ${['Cantidad', 'Valor'].includes(h) ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lotes.map(l => {
                const e = estado(l.dias_restantes);
                return (
                  <tr key={l.id_lote} className="border-b border-[#1a2e2244] hover:bg-[#111c17]">
                    <td className="py-2 px-2 text-white font-semibold">{l.producto}</td>
                    <td className="py-2 px-2 text-[#8fae5a]">{l.finca}</td>
                    <td className="py-2 px-2 text-[#8fae5a]">{l.factura || '—'}</td>
                    <td className="py-2 px-2 text-right font-mono text-white">
                      {l.cantidad.toLocaleString('es-CO')} {l.unidadmedida}
                    </td>
                    <td className="py-2 px-2 font-mono text-[#c8d9a0]">
                      {new Date(l.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${e.clase}`}>
                        {e.texto}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[#d4a843] font-semibold">
                      {fmt(l.cantidad * l.costo_unitario)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Números para SMS — solo administrador */}
      {esAdmin && (
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-[#4a7c3f]">📱 Números para recibir alertas por SMS</h2>
            <span className="text-[10px] text-[#8fae5a]">{activos} activo(s)</span>
          </div>
          <p className="text-xs text-[#8fae5a] mb-4">
            Solo estos números reciben el SMS. No se toman de la lista de trabajadores.
          </p>

          <form onSubmit={agregarTelefono} className="flex gap-2 flex-wrap mb-3">
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre (ej: Administrador)"
              required
              className="flex-1 min-w-[160px] bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                         text-sm text-white outline-none focus:border-[#4a7c3f]"/>
            <input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Celular (ej: 300 123 4567)"
              required
              className="flex-1 min-w-[160px] bg-[#111c17] border border-[#264d35] rounded-lg px-3 py-2
                         text-sm text-white outline-none focus:border-[#4a7c3f] font-mono"/>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 bg-[#4a7c3f] text-white rounded-lg text-sm font-semibold
                         hover:bg-[#3d6b2e] transition-colors disabled:opacity-50">
              {guardando ? 'Guardando...' : '+ Agregar número'}
            </button>
          </form>

          {errTel && (
            <p className="text-red-400 text-xs mb-3 bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
              {errTel}
            </p>
          )}

          {telefonos.length === 0 ? (
            <p className="text-center text-[#8fae5a] text-xs py-6">
              Aún no has agregado números. Agrega al menos uno para poder enviar alertas.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#264d35]">
                  <th className="pb-2 px-2 text-left text-[#8fae5a] uppercase text-[10px] tracking-wider">Nombre</th>
                  <th className="pb-2 px-2 text-left text-[#8fae5a] uppercase text-[10px] tracking-wider">Celular</th>
                  <th className="pb-2 px-2 text-left text-[#8fae5a] uppercase text-[10px] tracking-wider">Estado</th>
                  <th className="pb-2 px-2 text-right text-[#8fae5a] uppercase text-[10px] tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {telefonos.map(t => (
                  <tr key={t.id_telefono}
                    className="border-b border-[#1a2e2244] hover:bg-[#111c17]"
                    style={{ opacity: t.activo ? 1 : 0.55 }}>
                    <td className="py-2 px-2 text-white font-semibold">{t.nombre}</td>
                    <td className="py-2 px-2 font-mono text-[#c8d9a0]">{fmtTel(t.telefono)}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.activo ? 'bg-green-900/60 text-green-400' : 'bg-red-900/40 text-red-400'
                      }`}>
                        {t.activo ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button onClick={() => cambiarEstado(t)}
                        className="text-[#d4a843] hover:underline mr-3">
                        {t.activo ? 'Pausar' : 'Activar'}
                      </button>
                      <button onClick={() => eliminar(t)}
                        className="text-red-400 hover:underline">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}