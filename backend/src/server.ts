import express from 'express';
import cors from 'cors';
import './database';

import productoRoutes from './routes/productoRoutes';
import fincaRoutes from './routes/fincaRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import trabajadorRoutes from './routes/trabajadorRoutes';
import authRoutes from './routes/authRoutes';
import kardexRoutes from './routes/kardexRoutes';
import categoriaRoutes from './routes/categoriaRoutes';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://agrogestioninventario.netlify.app',
      'http://localhost:5173'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('API Inventario Finca funcionando 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/fincas', fincaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/kardex', kardexRoutes);
app.use('/api/categorias', categoriaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});