import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div data-testid="error-message" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            data-testid="retry-button"
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
