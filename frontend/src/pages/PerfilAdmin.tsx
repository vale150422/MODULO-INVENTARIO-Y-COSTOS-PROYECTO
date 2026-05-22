import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function PerfilAdmin() {
  const { user } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState<'ok' | 'error'>('ok');
  const [loading, setLoading] = useState(false);

  // Nombre editable
  const [nombreEdit, setNombreEdit] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre ?? user?.email?.split('@')[0] ?? '');
  const [nombreTemp, setNombreTemp] = useState(nombre);
  const [msgNombre, setMsgNombre] = useState('');

  const guardarNombre = async () => {
    if (!nombreTemp.trim()) return;
    try {
      const res = await fetch('http://localhost:3001/api/auth/actualizar-perfil', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ nombre: nombreTemp.trim() }),
      });
      if (res.ok) {
        setNombre(nombreTemp.trim());
        setMsgNombre('✓ Nombre actualizado');
        setTimeout(() => { setMsgNombre(''); setNombreEdit(false); }, 1500);
      } else {
        // Si el endpoint no existe aún, igual guardamos localmente
        setNombre(nombreTemp.trim());
        setNombreEdit(false);
      }
    } catch {
      // Guardamos localmente aunque falle el backend
      setNombre(nombreTemp.trim());
      setNombreEdit(false);
    }
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passNueva !== passConfirm) {
      setMsgTipo('error'); setMsg('Las contraseñas no coinciden'); return;
    }
    if (passNueva.length < 6) {
      setMsgTipo('error'); setMsg('Mínimo 6 caracteres'); return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/auth/cambiar-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actual: passActual, nueva: passNueva }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar');
      setMsgTipo('ok');
      setMsg('✓ Contraseña actualizada correctamente');
      setPassActual(''); setPassNueva(''); setPassConfirm('');
      setTimeout(() => { setMsg(''); setShowPass(false); }, 2500);
    } catch (err: any) {
      setMsgTipo('error');
      setMsg(err.message === 'Failed to fetch'
        ? 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-[#2d4a1e] rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 50%, #6b8c3e, transparent 60%)' }} />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#d4a843] flex-shrink-0 bg-[#f5f0e0]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <div>
            <p className="text-xs text-[#8fae5a] uppercase tracking-widest mb-1">
              Sistema de Inventario AgroGestión
            </p>
            <h1 className="text-2xl font-bold" style={{ color: '#f5f0e0' }}>
              Panel Administrador
            </h1>
            <p className="text-sm mt-1" style={{ color: '#c8d9a0' }}>
              Bienvenid@ al sistema de inventario
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Info personal */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4 uppercase tracking-widest">
            📋 Mi información
          </h2>
          <div className="space-y-3">

            {/* Nombre editable */}
            <div className="py-2 border-b border-[#264d35]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8fae5a] uppercase tracking-widest">Nombre</span>
                {!nombreEdit && (
                  <button onClick={() => { setNombreTemp(nombre); setNombreEdit(true); }}
                    className="text-[10px] px-2 py-1 bg-[#3d6b2e] text-[#c8d9a0] rounded hover:bg-[#4a7c3f] transition-colors">
                    ✏️ Editar
                  </button>
                )}
              </div>
              {nombreEdit ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={nombreTemp}
                    onChange={e => setNombreTemp(e.target.value)}
                    className="flex-1 bg-[#111c17] border border-[#4a7c3f] rounded-lg px-3 py-1.5
                               text-sm text-white outline-none"
                    placeholder="Tu nombre completo"
                    autoFocus
                  />
                  <button onClick={guardarNombre}
                    className="px-3 py-1.5 bg-[#4a7c3f] text-white rounded-lg text-xs font-semibold hover:bg-[#3d6b2e]">
                    ✓
                  </button>
                  <button onClick={() => setNombreEdit(false)}
                    className="px-3 py-1.5 bg-[#264d35] text-[#8fae5a] rounded-lg text-xs hover:bg-[#3d6b2e]">
                    ✕
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white font-medium mt-1">{nombre || '—'}</p>
              )}
              {msgNombre && <p className="text-xs text-green-400 mt-1">{msgNombre}</p>}
            </div>

            {/* Resto de campos */}
            {[
              { label: 'Correo', value: user?.email ?? '—' },
              { label: 'Rol',    value: 'Administrador' },
              { label: 'Estado', value: 'Activo' },
              { label: 'Acceso', value: 'Total — todos los módulos' },
            ].map(item => (
              <div key={item.label}
                className="flex items-center justify-between py-2 border-b border-[#264d35] last:border-0">
                <span className="text-xs text-[#8fae5a] uppercase tracking-widest">{item.label}</span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#4a7c3f] uppercase tracking-widest">
              🔒 Seguridad
            </h2>
            <button onClick={() => { setShowPass(!showPass); setMsg(''); }}
              className="text-xs px-3 py-1.5 bg-[#3d6b2e] text-[#c8d9a0] rounded-lg hover:bg-[#4a7c3f] transition-colors">
              {showPass ? 'Cancelar' : 'Cambiar contraseña'}
            </button>
          </div>

          {!showPass ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">🔐</div>
              <p className="text-sm text-[#8fae5a]">Tu contraseña está protegida</p>
              <p className="text-xs text-[#264d35] mt-1">
                Haz clic en "Cambiar contraseña" para actualizarla
              </p>
            </div>
          ) : (
            <form onSubmit={cambiarPassword} className="space-y-3">
              {[
                { label: 'Contraseña actual',    val: passActual,  set: setPassActual  },
                { label: 'Nueva contraseña',     val: passNueva,   set: setPassNueva   },
                { label: 'Confirmar contraseña', val: passConfirm, set: setPassConfirm },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs text-[#8fae5a] mb-1">{f.label}</label>
                  <input type="password" value={f.val}
                    onChange={e => f.set(e.target.value)} required
                    className="w-full bg-[#111c17] border border-[#264d35] rounded-lg
                               px-3 py-2 text-sm text-white outline-none focus:border-[#4a7c3f] transition-colors" />
                </div>
              ))}
              {msg && (
                <p className={`text-xs px-3 py-2 rounded-lg ${
                  msgTipo === 'ok'
                    ? 'text-green-400 bg-green-900/20 border border-green-900/40'
                    : 'text-red-400 bg-red-900/20 border border-red-900/40'
                }`}>{msg}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2 bg-[#4a7c3f] text-white rounded-lg text-sm font-semibold
                           hover:bg-[#3d6b2e] transition-colors disabled:opacity-50">
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>

        {/* Módulos del sistema */}
        <div className="col-span-2 bg-[#1a2e22] border border-[#264d35] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4 uppercase tracking-widest">
            ⚡ Módulos del sistema
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: '📊', label: 'Dashboard',   sub: 'Resumen general',     to: '/'             },
              { icon: '🌿', label: 'Fincas',       sub: 'Gestión de fincas',   to: '/fincas'       },
              { icon: '👥', label: 'Trabajadores', sub: 'Personal registrado', to: '/trabajadores' },
              { icon: '📦', label: 'Kardex PEPS',  sub: 'Inventario insumos',  to: '/kardex'       },
              { icon: '🛒', label: 'Productos',    sub: 'Insumos agrícolas',   to: '/productos'    },
              { icon: '🤝', label: 'Proveedores',  sub: 'Gestión proveedores', to: '/proveedores'  },
              { icon: '📈', label: 'Reportes',     sub: 'Informes y gráficas', to: '/reportes'     },
              { icon: '🏷️', label: 'Categorías',   sub: 'Tipos de productos',  to: '/categorias'   },
            ].map(item => (
              <a key={item.label} href={item.to}
                className="flex items-center gap-3 p-3 bg-[#111c17] border border-[#264d35]
                           rounded-xl hover:border-[#4a7c3f] hover:bg-[#162a1e] transition-all cursor-pointer group">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-[#c8d9a0]">{item.label}</p>
                  <p className="text-[10px] text-[#8fae5a]">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}