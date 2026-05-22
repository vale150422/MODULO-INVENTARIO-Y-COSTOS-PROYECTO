import express from 'express';
import cors from 'cors';
import { pool } from './database/connection';
import productoRoutes from './routes/productoRoutes';
import fincaRoutes from './routes/fincaRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import trabajadorRoutes from './routes/trabajadorRoutes';
import authRoutes from './routes/authRoutes';
import kardexRoutes from './routes/kardexRoutes';
import categoriaRoutes from './routes/categoriaRoutes';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ← ahora usa las mismas opciones
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Inventario Finca funcionando 🚀');
});

app.use('/api/auth',         authRoutes);
app.use('/api/productos',    productoRoutes);
app.use('/api/fincas',       fincaRoutes);
app.use('/api/proveedores',  proveedorRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/kardex',       kardexRoutes);
app.use('/api/categorias',   categoriaRoutes);

app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});