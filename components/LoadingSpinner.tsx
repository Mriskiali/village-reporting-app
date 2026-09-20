import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'blue' | 'gray' | 'white';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'orange',
  className = '',
  label 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerColors = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  } as const;

  const borderSize = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4'
  } as const;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${spinnerColors[color]} ${borderSize[size]} border-current border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label || "loading"}
      >
        <span className="sr-only">Loading...</span>
      </div>
      {label && <p className="mt-2 text-sm text-gray-600">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;