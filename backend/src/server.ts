import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import './database';

import { auditContext } from './middleware/auditContext';
import { fincaActiva } from './middleware/fincaActiva';
import productoRoutes from './routes/productoRoutes';
import fincaRoutes from './routes/fincaRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import trabajadorRoutes from './routes/trabajadorRoutes';
import authRoutes from './routes/authRoutes';
import kardexRoutes from './routes/kardexRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import alertasRoutes from './routes/alertasRoutes';
import { iniciarAlertasJob } from './job/alertasJob';

const app = express();

// Orígenes que pueden llamar a la API (sin barra final).
// Extra opcional: variable FRONTEND_URL en el backend, separada por comas.
const origenesPermitidos = [
  'https://agrogestioninventario.vercel.app', // Vercel (producción)
  'https://agrogestioninventario.netlify.app', // Netlify (quítalo cuando lo apagues)
  'http://localhost:5173', // desarrollo local
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
    : []),
];

// Previews de Vercel de ESTE proyecto: agrogestioninventario-xxxx.vercel.app
const previewVercel = /^https:\/\/agrogestioninventario(-[a-z0-9-]+)?\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Sin origin = Postman, curl o llamadas servidor a servidor
    if (!origin || origenesPermitidos.includes(origin) || previewVercel.test(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS bloqueado para el origen: ${origin}`);
    callback(null, false);
  },
  credentials: true
}));

app.use(express.json());

// Identifica al usuario del token para la auditoría de la base de datos
app.use(auditContext);

app.get('/', (req, res) => {
  res.send('API Inventario Finca funcionando 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', fincaActiva, productoRoutes);
app.use('/api/fincas', fincaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/trabajadores', fincaActiva, trabajadorRoutes);
app.use('/api/kardex', fincaActiva, kardexRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/alertas', fincaActiva, alertasRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  iniciarAlertasJob();
});