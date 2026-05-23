# 🌿 AgroGestión
### Módulo de Inventario — Sistema Integrado de Gestión Agropecuaria

> Proyecto académico-real desarrollado para las fincas **Monterrey** y **Miraflores**, parte de un sistema integral de gestión dividido en tres módulos independientes.

---

## 📋 Descripción General

**Inventario AgroGestión** es el módulo de gestión de inventario agrícola del sistema integrado de administración de fincas. Permite registrar, controlar y analizar los insumos agrícolas mediante el método contable **PEPS (Primeras en Entrar, Primeras en Salir)**, garantizando una valoración precisa del inventario y el costo de ventas.

El sistema está diseñado para ser usado por dos tipos de usuarios:
- **Administrador**: acceso total a todos los módulos del sistema.
- **Empleado**: acceso restringido al Kardex, fincas y reportes.

---

## 🏗️ Arquitectura del Proyecto

El sistema completo está dividido en **3 módulos independientes**, desarrollados por equipos distintos:

| Módulo | Descripción | Equipo |
|--------|-------------|--------|
| 🏠 **Experiencia Miraflores** | Gestión de reservas y hospedaje | Grupo 1 |
| 🌾 **Productos y Cosechas** | Control de producción agrícola | Grupo 2 |
| 📦 **Inventario (este módulo)** | Kardex PEPS, insumos y costos | Grupo 3 |

---
## 🛠️ Stack Tecnológico

## 🎨 Frontend

Tecnología	Función en el proyecto

--**React 18**	Construcción de la interfaz SPA
--**TypeScript**	Tipado seguro y escalabilidad
--**Vite**	Compilación rápida y entorno de desarrollo
--**Tailwind CSS**	Diseño responsivo y estilos modernos
--**React Router DOM**	Navegación entre módulos
--**Axios**	Consumo de la API REST
--**Context API** / Hooks	Manejo de autenticación y estado
--**JWT Decode**	Decodificación del token de sesión
--**React Icons**	Iconografía del sistema
--**SweetAlert2 / Toasts**	Alertas y notificaciones

## ⚙️ Backend

Tecnología	Función en el proyecto

--**Node.js**	Entorno de ejecución
--**Express.js**	API REST y manejo de rutas
--**TypeScript**	Estructura tipada y mantenible
--**PostgreSQL**	Base de datos relacional
--**pg**	Conexión y consultas SQL
--**bcryptjs**	Encriptación de contraseñas
--**jsonwebtoken (JWT)**	Autenticación segura
--**dotenv**	Variables de entorno
--**cors**	Comunicación entre frontend y backend
--**nodemon**	Desarrollo en tiempo real

## 🗄️ Base de Datos

Tecnología	Uso

--**PostgreSQL 15**	Persistencia de datos
--**SQL**	Consultas y procedimientos
--**Método PEPS**	Valorización de inventario
--**Kardex por lotes**	Control detallado de entradas y salidas

## 🧩 Arquitectura Implementada

--Arquitectura Cliente-Servidor
--API RESTful
--Arquitectura modular
--Separación Frontend / Backend
--Patrón MVC en backend
--Persistencia relacional
--Autenticación basada en JWT
--Manejo de roles y permisos
--Sistema de inventario con lógica PEPS

## 🔒 Seguridad Implementada

--Contraseñas cifradas con bcrypt
--Tokens JWT para autenticación
--Protección de rutas privadas
--Validación de roles (admin / empleado)
--Variables sensibles protegidas con .env

## 📊 Funcionalidades Técnicas Destacadas

--Kardex valorizado con método PEPS
--Dashboard con KPIs dinámicos
--Manejo de inventario en tiempo real
--Activación e inactivación lógica de productos
--Generación de reportes
--Control de acceso por roles
--Arquitectura escalable por módulos independientes

## ✨ Funcionalidades del Módulo de Inventario

### 👨‍💼 Administrador
- **Dashboard** — Resumen general con KPIs en tiempo real
- **Gestión de Fincas** — Crear, editar e inactivar fincas
- **Gestión de Trabajadores** — Registro y control de personal
- **Productos** — Insumos agrícolas con activación/inactivación
- **Categorías** — Gestión dinámica de categorías de productos
- **Proveedores** — Directorio de proveedores
- **Kardex PEPS** — Registro de entradas y salidas con método PEPS
- **Reportes** — Informe de inventario final y asiento contable de costo de ventas
- **Mi Perfil** — Edición de nombre y cambio de contraseña

### 👷 Empleado
- **Mi Panel** — Información personal y accesos rápidos
- **Kardex** — Visualización del inventario (solo lectura)
- **Mis Fincas** — Consulta de fincas registradas
- **Reporte Kardex** — Descarga e impresión del inventario

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18+ | Framework principal |
| TypeScript | 5+ | Tipado estático |
| Vite | 5+ | Bundler y dev server |
| Tailwind CSS | 3+ | Estilos utilitarios |
| React Router | 6+ | Navegación SPA |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18+ | Runtime |
| Express | 4+ | Framework HTTP |
| TypeScript | 5+ | Tipado estático |
| PostgreSQL | 15+ | Base de datos |
| bcryptjs | — | Hash de contraseñas |
| jsonwebtoken | — | Autenticación JWT |
| dotenv | — | Variables de entorno |

---

## 🗄️ Modelo de Base de Datos

```
finca ──────────────── producto ─────────── categoria
  │                       │
  │                    kardex_lote
  │                       │
trabajador              kardex
  │                       │
usuario ────────────────┘
```

