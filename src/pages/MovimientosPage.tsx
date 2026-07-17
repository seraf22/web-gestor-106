import { useEffect, useState } from 'react';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../config';

interface Movimiento {
  id: string;
  fechaMovimiento: string;
  tipo: string;
  categoriaNombre?: string;
  descripcion?: string;
  monto: number;
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
      const response = await fetch(apiUrl(`/api/movimientos?page=${page}&pageSize=20`));
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
      });

      if (!response.ok) throw new Error('Error al eliminar');

      loadMovimientos();
    } catch {
      setError('Error al eliminar el movimiento');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Movimientos</h2>

      {/* Filtro */}
      <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Filtrar por tipo:
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          >
            <option value="Todos">Todos</option>
            <option value="Ingreso">Ingresos</option>
            <option value="Egreso">Egresos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Cargando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descripción</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Monto</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(mov.fechaMovimiento).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-gray-600">{mov.categoriaNombre || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{mov.descripcion}</td>
                    <td className="py-3 px-4 text-right font-semibold">
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
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(mov.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
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

          {/* Paginación */}
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
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
