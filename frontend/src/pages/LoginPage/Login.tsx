import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const getEmailError = (email: string): string => {
  if (!email.includes('@') && !email.includes('.')) {
    return 'El correo debe contener @ y un punto (ej: usuario@correo.com)';
  }
  if (!email.includes('@')) {
    return 'Le falta el @ (ej: usuario@correo.com)';
  }
  if (!email.includes('.')) {
    return 'Le falta el punto (ej: .com, .co)';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Formato inválido (ej: usuario@correo.com)';
  }
  return '';
};

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val ? getEmailError(val) : '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = getEmailError(email);
    if (err) {
      setEmailError(err);
      return;
    }
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

  return (
    <div className="login-wrapper">

      {/* ===== PANEL IZQUIERDO ===== */}
      <div className="login-left">
        <svg className="login-left__svg"
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

        <div className="login-left__overlay" />

        <div className="login-left__content">
          <div className="login-left__logo">
            <img src="/logo.png" alt="Logo" />
          </div>
          <h1 className="login-left__title">
            INVENTARIO<br/>AGROGESTIÓN
          </h1>
          <p className="login-left__subtitle">
            Bienvenid@ al Sistema de Inventario<br/>
          </p>
          <div className="login-left__divider">
            <div className="login-left__divider-line-left" />
            <div className="login-left__divider-dot" />
            <div className="login-left__divider-line-right" />
          </div>
        </div>
      </div>

      {/* ===== PANEL DERECHO ===== */}
      <div className="login-right">
        <div className="login-right__blob">
          <div className="login-right__blob-1" />
          <div className="login-right__blob-2" />
          <div className="login-right__blob-3" />
        </div>

        <div className="login-card">
          <div className="login-card__header">
            <div className="login-card__logo">
              <img src="/logo.png" alt="Logo" />
            </div>
            <h2 className="login-card__title">Iniciar sesión</h2>
            <p className="login-card__brand">Inventario Agrogestión</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div>
              <label className="login-form__label">Correo electrónico</label>
              <input
                type="text"
                value={email}
                onChange={handleEmailChange}
                placeholder="Ingrese su correo"
                required
                className={`login-form__input ${emailError ? 'login-form__input--error' : ''}`}
              />
              {emailError && (
                <p className="login-form__field-error">⚠ {emailError}</p>
              )}
            </div>
            <div>
              <label className="login-form__label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña o número de cédula"
                required
                className="login-form__input"
              />
            </div>
            {error && (
              <p className="login-form__error">{error}</p>
            )}
            <button type="submit" disabled={loading} className="login-form__submit">
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
            <button type="button" className="login-form__forgot">
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}