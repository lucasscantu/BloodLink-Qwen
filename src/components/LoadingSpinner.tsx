import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Carregando...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div data-testid="loading-spinner" className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin`}
        role="status"
        aria-label="Carregando"
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
