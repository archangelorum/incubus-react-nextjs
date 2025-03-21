import React from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${sizeClasses[size]} rounded-full border-primary border-t-transparent animate-spin ${className}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}