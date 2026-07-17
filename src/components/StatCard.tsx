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
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-casa-blue">
      <div className="flex justify-between items-start gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs lg:text-sm font-medium">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1 lg:mt-2 truncate sm:truncate-none">{value}</p>
          {change && (
            <p className={`text-xs lg:text-sm font-medium mt-1 lg:mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="text-casa-blue bg-blue-100 p-2 lg:p-3 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
