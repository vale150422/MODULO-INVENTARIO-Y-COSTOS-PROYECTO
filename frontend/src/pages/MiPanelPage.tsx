import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function MiPanelPage() {
  const { user } = useAuth();
  const [showCambiarPass, setShowCambiarPass] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [msgPass, setMsgPass] = useState('');

  const cambiarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passNueva !== passConfirm) {
      setMsgPass('Las contraseñas no coinciden');
      return;
    }
    if (passNueva.length < 6) {
      setMsgPass('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    // Aquí conectarás con el backend
    setMsgPass('✓ Contraseña actualizada correctamente');
    setPassActual(''); setPassNueva(''); setPassConfirm('');
    setTimeout(() => { setMsgPass(''); setShowCambiarPass(false); }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header con logo */}
      <div className="bg-[#2d4a1e] rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{background:'radial-gradient(circle at 80% 50%, #6b8c3e, transparent 60%)'}}/>
        <div className="flex items-center gap-6 z-10 relative">
          <img src="/logo.png" alt="Logo"
            className="w-20 h-20 object-contain rounded-full
                       border-2 border-[#d4a843] flex-shrink-0"/>
          <div>
            <p className="text-xs text-[#8fae5a] uppercase tracking-widest mb-1">
              Sistema de Inventario AgroGestión
            </p>
            <h1 className="text-2xl font-bold text-white">
              ¡Bienvenido, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-[#c8d9a0] text-sm mt-1">
              Panel de Empleado · Módulo de Inventario
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
            {[
              { label:'Correo',     value: user?.email ?? '—'      },
              { label:'Rol',        value: 'Empleado'               },
              { label:'Estado',     value: 'Activo'                 },
              { label:'Módulo',     value: 'Inventario / Kardex'    },
            ].map(item => (
              <div key={item.label}
                className="flex items-center justify-between py-2
                           border-b border-[#264d35] last:border-0">
                <span className="text-xs text-[#8fae5a] uppercase tracking-widest">
                  {item.label}
                </span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-[#1a2e22] border border-[#264d35] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#4a7c3f] uppercase tracking-widest">
              🔒 Seguridad
            </h2>
            <button onClick={() => setShowCambiarPass(!showCambiarPass)}
              className="text-xs px-3 py-1.5 bg-[#3d6b2e] text-[#c8d9a0]
                         rounded-lg hover:bg-[#4a7c3f] transition-colors">
              {showCambiarPass ? 'Cancelar' : 'Cambiar contraseña'}
            </button>
          </div>

          {!showCambiarPass ? (
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
                { label:'Contraseña actual',   val:passActual,  set:setPassActual  },
                { label:'Nueva contraseña',    val:passNueva,   set:setPassNueva   },
                { label:'Confirmar contraseña',val:passConfirm, set:setPassConfirm },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs text-[#8fae5a] mb-1">{f.label}</label>
                  <input type="password" value={f.val}
                    onChange={e => f.set(e.target.value)} required
                    className="w-full bg-[#111c17] border border-[#264d35] rounded-lg
                               px-3 py-2 text-sm text-white outline-none
                               focus:border-[#4a7c3f] transition-colors"/>
                </div>
              ))}
              {msgPass && (
                <p className={`text-xs ${msgPass.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {msgPass}
                </p>
              )}
              <button type="submit"
                className="w-full py-2 bg-[#4a7c3f] text-white rounded-lg
                           text-sm font-semibold hover:bg-[#3d6b2e] transition-colors">
                Actualizar contraseña
              </button>
            </form>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="col-span-2 bg-[#1a2e22] border border-[#264d35] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#4a7c3f] mb-4 uppercase tracking-widest">
            ⚡ Accesos rápidos
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon:'📦', label:'Kardex PEPS',     sub:'Registrar movimientos',  to:'/kardex'          },
              { icon:'🌿', label:'Mis Fincas',       sub:'Ver fincas asignadas',   to:'/fincas'          },
              { icon:'📊', label:'Reporte Kardex',   sub:'Imprimir inventario',    to:'/reporte-kardex'  },
            ].map(item => (
              <a key={item.label} href={item.to}
                className="flex items-center gap-3 p-4 bg-[#111c17] border border-[#264d35]
                           rounded-xl hover:border-[#4a7c3f] hover:bg-[#162a1e] transition-all
                           cursor-pointer group">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[#c8d9a0]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#8fae5a]">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}