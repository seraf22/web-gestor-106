import { useEffect, useState } from 'react';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl, authHeaders } from '../config';

interface Movimiento {
  id: string;
  fechaMovimiento: string;
  mesDevengo?: any;
  periodoDesde?: any;
  periodoHasta?: any;
  tipo: string;
  categoriaNombre?: string;
  descripcion?: string;
  monto: number;
}

function parsePeriodoDate(mov: Movimiento): Date {
  const p = (mov as any).mesDevengo ?? mov.periodoHasta ?? mov.fechaMovimiento;
  if (!p) return new Date(0);
  if (typeof p === 'string') {
    const m = p.match(/^(\\d{4})-(\\d{2})(?:-(\\d{2}))?$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = 12; // always use mid-month to avoid timezone shifts even if day is 01
      if (!isNaN(y) && !isNaN(mo)) return new Date(Date.UTC(y, mo - 1, d));
    }
    const parsed = new Date(p);
    if (!isNaN(parsed.getTime())) return parsed;
    const parts = p.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(mm)) return new Date(Date.UTC(y, mm - 1, 12));
    }
    return new Date(p);
  }
  if (typeof p === 'object') {
    const y = p.year ?? p.año ?? p.year;
    const m = p.month ?? p.mes ?? p.month;
    const d = p.day ?? p.día ?? p.day ?? 1;
    if (y !== undefined && m !== undefined) return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d || 12)));
  }
  return new Date(0);
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  useEffect(() => {
    loadMovimientos();
  }, [page]);

  async function loadMovimientos() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/movimientos?page=${page}&pageSize=20`), {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('Error al cargar movimientos');

      const data: PaginatedResponse<Movimiento> = await response.json();

      let items = data.items ?? [];

      // Filtrar por tipo
      if (filtroTipo !== 'Todos') {
        items = items.filter((m) => m.tipo === filtroTipo);
      }

      setMovimientos(items);
      setTotalPages(Math.ceil(data.totalItems / 20));
    } catch {
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este movimiento?')) return;

    try {
      const response = await fetch(apiUrl(`/api/movimientos/${id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!response.ok) throw new Error('Error al eliminar');

      loadMovimientos();
    } catch {
      setError('Error al eliminar el movimiento');
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Movimientos</h2>

      {/* Filtro */}
      <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="w-full sm:w-auto">
          <label className="text-xs lg:text-sm font-medium text-gray-700 block mb-2">
            Filtrar por tipo:
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          >
            <option value="Todos">Todos</option>
            <option value="Ingreso">Ingresos</option>
            <option value="Egreso">Egresos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-8 text-gray-600 text-sm lg:text-base">Cargando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm lg:text-base">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-gray-700">Descripción</th>
                  <th className="text-right py-3 px-3 lg:px-4 font-semibold text-gray-700">Monto</th>
                  <th className="text-center py-3 px-3 lg:px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 lg:px-4">
                      {new Date(mov.fechaMovimiento).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-3 lg:px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mov.tipo === 'Ingreso'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-3 lg:px-4 text-gray-600">{mov.categoriaNombre || '-'}</td>
                    <td className="py-3 px-3 lg:px-4 text-gray-600">{mov.descripcion}</td>
                    <td className="py-3 px-3 lg:px-4 text-right font-semibold">
                      <span
                        className={mov.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}
                      >
                        {mov.monto.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-3 lg:px-4 text-center">
                      <button
                        onClick={() => handleDelete(mov.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="lg:hidden space-y-3 p-3 lg:p-4">
            {movimientos.map((mov) => (
              <div key={mov.id} className="border border-gray-200 rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(mov.fechaMovimiento).toLocaleDateString('es-CL')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{mov.descripcion}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                    mov.tipo === 'Ingreso'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {mov.tipo}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-gray-600">{mov.categoriaNombre ?? '-'}</p>
                  <p className={`text-sm font-semibold ${
                    mov.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mov.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </p>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleDelete(mov.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 p-1 text-sm"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="px-3 lg:px-4 py-3 lg:py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-2 lg:px-3 py-2 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span className="text-xs lg:text-sm text-gray-600">
              Pág {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2 lg:px-3 py-2 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
