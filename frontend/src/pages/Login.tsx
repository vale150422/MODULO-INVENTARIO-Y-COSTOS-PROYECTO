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

      {/* ===== PANEL IZQUIERDO ===== */}
      <div className="hidden md:flex w-1/2 flex-col items-center
                      justify-center p-10 relative overflow-hidden"
        style={{background:'linear-gradient(160deg, #1a3a0f 0%, #2d4a1e 40%, #1e3d12 100%)'}}>

        {/* Hojas SVG de fondo */}
        <svg className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
          <g opacity="0.18" fill="#d8e7d1">
            <path d="M-40 -20 Q60 80 20 200 Q-20 140 -40 -20Z"/>
            <path d="M-10 -30 Q90 70 50 190 Q10 130 -10 -30Z"/>
            <path d="M30 -40 Q120 60 80 180 Q40 120 30 -40Z"/>
            <path d="M-60 60 Q20 140 0 240 Q-40 190 -60 60Z"/>
          </g>
          <g opacity="0.16" fill="#d8e7d1" transform="translate(500, 0) scale(-1,1)">
            <path d="M-40 -20 Q60 80 20 200 Q-20 140 -40 -20Z"/>
            <path d="M-10 -30 Q90 70 50 190 Q10 130 -10 -30Z"/>
            <path d="M30 -10 Q110 80 70 190 Q30 140 30 -10Z"/>
          </g>
          <g opacity="0.14" fill="#d8e7d1">
            <path d="M-30 280 Q70 350 40 460 Q0 400 -30 280Z"/>
            <path d="M-50 320 Q40 390 15 490 Q-25 440 -50 320Z"/>
            <path d="M-10 350 Q80 410 55 510 Q15 460 -10 350Z"/>
          </g>
          <g opacity="0.14" fill="#d8e7d1" transform="translate(500, 300) scale(-1,1)">
            <path d="M-30 0 Q70 70 40 180 Q0 120 -30 0Z"/>
            <path d="M-50 40 Q40 110 15 210 Q-25 160 -50 40Z"/>
          </g>
          <g opacity="0.16" fill="#d8e7d1">
            <path d="M-40 600 Q60 670 30 780 Q-10 720 -40 600Z"/>
            <path d="M-20 640 Q80 700 50 800 Q10 750 -20 640Z"/>
            <path d="M20 620 Q110 690 80 790 Q40 740 20 620Z"/>
          </g>
          <g opacity="0.15" fill="#d8e7d1" transform="translate(500, 600) scale(-1,1)">
            <path d="M-40 0 Q60 70 30 180 Q-10 120 -40 0Z"/>
            <path d="M-20 40 Q80 100 50 200 Q10 150 -20 40Z"/>
            <path d="M10 20 Q100 90 70 190 Q30 140 10 20Z"/>
          </g>
          <g opacity="0.1" stroke="#d8e7d1" strokeWidth="1" fill="none">
            <path d="M-20 0 Q40 80 20 180"/>
            <path d="M480 0 Q420 80 440 180"/>
            <path d="M-30 620 Q30 700 10 780"/>
            <path d="M490 620 Q430 700 450 780"/>
          </g>
        </svg>

        {/* Overlay */}
        <div className="absolute inset-0"
          style={{background:'radial-gradient(ellipse at center, rgba(45,74,30,0.3) 0%, rgba(15,30,8,0.6) 100%)'}}/>

        {/* Contenido */}
        <div className="text-center z-10 relative">

          {/* Logo doble borde dorado */}
          <div className="mx-auto mb-6 rounded-full overflow-hidden"
            style={{
              width:'200px', height:'200px',
              border:'4px solid #d4a843',
              boxShadow:'0 0 0 3px #2d4a1e, 0 0 0 7px #d4a843, 0 8px 32px rgba(0,0,0,0.5)',
              background:'#f5f0e0',
            }}>
            <img src="/logo.png" alt="Logo"
              className="w-full h-full object-cover"/>
          </div>

          {/* Título dorado */}
          <h1 className="font-bold mb-3 uppercase"
            style={{
              color:'#d4a843',
              fontSize:'2.4rem',
              textShadow:'0 2px 8px rgba(0,0,0,0.5)',
              fontFamily:'Georgia, serif',
              lineHeight:1.2,
              letterSpacing:'0.05em',
            }}>
            INVENTARIO<br/>AGROGESTIÓN
          </h1>

          {/* Subtítulo cursiva */}
          <p style={{
            color:'#c8d9a0',
            fontSize:'1rem',
            fontStyle:'italic',
            fontFamily:'Georgia, serif',
            textShadow:'0 1px 4px rgba(0,0,0,0.4)',
            maxWidth:'300px',
            lineHeight:1.6,
          }}>
            Bienvenid@ al Sistema de Inventario<br/>
            
          </p>

          {/* Línea decorativa dorada */}
          <div className="flex items-center gap-3 mt-5 justify-center">
            <div style={{height:'1px', width:'60px',
              background:'linear-gradient(to right, transparent, #d4a843)'}}/>
            <div style={{width:'6px', height:'6px',
              borderRadius:'50%', background:'#d4a843'}}/>
            <div style={{height:'1px', width:'60px',
              background:'linear-gradient(to left, transparent, #d4a843)'}}/>
          </div>
        </div>
      </div>

      {/* ===== PANEL DERECHO — glassmorphism ===== */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
        style={{background:'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 35%, #e0f2f1 65%, #e8f5e9 100%)'}}>

        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position:'absolute', top:'-60px', right:'-60px',
            width:'300px', height:'300px', borderRadius:'50%',
            background:'rgba(56,142,60,0.2)', filter:'blur(50px)',
          }}/>
          <div style={{
            position:'absolute', bottom:'0px', left:'-40px',
            width:'220px', height:'220px', borderRadius:'50%',
            background:'rgba(104,159,56,0.18)', filter:'blur(40px)',
          }}/>
          <div style={{
            position:'absolute', top:'40%', left:'55%',
            width:'160px', height:'160px', borderRadius:'50%',
            background:'rgba(129,199,132,0.22)', filter:'blur(36px)',
          }}/>
        </div>

        {/* Tarjeta vidrio */}
        <div className="w-full max-w-sm relative z-10" style={{
          background:'rgba(255,255,255,0.58)',
          backdropFilter:'blur(22px) saturate(160%)',
          WebkitBackdropFilter:'blur(22px) saturate(160%)',
          borderRadius:'24px',
          border:'1px solid rgba(255,255,255,0.88)',
          boxShadow:'0 8px 32px rgba(46,125,50,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          padding:'2rem',
        }}>

          {/* Logo pequeño */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 rounded-full overflow-hidden"
              style={{
                width:'72px', height:'72px',
                border:'2px solid #d4a843',
                boxShadow:'0 0 0 2px #4a7c3f',
                background:'#f5f0e0',
              }}>
              <img src="/logo.png" alt="Logo"
                className="w-full h-full object-cover"/>
            </div>
            <h2 className="text-2xl font-bold" style={{color:'#2d4a1e'}}>
              {vista === 'login' ? 'Iniciar sesión' : 'Registro de empleado'}
            </h2>
            <p className="text-sm mt-1" style={{color:'#6b8c3e'}}>
              Inventario Agrogestión
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 mb-6"
            style={{background:'rgba(46,125,50,0.1)', borderRadius:'12px'}}>
            {(['login','registro'] as Vista[]).map(v => (
              <button key={v}
                onClick={() => { setVista(v); setError(''); setRegError(''); }}
                className="flex-1 py-2 text-sm transition-all"
                style={{
                  borderRadius:'9px', border:'none', cursor:'pointer',
                  background: vista === v ? '#2d4a1e' : 'transparent',
                  color: vista === v ? '#ffffff' : '#2d4a1e',
                  boxShadow: vista === v ? '0 2px 8px rgba(45,74,30,0.35)' : 'none',
                  fontWeight:600,
                }}>
                {v === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {vista === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase
                                  tracking-widest mb-2" style={{color:'#2d4a1e'}}>
                  Correo electrónico
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ingrese su correo" required
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none
                             transition-colors placeholder-[#b5c99a]"
                  style={{
                    background:'rgba(255,255,255,0.75)',
                    border:'1px solid rgba(143,174,90,0.45)',
                    color:'#2d4a1e',
                  }}/>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase
                                  tracking-widest mb-2" style={{color:'#2d4a1e'}}>
                  Contraseña
                </label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña" required
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none
                             transition-colors placeholder-[#b5c99a]"
                  style={{
                    background:'rgba(255,255,255,0.75)',
                    border:'1px solid rgba(143,174,90,0.45)',
                    color:'#2d4a1e',
                  }}/>
              </div>
              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200
                              rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-lg text-sm font-semibold
                           disabled:opacity-50"
                style={{
                  background:'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)',
                  boxShadow:'0 4px 14px rgba(45,74,30,0.35)',
                  border:'none', cursor:'pointer',
                }}>
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
              <button type="button"
                className="w-full py-2 text-sm hover:opacity-80"
                style={{background:'none', border:'none',
                  cursor:'pointer', color:'#6b8c3e'}}>
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* REGISTRO */}
          {vista === 'registro' && (
            <form onSubmit={handleRegistro} className="space-y-4">
              {regExito ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="font-semibold" style={{color:'#2d4a1e'}}>
                    ¡Registro exitoso!
                  </p>
                  <p className="text-sm mt-1" style={{color:'#6b8c3e'}}>
                    Redirigiendo al login...
                  </p>
                </div>
              ) : (
                <>
                  {[
                    { label:'Nombre completo',     type:'text',     val:regNombre,   set:setRegNombre,   ph:'Tu nombre completo'    },
                    { label:'Correo electrónico',  type:'email',    val:regEmail,    set:setRegEmail,    ph:'Tu correo electrónico'  },
                    { label:'Contraseña',          type:'password', val:regPassword, set:setRegPassword, ph:'Mínimo 6 caracteres'   },
                    { label:'Confirmar contraseña',type:'password', val:regConfirm,  set:setRegConfirm,  ph:'Repite tu contraseña'  },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold uppercase
                                        tracking-widest mb-2" style={{color:'#2d4a1e'}}>
                        {f.label}
                      </label>
                      <input type={f.type} value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.ph} required
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none
                                   transition-colors placeholder-[#b5c99a]"
                        style={{
                          background:'rgba(255,255,255,0.75)',
                          border:'1px solid rgba(143,174,90,0.45)',
                          color:'#2d4a1e',
                        }}/>
                    </div>
                  ))}
                  {regError && (
                    <p className="text-red-600 text-xs bg-red-50 border border-red-200
                                  rounded-lg px-3 py-2">{regError}</p>
                  )}
                  <button type="submit" disabled={regLoading}
                    className="w-full py-3 text-white rounded-lg text-sm font-semibold
                               disabled:opacity-50"
                    style={{
                      background:'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)',
                      boxShadow:'0 4px 14px rgba(45,74,30,0.35)',
                      border:'none', cursor:'pointer',
                    }}>
                    {regLoading ? 'Registrando...' : 'Crear cuenta'}
                  </button>
                  <p className="text-xs text-center" style={{color:'#8fae5a'}}>
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