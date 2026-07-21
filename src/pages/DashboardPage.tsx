import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Chart } from '../components/Chart';
import { MovimientosTable } from '../components/MovimientosTable';
import { apiUrl, authHeaders } from '../config';

interface Movimiento {
  id: string;
  fechaMovimiento: string;
  periodoDesde?: any;
  periodoHasta?: any;
  tipo: string;
  categoriaNombre?: string;
  descripcion?: string;
  monto: number;
}

function parsePeriodoDate(mov: Movimiento): Date {
  // Prefer mesDevengo, then periodoHasta, then fechaMovimiento
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
    if (y !== undefined && m !== undefined) {
      return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d || 12)));
    }
  }

  return new Date(0);
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
      const response = await fetch(apiUrl('/api/movimientos?page=1&pageSize=100'), {
        headers: authHeaders(),
      });
      if (!response.ok) {
        throw new Error('No se pudo obtener la información de movimientos.');
      }

      const data: PaginatedResponse<Movimiento> = await response.json();
      let items = data.items ?? [];

      // Filtrar por mes usando periodoHasta (si existe) para determinar el mes real del movimiento
      const [year, month] = mes.split('-');
      items = items.filter((mov) => {
        const movDate = parsePeriodoDate(mov);
        return (
          movDate.getUTCFullYear() === parseInt(year) &&
          movDate.getUTCMonth() === parseInt(month) - 1
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
    <div className="space-y-4 lg:space-y-6">
      {/* Filtro por Mes */}
      <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Calendar className="text-casa-blue flex-shrink-0" size={20} />
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="w-full sm:w-auto px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
        />
        <span className="text-gray-600 text-xs lg:text-sm">Filtrando por mes</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
