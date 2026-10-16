import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Processando...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <Loader2 className="w-12 h-12 text-blood-600 animate-spin" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
        <p className="text-sm text-gray-500 text-center">
          Por favor, aguarde enquanto processamos sua solicitação.
        </p>
      </div>
    </div>
  );
}
