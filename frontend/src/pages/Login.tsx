
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

type Vista = 'login' | 'registro';

export default function Login() {
  const { login } = useAuth();
  const [vista, setVista] = useState<Vista>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regExito, setRegExito] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirm) {
      setRegError('Las contraseñas no coinciden');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          password: regPassword,
          rol: 'empleado'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      setRegExito(true);
      setTimeout(() => {
        setRegExito(false);
        setVista('login');
        setRegNombre(''); setRegEmail('');
        setRegPassword(''); setRegConfirm('');
      }, 2500);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      
      {/* Panel izquierdo */}
<div className="hidden md:flex w-1/2 bg-[#2d4a1e] flex-col items-center
                justify-center p-10 relative overflow-hidden">

  {/* Gradiente base */}
  <div className="absolute inset-0 opacity-20"
    style={{ background: 'radial-gradient(circle at 30% 50%, #6b8c3e 0%, transparent 60%)' }} />

  {/* Hojas decorativas SVG */}
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">

    {/* Hoja grande esquina superior izquierda */}
    <g opacity="0.13" fill="#a8d97f">
      <path d="M-30 20 Q40 80 20 160 Q-10 120 -30 20Z" transform="rotate(-20 0 80)"/>
      <path d="M-20 10 Q60 90 30 180 Q-5 130 -20 10Z" transform="rotate(-10 10 90)"/>
      <path d="M10 -10 Q80 60 60 150 Q20 110 10 -10Z" transform="rotate(5 40 70)"/>
    </g>

    {/* Rama con hojas esquina superior derecha */}
    <g opacity="0.12" fill="#8fba5a" transform="translate(420, -10) rotate(30)">
      <path d="M0 0 Q-50 60 -20 130 Q10 90 0 0Z"/>
      <path d="M0 0 Q30 70 10 140 Q-20 100 0 0Z"/>
      <path d="M5 20 Q-40 80 -15 150 Q15 110 5 20Z"/>
      <line x1="0" y1="0" x2="-5" y2="150" stroke="#8fba5a" strokeWidth="1.5" opacity="0.4"/>
    </g>

    {/* Hoja mediana izquierda centro */}
    <g opacity="0.1" fill="#b5d47a" transform="translate(-20, 320) rotate(-35)">
      <path d="M0 0 Q60 50 40 120 Q0 80 0 0Z"/>
      <path d="M0 0 Q-30 55 -10 120 Q20 85 0 0Z"/>
      <line x1="0" y1="0" x2="15" y2="115" stroke="#b5d47a" strokeWidth="1" opacity="0.35"/>
    </g>

    {/* Hojas pequeñas dispersas */}
    <g opacity="0.09" fill="#c8e096">
      <path d="M380 200 Q420 240 400 290 Q370 260 380 200Z" transform="rotate(15 400 245)"/>
      <path d="M60 500 Q100 530 85 575 Q58 555 60 500Z" transform="rotate(-25 80 537)"/>
      <path d="M440 480 Q470 510 455 550 Q432 532 440 480Z" transform="rotate(40 455 515)"/>
      <path d="M150 680 Q185 705 172 745 Q148 728 150 680Z" transform="rotate(-10 165 712)"/>
      <path d="M350 700 Q380 725 368 762 Q345 745 350 700Z" transform="rotate(20 365 730)"/>
    </g>

    {/* Rama inferior derecha */}
    <g opacity="0.11" fill="#8fba5a" transform="translate(460, 680) rotate(-140)">
      <path d="M0 0 Q-45 55 -18 120 Q12 85 0 0Z"/>
      <path d="M0 0 Q25 60 8 125 Q-18 92 0 0Z"/>
      <line x1="0" y1="0" x2="-5" y2="120" stroke="#8fba5a" strokeWidth="1.5" opacity="0.35"/>
    </g>

    {/* Hoja grande esquina inferior izquierda */}
    <g opacity="0.1" fill="#a8d97f" transform="translate(-10, 700) rotate(20)">
      <path d="M0 0 Q70 60 50 140 Q5 100 0 0Z"/>
      <path d="M0 0 Q-35 65 -12 140 Q25 105 0 0Z"/>
    </g>

    {/* Puntitos/semillas flotantes */}
    <g opacity="0.15" fill="#c8e096">
      <circle cx="390" cy="150" r="2"/>
      <circle cx="410" cy="170" r="1.5"/>
      <circle cx="375" cy="175" r="1"/>
      <circle cx="80" cy="420" r="2"/>
      <circle cx="95" cy="440" r="1.5"/>
      <circle cx="460" cy="380" r="2"/>
      <circle cx="475" cy="395" r="1.5"/>
      <circle cx="200" cy="750" r="2"/>
      <circle cx="215" cy="765" r="1.5"/>
    </g>
  </svg>

  {/* Contenido */}
  <div className="text-center z-10 relative">
    <img src="/logo.png" alt="Logo"
      className="w-44 h-44 object-contain mx-auto mb-4 rounded-full" />
    <h1 className="text-4xl font-bold text-[#f5f0e0] mb-3">
      INVENTARIO AGROGESTIÓN
    </h1>
    <p className="text-[#8fae5a] text-lg">Bienvenid@ al Sistema de Inventario</p>
  </div>
</div>

      {/* Panel derecho — glassmorphism */}
      <div
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 35%, #e0f2f1 65%, #e8f5e9 100%)',
        }}
      >
        {/* Blobs desenfocados */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'rgba(56,142,60,0.2)', filter: 'blur(50px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '0px', left: '-40px',
            width: '220px', height: '220px', borderRadius: '50%',
            background: 'rgba(104,159,56,0.18)', filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '55%',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'rgba(129,199,132,0.22)', filter: 'blur(36px)',
          }} />
        </div>

        {/* Tarjeta de vidrio */}
        <div
          className="w-full max-w-sm relative z-10"
          style={{
            background: 'rgba(255,255,255,0.58)',
            backdropFilter: 'blur(22px) saturate(160%)',
            WebkitBackdropFilter: 'blur(22px) saturate(160%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.88)',
            boxShadow: '0 8px 32px rgba(46,125,50,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
            padding: '2rem',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Logo"
              className="w-20 h-20 object-contain mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-[#2d4a1e]">
              {vista === 'login' ? 'Iniciar sesión' : 'Registro de empleado'}
            </h2>
            <p className="text-sm text-[#6b8c3e] mt-1">Sistema de Inventario AgroGestión</p>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 mb-6"
            style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '12px' }}
          >
            <button
              onClick={() => { setVista('login'); setError(''); }}
              className="flex-1 py-2 text-sm transition-all"
              style={{
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                background: vista === 'login' ? '#2d4a1e' : 'transparent',
                color: vista === 'login' ? '#ffffff' : '#2d4a1e',
                boxShadow: vista === 'login' ? '0 2px 8px rgba(45,74,30,0.35)' : 'none',
                fontWeight: 600,
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setVista('registro'); setRegError(''); }}
              className="flex-1 py-2 text-sm transition-all"
              style={{
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                background: vista === 'registro' ? '#2d4a1e' : 'transparent',
                color: vista === 'registro' ? '#ffffff' : '#2d4a1e',
                boxShadow: vista === 'registro' ? '0 2px 8px rgba(45,74,30,0.35)' : 'none',
                fontWeight: 600,
              }}
            >
              Registrarse
            </button>
          </div>

          {/* FORMULARIO LOGIN */}
          {vista === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                  Correo electrónico
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ingrese su correo" required
                  className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                  style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                  Contraseña
                </label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña" required
                  className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                  style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)',
                  boxShadow: '0 4px 14px rgba(45,74,30,0.35)',
                  border: 'none',
                }}
              >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
              <button type="button"
                className="w-full py-2 text-sm text-[#6b8c3e] hover:text-[#4a7c3f] transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* FORMULARIO REGISTRO */}
          {vista === 'registro' && (
            <form onSubmit={handleRegistro} className="space-y-4">
              {regExito ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-[#2d4a1e] font-semibold">¡Registro exitoso!</p>
                  <p className="text-sm text-[#6b8c3e] mt-1">Redirigiendo al login...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                      Nombre completo
                    </label>
                    <input type="text" value={regNombre}
                      onChange={e => setRegNombre(e.target.value)}
                      placeholder="Tu nombre completo" required
                      className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                      Correo electrónico
                    </label>
                    <input type="email" value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="Tu correo electrónico" required
                      className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                      Contraseña
                    </label>
                    <input type="password" value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres" required
                      className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2d4a1e] uppercase tracking-widest mb-2">
                      Confirmar contraseña
                    </label>
                    <input type="password" value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                      placeholder="Repite tu contraseña" required
                      className="w-full border rounded-lg px-4 py-3 text-sm text-[#2d4a1e] outline-none focus:border-[#4a7c3f] transition-colors placeholder-[#b5c99a]"
                      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(143,174,90,0.45)' }}
                    />
                  </div>
                  {regError && (
                    <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{regError}</p>
                  )}
                  <button type="submit" disabled={regLoading}
                    className="w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)',
                      boxShadow: '0 4px 14px rgba(45,74,30,0.35)',
                      border: 'none',
                    }}
                  >
                    {regLoading ? 'Registrando...' : 'Crear cuenta'}
                  </button>
                  <p className="text-xs text-[#8fae5a] text-center">
                    Al registrarte entras como <strong>Empleado</strong>.
                    El administrador gestiona los roles.
                  </p>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
