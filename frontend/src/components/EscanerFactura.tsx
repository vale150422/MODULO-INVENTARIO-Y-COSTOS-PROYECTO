import { useState } from 'react';

type Item = {
  descripcion: string;
  numero_lote: string | null;
  fecha_vencimiento: string | null;
  cantidad: number | null;
  costo_unitario: number | null;
  id_producto: number | null;
  advertencias: string[];
};

type Factura = {
  proveedor: string | null;
  numero_factura: string | null;
  id_proveedor: number | null;
  facturaDuplicada: boolean;
  items: Item[];
};

type Props = {
  idFinca: number;
  productos: { id_producto: number; nombre: string }[];
  onConfirmar: (f: {
    numero_factura: string | null;
    id_proveedor: number | null;
    items: Item[];
  }) => Promise<void>;
};

const API = import.meta.env.VITE_API_URL;

export default function EscanerFactura({ idFinca, productos, onConfirmar }: Props) {
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [factura, setFactura] = useState<Factura | null>(null);

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    setError('');
    setFactura(null);

    const fd = new FormData();
    fd.append('archivo', file);

    try {
      // ⚠ Ajusta 'token' si tu app guarda el JWT con otro nombre
      const r = await fetch(`${API}/api/kardex/escanear-factura?id_finca=${idFinca}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error al escanear');
      setFactura(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
      e.target.value = ''; // permite volver a escanear el mismo archivo
    }
  }

  const editar = (i: number, campo: keyof Item, valor: any) =>
    setFactura(f =>
      f ? { ...f, items: f.items.map((it, k) => (k === i ? { ...it, [campo]: valor } : it)) } : f
    );

  const quitar = (i: number) =>
    setFactura(f => (f ? { ...f, items: f.items.filter((_, k) => k !== i) } : f));

  const hoy = new Date().toLocaleDateString('en-CA');

  // Errores bloqueantes (se calculan en vivo según lo que el usuario corrija)
  const erroresItem = (it: Item) => {
    const e: string[] = [];
    if (!it.id_producto) e.push('Selecciona el producto');
    if (!it.cantidad || it.cantidad <= 0) e.push('Cantidad no válida');
    if (!it.costo_unitario || it.costo_unitario <= 0) e.push('Costo unitario no válido');
    if (it.fecha_vencimiento && it.fecha_vencimiento < hoy) e.push('Producto vencido');
    return e;
  };

  const avisosItem = (it: Item) => {
    const a: string[] = [];
    if (!it.numero_lote) a.push('Sin número de lote');
    if (!it.fecha_vencimiento) a.push('Sin fecha de vencimiento (FEFO lo tratará como el último en salir)');
    return a;
  };

  const hayErrores =
    !factura || factura.items.length === 0 || factura.items.some(it => erroresItem(it).length > 0);

  async function confirmar() {
    if (!factura) return;
    setGuardando(true);
    setError('');
    try {
      await onConfirmar({
        numero_factura: factura.numero_factura,
        id_proveedor: factura.id_proveedor,
        items: factura.items,
      });
      setFactura(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const input = 'border rounded px-2 py-1 text-sm w-full';

  return (
    <div className="space-y-3">
      <label className="inline-block cursor-pointer rounded bg-green-700 px-4 py-2 text-white">
        📷 Escanear factura / etiqueta
        {/* capture abre la cámara trasera en el celular */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          capture="environment"
          hidden
          onChange={subir}
        />
      </label>

      {cargando && <p className="text-sm">Leyendo documento…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {factura && (
        <div className="space-y-3">
          {factura.facturaDuplicada && (
            <p className="text-sm text-orange-600">⚠ Esta factura ya fue registrada antes.</p>
          )}

          <p className="text-sm">
            Proveedor: <strong>{factura.proveedor ?? '—'}</strong>
            {!factura.id_proveedor && factura.proveedor && ' (no registrado en Proveedores)'}
            {' · '}Factura N°:{' '}
            <input
              className="border rounded px-2 py-1 text-sm"
              value={factura.numero_factura ?? ''}
              onChange={e => setFactura({ ...factura, numero_factura: e.target.value || null })}
            />
          </p>

          {factura.items.map((it, i) => (
            <div key={i} className="rounded border p-3 space-y-2">
              <div className="flex justify-between">
                <strong className="text-sm">Leído: {it.descripcion}</strong>
                <button type="button" onClick={() => quitar(i)} className="text-sm text-red-600">
                  Quitar
                </button>
              </div>

              <select
                className={input}
                value={it.id_producto ?? ''}
                onChange={e => editar(i, 'id_producto', e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Selecciona el producto —</option>
                {productos.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <input
                  className={input}
                  placeholder="Lote"
                  value={it.numero_lote ?? ''}
                  onChange={e => editar(i, 'numero_lote', e.target.value || null)}
                />
                <input
                  className={input}
                  type="date"
                  value={it.fecha_vencimiento ?? ''}
                  onChange={e => editar(i, 'fecha_vencimiento', e.target.value || null)}
                />
                <input
                  className={input}
                  type="number"
                  placeholder="Cantidad"
                  value={it.cantidad ?? ''}
                  onChange={e => editar(i, 'cantidad', e.target.value ? Number(e.target.value) : null)}
                />
                <input
                  className={input}
                  type="number"
                  placeholder="Costo unitario"
                  value={it.costo_unitario ?? ''}
                  onChange={e =>
                    editar(i, 'costo_unitario', e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>

              {erroresItem(it).map(m => (
                <p key={m} className="text-sm text-red-600">✖ {m}</p>
              ))}
              {avisosItem(it).map(m => (
                <p key={m} className="text-sm text-orange-600">⚠ {m}</p>
              ))}
            </div>
          ))}

          <button
            type="button"
            disabled={hayErrores || guardando}
            onClick={confirmar}
            className="rounded bg-green-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Confirmar y registrar entrada'}
          </button>
        </div>
      )}
    </div>
  );
}