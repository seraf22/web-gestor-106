import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { apiUrl } from '../config';

interface Movimiento {
  id: string;
  fechaMovimiento: string;
  tipo: string;
  categoriaNombre?: string;
  monto: number;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export function ReportesPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mesInicio, setMesInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)
      .toISOString()
      .split('T')[0]
      .slice(0, 7)
  );
  const [mesFin, setMesFin] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

  useEffect(() => {
    loadMovimientos();
  }, [mesInicio, mesFin]);

  async function loadMovimientos() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/movimientos?page=1&pageSize=500'));
      if (!response.ok) throw new Error('Error al cargar movimientos');

      const data: PaginatedResponse<Movimiento> = await response.json();
      let items = data.items ?? [];

      // Filtrar por rango de fechas
      const [yearInicio, monthInicio] = mesInicio.split('-');
      const [yearFin, monthFin] = mesFin.split('-');
      const fechaInicio = new Date(parseInt(yearInicio), parseInt(monthInicio) - 1, 1);
      const fechaFin = new Date(parseInt(yearFin), parseInt(monthFin), 0);

      items = items.filter((mov) => {
        const fecha = new Date(mov.fechaMovimiento);
        return fecha >= fechaInicio && fecha <= fechaFin;
      });

      setMovimientos(items);
    } catch {
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  // Preparar datos para gráficos
  const dataPorMes = movimientos.reduce((acc: any, mov) => {
    const fecha = new Date(mov.fechaMovimiento);
    const mes = fecha.toLocaleDateString('es-CL', { year: 'numeric', month: 'short' });

    const existing = acc.find((m: any) => m.mes === mes);
    if (existing) {
      if (mov.tipo === 'Ingreso') {
        existing.ingresos += mov.monto;
      } else {
        existing.egresos += mov.monto;
      }
    } else {
      acc.push({
        mes,
        ingresos: mov.tipo === 'Ingreso' ? mov.monto : 0,
        egresos: mov.tipo === 'Egreso' ? mov.monto : 0,
      });
    }
    return acc;
  }, []);

  const dataPorCategoria = movimientos.reduce((acc: any, mov) => {
    const existing = acc.find((c: any) => c.name === mov.categoriaNombre);
    if (existing) {
      existing.value += mov.monto;
    } else {
      acc.push({ name: mov.categoriaNombre || 'Sin categoría', value: mov.monto });
    }
    return acc;
  }, []);

  // Estadísticas
  let totalIngresos = 0;
  let totalEgresos = 0;
  movimientos.forEach((mov) => {
    if (mov.tipo === 'Ingreso') {
      totalIngresos += mov.monto;
    } else {
      totalEgresos += mov.monto;
    }
  });

  const saldo = totalIngresos - totalEgresos;
  const margenGanancia = totalIngresos > 0 ? ((saldo / totalIngresos) * 100).toFixed(2) : '0';

  const COLORS = ['#1e40af', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Reportes Financieros</h2>

      {/* Filtro de fecha */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Desde:
          </label>
          <input
            type="month"
            value={mesInicio}
            onChange={(e) => setMesInicio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Hasta:
          </label>
          <input
            type="month"
            value={mesFin}
            onChange={(e) => setMesFin(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          />
        </div>
        <button className="flex items-center gap-2 bg-casa-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-600">
            {totalIngresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
          <p className="text-gray-600 text-sm mb-1">Total Egresos</p>
          <p className="text-2xl font-bold text-red-600">
            {totalEgresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-casa-blue">
          <p className="text-gray-600 text-sm mb-1">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-casa-blue' : 'text-red-600'}`}>
            {saldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-600">
          <p className="text-gray-600 text-sm mb-1">Margen</p>
          <p className="text-2xl font-bold text-amber-600">{margenGanancia}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por mes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Ingresos vs Egresos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" />
              <Bar dataKey="egresos" fill="#dc2626" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pastel por categoría */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dataPorCategoria.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de resumen por categoría */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Detalle por Categoría</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                <th className="text-right py-3 px-4 font-semibold">Monto</th>
                <th className="text-right py-3 px-4 font-semibold">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {dataPorCategoria.map((cat: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {cat.value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {((cat.value / (totalIngresos + totalEgresos)) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
