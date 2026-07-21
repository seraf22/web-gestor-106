import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { Chart } from '../components/Chart';
import { apiUrl, authHeaders } from '../config';

interface Movimiento {
  id: string;
  fechaMovimiento: string;
  periodoDesde?: any;
  periodoHasta?: any;
  tipo: string;
  categoriaNombre?: string;
  monto: number;
}

function parsePeriodoDate(mov: Movimiento): Date {
  // Prefer mesDevengo, then periodoHasta, then fechaMovimiento
  const p = (mov as any).mesDevengo ?? mov.periodoHasta ?? mov.fechaMovimiento;
  if (!p) return new Date(0);
  if (typeof p === 'string') {
    // Prefer parsing YYYY-MM or YYYY-MM-DD manually to avoid timezone shifts from Date(string)
    const m = p.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = m[3] ? Number(m[3]) : 1;
      if (!isNaN(y) && !isNaN(mo)) return new Date(y, mo - 1, d);
    }
    const parsed = new Date(p);
    if (!isNaN(parsed.getTime())) return parsed;
    const parts = p.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(mm)) return new Date(y, mm - 1, 1);
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
      const response = await fetch(apiUrl('/api/movimientos?page=1&pageSize=500'), {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('Error al cargar movimientos');

      const data: PaginatedResponse<Movimiento> = await response.json();
      let items = data.items ?? [];

      // Filtrar por rango de fechas
      const [yearInicio, monthInicio] = mesInicio.split('-');
      const [yearFin, monthFin] = mesFin.split('-');
      const fechaInicio = new Date(parseInt(yearInicio), parseInt(monthInicio) - 1, 1);
      const fechaFin = new Date(parseInt(yearFin), parseInt(monthFin), 0);

      items = items.filter((mov) => {
        const fecha = parsePeriodoDate(mov);
        return fecha >= fechaInicio && fecha <= fechaFin;
      });

      setMovimientos(items);
    } catch {
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  // Helper para formatear mes de devengo evitando shifts por zona horaria
  function formatDevengoMonth(mov: Movimiento) {
    const p = (mov as any).mesDevengo ?? mov.periodoHasta ?? mov.fechaMovimiento;
    if (!p) return '';
    let y: number | undefined;
    let mo: number | undefined;
    let d = 1;
    if (typeof p === 'string') {
      const m = p.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
      if (m) {
        y = Number(m[1]);
        mo = Number(m[2]);
        d = m[3] ? Number(m[3]) : 1;
      } else {
        const dt = new Date(p);
        if (!isNaN(dt.getTime())) {
          y = dt.getFullYear();
          mo = dt.getMonth() + 1;
          d = dt.getDate();
        }
      }
    } else if (typeof p === 'object') {
      y = Number((p as any).year ?? (p as any).año);
      mo = Number((p as any).month ?? (p as any).mes);
      d = Number((p as any).day ?? 1);
    }
    if (!y || !mo) return '';
    return new Intl.DateTimeFormat('es-CL', { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(y, mo - 1, d)));
  }

  // Preparar datos para gráficos
  const dataPorMes = movimientos.reduce((acc: any, mov) => {
    // usar key canonical YYYY-MM para agrupar sin depender de Date local
    const p = (mov as any).mesDevengo ?? mov.periodoHasta ?? mov.fechaMovimiento;
    let key = '';
    let y: number | undefined;
    let mo: number | undefined;
    if (typeof p === 'string') {
      const m = p.match(/^(\d{4})-(\d{2})/);
      if (m) {
        y = Number(m[1]);
        mo = Number(m[2]);
      } else {
        const dt = new Date(p);
        if (!isNaN(dt.getTime())) {
          y = dt.getFullYear();
          mo = dt.getMonth() + 1;
        }
      }
    } else if (typeof p === 'object') {
      y = Number((p as any).year ?? (p as any).año);
      mo = Number((p as any).month ?? (p as any).mes);
    }
    if (y && mo) key = `${y}-${String(mo).padStart(2, '0')}`;
    else key = 'other';

    const display = key === 'other' ? 'Otros' : new Intl.DateTimeFormat('es-CL', { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(y), Number(mo) - 1, 1)));

    const existing = acc.find((m: any) => m.key === key);
    if (existing) {
      if (mov.tipo === 'Ingreso') {
        existing.ingresos += mov.monto;
      } else {
        existing.egresos += mov.monto;
      }
    } else {
      acc.push({
        key,
        mes: display,
        ingresos: mov.tipo === 'Ingreso' ? mov.monto : 0,
        egresos: mov.tipo === 'Egreso' ? mov.monto : 0,
      });
    }
    return acc;
  }, []).sort((a: any,b: any)=> a.key.localeCompare(b.key));

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
    return <div className="text-center py-8 text-sm lg:text-base">Cargando...</div>;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Reportes Financieros</h2>

      {/* Filtro de fecha */}
      <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 flex flex-col sm:flex-row flex-wrap gap-2 lg:gap-4 items-start sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="text-xs lg:text-sm font-medium text-gray-700 block mb-2">
            Desde:
          </label>
          <input
            type="month"
            value={mesInicio}
            onChange={(e) => setMesInicio(e.target.value)}
            className="w-full sm:w-auto px-3 lg:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="text-xs lg:text-sm font-medium text-gray-700 block mb-2">
            Hasta:
          </label>
          <input
            type="month"
            value={mesFin}
            onChange={(e) => setMesFin(e.target.value)}
            className="w-full sm:w-auto px-3 lg:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-casa-blue"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-casa-blue text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Total Ingresos</p>
          <p className="text-lg lg:text-2xl font-bold text-green-600">
            {totalIngresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-red-600">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Total Egresos</p>
          <p className="text-lg lg:text-2xl font-bold text-red-600">
            {totalEgresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-casa-blue">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Saldo</p>
          <p className={`text-lg lg:text-2xl font-bold ${saldo >= 0 ? 'text-casa-blue' : 'text-red-600'}`}>
            {saldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-amber-600">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Margen</p>
          <p className="text-lg lg:text-2xl font-bold text-amber-600">{margenGanancia}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Gráfico de barras por mes */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <Chart data={dataPorMes.map((m:any)=>({ name: m.mes, ingresos: m.ingresos, egresos: m.egresos }))} title="Ingresos vs Egresos por Mes" type="bar" />
        </div>

        {/* Gráfico de pastel por categoría */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <Chart data={dataPorCategoria.map((c:any)=>({ name: c.name, value: c.value }))} title="Distribución por Categoría" type="pie" />
        </div>
      </div>

      {/* Tabla de resumen por categoría */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900">Detalle por Categoría</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs lg:text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold">Categoría</th>
                <th className="text-right py-2 lg:py-3 px-2 lg:px-4 font-semibold">Monto</th>
                <th className="text-right py-2 lg:py-3 px-2 lg:px-4 font-semibold">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {dataPorCategoria.map((cat: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 lg:py-3 px-2 lg:px-4">
                    <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {cat.name}
                  </td>
                  <td className="py-2 lg:py-3 px-2 lg:px-4 text-right font-semibold">
                    {cat.value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-2 lg:py-3 px-2 lg:px-4 text-right">
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
