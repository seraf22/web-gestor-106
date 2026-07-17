interface Movimiento {
  id: string;
  fechaMovimiento: string;
  tipo: string;
  categoriaNombre?: string;
  descripcion?: string;
  monto: number;
}

interface MovimientosTableProps {
  movimientos: Movimiento[];
  loading: boolean;
  error: string | null;
}

export function MovimientosTable({ movimientos, loading, error }: MovimientosTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Movimientos Recientes</h3>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm lg:text-base">Cargando movimientos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {movimientos.map((movimiento) => (
              <div key={movimiento.id} className="border border-gray-200 rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(movimiento.fechaMovimiento).toLocaleDateString('es-CL')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{movimiento.descripcion ?? '-'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                    movimiento.tipo === 'Ingreso'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {movimiento.tipo}
                  </span>
                </div>
                <div className="flex justify-between items-end text-sm">
                  <p className="text-gray-600">{movimiento.categoriaNombre ?? '-'}</p>
                  <p className={`font-semibold ${
                    movimiento.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movimiento.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Categoría</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Descripción</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(movimiento.fechaMovimiento).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        movimiento.tipo === 'Ingreso'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{movimiento.categoriaNombre ?? '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{movimiento.descripcion ?? '-'}</td>
                    <td className={`py-3 px-4 text-right font-semibold text-sm ${
                      movimiento.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movimiento.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movimientos.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No hay movimientos registrados
            </div>
          )}
        </>
      )}
    </div>
  );
}