### Tablas principales
- **`finca`** — Fincas registradas (Monterrey, Miraflores)
- **`categoria`** — Categorías de insumos (dinámica)
- **`producto`** — Insumos con campo `activo` para inactivación
- **`proveedor`** — Directorio de proveedores
- **`trabajador`** — Personal de las fincas
- **`usuario`** — Cuentas con roles `admin` / `empleado`
- **`kardex`** — Movimientos de inventario (ENTRADA, SALIDA, INICIO)
- **`kardex_lote`** — Lotes para cálculo PEPS

---

## 🚀 Instalación y Configuración

### Requisitos previos
- Node.js 18+
- PostgreSQL 15+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd MODULO-INVENTARIO-Y-COSTOS-PROYECTO
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` en `/backend`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=inventario
JWT_SECRET=clave_secreta_segura
```

Inicializar la base de datos en pgAdmin ejecutando el script SQL del proyecto, luego insertar el usuario administrador:
```sql
INSERT INTO usuario (nombre, email, password, rol)
VALUES (
  'Administrador',
  'admin@agrogestion.com',
  '$2b$10$...hash_de_tu_contraseña...',
  'admin'
);
```

Para generar el hash de una contraseña:
```bash
node -e "const b = require('bcryptjs'); b.hash('tu_contraseña', 10).then(h => console.log(h))"
```

Iniciar el backend:
```bash
npm run dev
```
> El servidor corre en `http://localhost:3001`

### 3. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```
> La aplicación corre en `http://localhost:5173`

---

## 👤 Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@agrogestion.com | *(configurada en instalación)* |
| Empleado | *(registrado por el admin)* | *(definida al registrarse)* |

---

## 📁 Estructura del Proyecto

```
MODULO-INVENTARIO-Y-COSTOS-PROYECTO/
├── backend/
│   ├── config/
│   │   └── db.js                  # Configuración de conexión
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   │   ├── authController.ts
│   │   │   ├── kardexController.ts
│   │   │   ├── productoController.ts
│   │   │   ├── fincaControllers.ts
│   │   │   ├── trabajadorControllers.ts
│   │   │   ├── proveedorControllers.ts
│   │   │   └── categoriaController.ts
│   │   ├── database/
│   │   │   └── connection.ts      # Pool de PostgreSQL
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts  # Verificación JWT
│   │   ├── models/                # Queries SQL
│   │   ├── routes/                # Endpoints REST
│   │   └── server.ts              # Entrada del servidor
│   ├── .env                       # Variables de entorno
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── logo.png               # Logo del sistema
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.tsx    # Navegación lateral
    │   │   │   └── Topbar.tsx     # Barra superior
    │   │   └── toast/             # Notificaciones
    │   ├── hooks/
    │   │   ├── useAuth.ts         # Autenticación
    │   │   └── useTheme.ts        # Modo claro/oscuro
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Kardex.tsx
    │   │   ├── FincaPage/
    │   │   ├── ProductoPage/
    │   │   ├── TrabajadorPage/
    │   │   ├── ProveedorPage/
    │   │   ├── CategoriaPage/
    │   │   ├── Reportes.tsx
    │   │   ├── MiPanelPage.tsx    # Panel empleado
    │   │   └── PerfilAdmin.tsx    # Panel administrador
    │   ├── services/              # Llamadas a la API
    │   └── App.tsx                # Rutas principales
    └── package.json
```

---

## 🔐 API REST — Endpoints Principales

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registro` | Registrar empleado |
| PATCH | `/api/auth/cambiar-password` | Cambiar contraseña |

### Kardex
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/kardex/productos` | Listar productos con saldo |
| GET | `/api/kardex/:id` | Historial de movimientos |
| GET | `/api/kardex/:id/lotes` | Lotes disponibles PEPS |
| POST | `/api/kardex/movimiento` | Registrar entrada/salida |
| GET | `/api/kardex/reporte` | Reporte consolidado |
| GET | `/api/kardex/dashboard` | KPIs del dashboard |

### Otros módulos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/api/productos` | CRUD productos |
| GET/POST/DELETE | `/api/categorias` | CRUD categorías |
| GET/POST/PUT/DELETE | `/api/fincas` | CRUD fincas |
| GET/POST/PUT/DELETE | `/api/trabajadores` | CRUD trabajadores |
| GET/POST/PUT/DELETE | `/api/proveedores` | CRUD proveedores |

---

## 🔄 Método PEPS (Kardex)

El módulo implementa el método **PEPS** para la valuación de inventarios:

1. **ENTRADA** → Se crea un lote con cantidad y costo unitario
2. **SALIDA** → Se consumen los lotes más antiguos primero
3. **Costo automático** → El sistema calcula el costo de salida promedio ponderado de los lotes consumidos
4. **Saldo en tiempo real** → Cada movimiento actualiza el saldo de cantidad y valor

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| **Katherin Valeria Vasquez** | Desarrolladora Full Stack |
| **Pedro Luis Perdomo** | Desarrollador Backend |

---

## 🏫 Contexto Académico

Proyecto desarrollado como trabajo de la asignatura Desarrollo De Software 2 / proyecto académico para la gestión de las fincas **Monterrey** y **Miraflores**. El sistema completo integra tres módulos desarrollados por diferentes equipos de estudiantes, siendo este el **Módulo de Inventario**.

---

## 📄 Licencia

Proyecto académico — Todos los derechos reservados © 2026  
Fincas Monterrey & Miraflores