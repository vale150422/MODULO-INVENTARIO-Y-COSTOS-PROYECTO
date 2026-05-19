import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fakeUser = {
        id: 1, email,
        role: email.includes('admin') ? 'admin' : 'empleado'
      };
      localStorage.setItem('token', 'token-demo-123');
      localStorage.setItem('user', JSON.stringify(fakeUser));
      window.location.href = '/';
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div className="hidden md:flex w-1/2 bg-[#2d4a1e] flex-col items-center
                      justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{background:'radial-gradient(circle at 30% 50%, #6b8c3e 0%, transparent 60%)'}}/>
        <div className="text-center z-10">
          <img src="/logo.png" alt="Logo"
            className="w-44 h-44 object-contain mx-auto mb-4 rounded-full" />
          <h1 className="text-4xl font-bold text-[#f5f0e0] mb-3">INVENTARIO AGROGESTIÓN</h1>
          <p className="text-[#8fae5a] text-lg">Bienvenid@ al Sistema de Inventario</p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-center">
            {[
              { icon:'🌿', label:'Gestión de Fincas'   },
              { icon:'📊', label:'Control de Costos'   },
              { icon:'👥', label:'Gestión de Personal' },
              { icon:'📦', label:'Inventario Kardex'   },
            ].map(f => (
              <div key={f.label} className="bg-[#3d6b2e]/60 rounded-xl p-3">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs text-[#c8d9a0]">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f0e0] p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo"
              className="w-24 h-24 object-contain mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#2d4a1e]">
              Inicia sesión en Inventario
            </h2>
            <p className="text-sm text-[#6b8c3e] mt-1">Sistema de Inventario</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2d4a1e] uppercase
                                tracking-widest mb-2">Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico" required
                className="w-full bg-white border border-[#8fae5a] rounded-lg px-4 py-3
                           text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f]
                           transition-colors placeholder-[#b5c99a]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2d4a1e] uppercase
                                tracking-widest mb-2">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña" required
                className="w-full bg-white border border-[#8fae5a] rounded-lg px-4 py-3
                           text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f]
                           transition-colors placeholder-[#b5c99a]"/>
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#4a7c3f] text-white rounded-lg text-sm
                         font-semibold hover:bg-[#3d6b2e] transition-colors
                         disabled:opacity-50 mt-2">
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
            <button type="button"
              className="w-full py-2 text-sm text-[#6b8c3e] hover:text-[#4a7c3f]
                         transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </form>

          <p className="text-xs text-[#8fae5a] text-center mt-6">
            💡 Admin: usa email con "admin" · Empleado: cualquier otro email
          </p>
        </div>
      </div>

    </div>
  );
}