import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Agrega el token a TODAS las llamadas al backend, sin tocar cada servicio
const API_HOST = 'modulo-inventario-y-costos-proyecto.onrender.com';
const originalFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const url =
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  if (url.includes(API_HOST)) {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
      );
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)