import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import ModalAyuda from '../components/ModalAyuda';

export default function MiPanelPage() {
  usePageTitle('Mi panel');
  
  
  const { user } = useAuth();
  const [showCambiarPass, setShowCambiarPass] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [msgPass, setMsgPass] = useState('');
  const [msgTipo, setMsgTipo] = useState<'ok' | 'error'>('ok');
  const [loading, setLoading] = useState(false);

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passNueva !== passConfirm) { setMsgTipo('error'); setMsgPass('Las contraseñas no coinciden'); return; }
    if (passNueva.length < 6) { setMsgTipo('error'); setMsgPass('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/cambiar-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ actual: passActual, nueva: passNueva }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar');
      setMsgTipo('ok'); setMsgPass('✓ Contraseña actualizada correctamente');
      setPassActual(''); setPassNueva(''); setPassConfirm('');
      setTimeout(() => { setMsgPass(''); setShowCambiarPass(false); }, 2500);
    } catch (err: any) {
      setMsgTipo('error');
      setMsgPass(err.message === 'Failed to fetch' ? 'No se pudo conectar al servidor.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3d10 0%, #2d4a1e 50%, #1a3a0e 100%)' }}>
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 80% 50%, rgba(107,140,62,0.25), transparent 60%)' }} />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
            <g opacity="0.12" fill="#a8d97f">
              <path d="M750 -10 Q800 40 780 100 Q750 60 750 -10Z" />
              <path d="M760 -5 Q820 50 795 115 Q762 72 760 -5Z" />
            </g>
            <g opacity="0.1" fill="#8fba5a" transform="translate(680, 80) rotate(20)">
              <path d="M0 0 Q50 40 35 100 Q5 65 0 0Z" />
              <path d="M0 0 Q-30 45 -10 100 Q18 70 0 0Z" />
            </g>
            <g opacity="0.08" fill="#c8e096">
              <path d="M20 180 Q60 140 80 80 Q40 110 20 180Z" transform="rotate(10 50 130)" />
              <path d="M-10 160 Q30 120 55 60 Q20 90 -10 160Z" transform="rotate(5 25 110)" />
            </g>
            <g opacity="0.1" fill="#a8d97f" transform="translate(600, -20) rotate(-15)">
              <path d="M0 0 Q40 50 25 110 Q0 75 0 0Z" />
            </g>
            <g opacity="0.15" fill="#c8e096">
              <circle cx="720" cy="30" r="2" /><circle cx="740" cy="50" r="1.5" />
              <circle cx="700" cy="55" r="1" /><circle cx="50" cy="150" r="2" />
              <circle cx="70" cy="165" r="1.5" />
            </g>
          </svg>
          <div className="flex items-center gap-6 relative z-10">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #d4a843', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', background: '#2d4a1e', position: 'relative' }}>
              <img src="/logo.png" alt="Logo" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.3)', width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#8fae5a' }}>Sistema de Inventario AgroGestión</p>
              <h1 className="text-2xl font-bold" style={{ color: '#f5f0e0' }}>¡Bienvenid@, {user?.email?.split('@')[0]}!</h1>
              <p className="text-sm mt-1" style={{ color: '#c8d9a0' }}>Panel de Empleado · Módulo de Inventario</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Info personal */}
          <div className="bg-white border border-[#e0ead0] rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#2d4a1e] mb-4 uppercase tracking-widest flex items-center gap-2">
              <span>📋</span> Mi información
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Correo',  value: user?.email ?? '—'   },
                { label: 'Rol',     value: 'Empleado'            },
                { label: 'Estado',  value: 'Activo'              },
                { label: 'Módulo',  value: 'Inventario / Kardex' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#e8f0d8] last:border-0">
                  <span className="text-xs text-[#6b8c3e] uppercase tracking-widest font-semibold">{item.label}</span>
                  <span className="text-sm font-medium" style={{ color: '#1a3a0e' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-white border border-[#e0ead0] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#2d4a1e] uppercase tracking-widest flex items-center gap-2">
                <span>🔒</span> Seguridad
              </h2>
              <button onClick={() => { setShowCambiarPass(!showCambiarPass); setMsgPass(''); }}
                style={{ background: showCambiarPass ? '#6b7280' : '#2d4a1e', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {showCambiarPass ? 'Cancelar' : 'Cambiar contraseña'}
              </button>
            </div>
            {!showCambiarPass ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-sm font-semibold" style={{ color: '#2d4a1e' }}>Tu contraseña está protegida</p>
                <p className="text-xs mt-1" style={{ color: '#6b8c3e' }}>Haz clic en "Cambiar contraseña" para actualizarla</p>
              </div>
            ) : (
              <form onSubmit={cambiarPassword} className="space-y-3">
                {[
                  { label: 'Contraseña actual', val: passActual, set: setPassActual },
                  { label: 'Nueva contraseña', val: passNueva, set: setPassNueva },
                  { label: 'Confirmar contraseña', val: passConfirm, set: setPassConfirm },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b8c3e' }}>{f.label}</label>
                    <input type="password" value={f.val} onChange={e => f.set(e.target.value)} required
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ border: '1px solid #c8d9a0', color: '#2d4a1e', background: '#fafff5' }} />
                  </div>
                ))}
                {msgPass && <p className={`text-xs px-3 py-2 rounded-lg ${msgTipo === 'ok' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>{msgPass}</p>}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="col-span-2 bg-white border border-[#e0ead0] rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#2d4a1e] mb-4 uppercase tracking-widest flex items-center gap-2">
              <span>⚡</span> Accesos rápidos
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '📦', label: 'Kardex PEPS',   sub: 'Registrar movimientos', to: '/kardex'         },
                { icon: '🌿', label: 'Mis Fincas',     sub: 'Ver fincas asignadas',  to: '/fincas'         },
                { icon: '📊', label: 'Reporte Kardex', sub: 'Imprimir inventario',   to: '/reporte-kardex' },
              ].map(item => (
                <a key={item.label} href={item.to}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer"
                  style={{ background: '#f5faf0', border: '1px solid #d4e8b8', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f5d8'; (e.currentTarget as HTMLElement).style.borderColor = '#4a7c3f'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f5faf0'; (e.currentTarget as HTMLElement).style.borderColor = '#d4e8b8'; }}>
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#2d4a1e' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#6b8c3e' }}>{item.sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de ayuda — UNA sola vez, fuera de todo contenedor */}
      <ModalAyuda rol="empleado" />
    </>
  );
}