import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  isWarning?: boolean;
}

export default function SensorCard({ title, value, unit, icon: Icon, color, isWarning = false }: SensorCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isWarning ? 'ring-4 ring-red-500 ring-opacity-50 animate-pulse' : ''}`}>
      <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-gray-600 text-sm font-semibold mb-1 text-center">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
        <span className={`text-xl font-medium ${isWarning ? 'text-red-500' : 'text-gray-500'}`}>{unit}</span>
      </div>
    </div>
  );
}
