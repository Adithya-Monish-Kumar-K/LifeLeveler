import { forwardRef, InputHTMLAttributes } from 'react';
import { useCapacitor } from '../../hooks/useCapacitor';

interface MobileOptimizedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const MobileOptimizedInput = forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const { isNative } = useCapacitor();

    const inputClasses = `
      w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
      placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent
      ${isNative ? 'text-base' : ''} // Prevent zoom on iOS
      ${icon ? 'pl-10' : ''}
      ${error ? 'border-red-500 focus:ring-red-500' : ''}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

MobileOptimizedInput.displayName = 'MobileOptimizedInput';