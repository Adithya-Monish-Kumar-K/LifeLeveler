import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-200"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}