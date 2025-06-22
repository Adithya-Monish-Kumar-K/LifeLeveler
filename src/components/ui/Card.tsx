import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

// Ensure Card forwards events
export function Card({ className, children, ...props }) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}
