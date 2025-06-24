import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useCapacitor } from '../../hooks/useCapacitor';
import { ImpactStyle } from '@capacitor/haptics';

interface MobileOptimizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  hapticFeedback?: boolean;
}

export function MobileOptimizedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  hapticFeedback = true,
}: MobileOptimizedButtonProps) {
  const { triggerHaptic, isNative } = useCapacitor();

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 focus:ring-yellow-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black focus:ring-yellow-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]', // Increased min-height for mobile
    md: 'px-4 py-3 text-base min-h-[44px]', // iOS recommended minimum
    lg: 'px-6 py-4 text-lg min-h-[48px]',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const handleClick = async () => {
    if (hapticFeedback && isNative) {
      await triggerHaptic(ImpactStyle.Light);
    }
    onClick?.();
  };
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? disabledClasses : ''}
        ${isNative ? 'select-none' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}