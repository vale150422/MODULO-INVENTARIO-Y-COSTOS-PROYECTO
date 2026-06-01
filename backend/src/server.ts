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
  origin: process.env.FRONTEND_URL || 'https://agrogestioninventario.netlify.app'
}));
app.use(express.json());

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