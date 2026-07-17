import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Chart } from '../components/Chart';
import { MovimientosTable } from '../components/MovimientosTable';
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

export function DashboardPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    ingresos: 0,
    egresos: 0,
    saldo: 0,
  });

  // Filtros
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadMovimientos();
  }, [mes]);

  async function loadMovimientos() {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/movimientos?page=1&pageSize=100'));
      if (!response.ok) {
        throw new Error('No se pudo obtener la información de movimientos.');
      }

      const data: PaginatedResponse<Movimiento> = await response.json();
      let items = data.items ?? [];

      // Filtrar por mes
      const [year, month] = mes.split('-');
      items = items.filter((mov) => {
        const movDate = new Date(mov.fechaMovimiento);
        return (
          movDate.getFullYear() === parseInt(year) &&
          movDate.getMonth() === parseInt(month) - 1
        );
      });

      setMovimientos(items);

      // Calcular estadísticas
      let totalIngresos = 0;
      let totalEgresos = 0;

      items.forEach((mov) => {
        if (mov.tipo === 'Ingreso') {
          totalIngresos += mov.monto;
        } else {
          totalEgresos += mov.monto;
        }
      });

      setStats({
        ingresos: totalIngresos,
        egresos: totalEgresos,
        saldo: totalIngresos - totalEgresos,
      });
    } catch {
      setError('Error al cargar movimientos desde la API.');
    } finally {
      setLoading(false);
    }
  }

  // Datos para gráficos
  const datosGrafico = [
    { name: 'Mes', ingresos: stats.ingresos, egresos: stats.egresos },
  ];

  const datosCategories = movimientos.reduce((acc: any, mov) => {
    const existing = acc.find((cat: any) => cat.name === mov.categoriaNombre);
    if (existing) {
      existing.value += mov.monto;
    } else {
      acc.push({ name: mov.categoriaNombre || 'Sin categoría', value: mov.monto });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Filtro por Mes */}
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
        <Calendar className="text-casa-blue" size={24} />
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
        />
        <span className="text-gray-600 text-sm">Filtrando por mes</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ingresos"
          value={stats.ingresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          icon={<TrendingUp size={24} />}
          isPositive={true}
        />
        <StatCard
          title="Egresos"
          value={stats.egresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          icon={<TrendingDown size={24} />}
          isPositive={false}
        />
        <StatCard
          title="Saldo"
          value={stats.saldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          icon={<DollarSign size={24} />}
          isPositive={stats.saldo >= 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart data={datosGrafico} title="Ingresos vs Egresos" type="bar" />
        {datosCategories.length > 0 && (
          <Chart data={datosCategories} title="Distribución por Categoría" type="pie" />
        )}
      </div>

      {/* Tabla */}
      <MovimientosTable movimientos={movimientos} loading={loading} error={error} />
    </div>
  );
}
