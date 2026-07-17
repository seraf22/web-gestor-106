import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, isPositive, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-casa-blue">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="text-casa-blue bg-blue-100 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
