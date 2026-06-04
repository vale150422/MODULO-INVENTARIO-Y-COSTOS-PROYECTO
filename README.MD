# 🌿 AgroGestión — Módulo de Inventario 

**Sistema Integrado de Gestión Agropecuaria**

> Proyecto académico desarrollado para la asignatura **Desarrollo de Software 2**  
> Profesor: **Cristhian Johan Rodriguez**  
> Universidad del Valle  
> Fincas **Monterrey** y **Miraflores** — 2026

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| **Katherin Valeria Vasquez** | Desarrolladora Full Stack |
| **Pedro Luis Perdomo** | Desarrollador Full Stack |

---

## 🌐 Aplicación Desplegada

La aplicación está disponible en producción en el siguiente enlace:

🔗 **[https://agrogestioninventario.netlify.app/](https://agrogestioninventario.netlify.app/)**

| Servicio | Plataforma | Descripción |
|----------|-----------|-------------|
| Frontend | **Netlify** | Interfaz React desplegada con CI/CD automático |
| Backend | **Render** | API REST Node.js + Express siempre activa |
| Base de datos | **Supabase** | PostgreSQL en la nube con respaldo automático |

---

## 1. Título

**AgroGestión — Módulo de Inventario y Costos de Insumos Agrícolas**

Sistema web para el control de inventario de insumos agrícolas mediante el método contable PEPS (Primeras en Entrar, Primeras en Salir), desarrollado para apoyar la gestión administrativa de las fincas Monterrey y Miraflores.

---

## 2. Objetivos

### Objetivo General

Desarrollar un módulo de software web para la gestión y control del inventario de insumos agrícolas de las fincas Monterrey y Miraflores, implementando el método contable PEPS para la valoración precisa del inventario, los costos de ventas y el control de vencimientos, con diferenciación de roles entre administrador y empleado.

### Objetivos Específicos

1. **Implementar el método PEPS (FEFO)** para el registro y valoración de entradas y salidas de insumos agrícolas, asegurando que los lotes con fecha de vencimiento más próxima sean consumidos primero.

2. **Desarrollar un sistema de autenticación seguro** con roles diferenciados (administrador y empleado) usando JWT, que restrinja el acceso a funcionalidades según el perfil del usuario.

3. **Construir un módulo de Kardex** que permita registrar movimientos de inventario por lotes con número de factura, fecha de vencimiento y cálculo automático de costos.

4. **Generar reportes de inventario valorado** que muestren el saldo final de cada insumo con su valor en pesos colombianos (COP), con alertas de bajo stock configurables por el administrador.

5. **Gestionar los maestros del sistema** (fincas, productos, categorías, trabajadores y proveedores) con activación/inactivación lógica de registros sin eliminación permanente.

6. **Implementar un dashboard con KPIs** en tiempo real que muestre el valor total del inventario, productos con bajo stock, movimientos del día y últimas transacciones.

7. **Desplegar el sistema en la nube** usando Netlify (frontend), Render (backend) y Supabase (base de datos), garantizando disponibilidad continua.

---

## 3. Problemática

Las fincas agrícolas Monterrey y Miraflores gestionaban su inventario de insumos (fertilizantes, fungicidas, herbicidas, entre otros) de forma manual mediante registros en papel o hojas de cálculo, lo que generaba los siguientes problemas:

- **Pérdida de insumos por vencimiento**: sin un sistema que alerte sobre los productos próximos a vencer, los empleados consumían lotes más nuevos primero, dejando vencer los anteriores y generando pérdidas económicas.

- **Valoración imprecisa del inventario**: al no aplicar un método contable formal como PEPS, era imposible conocer con exactitud el valor real del inventario en un momento dado ni calcular correctamente el costo de los insumos utilizados.

- **Falta de trazabilidad**: no existía un historial confiable de entradas y salidas que permitiera identificar quién realizó cada movimiento, cuándo y con qué factura.

- **Alertas de stock inexistentes**: no había un mecanismo que notificara al administrador cuando un insumo estaba por agotarse, lo que generaba desabastecimiento en momentos críticos del ciclo agrícola.

- **Acceso no controlado a la información**: cualquier persona podía modificar los registros sin restricción de roles ni contraseña, exponiendo la información a errores e inconsistencias.

- **Reportes inexistentes**: no se generaban informes contables del inventario que pudieran ser utilizados para toma de decisiones o presentación a directivos.

---

## 4. Justificación

El desarrollo de este módulo de inventario se justifica por la necesidad de modernizar y formalizar la gestión de insumos agrícolas en las fincas Monterrey y Miraflores, aplicando principios contables y tecnológicos que garanticen eficiencia, trazabilidad y control.

Desde el punto de vista **contable**, el método PEPS es uno de los más utilizados en la valoración de inventarios según las Normas Internacionales de Información Financiera (NIIF), ya que refleja el flujo real de los productos y permite calcular con precisión el costo de ventas y el valor del inventario final.

Desde el punto de vista **tecnológico**, una aplicación web accesible desde cualquier dispositivo con conexión a internet elimina las barreras geográficas que enfrentan los administradores de fincas rurales, permitiéndoles consultar y gestionar el inventario en tiempo real sin necesidad de desplazarse físicamente.

Desde el punto de vista **académico**, este proyecto integra los conocimientos de desarrollo de software, bases de datos, arquitectura cliente-servidor, seguridad informática y metodologías ágiles adquiridos durante la carrera, aplicándolos en un contexto real con impacto directo en una organización productiva.

La implementación del sistema representa una mejora significativa en la eficiencia operativa de las fincas, reduciendo pérdidas por vencimiento, mejorando el control de costos y proporcionando información confiable para la toma de decisiones administrativas.

---

## 5. Arquitectura del Sistema

### Visión General

El sistema sigue una arquitectura **Cliente-Servidor** con separación completa entre frontend y backend, comunicándose a través de una **API REST** protegida con **JWT**.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│                                                             │
│   React 18 + TypeScript + Tailwind CSS                      │
│   Desplegado en: Netlify                                    │
│   https://agrogestioninventario.netlify.app                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / REST API
                        │ JWT Authentication
┌───────────────────────▼─────────────────────────────────────┐
│                       SERVIDOR                              │
│                                                             │
│   Node.js + Express.js + TypeScript                         │
│   Desplegado en: Render                                     │
│   Puerto: 3001                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │ pg (node-postgres)
                        │ Connection Pool
┌───────────────────────▼─────────────────────────────────────┐
│                   BASE DE DATOS                             │
│                                                             │
│   PostgreSQL 15                                             │
│   Desplegado en: Supabase                                   │
│   Tablas: 8 entidades principales                           │
└─────────────────────────────────────────────────────────────┘
```

### Patrones y Principios Aplicados

- **MVC en Backend**: separación entre Modelos (SQL), Controladores (lógica) y Rutas (endpoints)
- **SPA en Frontend**: Single Page Application con React Router DOM
- **API RESTful**: endpoints organizados por recurso con métodos HTTP semánticos
- **Autenticación Stateless**: JWT sin sesiones en servidor
- **Roles y permisos**: middleware de autorización por rol

### Stack Tecnológico

#### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18+ | Framework principal SPA |
| TypeScript | 5+ | Tipado estático |
| Vite | 5+ | Bundler y dev server |
| Tailwind CSS | 3+ | Estilos utilitarios |
| React Router DOM | 6+ | Navegación entre páginas |
| Context API / Hooks | — | Estado global de autenticación |
| JWT Decode | — | Decodificación del token |

#### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18+ | Runtime de JavaScript |
| Express.js | 4+ | Framework API REST |
| TypeScript | 5+ | Tipado estático |
| PostgreSQL | 15+ | Base de datos relacional |
| pg | — | Conexión y pool de conexiones |
| bcryptjs | — | Hash de contraseñas |
| jsonwebtoken | — | Generación y verificación JWT |
| cors | — | Control de origen cruzado |
| dotenv | — | Variables de entorno |
| nodemon | — | Recarga automática en desarrollo |

### Módulos del Sistema Integrado

El proyecto forma parte de un sistema integrado dividido en 3 módulos independientes:

| Módulo | Descripción | Equipo |
|--------|-------------|--------|
| 🏠 Experiencia Miraflores | Gestión de reservas y hospedaje | Grupo 1 |
| 📦 ** AgroGestión Inventario (este módulo)** | Kardex PEPS, insumos | **Grupo 2** |
  🌾 AgroGestión Control de Procesos Agricolas | Control de producción agrícola | Grupo 3 |

---

## 6. Requerimientos

### Requerimientos Funcionales

| ID | Módulo | Descripción |
|----|--------|-------------|
| RF01 | Autenticación | El sistema debe permitir iniciar sesión con email y contraseña, generando un token JWT con rol y datos del usuario. |
| RF02 | Autenticación | El sistema debe permitir registrar nuevos usuarios con rol empleado. |
| RF03 | Autenticación | El administrador debe poder cambiar su contraseña desde su perfil. |
| RF04 | Dashboard | El sistema debe mostrar KPIs en tiempo real: total productos, bajo stock, valor inventario y movimientos del día. |
| RF05 | Dashboard | El sistema debe mostrar los últimos 10 movimientos de inventario en una tabla. |
| RF06 | Fincas | El administrador debe poder crear, editar y eliminar fincas con nombre, municipio y vereda. |
| RF07 | Fincas | Los empleados solo deben poder consultar las fincas, sin poder editarlas. |
| RF08 | Trabajadores | El sistema debe permitir registrar trabajadores asociados a una finca con su información básica. |
| RF09 | Categorías | El administrador debe poder crear y eliminar categorías de productos. |
| RF10 | Productos | El sistema debe permitir crear productos con nombre, categoría, unidad de medida, finca y stock mínimo configurable. |
| RF11 | Productos | Los productos deben poder inactivarse (no eliminarse) y reactivarse. |
| RF12 | Proveedores | El sistema debe permitir registrar proveedores con múltiples productos que suministran. |
| RF13 | Kardex | El sistema debe registrar entradas de insumos con número de factura (generado automáticamente), cantidad, costo unitario y fecha de vencimiento opcional. |
| RF14 | Kardex | El sistema debe registrar salidas de insumos aplicando el método FEFO: se consume primero el lote que vence antes. |
| RF15 | Kardex | El sistema debe mostrar los lotes disponibles ordenados por fecha de vencimiento con alertas de color (rojo: vencido, naranja: ≤15 días, amarillo: ≤30 días). |
| RF16 | Kardex | El sistema debe mostrar el historial completo de movimientos por producto con columnas de entrada, salida y saldo. |
| RF17 | Kardex | El sistema debe calcular automáticamente el costo de las salidas usando los lotes disponibles (FEFO). |
| RF18 | Reporte | El sistema debe generar un reporte consolidado del inventario con valor total, costo de ventas, entradas y salidas. |
| RF19 | Reporte | El reporte debe mostrar alertas en rojo para productos con saldo menor al stock mínimo configurado. |
| RF20 | Reporte | El usuario debe poder imprimir o exportar el reporte a PDF desde el navegador. |
| RF21 | Perfil | El administrador debe poder editar su nombre desde su perfil. |

### Requerimientos No Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF01 | Seguridad | Las contraseñas deben almacenarse cifradas con bcrypt (salt rounds: 10). |
| RNF02 | Seguridad | Todas las rutas privadas deben requerir token JWT válido en el header Authorization. |
| RNF03 | Seguridad | El sistema debe validar el rol del usuario para cada operación sensible. |
| RNF04 | Disponibilidad | El sistema debe estar disponible 24/7 en la nube (Netlify + Render + Supabase). |
| RNF05 | Usabilidad | La interfaz debe ser intuitiva, con modo claro/oscuro y un botón de ayuda contextual. |
| RNF06 | Rendimiento | Las consultas al dashboard deben responder en menos de 2 segundos. |
| RNF07 | Escalabilidad | La arquitectura modular debe permitir agregar nuevos módulos sin afectar los existentes. |
| RNF08 | Mantenibilidad | El código debe estar tipado con TypeScript en frontend y backend. |
| RNF09 | Portabilidad | El sistema debe funcionar en cualquier navegador moderno (Chrome, Firefox, Edge, Safari). |
| RNF10 | Integridad | Las operaciones de inventario deben usar transacciones SQL para garantizar consistencia. |

---

## 7. Prototipado

El sistema cuenta con las siguientes pantallas implementadas y funcionales:

### 7.1 Pantalla de Login
Pantalla dividida en dos paneles. El panel izquierdo muestra el logo de la finca, el nombre del sistema y decoraciones vegetales. El panel derecho presenta una tarjeta con efecto glassmorphism que contiene dos pestañas: "Iniciar sesión" y "Registrarse". El formulario de login solicita correo electrónico y contraseña. El de registro solicita nombre completo, correo y contraseña con confirmación. Los botones usan tonos verdes oscuros coherentes con la identidad visual del sistema.

### 7.2 Dashboard (Admin)
Panel principal con 4 tarjetas de indicadores: Total Productos, Bajo Stock (en rojo cuando hay alertas), Valor Inventario en COP y Movimientos del Día. Debajo, una tabla oscura con los últimos 10 movimientos mostrando fecha, producto, tipo (ENTRADA/SALIDA con colores), cantidad, costo unitario y total.

### 7.3 Kardex PEPS
Página dividida en dos columnas. La columna izquierda muestra la lista de insumos registrados con su saldo actual, y un panel de Inventario Consolidado con el valor total en COP. La columna derecha muestra el producto seleccionado con sus etiquetas (categoría, unidad, método PEPS, finca), el saldo actual y los lotes disponibles ordenados por fecha de vencimiento con badges de color. El formulario de movimiento (+ Movimiento) permite registrar entradas con número de factura automático, cantidad, costo y fecha de vencimiento, o salidas seleccionando visualmente el lote a consumir. El historial muestra una tabla con columnas de entrada, salida y saldo acumulado.

### 7.4 Reporte Kardex
Página con encabezado institucional (logo + nombre del sistema), 4 indicadores de resumen (Valor Inventario, Costo Ventas, Entradas, Salidas), tabla de productos con categoría, finca, saldo en cantidad y valor, y fila de total. Los productos con stock bajo al mínimo configurado aparecen en rojo. Incluye botón de impresión/exportar PDF.

### 7.5 Gestión de Productos
Tabla con columnas: Nombre, Categoría (badge), Unidad, Finca, Stock mínimo (configurable por el admin), Fecha de creación, Estado (Activo/Inactivo) y Acciones. Los productos inactivos aparecen con opacidad reducida. Los botones Editar e Inactivar/Activar permiten gestionar el ciclo de vida del producto sin eliminación permanente.

### 7.6 Gestión de Proveedores
Tabla de proveedores con nombre, NIT, ciudad, contacto y los productos que suministra mostrados como etiquetas (badges) separadas. El formulario de creación/edición incluye un selector de productos con autocompletado y sugerencias de productos agrícolas comunes, donde cada producto seleccionado aparece como chip removible.

### 7.7 Gestión de Fincas
Tabla simple con nombre, municipio, vereda y fecha de creación. Para el administrador incluye botones Editar y Eliminar. Para el empleado la tabla no muestra la columna de acciones ni el botón de nueva finca.

### 7.8 Gestión de Trabajadores
Tabla con nombre, cédula, cargo, finca asignada, teléfono y estado. Formulario de creación con selector de finca y campos de información personal.

### 7.9 Gestión de Categorías
Tabla simple con nombre de la categoría y fecha de creación. Formulario mínimo de creación con campo de nombre.

### 7.10 Panel de Empleado (Mi Panel)
Encabezado verde oscuro con logo, bienvenida con nombre del usuario y rol. Dos tarjetas: "Mi información" (correo, rol, estado, módulo) y "Seguridad" (cambio de contraseña con formulario desplegable). Sección de accesos rápidos a Kardex, Mis Fincas y Reporte.

### 7.11 Perfil Administrador
Similar al panel de empleado con encabezado verde y logo. Tarjeta de información con campo de nombre editable (botón ✏️ Editar). Tarjeta de seguridad con cambio de contraseña. Grid de 8 accesos rápidos a todos los módulos del sistema.

### 7.12 Reportes Financieros
Página con indicadores del valor total del inventario (Cuenta 1405 Materias Primas), costo de ventas acumulado y asiento contable de las salidas.

### 7.13 Centro de Ayuda (Modal)
Botón flotante ❓ en la esquina inferior derecha que abre un modal con sidebar de secciones y contenido paso a paso para cada módulo. El contenido varía según el rol del usuario (admin o empleado).

---

## 8. Diagrama de Casos de Uso

```
                    ┌─────────────────────────────────────────────┐
                    │           SISTEMA AGROGESTION               │
                    │                                             │
  ┌──────────┐      │  ┌──────────────────────────────────────┐  │
  │          │      │  │           AUTENTICACIÓN               │  │
  │  ADMIN   │──────┼─▶│  • Iniciar sesión                    │  │
  │          │      │  │  • Registrar empleado                 │  │
  └────┬─────┘      │  │  • Cambiar contraseña                 │  │
       │            │  └──────────────────────────────────────┘  │
       │            │                                             │
       │            │  ┌──────────────────────────────────────┐  │
       │            │  │           DASHBOARD                   │  │
       ├────────────┼─▶│  • Ver KPIs en tiempo real           │  │
       │            │  │  • Ver últimos movimientos            │  │
       │            │  └──────────────────────────────────────┘  │
       │            │                                             │
       │            │  ┌──────────────────────────────────────┐  │
       │            │  │           MAESTROS                    │  │
       ├────────────┼─▶│  • Gestionar fincas (CRUD)           │  │
       │            │  │  • Gestionar trabajadores (CRUD)      │  │
       │            │  │  • Gestionar productos (CRUD)         │  │
       │            │  │  • Gestionar categorías (CRUD)        │  │
       │            │  │  • Gestionar proveedores (CRUD)       │  │
       │            │  └──────────────────────────────────────┘  │
       │            │                                             │
       │            │  ┌──────────────────────────────────────┐  │
       │            │  │           KARDEX PEPS                 │  │      ┌──────────┐
       ├────────────┼─▶│  • Registrar entrada de insumos      │◀─┼──────│          │
       │            │  │  • Registrar salida de insumos       │  │      │ EMPLEADO │
       │            │  │  • Ver historial por producto         │◀─┼──────│          │
       │            │  │  • Ver lotes y vencimientos          │◀─┼──────└──────────┘
       │            │  │  • Consultar facturas                 │  │           │
       │            │  └──────────────────────────────────────┘  │           │
       │            │                                             │           │
       │            │  ┌──────────────────────────────────────┐  │           │
       │            │  │           REPORTES                    │  │           │
       ├────────────┼─▶│  • Ver reporte consolidado PEPS      │◀─┼───────────┤
       │            │  │  • Ver reportes financieros          │  │           │
       │            │  │  • Imprimir / exportar PDF           │◀─┼───────────┤
       │            │  └──────────────────────────────────────┘  │           │
       │            │                                             │           │
       │            │  ┌──────────────────────────────────────┐  │           │
       │            │  │           FINCAS (consulta)           │  │           │
       │            │  │  • Consultar fincas registradas      │◀─┼───────────┘
       │            │  └──────────────────────────────────────┘  │
       │            │                                             │
       │            │  ┌──────────────────────────────────────┐  │
       │            │  │           PERFIL                      │  │
       └────────────┼─▶│  • Editar nombre                     │  │
                    │  │  • Cambiar contraseña                 │  │
                    │  └──────────────────────────────────────┘  │
                    │                                             │
                    └─────────────────────────────────────────────┘

Actores:
  ADMIN    → Acceso total a todos los módulos
  EMPLEADO → Acceso a: Kardex (lectura/escritura), Fincas (lectura),
              Reporte Kardex, Mi Panel
```

---

## 9. Modelo Relacional

```
┌─────────────────┐         ┌─────────────────┐
│    USUARIO      │         │     FINCA        │
├─────────────────┤         ├─────────────────┤
│ PK id_usuario   │         │ PK id_finca      │
│    nombre       │         │    nombre        │
│    email        │         │    municipio     │
│    password     │         │    vereda        │
│    rol          │         │    created_at    │
│    activo       │         └────────┬────────┘
└────────┬────────┘                  │
         │                           │ 1:N
         │ 1:N                       │
         │                  ┌────────▼────────┐     ┌─────────────────┐
         │                  │  TRABAJADOR     │     │   CATEGORIA     │
         │                  ├─────────────────┤     ├─────────────────┤
         │                  │ PK id_trabajador│     │ PK id_categoria │
         │                  │ FK id_finca     │     │    nombre       │
         │                  │    nombre       │     │    created_at   │
         │                  │    cedula       │     └────────┬────────┘
         │                  │    cargo        │              │
         │                  │    telefono     │              │ 1:N
         │                  │    activo       │              │
         │                  └─────────────────┘    ┌────────▼────────┐
         │                                         │    PRODUCTO     │
         │                                         ├─────────────────┤
         │                                         │ PK id_producto  │
         │                                         │ FK id_categoria │
         │                                         │ FK id_finca     │
         │                                         │    nombre       │
         │                                         │    unidadmedida │
         │                                         │    stock_minimo │
         │                                         │    activo       │
         │                                         │    created_at   │
         │                                         └────────┬────────┘
         │                                                  │
         │                         ┌────────────────────────┤
         │                         │                        │
         │                1:N      │              1:N       │
         │          ┌──────────────▼──┐     ┌──────────────▼──┐
         │          │   KARDEX_LOTE   │     │     KARDEX       │
         │          ├─────────────────┤     ├─────────────────┤
         │          │ PK id_lote      │     │ PK id_kardex     │
         │          │ FK id_producto  │     │ FK id_producto   │
         │          │ FK id_finca     │     │ FK id_finca      │
         │          │    cantidad     │     │ FK id_usuario ◄──┘
         │          │    costo_unit.  │     │    tipo          │
         │          │    factura      │     │    cantidad      │
         │          │    fecha_ent.   │     │    costo_unit.   │
         │          │    fecha_venc.  │     │    total         │
         │          └─────────────────┘     │    saldo_cant.   │
         │                                  │    saldo_valor   │
         └──────────────────────────────────│    detalle       │
                                            │    fecha         │
                                            └─────────────────┘

┌─────────────────────┐
│     PROVEEDOR       │
├─────────────────────┤
│ PK id_proveedor     │
│    nombre           │
│    nit              │
│    tipo_producto    │  ← múltiples productos separados por coma
│    ciudad           │
│    telefono         │
│    correo           │
│    created_at       │
└─────────────────────┘

Relaciones:
  finca       1 ──── N  producto
  finca       1 ──── N  trabajador
  finca       1 ──── N  kardex
  finca       1 ──── N  kardex_lote
  categoria   1 ──── N  producto
  producto    1 ──── N  kardex
  producto    1 ──── N  kardex_lote
  usuario     1 ──── N  kardex
```

---

## 📁 Estructura del Proyecto

```
MODULO-INVENTARIO-Y-COSTOS-PROYECTO/
├── backend/
│   └── src/
│       ├── controllers/       # Lógica de negocio
│       ├── database/          # Conexión PostgreSQL
│       ├── middleware/        # Autenticación JWT
│       ├── models/            # Queries SQL
│       ├── routes/            # Endpoints REST
│       └── server.ts          # Entrada del servidor
│
└── frontend/
    └── src/
        ├── components/        # Sidebar, Topbar, Toast, Ayuda
        ├── hooks/             # useAuth, useTheme
        ├── pages/             # Todas las páginas del sistema
        ├── services/          # Llamadas a la API REST
        └── App.tsx            # Rutas principales
```

---

## 🔐 API REST — Endpoints Principales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/registro` | Registrar empleado | ❌ |
| PATCH | `/api/auth/cambiar-password` | Cambiar contraseña | ✅ |
| GET | `/api/kardex/productos` | Listar productos con saldo | ✅ |
| GET | `/api/kardex/:id` | Historial de movimientos | ✅ |
| GET | `/api/kardex/:id/lotes` | Lotes disponibles FEFO | ✅ |
| POST | `/api/kardex/movimiento` | Registrar entrada/salida | ✅ |
| GET | `/api/kardex/reporte` | Reporte consolidado | ✅ |
| GET | `/api/kardex/dashboard` | KPIs del dashboard | ✅ |
| GET/POST/PUT/DELETE | `/api/productos` | CRUD productos | ✅ |
| GET/POST/DELETE | `/api/categorias` | CRUD categorías | ✅ |
| GET/POST/PUT/DELETE | `/api/fincas` | CRUD fincas | ✅ |
| GET/POST/PUT/DELETE | `/api/trabajadores` | CRUD trabajadores | ✅ |
| GET/POST/PUT/DELETE | `/api/proveedores` | CRUD proveedores | ✅ |

---

## 🔄 Método PEPS / FEFO

El módulo implementa **FEFO (First Expired, First Out)** — variante del PEPS que prioriza los lotes por fecha de vencimiento:

1. **ENTRADA** → Se crea un lote con cantidad, costo unitario, número de factura y fecha de vencimiento opcional
2. **SALIDA** → El administrador selecciona el lote a consumir; el sistema sugiere el que vence primero
3. **Costo automático** → El sistema calcula el costo de la salida a partir del costo del lote seleccionado
4. **Alertas de vencimiento** → 🔴 Vencido · 🟠 ≤15 días · 🟡 ≤30 días · ✅ Sin urgencia
5. **Saldo en tiempo real** → Cada movimiento actualiza el saldo de cantidad y valor del producto

---

## 🚀 Instalación Local

### Requisitos
- Node.js 18+ · PostgreSQL 15+ · npm

### Backend
```bash
cd backend
npm install
# Crear .env con DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm run dev   # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## 📄 Licencia

Proyecto académico — Todos los derechos reservados © 2026  
Universidad del Valle · Desarrollo de Software 2  
Fincas Monterrey & Miraflores