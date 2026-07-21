import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataProps {
  data: any[];
  title: string;
  type: 'bar' | 'line' | 'pie';
}

export function Chart({ data, title, type }: ChartDataProps) {
  const [isWide, setIsWide] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    function onResize() {
      setIsWide(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Legend props: on wide screens place legend to right vertically, otherwise bottom horizontal
  const legendProps = isWide
    ? { layout: 'vertical' as const, verticalAlign: 'middle' as const, align: 'right' as const }
    : { layout: 'horizontal' as const, verticalAlign: 'bottom' as const, align: 'center' as const };

  // Pie label renderer: place labels outside with small offset and avoid overlap by horizontal placement
  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';
    return (
      <text x={x} y={y} fill="#333" textAnchor={textAnchor} dominantBaseline="central" style={{ fontSize: 12 }}>
        {`${payload.name} ${Math.round(percent * 100)}%`}
      </text>
    );
  };

  // For pie charts, aggregate small slices into 'Otros' to avoid label overlap
  const processedPieData = (() => {
    if (type !== 'pie') return data;
    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
    if (total === 0) return data;
    const threshold = 0.05; // 5%
    const big = data.filter((d) => (Number(d.value) || 0) / total >= threshold);
    const small = data.filter((d) => (Number(d.value) || 0) / total < threshold);
    if (small.length === 0) return data;
    const othersSum = small.reduce((s, d) => s + (Number(d.value) || 0), 0);
    return [...big, { name: 'Otros', value: othersSum }];
  })();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250} minHeight={250}>
        {type === 'bar' ? (
          <BarChart data={data} barCategoryGap="30%" barGap={6}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend {...legendProps} />
            <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" barSize={18} />
            <Bar dataKey="egresos" fill="#dc2626" name="Egresos" barSize={18} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend {...legendProps} />
            <Line type="monotone" dataKey="saldo" stroke="#1e40af" strokeWidth={2} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={processedPieData}
              cx={isWide ? '35%' : '50%'}
              cy="50%"
              innerRadius={isWide ? 48 : 36}
              outerRadius={isWide ? 88 : 64}
              labelLine={false}
              label={processedPieData.length <= 6 ? renderPieLabel : false}
              dataKey="value"
            >
              {processedPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend {...legendProps} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#1e40af', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const renderCustomLabel = (entry: any) => `${entry.name}`;
