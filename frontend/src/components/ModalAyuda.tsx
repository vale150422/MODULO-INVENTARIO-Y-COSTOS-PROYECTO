import { useState } from 'react';

interface Props {
  rol: 'admin' | 'empleado';
}

const seccionesAdmin = [
  {
    icon: '📊',
    titulo: 'Dashboard',
    descripcion: 'Panel principal con resumen del sistema en tiempo real.',
    pasos: [
      'Al ingresar verás 4 tarjetas: Total Productos, Bajo Stock, Valor Inventario y Movimientos Hoy.',
      'La tabla "Últimos movimientos" muestra las 10 entradas/salidas más recientes.',
      'Los datos se actualizan automáticamente cada vez que entras al dashboard.',
    ],
  },
  {
    icon: '🌿',
    titulo: 'Fincas',
    descripcion: 'Gestiona las fincas registradas en el sistema.',
    pasos: [
      'Haz clic en "+ Nueva Finca" para agregar una finca.',
      'Completa nombre, municipio y vereda, luego guarda.',
      'Usa "Editar" para modificar los datos de una finca existente.',
      'Las fincas no se eliminan — se pueden editar en cualquier momento.',
    ],
  },
  {
    icon: '👥',
    titulo: 'Trabajadores',
    descripcion: 'Registra y administra el personal de las fincas.',
    pasos: [
      'Haz clic en "+ Nuevo Trabajador" para registrar un empleado.',
      'Debes seleccionar a qué finca pertenece el trabajador.',
      'Puedes editar sus datos o cambiar su estado (Activo/Inactivo).',
    ],
  },
  {
    icon: '🏷️',
    titulo: 'Categorías',
    descripcion: 'Administra los tipos de productos del inventario.',
    pasos: [
      'Crea categorías antes de registrar productos (ej: Café, Plátano, Fertilizantes).',
      'Haz clic en "+ Nueva Categoría", escribe el nombre y guarda.',
      'Puedes eliminar categorías que no tengan productos asociados.',
    ],
  },
  {
    icon: '🛒',
    titulo: 'Productos',
    descripcion: 'Gestiona los insumos agrícolas del inventario.',
    pasos: [
      'Primero crea categorías y fincas antes de agregar productos.',
      'Haz clic en "+ Nuevo Producto" y completa nombre, categoría, unidad y finca.',
      'Los productos NO se eliminan — usa "Inactivar" para ocultarlos del inventario activo.',
      'Puedes reactivar un producto inactivo con el botón "Activar".',
    ],
  },
  {
    icon: '🤝',
    titulo: 'Proveedores',
    descripcion: 'Directorio de proveedores de insumos.',
    pasos: [
      'Registra proveedores con nombre, NIT, ciudad, teléfono y correo.',
      'Puedes editar o eliminar proveedores desde la tabla.',
      'Usa esta información para referenciar compras en el Kardex.',
    ],
  },
  {
    icon: '📦',
    titulo: 'Kardex PEPS',
    descripcion: 'Control de inventario con método Primeras en Entrar, Primeras en Salir.',
    pasos: [
      'Selecciona un producto de la lista izquierda para ver su historial.',
      'Haz clic en "+ Movimiento" para registrar una entrada o salida.',
      'ENTRADA: ingresa cantidad, costo unitario y número de factura.',
      'SALIDA: solo ingresa la cantidad — el costo lo calcula el sistema automáticamente usando los lotes más antiguos.',
      'El saldo se actualiza en tiempo real después de cada movimiento.',
      'Los lotes disponibles se muestran en orden PEPS (el más antiguo primero).',
    ],
  },
  {
    icon: '📈',
    titulo: 'Reportes',
    descripcion: 'Informes financieros del inventario.',
    pasos: [
      'Ver el valor total del inventario (Cuenta 1405 Materias Primas).',
      'Consultar el costo de ventas acumulado de todas las salidas.',
      'El asiento contable muestra el movimiento contable de las salidas.',
      'Los datos reflejan el estado actual del inventario en tiempo real.',
    ],
  },
];

