import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataProps {
  data: any[];
  title: string;
  type: 'bar' | 'line' | 'pie';
}

export function Chart({ data, title, type }: ChartDataProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250} minHeight={250}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" />
            <Bar dataKey="egresos" fill="#dc2626" name="Egresos" />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="saldo" stroke="#1e40af" strokeWidth={2} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={60} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#1e40af', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const renderCustomLabel = (entry: any) => `${entry.name}`;
