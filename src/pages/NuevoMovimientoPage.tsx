import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { apiUrl, authHeaders } from '../config';

interface Categoria {
  id: string;
  nombre: string;
  tipoMovimiento: string;
}

export function NuevoMovimientoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const mensajeRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const statePrefill = (location.state as any)?.prefill as any | undefined;

  // También leer de sessionStorage si el usuario vino desde la página de análisis y usamos window.location
  let sessionPrefill: any | undefined = undefined;
  try {
    const raw = sessionStorage.getItem('prefillMovimiento');
    if (raw) {
      sessionPrefill = JSON.parse(raw);
      // limpiar para evitar reuso accidental
      sessionStorage.removeItem('prefillMovimiento');
    }
  } catch {}

  const prefill = statePrefill ?? sessionPrefill;

  const [formData, setFormData] = useState(() => ({
    tipo: prefill?.tipo ?? 'Ingreso',
    categoriaId: '',
    descripcion: prefill?.descripcion ?? '',
    monto: prefill?.monto !== undefined ? String(prefill.monto) : '',
    fechaMovimiento: prefill?.fecha ?? new Date().toISOString().split('T')[0],
    // mesDevengo se pide como obligatorio; prefill puede traer mesDevengo, periodoHasta o periodoDesde
    mesDevengo: (() => {
      const md = prefill?.mesDevengo ?? prefill?.periodoHasta ?? prefill?.periodoDesde ?? prefill?.fecha;
      if (!md) return '';
      if (typeof md === 'string') {
        // try ISO or YYYY-MM
        const d = new Date(md);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0,7);
        const parts = md.split('-');
        if (parts.length >= 2) return `${parts[0]}-${parts[1].padStart(2,'0')}`;
        return '';
      }
      if (typeof md === 'object') {
        const y = md.year ?? md.año ?? md.year;
        const m = md.month ?? md.mes ?? md.month;
        if (y !== undefined && m !== undefined) return `${String(y)}-${String(m).padStart(2,'0')}`;
      }
      return '';
    })(),
    proveedor: prefill?.proveedor ?? '',
    metodoPago: prefill?.metodoPago ?? '',
    periodoDesde: '',
    periodoHasta: '',
  }));

  useEffect(() => {
    loadCategorias();
  }, []);

  async function loadCategorias() {
    try {
      const response = await fetch(apiUrl('/api/categorias'), {
      headers: authHeaders(),
    });
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategorias(data);
      // Si venimos de un prefill con categoría, intentar mapearla a una categoría existente
      if (prefill?.categoria) {
        const match = data.find((c: Categoria) => c.nombre.toLowerCase() === String(prefill.categoria).toLowerCase() && c.tipoMovimiento === (prefill.tipo ?? formData.tipo));
        if (match) {
          setFormData((f) => ({ ...f, categoriaId: match.id }));
        }
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cargar las categorías' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.categoriaId || !formData.monto || !formData.descripcion || !formData.mesDevengo) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa todos los campos requeridos. El Mes de Devengo es obligatorio.' });
      setTimeout(() => {
        if (mensajeRef.current) mensajeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/movimientos'), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: formData.tipo,
          categoriaId: formData.categoriaId,
          descripcion: formData.descripcion,
          monto: parseFloat(formData.monto),
          fechaMovimiento: formData.fechaMovimiento,
          proveedor: formData.proveedor || null,
          metodoPago: formData.metodoPago || null,
          mesDevengo: formData.mesDevengo ? `${formData.mesDevengo}-01` : null,
          periodoDesde: formData.periodoDesde || null,
          periodoHasta: formData.periodoHasta || null,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar movimiento');

      setMensaje({ tipo: 'exito', texto: 'Movimiento guardado exitosamente' });
      // scroll automático hacia el mensaje
      setTimeout(() => {
        if (mensajeRef.current) mensajeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      setFormData({
        tipo: 'Ingreso',
        categoriaId: '',
        descripcion: '',
        monto: '',
        fechaMovimiento: new Date().toISOString().split('T')[0],
        mesDevengo: '',
        proveedor: '',
        metodoPago: '',
        periodoDesde: '',
        periodoHasta: '',
      });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el movimiento' });
      setTimeout(() => {
        if (mensajeRef.current) mensajeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  const categoriasDelTipo = categorias.filter(
    (c) => c.tipoMovimiento === formData.tipo
  );

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 lg:px-0">
      <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 text-gray-900">Nuevo Movimiento</h2>

      {mensaje && (
        <div
          ref={mensajeRef}
          className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg flex gap-2 lg:gap-3 text-sm lg:text-base ${
            mensaje.tipo === 'exito'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {mensaje.tipo === 'exito' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Tipo */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Tipo de Movimiento *
          </label>
          <select
            value={formData.tipo}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipo: e.target.value,
                categoriaId: '',
              })
            }
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          >
            <option value="Ingreso">Ingreso</option>
            <option value="Egreso">Egreso</option>
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.categoriaId}
            onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          >
            <option value="">Selecciona una categoría</option>
            {categoriasDelTipo.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            placeholder="Ej: Arriendo mes de julio"
          />
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            placeholder="0.00"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Fecha del Movimiento
          </label>
          <input
            type="date"
            value={formData.fechaMovimiento}
            onChange={(e) => setFormData({ ...formData, fechaMovimiento: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-"/> 
        </div>

        {/* Mes de Devengo (obligatorio) */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Mes de Devengo *
          </label>
          <input
            type="month"
            value={formData.mesDevengo}
            onChange={(e) => setFormData({ ...formData, mesDevengo: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            required
          />
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Proveedor (Opcional)
          </label>
          <input
            type="text"
            value={formData.proveedor}
            onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            placeholder="Ej: Airbnb, Banco, etc."
          />
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Método de Pago (Opcional)
          </label>
          <input
            type="text"
            value={formData.metodoPago}
            onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            placeholder="Ej: Transferencia, Efectivo, Tarjeta"
          />
        </div>

        {/* Período */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
              Período Desde (Opcional)
            </label>
            <input
              type="date"
              value={formData.periodoDesde}
              onChange={(e) => setFormData({ ...formData, periodoDesde: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
              Período Hasta (Opcional)
            </label>
            <input
              type="date"
              value={formData.periodoHasta}
              onChange={(e) => setFormData({ ...formData, periodoHasta: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-casa-blue text-white font-semibold py-2 lg:py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <Save size={20} />
          Guardar Movimiento
        </button>
      </form>
    </div>
  );
}
