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
      'Solo el administrador puede crear, editar o eliminar fincas. Los empleados solo pueden consultarlas.',
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
    icon: '🏪',
    titulo: 'Proveedores',
    descripcion: 'Directorio de proveedores con soporte para múltiples productos.',
    pasos: [
      'Registra proveedores con nombre, NIT, ciudad, teléfono y correo.',
      'Un proveedor puede suministrar varios productos — escribe cada uno y presiona Enter o clic en "+ Agregar".',
      'El sistema sugiere automáticamente productos agrícolas comunes mientras escribes.',
      'Cada producto aparece como una etiqueta que puedes eliminar con ×.',
      'Usa "Editar" para modificar los productos que provee en cualquier momento.',
    ],
  },
  {
    icon: '📦',
    titulo: 'Kardex PEPS',
    descripcion: 'Control de inventario con método FEFO — el lote que vence antes sale primero.',
    pasos: [
      'Selecciona un producto de la lista izquierda para ver sus lotes y movimientos.',
      'Haz clic en "+ Movimiento" para registrar una entrada o salida.',
      'ENTRADA: ingresa cantidad, costo unitario, número de factura y fecha de vencimiento (opcional). El número de factura se genera automáticamente — puedes editarlo.',
      'SALIDA: selecciona el lote a consumir de la lista — el sistema muestra cuál vence primero con el badge "← USAR PRIMERO". Ingresa la cantidad y el costo se calcula automáticamente.',
      'Los lotes en ROJO están vencidos, en NARANJA vencen en menos de 15 días, en AMARILLO en menos de 30 días.',
      'El botón "📋 Facturas" muestra el historial de todas las facturas registradas para ese producto.',
      'El inventario consolidado en la columna izquierda muestra el valor total en pesos colombianos (COP).',
    ],
  },
  {
    icon: '📋',
    titulo: 'Rep. Kardex',
    descripcion: 'Reporte consolidado del inventario valorado con método PEPS.',
    pasos: [
      'Muestra un resumen con 4 indicadores: Valor Inventario, Costo Ventas, Entradas y Salidas totales.',
      'La tabla lista todos los productos con su categoría, finca, saldo en cantidad y valor.',
      'Los productos con stock menor a 10 unidades aparecen resaltados en rojo como alerta.',
      'Haz clic en "🖨️ Imprimir / Exportar PDF" para generar el reporte imprimible.',
    ],
  },
  {
    icon: '📈',
    titulo: 'Reportes',
    descripcion: 'Informes financieros y contables del inventario.',
    pasos: [
      'Ver el valor total del inventario (Cuenta 1405 Materias Primas).',
      'Consultar el costo de ventas acumulado de todas las salidas.',
      'El asiento contable muestra el movimiento contable de las salidas.',
      'Los datos reflejan el estado actual del inventario en tiempo real.',
    ],
  },
  {
    icon: '👤',
    titulo: 'Mi Perfil',
    descripcion: 'Gestiona tu información personal y seguridad.',
    pasos: [
      'Puedes editar tu nombre haciendo clic en el botón ✏️ Editar junto al campo Nombre.',
      'Para cambiar tu contraseña haz clic en "Cambiar contraseña".',
      'Ingresa tu contraseña actual, luego la nueva (mínimo 6 caracteres) y confírmala.',
      'Haz clic en "Actualizar contraseña" para guardar los cambios.',
      'Accede rápidamente a cualquier módulo desde los accesos rápidos al final de la página.',
    ],
  },
];

const seccionesEmpleado = [
  {
    icon: '🏠',
    titulo: 'Mi Panel',
    descripcion: 'Tu panel personal con información y accesos rápidos.',
    pasos: [
      'Aquí puedes ver tu correo, rol y estado en el sistema.',
      'Para cambiar tu contraseña haz clic en "Cambiar contraseña".',
      'Ingresa tu contraseña actual, luego la nueva (mínimo 6 caracteres) y confírmala.',
      'Usa los accesos rápidos para ir directamente a Kardex, Mis Fincas o el Reporte.',
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
    icon: '📦',
    titulo: 'Kardex PEPS',
    descripcion: 'Registro y consulta del inventario de insumos con método FEFO.',
    pasos: [
      'Selecciona un producto de la lista izquierda para ver sus lotes y movimientos.',
      'ENTRADA: haz clic en "+ Movimiento", selecciona Entrada, el número de factura se genera automáticamente, ingresa cantidad, costo y fecha de vencimiento si aplica.',
      'SALIDA: selecciona Salida, luego elige el lote a consumir de la lista — el que vence primero aparece marcado con "← USAR PRIMERO".',
      'Los lotes en ROJO están vencidos, en NARANJA vencen pronto — consúmelos primero.',
      'El botón "📋 Facturas" muestra todas las facturas registradas para ese producto.',
      'El inventario consolidado muestra el valor total en pesos colombianos (COP).',
    ],
  },
  {
    icon: '📊',
    titulo: 'Reporte Kardex',
    descripcion: 'Genera e imprime el informe consolidado del inventario.',
    pasos: [
      'Muestra un resumen con el valor total del inventario, costo de ventas, entradas y salidas.',
      'La tabla lista todos los productos con saldo en cantidad y valor.',
      'Los productos con stock menor a 10 unidades aparecen en rojo como alerta de bajo stock.',
      'Haz clic en "🖨️ Imprimir / Exportar PDF" o usa Ctrl+P para generar el PDF.',
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
              maxWidth: '780px',
              maxHeight: '88vh',
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
              flexShrink: 0,
            }}>
              <div>
                <p style={{
                  color: '#8fae5a', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '2px', margin: 0,
                }}>
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

              {/* Sidebar */}
              <div style={{
                width: '210px', flexShrink: 0,
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
                  color: '#4a6b2e', fontSize: '14px',
                  marginBottom: '20px', lineHeight: 1.6,
                  padding: '10px 14px',
                  background: '#e8f5e0',
                  borderRadius: '10px',
                  borderLeft: '3px solid #4a7c3f',
                }}>
                  {secciones[seccionActiva].descripcion}
                </p>

                <h4 style={{
                  color: '#2d4a1e', fontSize: '13px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
                }}>
                  ¿Cómo usarlo?
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {secciones[seccionActiva].pasos.map((paso, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      padding: '12px 14px',
                      background: '#fafff5',
                      borderRadius: '10px',
                      border: '1px solid #d8ead0',
                    }}>
                      <div style={{
                        minWidth: '24px', height: '24px',
                        borderRadius: '50%',
                        background: '#2d4a1e',
                        color: '#ffffff',
                        fontSize: '12px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
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

                {/* Tip */}
                <div style={{
                  marginTop: '20px',
                  padding: '12px 14px',
                  background: '#fff8e8',
                  borderRadius: '10px',
                  border: '1px solid #e8c840',
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