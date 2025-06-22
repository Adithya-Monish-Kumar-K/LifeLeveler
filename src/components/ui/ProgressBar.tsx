import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showText?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showText = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="text-sm text-gray-300 mb-1">{label}</div>}
      <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
      {showText && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {current}/{max} ({percentage.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}