const seccionesEmpleado = [
  {
    icon: '📦',
    titulo: 'Kardex PEPS',
    descripcion: 'Registro y consulta del inventario de insumos.',
    pasos: [
      'Selecciona un producto de la lista izquierda.',
      'Verás el saldo actual, los lotes disponibles y el historial de movimientos.',
      'Para registrar un movimiento haz clic en "+ Movimiento".',
      'ENTRADA: registra compras de insumos con factura y costo.',
      'SALIDA: registra el uso de insumos — el sistema calcula el costo automáticamente.',
    ],
  },
  {
    icon: '🌿',
    titulo: 'Mis Fincas',
    descripcion: 'Consulta las fincas registradas en el sistema.',
    pasos: [
      'Aquí puedes ver todas las fincas con su municipio y vereda.',
      'Esta información es de solo consulta para empleados.',
      'Si necesitas agregar o editar una finca, contacta al administrador.',
    ],
  },
  {
    icon: '📊',
    titulo: 'Reporte Kardex',
    descripcion: 'Genera e imprime el informe del inventario.',
    pasos: [
      'Muestra el inventario final valorado con el método PEPS.',
      'Incluye cantidad, costo unitario y valor total por producto.',
      'Puedes imprimir o exportar el reporte desde el navegador (Ctrl+P).',
    ],
  },
  {
    icon: '👤',
    titulo: 'Mi Panel',
    descripcion: 'Tu información personal y seguridad.',
    pasos: [
      'Puedes ver tu correo, rol y estado en el sistema.',
      'Para cambiar tu contraseña haz clic en "Cambiar contraseña".',
      'Ingresa tu contraseña actual, luego la nueva (mínimo 6 caracteres) y confírmala.',
      'Haz clic en "Actualizar contraseña" para guardar los cambios.',
    ],
  },
];

export default function ModalAyuda({ rol }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState(0);

  const secciones = rol === 'admin' ? seccionesAdmin : seccionesEmpleado;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={(e) => { e.stopPropagation(); setAbierto(true); }}
        title="Ayuda"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d4a1e 0%, #4a7c3f 100%)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(45,74,30,0.45)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(45,74,30,0.55)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(45,74,30,0.45)';
        }}
      >
        ❓
      </button>

      {/* Modal */}
      {abierto && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAbierto(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '760px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3d10 0%, #2d4a1e 100%)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ color: '#8fae5a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                  Centro de ayuda
                </p>
                <h2 style={{ color: '#f5f0e0', margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>
                  Inventario AgroGestión
                </h2>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: '8px',
                  color: '#ffffff', cursor: 'pointer',
                  width: '32px', height: '32px',
                  fontSize: '16px', fontWeight: 700,
                }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* Sidebar de secciones */}
              <div style={{
                width: '200px', flexShrink: 0,
                background: '#f5faf0',
                borderRight: '1px solid #e0ead0',
                overflowY: 'auto',
                padding: '12px 8px',
              }}>
                {secciones.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSeccionActiva(i)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      background: seccionActiva === i ? '#2d4a1e' : 'transparent',
                      color: seccionActiva === i ? '#ffffff' : '#2d4a1e',
                      fontWeight: seccionActiva === i ? 600 : 400,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.titulo}</span>
                  </button>
                ))}
              </div>

              {/* Contenido */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '28px' }}>{secciones[seccionActiva].icon}</span>
                  <h3 style={{ margin: 0, color: '#1a3a0e', fontSize: '18px', fontWeight: 700 }}>
                    {secciones[seccionActiva].titulo}
                  </h3>
                </div>

                <p style={{
                  color: '#6b8c3e', fontSize: '14px',
                  marginBottom: '20px', lineHeight: 1.6,
                  padding: '10px 14px',
                  background: '#f0f9e8',
                  borderRadius: '10px',
                  borderLeft: '3px solid #4a7c3f',
                }}>
                  {secciones[seccionActiva].descripcion}
                </p>

                <h4 style={{ color: '#2d4a1e', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  ¿Cómo usarlo?
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {secciones[seccionActiva].pasos.map((paso, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      padding: '12px 14px',
                      background: '#fafff5',
                      borderRadius: '10px',
                      border: '1px solid #e0ead0',
                    }}>
                      <div style={{
                        minWidth: '24px', height: '24px',
                        borderRadius: '50%',
                        background: '#2d4a1e',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <p style={{ margin: 0, color: '#1a3a0e', fontSize: '13px', lineHeight: 1.6 }}>
                        {paso}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tip al final */}
                <div style={{
                  marginTop: '20px',
                  padding: '12px 14px',
                  background: '#fff8e8',
                  borderRadius: '10px',
                  border: '1px solid #f0d080',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#7a5c00', lineHeight: 1.5 }}>
                    <strong>¿Necesitas más ayuda?</strong> Contacta al administrador del sistema
                    o consulta el manual de usuario del proyecto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}