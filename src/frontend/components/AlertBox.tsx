import { AlertTriangle } from 'lucide-react';

interface AlertBoxProps {
  message: string;
  isHighPriority?: boolean;
}

export default function AlertBox({ message, isHighPriority = false }: AlertBoxProps) {
  const bgColor = isHighPriority
    ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500'
    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400';
  const iconBg = isHighPriority ? 'bg-red-500' : 'bg-amber-500';
  const textColor = isHighPriority ? 'text-red-900' : 'text-amber-900';
  const messageColor = isHighPriority ? 'text-red-800' : 'text-amber-800';

  return (
    <div className={`${bgColor} border-3 rounded-2xl p-6 shadow-xl ${isHighPriority ? 'animate-pulse' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`${iconBg} rounded-full p-3 flex-shrink-0 shadow-lg`}>
          <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className={`${textColor} font-bold text-xl mb-2`}>Onyo la AI</h3>
          <p className={`${messageColor} text-lg leading-relaxed font-medium`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
